import cProfile
import json
import pstats
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


def add_sprite(doc: Document, pokemon_data: PokemonData, dex_number: int):
    doc.add_element(
        Paragraph(
            [
                InlineText(
                    f"{pokemon_data.name}",
                    url=f"../img/pokemon/{get_pokemon_dex_formatted_name(dex_number)}.png",
                    image=True,
                )
            ]
        )
    )


def create_type_table(doc: Document, pokemon_data: PokemonData):
    data = pokemon_data
    type_images = [get_markdown_image_for_type(_type) for _type in data.types]

    doc.add_header("Types", 2)
    doc.add_table(
        ["Version", "Type"],
        [["Classic", " ".join(map(str, type_images))]],
        [Table.Align.CENTER, Table.Align.RIGHT],
        0,
    )


def create_defenses_table(doc: Document, pokemon_data: PokemonData):
    data = pokemon_data
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
            get_markdown_image_for_type(pokemon_type) for pokemon_type in response["0"]
        ]

    if "1" in response:
        normal_resists = [
            get_markdown_image_for_type(pokemon_type) for pokemon_type in response["1"]
        ]

    if "2" in response:
        two_weak_resists = [
            get_markdown_image_for_type(pokemon_type) for pokemon_type in response["2"]
        ]

    if "4" in response:
        four_weak_resists = [
            get_markdown_image_for_type(pokemon_type) for pokemon_type in response["4"]
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


def create_ability_table(doc: Document, pokemon_data: PokemonData):
    data = pokemon_data
    abilities = [ability.title() for ability in data.abilities]

    doc.add_header("Abilities", 2)
    doc.add_table(["Version", "Ability"], [["All", " / ".join(map(str, abilities))]])


def create_stats_table(doc: Document, pokemon_data: PokemonData):
    data = pokemon_data

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


def create_evolution_table(doc: Document, pokemon_data: PokemonData):
    data = pokemon_data

    if not data.evolution:
        return

    def determine_evo_item_level_note():
        if data.evolution.item:
            return f"{data.evolution.item.title()}"
        elif data.evolution.level:
            return f"{data.evolution.level}"
        elif data.evolution.other:
            return f"{data.evolution.other.title()}"
        else:
            return ""

    doc.add_header("Evolution Change", 2)
    doc.add_table(
        ["Method", "Item/Level/Note", "Evolved Pokemon"],
        [
            [
                data.evolution.method.title(),
                determine_evo_item_level_note(),
                data.evolution.evolved_pokemon.title(),
            ],
        ],
    )


def create_level_up_moves_table(
    doc: Document,
    version_group: PokemonVersions,
    file_moves: dict,
    pokemon_data: PokemonData,
):
    data = pokemon_data
    moves = {}

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
                relevant_past_value[0]["accuracy"] or file_moves[move_name]["accuracy"]
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


# TODO: Modify to consider consolidated moves and machine moves
def create_learnable_moves(
    doc: Document,
    version_group: PokemonVersions,
    file_moves: dict,
    pokemon_data: PokemonData,
):
    data = pokemon_data
    moves = {}

    for move_name, details in data.moves.__root__.items():
        # TODO: Consider removing this check since any move could be a machine
        if file_moves[move_name]["machine_details"] is None:
            continue
        if details.learn_method != "machine":
            continue

        machine_name = ""

        for machine_version in file_moves[move_name]["machine_details"]:
            if machine_version["game_version"] == version_group.value:
                machine_name = machine_version["technical_name"]
                break

        # Revise code to consider the following example logic:
        # Shadow ball has past value for firered-leafgreen (power is 10)
        #   current iteration has power 20, meaning every gen since firered-leafgreen has power 20

        # Example Wikis:
        #   First wiki is from diamond-pearl, so shadow ball should have power 20
        #   Second wiki is from red-blue, so shadow ball should have power 10
        #   With current logic, shadow ball will have power 20 for both wikis

        relevant_past_value = [
            value
            for value in file_moves[move_name]["past_values"]
            if value["version_group"]["name"] == version_group.value
        ]

        if len(relevant_past_value) > 0:
            file_moves[move_name]["accuracy"] = (
                relevant_past_value[0]["accuracy"] or file_moves[move_name]["accuracy"]
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
            file_moves[move_name]["type"] = past_type or file_moves[move_name]["type"]

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


def generate_pages_from_pokemon_list(
    wiki_name: str,
    version_group: PokemonVersions,
    file_pokemon: dict,
    file_moves: dict,
    pokemon_to_generate_page_for: list,
    mkdocs_yaml_dict: dict = None,
):
    specific_changes = get_specific_changes_from_yaml(mkdocs_yaml_dict)

    for pokemon in tqdm.tqdm(pokemon_to_generate_page_for):
        pokemon_data = PokemonData.parse_raw(json.dumps(file_pokemon[pokemon["name"]]))

        pokedex_markdown_file_name = get_pokemon_dex_formatted_name(
            pokemon["dex_number"]
        )

        markdown_file_path = f"dist/{wiki_name}/docs/pokemon/"

        doc = Document(pokedex_markdown_file_name)

        doc.add_header(f"{pokedex_markdown_file_name} - {pokemon_data.name.title()}")

        add_sprite(doc, pokemon_data, pokemon["dex_number"])
        create_type_table(doc, pokemon_data)
        create_defenses_table(doc, pokemon_data)
        create_ability_table(doc, pokemon_data)
        create_stats_table(doc, pokemon_data)
        create_evolution_table(doc, pokemon_data)
        create_level_up_moves_table(doc, version_group, file_moves, pokemon_data)
        create_learnable_moves(doc, version_group, wiki_name, file_moves, pokemon_data)

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


# generate pages for pokemon range
def generate_pages_from_range(
    wiki_name: str,
    version_group: PokemonVersions,
    pokemon: dict = None,
    file_moves: dict = None,
    mkdocs_yaml_dict: dict = None,
    range_start: int = 1,
    range_end: int = 650,
):
    pokemon_range = range(range_start, range_end + 1)

    specific_changes = get_specific_changes_from_yaml(mkdocs_yaml_dict)

    for pokedex_number in tqdm.tqdm(pokemon_range):
        pokemon_name = pokebase.pokemon(pokedex_number).name
        pokemon_data = PokemonData.parse_raw(json.dumps(pokemon[pokemon_name]))

        pokedex_markdown_file_name = get_pokemon_dex_formatted_name(pokedex_number)

        markdown_file_path = f"dist/{wiki_name}/docs/pokemon/"

        doc = Document(pokedex_markdown_file_name)

        doc.add_header(f"{pokedex_markdown_file_name} - {pokemon_data.name.title()}")

        add_sprite(doc, pokemon_data, pokedex_number)
        create_type_table(doc, pokemon_data)
        create_defenses_table(doc, pokemon_data)
        create_ability_table(doc, pokemon_data)
        create_stats_table(doc, pokemon_data)
        create_evolution_table(doc, pokemon_data)
        create_level_up_moves_table(doc, version_group, file_moves, pokemon_data)
        create_learnable_moves(doc, version_group, file_moves, pokemon_data)

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
