import datetime
import os
import shutil
import subprocess
from fastapi import APIRouter
import json
from evolution_page_generator import generate_evolution_page
from type_page_generator import generate_type_page
from wiki_boilerplate_generator import create_boiler_plate

from models.wikis_models import DeploymentData, GenerationData, Wiki
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


@router.post("/wikis/deploy")
async def deploy_wiki(deployment_data: DeploymentData):
    # Add checks for git on their system
    wiki_name = deployment_data.wiki_name
    repo_url = deployment_data.repo_url

    if os.path.exists(f"../generated_wikis/{wiki_name}/docs"):
        shutil.rmtree(f"../generated_wikis/{wiki_name}/docs")

    # Copy the generated wiki to the generated_wikis folder
    shutil.copytree(f"dist/{wiki_name}/docs", f"../generated_wikis/{wiki_name}/docs")
    shutil.copy(
        f"dist/{wiki_name}/mkdocs.yml", f"../generated_wikis/{wiki_name}/mkdocs.yml"
    )
    shutil.copy(
        "generator_assets/requirements.txt",
        f"../generated_wikis/{wiki_name}/requirements.txt",
    )

    if not os.path.exists(f"../generated_wikis/{wiki_name}/.git"):
        initialization_process = subprocess.Popen(
            f"git init".split(),
            cwd=f"../generated_wikis/{wiki_name}",
            stdout=subprocess.PIPE,
        )
        initialization_process.wait()

    add_wiki_files = subprocess.Popen(
        "git add .".split(),
        cwd=f"../generated_wikis/{wiki_name}",
        stdout=subprocess.PIPE,
    )
    add_wiki_files.wait()

    # Consider having more unique messages for wiki updates
    save_wiki_state = subprocess.Popen(
        "git commit -m 'Wiki_Update'".split(),
        cwd=f"../generated_wikis/{wiki_name}",
        stdout=subprocess.PIPE,
    )
    save_wiki_state.wait()

    is_origin_present = subprocess.Popen(
        "git remote show origin".split(),
        cwd=f"../generated_wikis/{wiki_name}",
        stdout=subprocess.PIPE,
    )
    is_origin_present.wait()

    if is_origin_present.returncode != 0:
        # Add instruction to create repo before running this function
        repo_addition_process = subprocess.Popen(
            f"git remote add origin {repo_url}".split(),
            cwd=f"../generated_wikis/{wiki_name}",
            stdout=subprocess.PIPE,
        )
        repo_addition_process.wait()

    push_wiki = subprocess.Popen(
        "git push origin main".split(),
        cwd=f"../generated_wikis/{wiki_name}",
        stdout=subprocess.PIPE,
    )
    push_wiki.wait()

    deploy_process = subprocess.Popen(
        f"mkdocs gh-deploy".split(),
        cwd=f"../generated_wikis/{wiki_name}",
        stdout=subprocess.PIPE,
    )
    deploy_process.wait()

    return {
        # "data": {
        #     "Initialization": initialization_process.returncode,
        #     "Repo Addition": repo_addition_process.returncode,
        #     "Deployment": deploy_process.returncode,
        # },
        "message": "Wiki Deployed",
        "status": 200,
    }
