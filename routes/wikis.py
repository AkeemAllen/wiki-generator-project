import datetime
import shutil
from fastapi import APIRouter
import json
from evolution_page_generator import generate_evolution_page
from type_page_generator import generate_type_page
from wiki_boilerplate_generator import create_boiler_plate

from models.wikis_models import GenerationData, Wiki
from pokemon_pages_generator import generate_pokemon
from route_pages_generator import generate_routes

router = APIRouter()
data_folder_route = "data"


@router.get("/wikis")
async def get_wiki_list():
    with open(f"data/wikis.json", encoding="utf-8") as wikis_file:
        wikis = json.load(wikis_file)
        wikis_file.close()

    return wikis


@router.post("/wikis/create")
async def create_wiki(wiki: Wiki):
    with open(f"data/wikis.json", encoding="utf-8") as wikis_file:
        wikis = json.load(wikis_file)
        wikis_file.close()

    if wiki.name in wikis.keys():
        return {"message": "Wiki already exists", "status": 400}

    wikis[wiki.name] = {
        "description": wiki.description,
        "site_name": wiki.site_name,
        "author": wiki.author,
        "repo_url": wiki.repo_url,
        "site_url": wiki.site_url,
    }

    create_boiler_plate(
        wiki_name=wiki.name,
        wiki_description=wiki.description,
        wiki_author=wiki.author,
        site_name=wiki.site_name,
    )

    with open(f"data/wikis.json", "w", encoding="utf-8") as wikis_file:
        wikis_file.write(json.dumps(wikis))
        wikis_file.close()

    return {"message": "Wiki created", "status": 200, "wikis": wikis}


@router.post("/wikis/generate/pokemon")
async def generate_pokemon_pages(generation_data: GenerationData):
    generate_pokemon(
        generation_data.wiki_name,
        generation_data.version_group,
        generation_data.range_start,
        generation_data.range_end,
    )
    generate_evolution_page(generation_data.wiki_name)
    generate_type_page(generation_data.wiki_name)

    return {
        "message": f"Pokemon from ranges {generation_data.range_start} to {generation_data.range_end} generated",
        "status": 200,
    }


# @router.post("/wikis/generate/evolution")
# async def generate_evolution_pages(generation_data: GenerationData):
#     generate_evolution_page(generation_data.wiki_name)

#     return {
#         "message": f"Evolution page generated",
#         "status": 200,
#     }


@router.post("/wikis/generate/routes")
async def generate_route_pages(generation_data: GenerationData):
    generate_routes(generation_data.wiki_name)

    return {
        "message": f"Routes generated",
        "status": 200,
    }


@router.post("/wikis/backup")
async def backup_wiki():
    try:
        now = datetime.datetime.now()
        formatted_now = now.strftime("%Y_%m_%d_%H_%M_%S")
        shutil.copytree("data", f"backups/data_backup_{formatted_now}")
    except Exception as err:
        return {
            "message": f"Backup failed with : {err}",
            "status": 400,
        }
    return {
        "message": f"Backup generated",
        "status": 200,
    }
