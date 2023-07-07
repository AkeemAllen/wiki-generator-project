# from typing import List
from fastapi import APIRouter
import json
from database import SessionLocal

from models.pokemon_models import PokemonChanges

from models.wikis_models import PreparationData
from prepare_large_data import download_pokemon_data, download_pokemon_sprites
from utils import get_db
from services.pokemon_services import get_all_pokemon
from schemas.pokemon_schemas import Pokemon

router = APIRouter()

data_folder_route = "data"


@router.get("/v2/pokemon/", response_model=list[Pokemon])
async def get_pokemon(db: SessionLocal = get_db()):
    pokemon = get_all_pokemon(db)
    return pokemon


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


# Get sprite url for pokemon
@router.get("/pokemon/{wiki_name}/{pokemon_name}/sprite")
async def get_pokemon_sprite(pokemon_name: str, wiki_name: str):
    with open(
        f"{data_folder_route}/{wiki_name}/pokemon.json", encoding="utf-8"
    ) as pokemon_file:
        pokemon = json.load(pokemon_file)
        pokemon_file.close()

    if pokemon_name not in pokemon:
        return {"message": "Pokemon not found", "status": 404}

    return {
        "sprite_url": pokemon[pokemon_name]["sprite"],
        "message": "Success",
        "status": 200,
    }


# Get pokemon by name
@router.get("/pokemon/{wiki_name}/{pokemon_name}")
async def get_pokemon(pokemon_name: str, wiki_name: str):
    with open(
        f"{data_folder_route}/{wiki_name}/pokemon.json", encoding="utf-8"
    ) as pokemon_file:
        pokemon = json.load(pokemon_file)
        pokemon_file.close()

    if pokemon_name not in pokemon:
        return {"message": "Pokemon not found", "status": 404}
    return pokemon[pokemon_name]


# Save Changes to pokemon
@router.post("/pokemon/edit/{wiki_name}/{pokemon_name}")
async def save_pokemon_changes(
    changes: PokemonChanges, pokemon_name: str, wiki_name: str
):
    with open(
        f"{data_folder_route}/{wiki_name}/pokemon.json", encoding="utf-8"
    ) as pokemon_file:
        pokemon = json.load(pokemon_file)
        pokemon_file.close()

    if changes.types:
        pokemon[pokemon_name]["types"] = [
            type for type in changes.types if type != "None"
        ]

    if changes.abilities:
        pokemon[pokemon_name]["abilities"] = changes.abilities

    if changes.stats:
        for stat, value in changes.stats:
            pokemon[pokemon_name]["stats"][stat] = value

    if changes.evolution:
        pokemon[pokemon_name]["evolution"] = changes.evolution

    if changes.moves:
        for move, value in changes.moves.__root__.items():
            if value.delete:
                del pokemon[pokemon_name]["moves"][move]
                continue

            pokemon[pokemon_name]["moves"][move] = {
                "level_learned_at": value.level_learned_at,
                "learn_method": value.learn_method,
            }

    with open(f"{data_folder_route}/{wiki_name}/pokemon.json", "w") as pokemon_file:
        pokemon_file.write(json.dumps(pokemon))
        pokemon_file.close()

    # with open(
    #     f"{data_folder_route}/{wiki_name}/updates/modified_pokemon.json", "r+"
    # ) as changes_file:
    #     current_changes = json.load(changes_file)
    #     if pokemon_name not in current_changes["changed_pokemon"]:
    #         current_changes["changed_pokemon"].append(pokemon_name)
    #         changes_file.seek(0)
    #         changes_file.truncate()
    #         changes_file.write(json.dumps(current_changes))
    #     changes_file.close()

    return {"message": "Changes Saved"}


@router.post("/pokemon/{wiki_name}/prepare-data")
async def prepare_data(preparation_data: PreparationData, wiki_name: str):
    if preparation_data.wipe_current_data:
        try:
            download_pokemon_data(
                wiki_name, preparation_data.range_start, preparation_data.range_end
            )
            download_pokemon_sprites(wiki_name)
        except Exception as e:
            return {"message": str(e)}
    else:
        return {"message": "Pokemon Data Not Prepared"}

    with open(
        f"{data_folder_route}/{wiki_name}/pokemon.json", encoding="utf-8"
    ) as pokemon_file:
        pokemon = json.load(pokemon_file)
        pokemon_file.close()

    return {
        "message": "Pokemon Data Prepared",
        "status": 200,
        "pokemon": [
            {"name": pokemon_name, "id": attributes["id"]}
            for pokemon_name, attributes in pokemon.items()
        ],
    }
