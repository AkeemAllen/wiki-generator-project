import argparse
import json
import os
import shutil

import tqdm
from generator_functions.trainer_generator_functions import (
    create_important_trainer_table,
    create_trainer_table,
)

import yaml
from generator_functions.wild_encounter_generator_functions import (
    create_encounter_table,
)
from models.game_route_models import (
    Route,
)


import global_var

data_folder_route = "data"


def generate_routes(wiki_name: str):
    global_var.g_wiki_name = wiki_name
    with open(f"dist/{wiki_name}/mkdocs.yml", "r") as mkdocs_file:
        mkdocs_yaml_dict = yaml.load(mkdocs_file, Loader=yaml.FullLoader)
        mkdocs_file.close()

    with open(
        f"{data_folder_route}/{wiki_name}/routes.json", encoding="utf-8"
    ) as routes_file:
        routes = json.load(routes_file)
        routes = Route.model_validate_json(json.dumps(routes))
        routes_file.close()

    with open(
        f"{data_folder_route}/{wiki_name}/abilities.json", encoding="utf-8"
    ) as abilities_file:
        abilities = json.load(abilities_file)
        abilities_file.close()

    with open(
        f"{data_folder_route}/{wiki_name}/items.json", encoding="utf-8"
    ) as items_file:
        items = json.load(items_file)
        items_file.close()

    sorted_routes = sorted(routes.root.items(), key=lambda route: route[1].position)

    mkdoc_routes = []
    for route_name, route_properties in tqdm.tqdm(sorted_routes):
        route_directory = f"dist/{wiki_name}/docs/routes/{route_name}"
        if not os.path.exists(route_directory):
            os.makedirs(route_directory)

        formatted_route_name = route_name.capitalize()
        route_entry = {}
        route_entry[formatted_route_name] = []

        if route_properties.wild_encounters:
            create_encounter_table(
                route_name,
                route_directory,
                route_properties.wild_encounters,
                route_properties.wild_encounters_area_levels,
            )
            route_entry[formatted_route_name].append(
                {"Wild Encounters": f"routes/{route_name}/wild_encounters.md"}
            )

        if route_properties.trainers:
            create_trainer_table(route_name, route_directory, route_properties.trainers)
            route_entry[formatted_route_name].append(
                {"Trainers": f"routes/{route_name}/trainers.md"}
            )

        if route_properties.important_trainers:
            create_important_trainer_table(
                route_name,
                route_properties.important_trainers,
                route_directory,
                abilities,
                items,
            )
            route_entry[formatted_route_name].append(
                {"Important Trainers": f"routes/{route_name}/important_trainers.md"}
            )

        if route_entry not in mkdoc_routes:
            mkdoc_routes.append(route_entry)

    for path in os.listdir(f"dist/{wiki_name}/docs/routes"):
        formatted_path_name = path.capitalize()
        existing_routes = [key for route in mkdoc_routes for key in route.keys()]

        if formatted_path_name not in existing_routes:
            shutil.rmtree(f"dist/{wiki_name}/docs/routes/{path}")

    # TODO: Modify line to search for Routes
    mkdocs_yaml_dict["nav"][2]["Routes"] = mkdoc_routes

    with open(f"dist/{wiki_name}/mkdocs.yml", "w") as mkdocs_file:
        yaml.dump(mkdocs_yaml_dict, mkdocs_file, sort_keys=False, indent=4)
        mkdocs_file.close()


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "-wn",
        "--wiki-name",
        help="Specify the name of the wiki to download data from",
        type=str,
    )
    args = parser.parse_args()

    generate_routes(args.wiki_name)
