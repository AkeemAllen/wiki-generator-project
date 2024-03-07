from fastapi import APIRouter
import json

from models.item_models import ItemProperties

router = APIRouter()
data_folder_route = "data"


# Get all pokemon and return by dict with name and id
@router.get("/items/{wiki_name}")
async def get_item_list(wiki_name: str):
    with open(
        f"{data_folder_route}/{wiki_name}/items.json", encoding="utf-8"
    ) as items_file:
        items = json.load(items_file)
        items_file.close()

    return [item_name for item_name, _ in items.items()]


@router.get("/item/single/{wiki_name}")
async def get_item(item_name: str, wiki_name: str):
    with open(
        f"{data_folder_route}/{wiki_name}/items.json", encoding="utf-8"
    ) as items_file:
        items = json.load(items_file)
        items_file.close()

    if item_name not in items:
        return {"message": "Item not found", "status": 404}

    return items[item_name]


@router.post("/item/create/{wiki_name}")
async def create_item(new_item: ItemProperties, item_name: str, wiki_name: str):
    with open(
        f"{data_folder_route}/{wiki_name}/items.json", encoding="utf-8"
    ) as items_file:
        items = json.load(items_file)
        items_file.close()

    if item_name in items:
        return {"message": "Item already exists", "status": 400}

    items[item_name] = new_item.dict()

    with open(
        f"{data_folder_route}/{wiki_name}/items.json", "w", encoding="utf-8"
    ) as items_file:
        items_file.write(json.dumps(items))
        items_file.close()

    return {
        "message": "Item created",
        "status": 200,
        "items": [item_name for item_name, _ in items.items()],
    }


@router.patch("/item/edit/{wiki_name}")
async def edit_item(item_name: str, wiki_name: str, item: ItemProperties):
    with open(
        f"{data_folder_route}/{wiki_name}/items.json", encoding="utf-8"
    ) as items_file:
        items = json.load(items_file)
        items_file.close()

    if item_name not in items:
        return {"message": "Item not found", "status": 404}

    items[item_name] = item.dict(exclude_none=True)

    with open(
        f"{data_folder_route}/{wiki_name}/items.json", "w", encoding="utf-8"
    ) as items_file:
        items_file.write(json.dumps(items))
        items_file.close()

    return {
        "message": "Item edited",
        "status": 200,
        "items": items.items(),
    }


@router.delete("/item/delete/{wiki_name}")
async def delete_item(item_name: str, wiki_name: str):
    with open(
        f"{data_folder_route}/{wiki_name}/items.json", encoding="utf-8"
    ) as items_file:
        items = json.load(items_file)
        items_file.close()

    if item_name not in items:
        return {"message": "Item not found", "status": 404}

    del items[item_name]

    with open(
        f"{data_folder_route}/{wiki_name}/items.json", "w", encoding="utf-8"
    ) as items_file:
        items_file.write(json.dumps(items))
        items_file.close()

    return {
        "message": "Item deleted",
        "status": 200,
        "items": [item_name for item_name, _ in items.items()],
    }
