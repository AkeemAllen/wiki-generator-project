# from typing import List
from typing import List
from fastapi import APIRouter, WebSocket
import json

import yaml


from models.pokemon_models import (
    MoveChange,
    Operation,
    PokemonChanges,
    PokemonMoveChanges,
    PokemonVersions,
    PreparationState,
)
from type_page_generator import generate_type_page
from evolution_page_generator import generate_evolution_page
from pokemon_pages_generator import generate_pages_from_pokemon_list

from models.wikis_models import PreparationData
from prepare_large_data import download_pokemon_data, download_pokemon_sprites


router = APIRouter()

data_folder_route = "data"


def save_and_generate_pokemon(
    wiki_name: str, pokemon: dict, pokemon_generation_list: list
):
    with open(f"{data_folder_route}/{wiki_name}/pokemon.json", "w") as pokemon_file:
        pokemon_file.write(json.dumps(pokemon))
        pokemon_file.close()

    with open(
        f"{data_folder_route}/{wiki_name}/moves.json", encoding="utf-8"
    ) as moves_file:
        file_moves = json.load(moves_file)
        moves_file.close()

    with open(f"dist/{wiki_name}/mkdocs.yml", "r") as mkdocs_file:
        mkdocs_yaml_dict = yaml.load(mkdocs_file, Loader=yaml.FullLoader)
        mkdocs_file.close()

    with open("data/wikis.json", encoding="utf-8") as wikis_file:
        wikis = json.load(wikis_file)
        wikis_file.close()

    with open(f"{data_folder_route}/{wiki_name}/abilities.json", "r") as abilities_file:
        abilities = json.load(abilities_file)
        abilities_file.close()

    version_group = wikis[wiki_name]["settings"]["version_group"]

    generate_pages_from_pokemon_list(
        wiki_name=wiki_name,
        version_group=PokemonVersions(version_group),
        file_pokemon=pokemon,
        file_moves=file_moves,
        file_abilities=abilities,
        mkdocs_yaml_dict=mkdocs_yaml_dict,
        pokemon_to_generate_page_for=pokemon_generation_list,
    )


# Get all pokemon and return by dict with name and id
@router.get("/pokemon/{wiki_name}")
async def get_pokemon_list(wiki_name: str):
    with open(
        f"{data_folder_route}/{wiki_name}/pokemon.json", encoding="utf-8"
    ) as pokemon_file:
        pokemon = json.load(pokemon_file)
        pokemon_file.close()

    return [
        {"name": pokemon_name, "id": attributes["id"]}
        for pokemon_name, attributes in pokemon.items()
    ]


# Get pokemon by name
@router.get("/pokemon/single/{wiki_name}")
async def get_pokemon(pokemon_name_or_id: str, wiki_name: str):
    with open(
        f"{data_folder_route}/{wiki_name}/pokemon.json", encoding="utf-8"
    ) as pokemon_file:
        pokemon = json.load(pokemon_file)
        pokemon_file.close()

    if pokemon_name_or_id.isdigit():
        for pokemon_name, attributes in pokemon.items():
            if attributes["id"] == int(pokemon_name_or_id):
                return pokemon[pokemon_name]
        return {"message": "Pokemon not found", "status": 404}

    pokemon_name = pokemon_name_or_id.lower()
    if pokemon_name not in pokemon:
        return {"message": "Pokemon not found", "status": 404}

    return pokemon[pokemon_name]


# Save Changes to pokemon
@router.post("/pokemon/edit/{wiki_name}")
async def save_pokemon_changes(
    changes: PokemonChanges, pokemon_name: str, wiki_name: str
):
    with open(
        f"{data_folder_route}/{wiki_name}/modifications/modified_pokemon.json",
        encoding="utf-8",
    ) as modified_pokemon_file:
        modified_pokemon = json.load(modified_pokemon_file)
        modified_pokemon_file.close()

    # Initialize pokemon in modified_pokemon if not already
    if pokemon_name not in modified_pokemon:
        modified_pokemon[pokemon_name] = {}

    with open(
        f"{data_folder_route}/{wiki_name}/pokemon.json", encoding="utf-8"
    ) as pokemon_file:
        pokemon = json.load(pokemon_file)
        pokemon_file.close()

    if pokemon_name not in pokemon:
        return {"message": "Pokemon not found", "status": 404}

    if changes.abilities:
        pokemon[pokemon_name]["abilities"] = changes.abilities

    if changes.stats:
        for stat, value in changes.stats.dict(exclude_none=True).items():
            pokemon[pokemon_name]["stats"][stat] = value

    if changes.moves:
        for move, value in changes.moves.__root__.items():
            if value.delete:
                del pokemon[pokemon_name]["moves"][move]
                continue

            pokemon[pokemon_name]["moves"][move] = {
                "level_learned_at": value.level_learned_at,
                "learn_method": value.learn_method,
            }

    if changes.types:
        # Initialize types in modified_pokemon if not already
        if "types" not in modified_pokemon[pokemon_name]:
            modified_pokemon[pokemon_name]["types"] = {}

        # I needed a way to track the original pokemon types without having it be overwritten.
        # This "original" key is only set once during the first type change and should never be changed again.
        if "original" not in modified_pokemon[pokemon_name]["types"]:
            modified_pokemon[pokemon_name]["types"]["original"] = pokemon[pokemon_name][
                "types"
            ]

        pokemon[pokemon_name]["types"] = [
            type for type in changes.types if type != "None"
        ]

        modified_pokemon[pokemon_name]["types"]["new"] = pokemon[pokemon_name]["types"]

        # If the original and new types are the same, delete the types key from modified_pokemon
        if set(modified_pokemon[pokemon_name]["types"]["original"]) == set(
            modified_pokemon[pokemon_name]["types"]["new"]
        ):
            del modified_pokemon[pokemon_name]["types"]

        # generate type page
        generate_type_page(wiki_name, modified_pokemon)

    if changes.evolution:
        if changes.evolution.method == "no change":
            del pokemon[pokemon_name]["evolution"]
            del modified_pokemon[pokemon_name]["evolution"]
        else:
            pokemon[pokemon_name]["evolution"] = {}
            for detail, value in changes.evolution.dict(exclude_none=True).items():
                if detail != "delete":
                    pokemon[pokemon_name]["evolution"][detail] = value

            modified_pokemon[pokemon_name]["evolution"] = pokemon[pokemon_name][
                "evolution"
            ]
        # generate evolution page
        generate_evolution_page(wiki_name, modified_pokemon)

    if modified_pokemon[pokemon_name] == {}:
        del modified_pokemon[pokemon_name]

    with open(
        f"{data_folder_route}/{wiki_name}/modifications/modified_pokemon.json",
        "w",
    ) as modified_pokemon_file:
        modified_pokemon_file.write(json.dumps(modified_pokemon))
        modified_pokemon_file.close()

    save_and_generate_pokemon(
        wiki_name,
        pokemon,
        [{"name": pokemon_name, "dex_number": pokemon[pokemon_name]["id"]}],
    )

    return {"message": "Changes Saved"}


# Set function only for machine moves
@router.post("/pokemon/add-machine-moves/{wiki_name}")
async def save_multiple_pokemon_move_changes(
    wiki_name: str, pokemon_being_modified: List[str], moves_being_added: List[str]
):
    with open(
        f"{data_folder_route}/{wiki_name}/pokemon.json", encoding="utf-8"
    ) as pokemon_file:
        pokemon = json.load(pokemon_file)
        pokemon_file.close()

    # Initialize pokemon in modified_pokemon if not already
    for pokemon_name in pokemon_being_modified:
        for move in moves_being_added:
            # fix potential bug here.
            if move in pokemon[pokemon_name]["moves"]:
                previous_learn_method = pokemon[pokemon_name]["moves"][move][
                    "learn_method"
                ]
                if "machine" not in previous_learn_method:
                    pokemon[pokemon_name]["moves"][move]["learn_method"] = [
                        previous_learn_method,
                        "machine",
                    ]
            else:
                pokemon[pokemon_name]["moves"][move] = {
                    "level_learned_at": 0,
                    "learn_method": ["machine"],
                }

    save_and_generate_pokemon(
        wiki_name,
        pokemon,
        [
            {"name": pokemon_name, "dex_number": pokemon[pokemon_name]["id"]}
            for pokemon_name in pokemon_being_modified
        ],
    )

    return {"message": "Changes Saved"}


def add_or_shift_move(pokemon, pokemon_name, move_name, level, previous_learn_method):
    pokemon[pokemon_name]["moves"][move_name] = {
        "level_learned_at": level,
        "learn_method": (
            ["level-up", "machine"]
            if "machine" in previous_learn_method
            else ["level-up"]
        ),
    }


def replace_move(pokemon, pokemon_name, move_name, secondary_move):
    pokemon[pokemon_name]["moves"][secondary_move] = pokemon[pokemon_name]["moves"][
        move_name
    ]
    del pokemon[pokemon_name]["moves"][move_name]


def replace_by_level(pokemon, pokemon_name, level, move_name, previous_learn_method):
    # consider presorting moves on pokemon by level to make this more effecient
    for move in pokemon[pokemon_name]["moves"]:
        if pokemon[pokemon_name]["moves"][move]["level_learned_at"] == level:
            del pokemon[pokemon_name]["moves"][move]
            break
    pokemon[pokemon_name]["moves"][move_name] = {
        "level_learned_at": level,
        "learn_method": (
            ["level-up", "machine"]
            if "machine" in previous_learn_method
            else ["level-up"]
        ),
    }


def swap_moves(pokemon, pokemon_name, move_name, secondary_move, previous_learn_method):
    temp = pokemon[pokemon_name]["moves"][move_name]
    pokemon[pokemon_name]["moves"][move_name] = pokemon[pokemon_name]["moves"][
        secondary_move
    ]
    pokemon[pokemon_name]["moves"][secondary_move] = temp

    # Setting Learn Method to level-up for swapped moves
    pokemon[pokemon_name]["moves"][move_name]["learn_method"] = (
        ["level-up", "machine"] if "machine" in previous_learn_method else ["level-up"]
    )
    pokemon[pokemon_name]["moves"][secondary_move]["learn_method"] = (
        ["level-up", "machine"] if "machine" in previous_learn_method else ["level-up"]
    )


@router.post("/pokemon/modify-level-moves/{wiki_name}")
async def modify_level_moves(pokemonMoveChanges: PokemonMoveChanges, wiki_name: str):
    with open(
        f"{data_folder_route}/{wiki_name}/pokemon.json", encoding="utf-8"
    ) as pokemon_file:
        pokemon = json.load(pokemon_file)
        pokemon_file.close()

    # with open(
    #     f"{data_folder_route}/{wiki_name}/moves.json", encoding="utf-8"
    # ) as moves_file:
    #     moves = json.load(moves_file)
    #     moves_file.close()

    pokemon_name = pokemonMoveChanges.pokemon

    for move_change in pokemonMoveChanges.move_changes:
        operation = move_change.operation
        move_name = move_change.move_name

        # if move_name not in moves:
        #     return {"message": f"Move {move_name} not found", "status": 404}

        previous_learn_method = []
        if move_name in pokemon[pokemon_name]["moves"]:
            previous_learn_method = pokemon[pokemon_name]["moves"][move_name][
                "learn_method"
            ]

        if operation == Operation.ADD.value or operation == Operation.SHIFT.value:
            add_or_shift_move(
                pokemon,
                pokemon_name,
                move_name,
                move_change.level,
                previous_learn_method,
            )
        elif operation == Operation.DELETE.value:
            del pokemon[pokemon_name]["moves"][move_name]
        elif operation == Operation.REPLACE_MOVE.value:
            replace_move(
                pokemon,
                pokemon_name,
                move_name,
                move_change.secondary_move,
            )
        elif operation == Operation.REPLACE_MOVE_AND_LEVEL.value:
            replace_move(pokemon, pokemon_name, move_name, move_change.secondary_move)
            add_or_shift_move(
                pokemon,
                pokemon_name,
                move_change.secondary_move,
                move_change.level,
                previous_learn_method,
            )
        elif operation == Operation.REPLACE_BY_LEVEL.value:
            replace_by_level(
                pokemon,
                pokemon_name,
                move_change.level,
                move_name,
                previous_learn_method,
            )
        elif operation == Operation.SWAP_MOVES.value:
            swap_moves(
                pokemon,
                pokemon_name,
                move_name,
                move_change.secondary_move,
                previous_learn_method,
            )

    save_and_generate_pokemon(
        wiki_name,
        pokemon,
        [{"name": pokemon_name, "dex_number": pokemon[pokemon_name]["id"]}],
    )

    return {"message": "Changes Saved"}


@router.websocket("/pokemon/prepare-data")
async def prepare_data(websocket: WebSocket):
    await websocket.accept()
    preparation_data = await websocket.receive_json()

    wiki_name = preparation_data["wiki_name"]
    range_start = preparation_data["range_start"]
    range_end = preparation_data["range_end"]

    try:
        pokemon = await download_pokemon_data(
            wiki_name, websocket, range_start, range_end
        )
        await download_pokemon_sprites(wiki_name, websocket, range_start, range_end)
    except Exception as e:
        await websocket.send_json(
            {"message": "Data Preparation Failed", "message": str(e)}
        )

    await websocket.send_json(
        {
            "message": "All Preparation Complete",
            "pokemon": [
                {"name": pokemon_name, "id": attributes["id"]}
                for pokemon_name, attributes in pokemon.items()
            ],
            "state": PreparationState.FINISHED.value,
        }
    )
