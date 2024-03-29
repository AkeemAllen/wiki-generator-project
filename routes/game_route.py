from typing import Optional
from fastapi import APIRouter
import json

from models.game_route_models import DuplicateRoute, NewRoute, RouteProperties
from route_pages_generator import generate_routes
from utils import get_sorted_routes


router = APIRouter()

data_folder_route = "data"


# Get all routes and return them as sorted dict
@router.get("/game-routes/{wiki_name}")
async def get_game_route_list(wiki_name: str):
    with open(
        f"{data_folder_route}/{wiki_name}/routes.json", encoding="utf-8"
    ) as routes_file:
        routes = json.load(routes_file)
        routes_file.close()

    return get_sorted_routes(routes)


# Get route by name
@router.get("/game-route/single/{wiki_name}")
async def get_game_route(route_name: str, wiki_name: str):
    with open(
        f"{data_folder_route}/{wiki_name}/routes.json", encoding="utf-8"
    ) as routes_file:
        routes = json.load(routes_file)
        routes_file.close()

    if route_name not in routes:
        return {"message": "Route not found", "status": 404}

    return routes[route_name]


@router.post("/game-route/create/{wiki_name}")
async def create_game_route(new_route: NewRoute, wiki_name: str):
    with open(
        f"{data_folder_route}/{wiki_name}/routes.json", encoding="utf-8"
    ) as routes_file:
        routes = json.load(routes_file)
        routes_file.close()

    if new_route.new_route_name in routes:
        return {"message": "Route already exists", "status": 400}

    routes[new_route.new_route_name] = {"position": len(routes) + 1}

    with open(
        f"{data_folder_route}/{wiki_name}/routes.json", "w", encoding="utf-8"
    ) as routes_file:
        routes_file.write(json.dumps(routes))
        routes_file.close()

    generate_routes(wiki_name)

    return {
        "message": "Route created",
        "status": 200,
        "routes": get_sorted_routes(routes),
    }


# Edit route name
@router.post("/game-route/edit-route-name/{wiki_name}")
async def edit_game_route(new_route: NewRoute, wiki_name: str):
    with open(
        f"{data_folder_route}/{wiki_name}/routes.json", encoding="utf-8"
    ) as routes_file:
        routes = json.load(routes_file)
        routes_file.close()

    if routes[new_route.current_route_name] is None:
        return {"message": "Route not found", "status": 404}

    if new_route.new_route_name in routes:
        return {"message": "Route with this name already exists", "status": 400}

    routes[new_route.new_route_name] = routes[new_route.current_route_name]

    del routes[new_route.current_route_name]

    with open(
        f"{data_folder_route}/{wiki_name}/routes.json", "w", encoding="utf-8"
    ) as routes_file:
        routes_file.write(json.dumps(routes))
        routes_file.close()

    generate_routes(wiki_name)

    return {
        "message": "Route edited",
        "status": 200,
        "routes": get_sorted_routes(routes),
    }


# Save changes to route
@router.post("/game-route/edit/{wiki_name}")
async def save_single_route_changes(
    route_name: str, route_properties: RouteProperties, wiki_name: str
):
    with open(
        f"{data_folder_route}/{wiki_name}/routes.json", encoding="utf-8"
    ) as routes_file:
        routes = json.load(routes_file)
        routes_file.close()

    if route_name not in routes:
        return {"message": "Route not found", "status": 404}

    routes[route_name] = route_properties.dict(exclude_none=True)

    with open(
        f"{data_folder_route}/{wiki_name}/routes.json", "w", encoding="utf-8"
    ) as routes_file:
        routes_file.write(json.dumps(routes))
        routes_file.close()

    generate_routes(wiki_name)

    return {
        "message": "Route changes saved",
        "status": 200,
        "routes": get_sorted_routes(routes),
    }


# Delete route by name
@router.delete("/game-route/delete/{wiki_name}")
async def delete_route(route_name: str, wiki_name: str):
    with open(
        f"{data_folder_route}/{wiki_name}/routes.json", encoding="utf-8"
    ) as routes_file:
        routes = json.load(routes_file)
        routes_file.close()

    if route_name not in routes:
        return {"message": "Route not found", "status": 404}

    del routes[route_name]

    with open(
        f"{data_folder_route}/{wiki_name}/routes.json", "w", encoding="utf-8"
    ) as routes_file:
        routes_file.write(json.dumps(routes))
        routes_file.close()

    generate_routes(wiki_name)

    return {
        "message": "Route deleted",
        "status": 200,
        "routes": get_sorted_routes(routes),
    }


@router.post("/game-route/duplicate/{wiki_name}")
async def duplicate_route(duplicate_route: DuplicateRoute, wiki_name: str):
    with open(
        f"{data_folder_route}/{wiki_name}/routes.json", encoding="utf-8"
    ) as routes_file:
        routes = json.load(routes_file)
        routes_file.close()

    route_name = duplicate_route.current_route_name
    new_route_name = duplicate_route.duplicated_route_name

    if route_name not in routes:
        return {"message": "Route not found", "status": 404}

    if new_route_name in routes:
        return {
            "message": "You cannot use the same name for duplicated Route",
            "status": 400,
        }

    if new_route_name == route_name:
        return {
            "message": "Duplicated Route name cannot be the same as the original Route name",
            "status": 400,
        }

    routes[new_route_name] = {
        **routes[route_name],
    }
    routes[new_route_name]["position"] = len(routes)

    with open(
        f"{data_folder_route}/{wiki_name}/routes.json", "w", encoding="utf-8"
    ) as routes_file:
        routes_file.write(json.dumps(routes))
        routes_file.close()

    generate_routes(wiki_name)

    return {
        "message": "Route duplicated",
        "status": 200,
        "routes": get_sorted_routes(routes),
    }


@router.patch("/game-route/edit-route-positions/{wiki_name}")
async def edit_route_positions(
    organized_routes_list: Optional[list[str]], wiki_name: str
):
    with open(
        f"{data_folder_route}/{wiki_name}/routes.json", encoding="utf-8"
    ) as routes_file:
        routes = json.load(routes_file)
        routes_file.close()

    for index, name in enumerate(organized_routes_list):
        routes[name]["position"] = index + 1

    with open(
        f"{data_folder_route}/{wiki_name}/routes.json", "w", encoding="utf-8"
    ) as routes_file:
        routes_file.write(json.dumps(routes))
        routes_file.close()

    generate_routes(wiki_name)

    return {
        "message": "Route positions edited",
        "status": 200,
        "routes": get_sorted_routes(routes),
    }
