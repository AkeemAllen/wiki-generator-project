from fastapi import APIRouter
import json

router = APIRouter()
data_folder_route = "data"


# Get all pokemon and return by dict with name and id
@router.get("/abilities/{wiki_name}")
async def get_item_list(wiki_name: str):
    with open(
        f"{data_folder_route}/{wiki_name}/abilities.json", encoding="utf-8"
    ) as abilities_file:
        abilities = json.load(abilities_file)
        abilities_file.close()

    return [ability_name for ability_name, _ in abilities.items()]
