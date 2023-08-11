from fastapi import APIRouter
import json


router = APIRouter()

data_folder_route = "data"


# Get all pokemon and return by dict with name and id
@router.get("/natures/{wiki_name}")
async def get_item_list(wiki_name: str):
    with open(
        f"{data_folder_route}/{wiki_name}/natures.json", encoding="utf-8"
    ) as natures_file:
        natures = json.load(natures_file)
        natures_file.close()

    return natures
