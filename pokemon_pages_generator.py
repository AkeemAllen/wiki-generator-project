import json
import yaml
import argparse
import pokebase
import requests
import tqdm
from snakemd import Document, InlineText, Table, Paragraph
from models.pokemon_models import (
    PokemonData,
    MoveDetails,
    PokemonVersions,
)
from pydantic import ValidationError
from routes.matchups import get_defensive_matchups, get_defensive_matchups_synchronous

from utils import get_pokemon_dex_formatted_name

data_folder_route = "data"


def get_markdown_image_for_type(_type: str):
    return f"![{_type}](../img/types/{_type}.png)"


# TODO: These functions are meant to dynamically get and set the Pokemon specific changes
#       from the yaml file. There should a more elegant way to do this.
#    get_specific_changes_from_yaml(yaml) and set_specific_changes_in_yaml(yaml, specific_changes)
def get_specific_changes_from_yaml(yaml):
    specific_changes = None
    for nav_item in yaml["nav"]:
        for nav_key, nav_value in nav_item.items():
            if nav_key == "Pokemon":
                for item in nav_value:
                    for key, value in item.items():
                        if key == "Specific Changes":
                            specific_changes = value

    return specific_changes


def set_specific_changes_in_yaml(yaml, specific_changes):
    for nav_item in yaml["nav"]:
        for nav_key, nav_value in nav_item.items():
            if nav_key == "Pokemon":
                for item in nav_value:
                    for key, value in item.items():
                        if key == "Specific Changes":
                            item[key] = specific_changes


def generate_moves_array(moves, table_type):
    table_array_for_moves = []
    for move_name, move_attributes in moves.items():
        move_array = [
            move_attributes.get(
                "level_learned" if table_type == "level_up" else "machine"
            ),
            move_name.title(),
            move_attributes.get("power") if move_attributes.get("power") else "-",
            f"{move_attributes.get('accuracy')}%"
            if move_attributes.get("accuracy")
            else "-",
            move_attributes.get("pp") if move_attributes.get("pp") else "-",
            f"{get_markdown_image_for_type(move_attributes.get('type'))}",
            f"{get_markdown_image_for_type(move_attributes.get('damage_class'))}",
        ]
        table_array_for_moves.append(move_array)
    return table_array_for_moves


# TODO: This class isn't really necessary. Remove later and have standalone functions
class Pokemon:
    def __init__(self, pokemon_name: str):
        self.pokemon_data = PokemonData()
        self.pokemon_name = pokemon_name
        self.dex_number = int(pokebase.pokemon(pokemon_name).id)

    def get_pokemon_data(self, wiki_name: str):
        with open(
            f"{data_folder_route}/{wiki_name}/pokemon.json", encoding="utf-8"
        ) as pokemon_data_file:
            pokemon = json.load(pokemon_data_file)
            pokemon_data_file.close()

            self.pokemon_data = PokemonData.parse_raw(
                json.dumps(pokemon[self.pokemon_name])
            )
        return self.pokemon_data

    def add_sprite(self, doc: Document):
        doc.add_element(
            Paragraph(
                [
                    InlineText(
                        f"{self.pokemon_data.name}",
                        url=f"../img/pokemon/{get_pokemon_dex_formatted_name(self.dex_number)}.png",
                        image=True,
                    )
                ]
            )
        )

    def create_type_table(self, doc: Document):
        data = self.pokemon_data
        type_images = [get_markdown_image_for_type(_type) for _type in data.types]

        doc.add_header("Types", 2)
        doc.add_table(
            ["Version", "Type"],
            [["Classic", " ".join(map(str, type_images))]],
            [Table.Align.CENTER, Table.Align.RIGHT],
            0,
        )

    def create_defenses_table(self, doc: Document):
        data = self.pokemon_data
        types = [_type for _type in data.types]
        query_string = f"{types[0]}+{types[1]}" if len(types) > 1 else f"{types[0]}"

        response = get_defensive_matchups_synchronous(query_string)

        # Converting int keys to string so that the keys can actually be checked for
        response = {str(k): v for k, v in response.items()}

        immunities = ""
        normal_resists = ""
        two_weak_resists = ""
        four_weak_resists = ""
        half_strong_resists = ""
        quarter_strong_resists = ""

        if "0" in response:
            immunities = [
                get_markdown_image_for_type(pokemon_type)
                for pokemon_type in response["0"]
            ]

        if "1" in response:
            normal_resists = [
                get_markdown_image_for_type(pokemon_type)
                for pokemon_type in response["1"]
            ]

        if "2" in response:
            two_weak_resists = [
                get_markdown_image_for_type(pokemon_type)
                for pokemon_type in response["2"]
            ]

        if "4" in response:
            four_weak_resists = [
                get_markdown_image_for_type(pokemon_type)
                for pokemon_type in response["4"]
            ]

        if "0.5" in response:
            half_strong_resists = [
                get_markdown_image_for_type(pokemon_type)
                for pokemon_type in response["0.5"]
            ]

        if "0.25" in response:
            quarter_strong_resists = [
                get_markdown_image_for_type(pokemon_type)
                for pokemon_type in response["0.25"]
            ]

        doc.add_header("Defenses", 2)
        doc.add_table(
            [
                "Immune x0",
                "Resistant ×¼",
                "Resistant ×½",
                "Normal ×1",
                "Weak ×2",
                "Weak ×4",
            ],
            [
                [
                    "<br/>".join(map(str, immunities)),
                    "<br/>".join(map(str, quarter_strong_resists)),
                    "<br/>".join(map(str, half_strong_resists)),
                    "<br/>".join(map(str, normal_resists)),
                    "<br/>".join(map(str, two_weak_resists)),
                    "<br/>".join(map(str, four_weak_resists)),
                ]
            ],
        )
        return

    def create_ability_table(self, doc: Document):
        data = self.pokemon_data
        abilities = [ability.title() for ability in data.abilities]

        doc.add_header("Abilities", 2)
        doc.add_table(
            ["Version", "Ability"], [["All", " / ".join(map(str, abilities))]]
        )

    def create_stats_table(self, doc: Document):
        data = self.pokemon_data

        base_stat_total = sum(dict(data.stats).values())

        doc.add_header("Base Stats", 2)
        doc.add_table(
            ["Version", "HP", "Atk", "Def", "SAtk", "SDef", "Spd", "BST"],
            [
                [
                    "All",
                    data.stats.hp,
                    data.stats.attack,
                    data.stats.defense,
                    data.stats.sp_attack,
                    data.stats.sp_defense,
                    data.stats.speed,
                    base_stat_total,
                ]
            ],
        )

    def create_evolution_note(self, doc: Document):
        data = self.pokemon_data

        if not data.evolution:
            return

        doc.add_header("Evolution Change", 2)
        doc.add_paragraph(data.evolution)

    def create_level_up_moves_table(
        self, doc: Document, version_group: PokemonVersions, wiki_name: str
    ):
        data = self.pokemon_data
        moves = {}

        with open(
            f"{data_folder_route}/{wiki_name}/moves.json", encoding="utf-8"
        ) as moves_file:
            file_moves = json.load(moves_file)
            moves_file.close()

        for move_name, details in data.moves.__root__.items():
            if details.learn_method != "level-up":
                continue
            if details.level_learned_at == 0:
                continue

            relevant_past_value = [
                value
                for value in file_moves[move_name]["past_values"]
                if value["version_group"]["name"] == version_group
            ]
            if len(relevant_past_value) > 0:
                file_moves[move_name]["accuracy"] = (
                    relevant_past_value[0]["accuracy"]
                    or file_moves[move_name]["accuracy"]
                )
                file_moves[move_name]["power"] = (
                    relevant_past_value[0]["power"] or file_moves[move_name]["power"]
                )
                file_moves[move_name]["pp"] = (
                    relevant_past_value[0]["power"] or file_moves[move_name]["pp"]
                )
                # special case for curse
                if move_name == "curse":
                    file_moves[move_name]["type"] = "ghost"
                else:
                    past_type = (
                        relevant_past_value[0]["type"]["name"]
                        if relevant_past_value[0]["type"]
                        else None
                    )
                    file_moves[move_name]["type"] = (
                        past_type or file_moves[move_name]["type"]
                    )

            try:
                move_data = MoveDetails.parse_raw(json.dumps(file_moves[move_name]))
            except ValidationError as err:
                print(f"Error parsing move {move_name} for {data.name}: {err}")
                continue

            moves[move_name] = {
                "level_learned": details.level_learned_at,
                "power": move_data.power,
                "type": move_data.type,
                "accuracy": move_data.accuracy,
                "pp": move_data.pp,
                "damage_class": move_data.damage_class,
            }

        sorted_moves = dict(
            sorted(moves.items(), key=lambda x: x[1]["level_learned"], reverse=False)
        )

        doc.add_header("Level Up Moves", 2)
        doc.add_table(
            ["Level", "Name", "Power", "Accuracy", "PP", "Type", "Damage Class"],
            generate_moves_array(sorted_moves, table_type="level_up"),
        )

    def create_learnable_moves(
        self, doc: Document, version_group: PokemonVersions, wiki_name: str
    ):
        data = self.pokemon_data
        moves = {}

        with open(
            f"{data_folder_route}/{wiki_name}/machines.json", encoding="utf-8"
        ) as machines_file:
            machines = json.load(machines_file)
            machines_file.close()

        with open(
            f"{data_folder_route}/{wiki_name}/moves.json", encoding="utf-8"
        ) as moves_file:
            file_moves = json.load(moves_file)
            moves_file.close()

        for move_name, details in data.moves.__root__.items():
            if move_name not in machines:
                continue
            if details.learn_method != "machine":
                continue

            machine_name = ""
            for machine_version in machines[move_name]:
                if machine_version["game_version"] == version_group:
                    machine_name = machine_version["technical_name"]
                    break

            if machine_name == "":
                continue

            relevant_past_value = [
                value
                for value in file_moves[move_name]["past_values"]
                if value["version_group"]["name"] == version_group
            ]
            if len(relevant_past_value) > 0:
                file_moves[move_name]["accuracy"] = (
                    relevant_past_value[0]["accuracy"]
                    or file_moves[move_name]["accuracy"]
                )
                file_moves[move_name]["power"] = (
                    relevant_past_value[0]["power"] or file_moves[move_name]["power"]
                )
                file_moves[move_name]["pp"] = (
                    relevant_past_value[0]["power"] or file_moves[move_name]["pp"]
                )
                past_type = (
                    relevant_past_value[0]["type"]["name"]
                    if relevant_past_value[0]["type"]
                    else None
                )
                file_moves[move_name]["type"] = (
                    past_type or file_moves[move_name]["type"]
                )

            try:
                move_data = MoveDetails.parse_raw(json.dumps(file_moves[move_name]))
            except ValidationError as err:
                print(f"Error parsing move {move_name} for {data.name}: {err}")
                continue

            moves[move_name] = {
                "machine": machine_name.upper(),
                "power": move_data.power,
                "type": move_data.type,
                "accuracy": move_data.accuracy,
                "pp": move_data.pp,
                "damage_class": move_data.damage_class,
            }

        sorted_moves = dict(
            sorted(moves.items(), key=lambda x: x[1]["machine"], reverse=False)
        )

        doc.add_header("Learnable Moves", 2)
        doc.add_table(
            ["Machine", "Name", "Power", "Accuracy", "PP", "Type", "Damage Class"],
            generate_moves_array(sorted_moves, table_type="learnable"),
        )


def get_updated_dict(dict_to_update, path, value):
    obj = dict_to_update
    key_list = path.split(".")

    print(key_list)
    for key in key_list[:-1]:
        print(key)
        obj = obj[key]

    print("Before", obj)
    obj[key_list[-1]] = value
    print("After", obj)


def generate_pokemon(
    wiki_name: str,
    version_group: PokemonVersions,
    range_start: int = 1,
    range_end: int = 650,
):
    pokemon_range = range(range_start, range_end + 1)

    with open(f"dist/{wiki_name}/mkdocs.yml", "r") as mkdocs_file:
        mkdocs_yaml_dict = yaml.load(mkdocs_file, Loader=yaml.FullLoader)
        mkdocs_file.close()

    specific_changes = get_specific_changes_from_yaml(mkdocs_yaml_dict)

    for pokedex_number in tqdm.tqdm(pokemon_range):
        pokemon_name = pokebase.pokemon(pokedex_number).name
        pokemon = Pokemon(pokemon_name)
        pokemon_data = pokemon.get_pokemon_data(wiki_name)

        pokedex_markdown_file_name = get_pokemon_dex_formatted_name(pokedex_number)

        markdown_file_path = f"dist/{wiki_name}/docs/pokemon/"

        doc = Document(pokedex_markdown_file_name)

        doc.add_header(f"{pokedex_markdown_file_name} - {pokemon_data.name.title()}")

        pokemon.add_sprite(doc)
        pokemon.create_type_table(doc)
        pokemon.create_defenses_table(doc)
        pokemon.create_ability_table(doc)
        pokemon.create_stats_table(doc)
        pokemon.create_evolution_note(doc)
        pokemon.create_level_up_moves_table(doc, version_group, wiki_name)
        pokemon.create_learnable_moves(doc, version_group, wiki_name)

        doc.output_page(markdown_file_path)

        specific_change_entry = {
            f"{pokedex_markdown_file_name} - {pokemon_data.name.title()}": f"pokemon/{pokedex_markdown_file_name}.md"
        }

        if specific_change_entry not in specific_changes:
            specific_changes.append(specific_change_entry)

    sorted_specific_changes = sorted(specific_changes, key=lambda x: list(x.keys())[0])

    set_specific_changes_in_yaml(mkdocs_yaml_dict, sorted_specific_changes)

    with open(f"dist/{wiki_name}/mkdocs.yml", "w") as mkdocs_file:
        yaml.dump(mkdocs_yaml_dict, mkdocs_file, sort_keys=False, indent=4)
        mkdocs_file.close()


# def generate_type_changes():
#     # When generating pokemon, check if type has changed from the original and add it to a list.


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("-wn", "--wiki_name", help="The name of the wiki")
    parser.add_argument(
        "-vg",
        "--version-group",
        help="The version group where the moves will come from",
    )
    parser.add_argument(
        "-r",
        "--range",
        nargs=2,
        help="The range of pokemon to generate (start end)",
        type=int,
    )
    args = parser.parse_args()

    if args.range:
        generate_pokemon(
            args.wiki_name, args.version_group, args.range[0], args.range[1]
        )
    else:
        generate_pokemon(args.wiki_name, args.version_group)