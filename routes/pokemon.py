# from typing import List
from fastapi import APIRouter
import json

import yaml


from models.pokemon_models import PokemonChanges, PokemonVersions
from type_page_generator import generate_type_page
from evolution_page_generator import generate_evolution_page
from pokemon_pages_generator import generate_pokemon

from models.wikis_models import PreparationData
from prepare_large_data import download_pokemon_data, download_pokemon_sprites


router = APIRouter()

data_folder_route = "data"


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
    with open(f"dist/{wiki_name}/mkdocs.yml", "r") as mkdocs_file:
        mkdocs_yaml_dict = yaml.load(mkdocs_file, Loader=yaml.FullLoader)
        mkdocs_file.close()

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
                "is_custom_machine": value.is_custom_machine,
                "custom_machine_id": value.custom_machine_id,
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

    with open(f"{data_folder_route}/{wiki_name}/pokemon.json", "w") as pokemon_file:
        pokemon_file.write(json.dumps(pokemon))
        pokemon_file.close()

    if modified_pokemon[pokemon_name] == {}:
        del modified_pokemon[pokemon_name]

    with open(
        f"{data_folder_route}/{wiki_name}/modifications/modified_pokemon.json",
        "w",
    ) as modified_pokemon_file:
        modified_pokemon_file.write(json.dumps(modified_pokemon))
        modified_pokemon_file.close()

    with open("data/wikis.json", encoding="utf-8") as wikis_file:
        wikis = json.load(wikis_file)
        wikis_file.close()

    version_group = wikis[wiki_name]["settings"]["version_group"]

    # generate pokemon page
    generate_pokemon(
        wiki_name,
        PokemonVersions(version_group),
        pokemon,
        mkdocs_yaml_dict,
        pokemon[pokemon_name]["id"],
        pokemon[pokemon_name]["id"],
    )

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
