# One off script to generate unique ids for each pokemon on a trainer team
import json
import random


with open(f"data/blaze-black-wiki/routes.json", encoding="utf-8") as routes_file:
    routes = json.load(routes_file)
    routes_file.close()

arr = []
for route in routes:
    if "trainers" in routes[route]:
        for trainer in routes[route]["trainers"]:
            for pokemon in routes[route]["trainers"][trainer]["pokemon"]:
                pokemon[
                    "unique_id"
                ] = f"{pokemon['id']}_{len(routes[route]['trainers'][trainer]['pokemon'])}_{random.randint(1000, 9999)}"

with open(f"data/blaze-black-wiki/routes.json", "w", encoding="utf-8") as routes_file:
    routes_file.write(json.dumps(routes))
    routes_file.close()
