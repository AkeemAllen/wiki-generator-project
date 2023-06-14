from fastapi import APIRouter
import json

router = APIRouter()
temp_folders_route = "temp_folders"


# Get all pokemon and return by dict with name and id
@router.get("/abilities/{wiki_name}")
async def get_item_list(wiki_name: str):
    with open(
        f"{temp_folders_route}/{wiki_name}/abilities.json", encoding="utf-8"
    ) as abilities_file:
        abilities = json.load(abilities_file)
        abilities_file.close()

    return [ability_name for ability_name, _ in abilities.items()]
