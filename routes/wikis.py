import cProfile
import datetime
import os
import pstats
import shutil
import subprocess
from fastapi import APIRouter, WebSocket
import json

import yaml
from evolution_page_generator import generate_evolution_page
from routes.matchups import generate_matchup_map
from type_page_generator import generate_type_page
from wiki_boilerplate_generator import create_boiler_plate

from models.wikis_models import (
    DeploymentData,
    DeploymentState,
    GenerationData,
    Wiki,
    WikiSettings,
)
from pokemon_pages_generator import generate_pages_from_range
from route_pages_generator import generate_routes

router = APIRouter()
data_folder_route = "data"


@router.get("/wikis")
async def get_wiki_list():
    with open(f"data/wikis.json", encoding="utf-8") as wikis_file:
        wikis = json.load(wikis_file)
        wikis_file.close()

    return wikis


@router.post("/wikis/{wiki_name}/settings")
async def update_wiki_settings(wiki_name: str, settings: WikiSettings):
    with open(f"data/wikis.json", encoding="utf-8") as wikis_file:
        wikis = json.load(wikis_file)
        wikis_file.close()

    if wiki_name not in wikis.keys():
        return {"message": "Wiki does not exist", "status": 400}

    original_matchup_generation = wikis[wiki_name]["settings"]["matchup_generation"]

    wikis[wiki_name]["settings"] = {
        "version_group": settings.version_group.value,
        "deployment_url": settings.deployment_url,
        "matchup_generation": settings.matchup_generation,
    }

    with open(f"data/wikis.json", "w", encoding="utf-8") as wikis_file:
        wikis_file.write(json.dumps(wikis))
        wikis_file.close()

    # Simple check so we don't generate the matchup map if it's not necessary
    if original_matchup_generation != settings.matchup_generation:
        generate_matchup_map(settings.matchup_generation, wiki_name)

    return {"message": "Wiki settings updated", "status": 200, "wikis": wikis}


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
        "settings": {
            "deployment_url": wiki.settings.deployment_url,
            "version_group": wiki.settings.version_group.value,
            "matchup_generation": wiki.settings.matchup_generation,
        },
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


@router.delete("/wikis/delete/{wiki_name}")
async def delete_wiki(wiki_name: str):
    with open(f"data/wikis.json", encoding="utf-8") as wikis_file:
        wikis = json.load(wikis_file)
        wikis_file.close()

    if wiki_name not in wikis.keys():
        return {"message": "Wiki does not exist", "status": 400}

    del wikis[wiki_name]

    with open(f"data/wikis.json", "w", encoding="utf-8") as wikis_file:
        wikis_file.write(json.dumps(wikis))
        wikis_file.close()

    shutil.rmtree(f"data/{wiki_name}")
    shutil.rmtree(f"dist/{wiki_name}")

    return {"message": "Wiki deleted", "status": 200, "wikis": wikis}


@router.post("/wikis/generate/pokemon")
async def generate_pokemon_pages(generation_data: GenerationData):
    wiki_name = generation_data.wiki_name
    with open(
        f"{data_folder_route}/{wiki_name}/pokemon.json",
        encoding="utf-8",
    ) as pokemon_data_file:
        pokemon = json.load(pokemon_data_file)
        pokemon_data_file.close()

    with open(f"dist/{wiki_name}/mkdocs.yml", "r") as mkdocs_file:
        mkdocs_yaml_dict = yaml.load(mkdocs_file, Loader=yaml.FullLoader)
        mkdocs_file.close()

    with open(
        f"{data_folder_route}/{wiki_name}/moves.json", encoding="utf-8"
    ) as moves_file:
        file_moves = json.load(moves_file)
        moves_file.close()

    generate_pages_from_range(
        wiki_name=wiki_name,
        version_group=generation_data.version_group,
        pokemon=pokemon,
        file_moves=file_moves,
        mkdocs_yaml_dict=mkdocs_yaml_dict,
        range_start=generation_data.range_start,
        range_end=generation_data.range_end,
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
async def backup_wikis():
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


@router.websocket("/wikis/deploy")
async def deploy_wiki(websocket: WebSocket):
    await websocket.accept()

    # receiving deployment data
    deployment_data = await websocket.receive_json()

    wiki_name = deployment_data["wiki_name"]
    deployment_url = deployment_data["deployment_url"]

    await websocket.send_json(
        {"message": f"Starting Wiki Deployment", "state": DeploymentState.START.value}
    )

    if os.path.exists(f"../generated_wikis/{wiki_name}/docs"):
        await websocket.send_json(
            {
                "message": f"Removing previous data",
                "state": DeploymentState.IN_PROGRESS.value,
            }
        )
        shutil.rmtree(f"../generated_wikis/{wiki_name}/docs")

    await websocket.send_json(
        {
            "message": f"Building wiki in ../generated_wikis/{wiki_name}/",
            "state": DeploymentState.IN_PROGRESS.value,
        }
    )
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
        await websocket.send_json(
            {
                "message": f"Initializing Repository",
                "state": DeploymentState.IN_PROGRESS.value,
            }
        )
        initialization_process = subprocess.Popen(
            f"git init".split(),
            cwd=f"../generated_wikis/{wiki_name}",
            stdout=subprocess.PIPE,
        )
        initialization_process.wait()

    await websocket.send_json(
        {
            "message": f"Adding and saving changes",
            "state": DeploymentState.IN_PROGRESS.value,
        }
    )
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
        await websocket.send_json(
            {
                "message": f"Adding deployment url origin",
                "state": DeploymentState.IN_PROGRESS.value,
            }
        )
        # Add instruction to create repo before running this function
        repo_addition_process = subprocess.Popen(
            f"git remote add origin {deployment_url}".split(),
            cwd=f"../generated_wikis/{wiki_name}",
            stdout=subprocess.PIPE,
        )
        repo_addition_process.wait()

    push_wiki = subprocess.Popen(
        "git push origin main".split(),
        cwd=f"../generated_wikis/{wiki_name}",
        stdout=subprocess.PIPE,
    )
    await websocket.send_json(
        {"message": f"Pushing Wiki to Repo", "state": DeploymentState.IN_PROGRESS.value}
    )
    # Add check for when wiki password is needed, and direct user to the terminal
    # find a way to get the password from the client
    push_wiki.wait()

    deploy_process = subprocess.Popen(
        f"mkdocs gh-deploy".split(),
        cwd=f"../generated_wikis/{wiki_name}",
        stdout=subprocess.PIPE,
    )
    await websocket.send_json(
        {"message": f"Deploying Wiki", "state": DeploymentState.IN_PROGRESS.value}
    )
    deploy_process.wait()

    await websocket.send_json(
        {"message": "Wiki Deployed", "state": DeploymentState.COMPLETE.value}
    )
