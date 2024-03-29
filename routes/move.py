import cProfile
import pstats
from typing import List
from fastapi import APIRouter, WebSocket
import json

import yaml

from models.move_models import MachineVersion, MoveDetails
from models.pokemon_models import PokemonVersions, PreparationState
from models.wikis_models import PreparationData
from move_page_generator import generate_move_page
from pokemon_pages_generator import generate_pages_from_pokemon_list
from prepare_large_data import prepare_move_data
from utils import obj_dict


router = APIRouter()

data_folder_route = "data"


def track_move_changes(moves, move_name, move_attribute, modified_moves, new_value):
    if move_attribute not in modified_moves[move_name]:
        modified_moves[move_name][move_attribute] = {}

    if "original" not in modified_moves[move_name][move_attribute]:
        modified_moves[move_name][move_attribute]["original"] = moves[move_name][
            move_attribute
        ]

    if move_attribute == "machine_details":
        modified_moves[move_name][move_attribute]["new"] = json.loads(
            json.dumps(new_value, default=obj_dict)
        )
    else:
        modified_moves[move_name][move_attribute]["new"] = new_value

    if (
        modified_moves[move_name][move_attribute]["original"]
        == modified_moves[move_name][move_attribute]["new"]
    ):
        del modified_moves[move_name][move_attribute]


def update_pokemon_with_move_page(moves: dict, move_name: str, wiki_name: str):
    with open(
        f"{data_folder_route}/{wiki_name}/pokemon.json", encoding="utf-8"
    ) as pokemon_file:
        pokemon = json.load(pokemon_file)
        pokemon_file.close()

    with open(f"dist/{wiki_name}/mkdocs.yml", "r") as mkdocs_file:
        mkdocs_yaml_dict = yaml.load(mkdocs_file, Loader=yaml.FullLoader)
        mkdocs_file.close()

    with open("data/wikis.json", encoding="utf-8") as wikis_file:
        wikis = json.load(wikis_file)
        wikis_file.close()

    with open(
        f"{data_folder_route}/{wiki_name}/abilities.json", encoding="utf-8"
    ) as abilities_file:
        abilities = json.load(abilities_file)
        abilities_file.close()

    version_group = wikis[wiki_name]["settings"]["version_group"]

    pokemon_to_generate_page_for = []
    for pokemon_name in pokemon:
        if move_name in pokemon[pokemon_name]["moves"]:
            pokemon_to_generate_page_for.append(
                {"name": pokemon_name, "dex_number": pokemon[pokemon_name]["id"]}
            )

    generate_pages_from_pokemon_list(
        wiki_name=wiki_name,
        version_group=PokemonVersions(version_group),
        file_pokemon=pokemon,
        file_moves=moves,
        file_abilities=abilities,
        pokemon_to_generate_page_for=pokemon_to_generate_page_for,
        mkdocs_yaml_dict=mkdocs_yaml_dict,
    )


# Get all move names, which is the key of the move dict
@router.get("/moves/{wiki_name}")
async def get_moves_list(wiki_name: str):
    with open(
        f"{data_folder_route}/{wiki_name}/moves.json", encoding="utf-8"
    ) as moves_file:
        moves = json.load(moves_file)
        moves_file.close()

    return list(moves.keys())


# Get move by name
@router.get("/moves/single/{wiki_name}")
async def get_move(move_name_or_id: str | int, wiki_name: str):
    with open(
        f"{data_folder_route}/{wiki_name}/moves.json", encoding="utf-8"
    ) as moves_file:
        moves = json.load(moves_file)
        moves_file.close()

    if move_name_or_id.isdigit():
        for move_name in moves:
            if moves[move_name]["id"] == int(move_name_or_id):
                return moves[move_name]
        return {"message": "Move not found", "status": 404}

    move_name = move_name_or_id.lower()
    if move_name not in moves:
        return {"message": "Move not found", "status": 404}
    return moves[move_name_or_id]


# Save Changes to move
@router.post("/moves/edit/{wiki_name}")
def save_move_changes(move_details: MoveDetails, move_name: str, wiki_name: str):
    with open(
        f"{data_folder_route}/{wiki_name}/moves.json", encoding="utf-8"
    ) as moves_file:
        moves = json.load(moves_file)
        moves_file.close()

    with open(
        f"{data_folder_route}/{wiki_name}/modifications/modified_moves.json",
        encoding="utf-8",
    ) as moves_changes_file:
        modified_moves = json.load(moves_changes_file)
        moves_changes_file.close()

    if move_name not in modified_moves:
        modified_moves[move_name] = {}

    if move_details.power:
        track_move_changes(
            moves, move_name, "power", modified_moves, move_details.power
        )
        moves[move_name]["power"] = move_details.power

    if move_details.accuracy:
        track_move_changes(
            moves, move_name, "accuracy", modified_moves, move_details.accuracy
        )
        moves[move_name]["accuracy"] = move_details.accuracy

    if move_details.pp:
        track_move_changes(moves, move_name, "pp", modified_moves, move_details.pp)
        moves[move_name]["pp"] = move_details.pp

    if move_details.type:
        track_move_changes(moves, move_name, "type", modified_moves, move_details.type)
        moves[move_name]["type"] = move_details.type

    if move_details.damage_class:
        track_move_changes(
            moves, move_name, "damage_class", modified_moves, move_details.damage_class
        )
        moves[move_name]["damage_class"] = move_details.damage_class

    if move_details.machine_details:
        track_move_changes(
            moves,
            move_name,
            "machine_details",
            modified_moves,
            move_details.machine_details,
        )
        moves[move_name]["machine_details"] = json.loads(
            json.dumps(move_details.machine_details, default=obj_dict)
        )

    with open(f"{data_folder_route}/{wiki_name}/moves.json", "w") as moves_file:
        moves_file.write(json.dumps(moves))
        moves_file.close()

    if not modified_moves[move_name]:
        del modified_moves[move_name]

    with open(
        f"{data_folder_route}/{wiki_name}/modifications/modified_moves.json",
        "w",
    ) as moves_changes_file:
        moves_changes_file.write(json.dumps(modified_moves))
        moves_changes_file.close()

    # function to find all pokemon that have this move and update them

    # TODO: Combination of these functions causes some lag on the page.
    # Need to either optimize or generate the page in the background
    update_pokemon_with_move_page(moves, move_name, wiki_name)
    generate_move_page(wiki_name)

    return {"message": "Changes Saved"}


# Note: Data preparation here is EXTREMELLY slow.
# It's best to just copy over and modify moves already in generator_assets folder.
@router.websocket("/moves/prepare-data")
async def prepare_data(websocket: WebSocket):
    await websocket.accept()
    preparation_data = await websocket.receive_json()

    wiki_name = preparation_data["wiki_name"]
    range_start = preparation_data["range_start"]
    range_end = preparation_data["range_end"]

    try:
        moves = await prepare_move_data(websocket, wiki_name, range_start, range_end)
    except Exception as e:
        return {"message": str(e)}

    await websocket.send_json(
        {
            "message": "Move Data Prepared",
            "state": PreparationState.FINISHED.value,
            "moves": list(moves.keys()),
        }
    )
