import argparse
import json
from genericpath import isfile
from json import JSONDecodeError
from fastapi import WebSocket
import requests
import tqdm
import sys

from models.pokemon_models import PreparationState


data_folder_route = "data"


def get_markdown_file_name(pokedex_number):
    file_name = f"00{pokedex_number}"
    if pokedex_number > 9:
        file_name = f"0{pokedex_number}"
    if pokedex_number > 99:
        file_name = f"{pokedex_number}"

    return file_name


def prepare_technical_and_hidden_machines_data(wiki_name: str):
    machine_range = range(1, 1689)
    machines = {}
    for machine_id in tqdm.tqdm(machine_range):
        response = requests.get(f"https://pokeapi.co/api/v2/machine/{machine_id}")

        if response == "Not Found":
            continue

        machine_data = response.json()
        machine_name = machine_data["move"]["name"]

        if machine_name not in machines:
            machines[machine_name] = []

        machines[machine_data["move"]["name"]].append(
            {
                "technical_name": machine_data["item"]["name"],
                "game_version": machine_data["version_group"]["name"],
            }
        )
    # Might be a better idea to append each new machine to the file
    # rather downloading all at once and then storing in file
    # That approach would likely be more tolerant of any faults that
    # may arise on the network side
    with open(
        f"{data_folder_route}/{wiki_name}/machines.json", "w"
    ) as machine_data_file:
        machine_data_file.write(json.dumps(machines))
        machine_data_file.close()


async def prepare_move_data(
    websocket: WebSocket, wiki_name: str, range_start: int, range_end: int
):
    move_range = range(range_start, range_end + 1)
    moves = {}

    await websocket.send_json(
        {
            "message": f"Preparing Data for {range_end} Moves",
            "state": PreparationState.START.value,
        }
    )
    for move_id in tqdm.tqdm(move_range):
        await websocket.send_json(
            {
                "message": "Tracking Progress",
                "state": PreparationState.IN_PROGRESS.value,
                "progress": int((move_id / range_end) * 100),
            }
        )
        response = requests.get(f"https://pokeapi.co/api/v2/move/{move_id}")
        if response == "Not Found":
            continue

        try:
            move = response.json()
        except JSONDecodeError as err:
            print(f"Move with id {move_id} failed: {err}")
            continue

        # TODO: Add option to download from online as well
        machine_details = []
        if move["machines"]:
            for machine in move["machines"]:
                machine_id = machine["machine"]["url"].split("/")[-2]
                machines_response = requests.get(
                    f"https://pokeapi.co/api/v2/machine/{machine_id}"
                )

                if machines_response == "Not Found":
                    continue

                try:
                    machines = machines_response.json()
                except JSONDecodeError as err:
                    print(f"Machine with id {machine_id} failed: {err}")
                    continue

                machine_details.append(
                    {
                        "technical_name": machines["item"]["name"],
                        "game_version": machines["version_group"]["name"],
                    }
                )

        moves[move["name"]] = {
            "id": move_id,
            "power": move["power"],
            "type": move["type"]["name"],
            "accuracy": move["accuracy"],
            "pp": move["pp"],
            "damage_class": move["damage_class"]["name"],
            "past_values": move["past_values"],
            "machine_details": machine_details,
        }

    fh = open(f"{data_folder_route}/{wiki_name}/moves.json", "w")
    fh.write(json.dumps(moves))
    fh.close()

    return moves


def prepare_items_data():
    items_range = range(1, 2050)
    items = {}

    for item_id in tqdm.tqdm(items_range):
        response = requests.get(f"https://pokeapi.co/api/v2/item/{item_id}")

        if response == "Not Found":
            continue

        try:
            item = response.json()
        except JSONDecodeError as err:
            print(f"Item with id {item_id} failed: {err}")
            continue

        for effect in item["effect_entries"]:
            if effect["language"]["name"] == "en":
                item_effect = effect["effect"]
                break

        items[item["name"]] = {
            "effect": item_effect,
            "sprite": item["sprites"]["default"],
        }

    fh = open(f"temp/items.json", "w")
    fh.write(json.dumps(items))
    fh.close()


def prepare_ability_data(wiki_name: str):
    ability_range = range(1, 359)
    abilities = {}

    for ability_id in tqdm.tqdm(ability_range):
        response = requests.get(f"https://pokeapi.co/api/v2/ability/{ability_id}")

        if response == "Not Found":
            continue

        try:
            ability = response.json()
        except JSONDecodeError as err:
            print(f"Ability with id {ability_id} failed: {err}")
            continue

        for effect in ability["effect_entries"]:
            if effect["language"]["name"] == "en":
                ability_effect = effect["effect"]
                break

        abilities[ability["name"]] = {
            "effect": ability_effect,
        }

    fh = open(f"{data_folder_route}/{wiki_name}/abilities.json", "w")
    fh.write(json.dumps(abilities))
    fh.close()


def prepare_nature_data(wiki_name: str):
    nature_range = range(1, 26)
    natures = {}

    for nature_id in tqdm.tqdm(nature_range):
        response = requests.get(f"https://pokeapi.co/api/v2/nature/{nature_id}")

        if response == "Not Found":
            continue

        try:
            nature = response.json()
        except JSONDecodeError as err:
            print(f"Nature with id {nature_id} failed: {err}")
            continue

        if nature["decreased_stat"] is None:
            nature["decreased_stat"] = {"name": None}

        if nature["increased_stat"] is None:
            nature["increased_stat"] = {"name": None}

        natures[nature["name"]] = {
            "increased_stat": nature["increased_stat"]["name"],
            "decreased_stat": nature["decreased_stat"]["name"],
        }

    fh = open(f"{data_folder_route}/{wiki_name}/natures.json", "w")
    fh.write(json.dumps(natures))
    fh.close()


def prepare_items_natures_abilities_data(wiki_name: str):
    # prepare_items_data()
    prepare_ability_data(wiki_name)
    prepare_nature_data(wiki_name)


async def download_pokemon_data(
    wiki_name: str,
    websocket: WebSocket,
    pokemon_range_start: int = 1,
    pokemon_range_end: int = 650,
):
    pokedex_numbers = range(pokemon_range_start, pokemon_range_end + 1)
    total_pokemon = pokemon_range_end - pokemon_range_start

    with open(f"{data_folder_route}/{wiki_name}/pokemon.json", "r") as pokemon_file:
        pokemon = json.load(pokemon_file)
        pokemon_file.close()

    await websocket.send_json(
        {
            "message": f"Preparing Data for {total_pokemon} Pokemon",
            "state": PreparationState.START.value,
        }
    )
    for index, dex_number in enumerate(tqdm.tqdm(pokedex_numbers)):
        progress = (index / total_pokemon) * 100
        await websocket.send_json(
            {
                "message": "Tracking Progress",
                "state": PreparationState.IN_PROGRESS.value,
                "progress": int(progress),
            }
        )
        response = "Not Found"
        try:
            response = requests.get(f"https://pokeapi.co/api/v2/pokemon/{dex_number}")
        except requests.exceptions.ConnectionError as err:
            await websocket.send_json(
                {"message": f"Pokemon with id {dex_number} failed: {err}"}
            )
            continue

        if response == "Not Found":
            continue

        pokemon_data = response.json()

        # flatten data structure to make it easier to work with
        types = []
        for type in pokemon_data["types"]:
            types.append(type["type"]["name"])

        abilities = []
        for ability in pokemon_data["abilities"]:
            abilities.append(ability["ability"]["name"])

        stats = {}
        for stat in pokemon_data["stats"]:
            stat_name = stat["stat"]["name"]
            if stat_name == "special-attack":
                stat_name = "sp_attack"

            if stat_name == "special-defense":
                stat_name = "sp_defense"

            stats[stat_name] = stat["base_stat"]

        moves = {}
        for move in pokemon_data["moves"]:
            group_details = move["version_group_details"]
            move_details = None
            for detail in group_details:
                if detail["version_group"]["name"] == "black-white":
                    move_details = detail
                    break

            if move_details is None:
                continue

            move_name = move["move"]["name"]
            moves[move_name] = {
                "level_learned_at": move_details["level_learned_at"],
                "learn_method": move_details["move_learn_method"]["name"],
            }

        pokemon_data["sprite"] = pokemon_data["sprites"]["front_default"]
        pokemon_data["stats"] = stats
        pokemon_data["abilities"] = abilities
        pokemon_data["types"] = types
        pokemon_data["moves"] = moves

        # remove unnecessary data
        del pokemon_data["game_indices"]
        del pokemon_data["held_items"]
        del pokemon_data["species"]
        del pokemon_data["location_area_encounters"]
        del pokemon_data["weight"]
        del pokemon_data["height"]
        del pokemon_data["forms"]
        del pokemon_data["order"]
        del pokemon_data["is_default"]
        del pokemon_data["past_types"]
        del pokemon_data["base_experience"]
        del pokemon_data["sprites"]
        pokemon[pokemon_data["name"]] = pokemon_data

    with open(f"{data_folder_route}/{wiki_name}/pokemon.json", "w") as pokemon_file:
        pokemon_file.write(json.dumps(pokemon))
        pokemon_file.close()

    await websocket.send_json(
        {
            "message": "Data Preparation Complete",
            "state": PreparationState.COMPLETE.value,
        }
    )

    return pokemon


async def download_pokemon_sprites(
    wiki_name: str,
    websocket: WebSocket,
    pokemon_range_start: int = 1,
    pokemon_range_end: int = 650,
):
    pokedex_numbers = range(pokemon_range_start, pokemon_range_end + 1)
    total_pokemon = pokemon_range_end - pokemon_range_start

    with open(
        f"{data_folder_route}/{wiki_name}/pokemon.json", encoding="utf-8"
    ) as pokemon_file:
        pokemon = json.load(pokemon_file)
        pokemon_file.close()

    await websocket.send_json(
        {
            "message": f"Preparing Sprites for {total_pokemon} Pokemon",
            "state": PreparationState.START.value,
        }
    )
    for index, dex_number in enumerate(tqdm.tqdm(pokedex_numbers)):
        progress = (index / total_pokemon) * 100
        await websocket.send_json(
            {
                "message": "Tracking Progress",
                "state": PreparationState.IN_PROGRESS.value,
                "progress": int(progress),
            }
        )
        image_file_name = get_markdown_file_name(dex_number)
        if isfile(f"dist/{wiki_name}/docs/img/pokemon/{image_file_name}.png"):
            continue

        for _, pokemon_data in pokemon.items():
            if pokemon_data["id"] == dex_number:
                sprite_url = pokemon_data["sprite"]
                break

        try:
            image_response = requests.get(f"{sprite_url}")
        except requests.exceptions.ConnectionError as err:
            await websocket.send_json(
                {
                    "message": f"Downloading Sprite for pokemon with id {dex_number} failed: {err}"
                }
            )
            continue

        with open(
            f"dist/{wiki_name}/docs/img/pokemon/{image_file_name}.png", "wb"
        ) as pokemon_image_sprite_file:
            pokemon_image_sprite_file.write(image_response.content)
            pokemon_image_sprite_file.close()

    await websocket.send_json(
        {
            "message": "Sprite Preparation Complete",
            "state": PreparationState.COMPLETE.value,
        }
    )


if __name__ == "__main__":
    parser = argparse.ArgumentParser()

    parser.add_argument(
        "-p", "--pokemon", help="Download pokemon data", action="store_true"
    )
    parser.add_argument(
        "-s", "--sprites", help="Download pokemon sprites", action="store_true"
    )
    parser.add_argument(
        "-ian",
        "--accessories",
        help="Download items, abilities and natures data",
        action="store_true",
    )
    parser.add_argument(
        "-tm",
        "--machines",
        help="Download technical and hidden machines data",
        action="store_true",
    )
    parser.add_argument(
        "-m", "--moves", help="Download moves data", action="store_true"
    )
    parser.add_argument(
        "-r",
        "--range",
        help="Specify range of data to download. Note: This can be pokemon, moves, sprites, etc",
        nargs=2,
        type=int,
    )
    parser.add_argument(
        "-wn",
        "--wiki-name",
        help="Specify the name of the wiki to download data from",
        type=str,
    )

    args = parser.parse_args()

    if args.pokemon:
        if args.range:
            download_pokemon_data(args.wiki_name, args.range[0], args.range[1])
        else:
            download_pokemon_data()

    if args.sprites:
        download_pokemon_sprites(args.wiki_name)

    if args.machines:
        prepare_technical_and_hidden_machines_data(args.wiki_name)

    if args.moves:
        prepare_move_data(args.wiki_name, args.range[0], args.range[1])

    if args.accessories:
        prepare_items_natures_abilities_data(args.wiki_name)
