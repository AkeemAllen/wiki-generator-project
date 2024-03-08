from fastapi import APIRouter
import json
from models.nature_models import NatureProperties

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

    return [nature_name for nature_name, _ in natures.items()]


@router.get("/nature/single/{wiki_name}")
async def get_nature(nature_name: str, wiki_name: str):
    with open(
        f"{data_folder_route}/{wiki_name}/natures.json", encoding="utf-8"
    ) as natures_file:
        natures = json.load(natures_file)
        natures_file.close()

    if nature_name not in natures:
        return {"message": "Nature not found", "status": 404}

    return natures[nature_name]


@router.post("/nature/create/{wiki_name}")
async def create_nature(new_nature: NatureProperties, nature_name: str, wiki_name: str):
    with open(
        f"{data_folder_route}/{wiki_name}/natures.json", encoding="utf-8"
    ) as natures_file:
        natures = json.load(natures_file)
        natures_file.close()

    if nature_name in natures:
        return {"message": "Nature already exists", "status": 400}

    natures[nature_name] = new_nature.dict()

    with open(
        f"{data_folder_route}/{wiki_name}/natures.json", "w", encoding="utf-8"
    ) as natures_file:
        natures_file.write(json.dumps(natures))
        natures_file.close()

    return {
        "message": "nature created",
        "status": 200,
        "natures": [nature_name for nature_name, _ in natures.items()],
    }


@router.patch("/nature/edit/{wiki_name}")
async def edit_nature(nature_name: str, wiki_name: str, nature: NatureProperties):
    with open(
        f"{data_folder_route}/{wiki_name}/natures.json", encoding="utf-8"
    ) as natures_file:
        natures = json.load(natures_file)
        natures_file.close()

    if nature_name not in natures:
        return {"message": "Nature not found", "status": 404}

    natures[nature_name] = nature.dict()

    with open(
        f"{data_folder_route}/{wiki_name}/natures.json", "w", encoding="utf-8"
    ) as natures_file:
        natures_file.write(json.dumps(natures))
        natures_file.close()

    return {
        "message": "Nature edited",
        "status": 200,
        "natures": natures.items(),
    }


@router.delete("/nature/delete/{wiki_name}")
async def delete_nature(nature_name: str, wiki_name: str):
    with open(
        f"{data_folder_route}/{wiki_name}/natures.json", encoding="utf-8"
    ) as natures_file:
        natures = json.load(natures_file)
        natures_file.close()

    if nature_name not in natures:
        return {"message": "nature not found", "status": 404}

    del natures[nature_name]

    with open(
        f"{data_folder_route}/{wiki_name}/natures.json", "w", encoding="utf-8"
    ) as natures_file:
        natures_file.write(json.dumps(natures))
        natures_file.close()

    return {
        "message": "Nature deleted",
        "status": 200,
        "natures": [nature_name for nature_name, _ in natures.items()],
    }
