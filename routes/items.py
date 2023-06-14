from fastapi import APIRouter
import json

router = APIRouter()
temp_folders_route = "temp_folders"


# Get all pokemon and return by dict with name and id
@router.get("/items/{wiki_name}")
async def get_item_list(wiki_name: str):
    with open(
        f"{temp_folders_route}/{wiki_name}/items.json", encoding="utf-8"
    ) as items_file:
        items = json.load(items_file)
        items_file.close()

    return [item_name for item_name, _ in items.items()]
