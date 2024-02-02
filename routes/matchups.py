import json
import os
from typing import Literal
from fastapi import APIRouter
from models.matchup_models import POKEMON_TYPES, pokemon_types, gen_default, gen1, gen2
from functools import reduce
import global_var

router = APIRouter()

data_folder_route = "data"
# wiki_name = "blaze-black-volt-white-two-wiki"

# Note: Code in this file was hoisted from pkmn.help project by wavebeem on GitHub.
# Credit to wavebeem for the original code. I simply translated it into Python with some modifications.


def generate_matchup_map(generation, wiki_name):
    data = gen_default

    if generation == "gen1":
        data = gen1
    elif generation == "gen2":
        data = gen2

    matchup_map = {}
    for row_index, row_value in enumerate(data):
        for col_index, col_value in enumerate(row_value):
            type_one = pokemon_types[row_index]
            type_two = pokemon_types[col_index]
            key = f"{type_one} > {type_two}"
            matchup_map[key] = col_value

    with open(
        f"{data_folder_route}/{wiki_name}/matchup_map.json", "w", encoding="utf-8"
    ) as matchup_map_file:
        json.dump(matchup_map, matchup_map_file, indent=4)
        matchup_map_file.close()


def get_matchup_map(wiki_name):
    if os.path.exists(f"{data_folder_route}/{wiki_name}/matchup_map.json"):
        with open(
            f"{data_folder_route}/{wiki_name}/matchup_map.json", encoding="utf-8"
        ) as matchup_map_file:
            matchup_map = json.load(matchup_map_file)
            matchup_map_file.close()
            return matchup_map

    matchup_map = {}
    data = gen_default

    for row_index, row_value in enumerate(data):
        for col_index, col_value in enumerate(row_value):
            type_one = pokemon_types[row_index]
            type_two = pokemon_types[col_index]
            key = f"{type_one} > {type_two}"
            matchup_map[key] = col_value

    with open(
        f"{data_folder_route}/{wiki_name}/matchup_map.json", "w", encoding="utf-8"
    ) as matchup_map_file:
        json.dump(matchup_map, matchup_map_file, indent=4)
        matchup_map_file.close()

    return matchup_map


def matchupForPair(wiki_name, defense_type, offense_type):
    matchup_map = get_matchup_map(wiki_name)
    key = f"{offense_type} > {defense_type}"
    value = matchup_map[key]
    return value


def matchupFor(wiki_name, defense_types, offense_type):
    filtered_defense_types = filter(
        lambda defense_type: defense_type != POKEMON_TYPES.none, defense_types
    )
    mapped_defense_types = map(
        lambda defense_type: matchupForPair(wiki_name, defense_type, offense_type),
        filtered_defense_types,
    )
    return reduce(lambda x, y: x * y, mapped_defense_types, 1)


def generate_defensive_matchups(wiki_name, defense_types, pokemon_type):
    effectiveness = matchupFor(wiki_name, defense_types, pokemon_type)
    return {
        "wiki_name": wiki_name,
        "pokemon_type": pokemon_type,
        "effectiveness": effectiveness,
    }


def defensive_matchups(wiki_name, defense_types: list):
    matchups = map(
        lambda pokemon_type: generate_defensive_matchups(
            wiki_name, defense_types, pokemon_type
        ),
        pokemon_types,
    )
    return matchups


def group_matchups_by_effectiveness(matchups, effectiveness):
    filtered_matchups = filter(
        lambda matchup: matchup["effectiveness"] == effectiveness, matchups
    )
    mapped_matchups = map(lambda matchup: matchup["pokemon_type"], filtered_matchups)
    return mapped_matchups


# Kind of a hack to avoid dealing with async and coroutines
# TODO: Figure out how to do this properly
def get_defensive_matchups_synchronous(types: str, wiki_name: str):
    # TODO: Add function to check for and generate matchup map if it doesn't exist
    type_array = types.split("+")
    effectiveness_levels = [8, 4, 2, 1, 0.5, 0.25, 0.125, 0]

    matchups = list(defensive_matchups(wiki_name, type_array))

    matchups_by_effectiveness = {}
    for effectiveness in effectiveness_levels:
        grouped_matchups = group_matchups_by_effectiveness(matchups, effectiveness)
        matchups_by_effectiveness[effectiveness] = list(grouped_matchups)

    filtered_matchups_by_effectiveness = {}
    for key, value in matchups_by_effectiveness.items():
        if len(value) != 0:
            filtered_matchups_by_effectiveness[key] = value

    return filtered_matchups_by_effectiveness


@router.get("/matchups/defensive/{wiki_name}")
async def get_defensive_matchups(types: str, wiki_name: str):
    # Generation is set to 0 by default, so it will default to the latest generation
    type_array = types.split()
    effectiveness_levels = [8, 4, 2, 1, 0.5, 0.25, 0.125, 0]

    matchups = list(defensive_matchups(wiki_name, type_array))

    matchups_by_effectiveness = {}
    for effectiveness in effectiveness_levels:
        grouped_matchups = group_matchups_by_effectiveness(matchups, effectiveness)
        matchups_by_effectiveness[effectiveness] = list(grouped_matchups)

    filtered_matchups_by_effectiveness = {}
    for key, value in matchups_by_effectiveness.items():
        if len(value) != 0:
            filtered_matchups_by_effectiveness[key] = value

    return filtered_matchups_by_effectiveness


@router.get("/matchups/generate-map/{wiki_name}")
async def matchup_map_generation(
    wiki_name: str, generation: Literal["current", "gen1", "gen2"] = "current"
):
    generate_matchup_map(generation, wiki_name)
    return {"message": "Matchup map generated."}
