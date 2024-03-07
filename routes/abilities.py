from fastapi import APIRouter
import json

from models.ability_models import AbilityProperties

router = APIRouter()
data_folder_route = "data"


# Get all pokemon and return by dict with name and id
@router.get("/abilities/{wiki_name}")
async def get_ability_list(wiki_name: str):
    with open(
        f"{data_folder_route}/{wiki_name}/abilities.json", encoding="utf-8"
    ) as abilities_file:
        abilities = json.load(abilities_file)
        abilities_file.close()

    return [ability_name for ability_name, _ in abilities.items()]


@router.get("/ability/single/{wiki_name}")
async def get_ability(ability_name: str, wiki_name: str):
    with open(
        f"{data_folder_route}/{wiki_name}/abilities.json", encoding="utf-8"
    ) as abilities_file:
        abilities = json.load(abilities_file)
        abilities_file.close()

    if ability_name not in abilities:
        return {"message": "Ability not found", "status": 404}

    return abilities[ability_name]


@router.post("/ability/create/{wiki_name}")
async def create_ability(
    new_ability: AbilityProperties, ability_name: str, wiki_name: str
):
    with open(
        f"{data_folder_route}/{wiki_name}/abilities.json", encoding="utf-8"
    ) as abilities_file:
        abilities = json.load(abilities_file)
        abilities_file.close()

    if ability_name in abilities:
        return {"message": "Ability already exists", "status": 400}

    abilities[ability_name] = new_ability.dict()

    with open(
        f"{data_folder_route}/{wiki_name}/abilities.json", "w", encoding="utf-8"
    ) as abilities_file:
        abilities_file.write(json.dumps(abilities))
        abilities_file.close()

    return {
        "message": "Ability created",
        "status": 200,
        "abilities": [ability_name for ability_name, _ in abilities.items()],
    }


@router.patch("/ability/edit/{wiki_name}")
async def edit_ability(ability_name: str, wiki_name: str, ability: AbilityProperties):
    with open(
        f"{data_folder_route}/{wiki_name}/abilities.json", encoding="utf-8"
    ) as abilities_file:
        abilities = json.load(abilities_file)
        abilities_file.close()

    if ability_name not in abilities:
        return {"message": "ability not found", "status": 404}

    abilities[ability_name] = ability.dict(exclude_none=True)

    with open(
        f"{data_folder_route}/{wiki_name}/abilities.json", "w", encoding="utf-8"
    ) as abilities_file:
        abilities_file.write(json.dumps(abilities))
        abilities_file.close()

    return {
        "message": "Ability edited",
        "status": 200,
        "abilities": abilities.items(),
    }


@router.delete("/ability/delete/{wiki_name}")
async def delete_ability(ability_name: str, wiki_name: str):
    with open(
        f"{data_folder_route}/{wiki_name}/abilities.json", encoding="utf-8"
    ) as abilities_file:
        abilities = json.load(abilities_file)
        abilities_file.close()

    if ability_name not in abilities:
        return {"message": "Item not found", "status": 404}

    del abilities[ability_name]

    with open(
        f"{data_folder_route}/{wiki_name}/abilities.json", "w", encoding="utf-8"
    ) as abilities_file:
        abilities_file.write(json.dumps(abilities))
        abilities_file.close()

    return {
        "message": "Ability deleted",
        "status": 200,
        "items": [ability_name for ability_name, _ in abilities.items()],
    }
