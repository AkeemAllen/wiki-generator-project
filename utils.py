import json
from models.game_route_models import TrainerPokemonOrWildPokemon
import global_var


data_folder_route = "data"


def get_pokemon_dex_formatted_name(pokedex_number):
    file_name = f"00{pokedex_number}"
    if pokedex_number > 9:
        file_name = f"0{pokedex_number}"
    if pokedex_number > 99:
        file_name = f"{pokedex_number}"

    return file_name


def get_sorted_routes(routes):
    return dict(sorted(routes.items(), key=lambda route: route[1]["position"]))


def get_markdown_image_for_item(item_name: str):
    if item_name == "" or item_name is None:
        return ""
    return f"![{item_name}](../../img/items/{item_name}.png)"


def get_markdown_image_for_pokemon(pokemon_list, pokemon_name: str):
    dex_number = pokemon_list[pokemon_name]["id"]
    file_name = get_pokemon_dex_formatted_name(dex_number)
    return f"![{pokemon_name}](../../img/pokemon/{file_name}.png)"


def get_link_to_pokemon_page(pokemon_list, pokemon_name: str):
    dex_number = pokemon_list[pokemon_name]["id"]
    url_route = get_pokemon_dex_formatted_name(dex_number)
    # passing the wiki name to this function was tricky
    # using a global variable from a different file that gets updated in the routes_generator file
    # gets around the need to pass the wiki name to this function (which would require deep prop drilling)
    return (
        f"[{pokemon_name.capitalize()}](/{global_var.g_wiki_name}/pokemon/{url_route})"
    )


def generate_move_string(moves):
    move_string = ""
    if moves is None or len(moves) == 0:
        return f"<ul><li>N/A</li><li>N/A</li><li>N/A</li><li>N/A</li></ul>"

    for move in moves:
        move_string += f"<li>{move.title() if move else 'N/A'}</li>"

    return f"<ul>{move_string}</ul>"


def get_bottom_value_for_pokemon(
    pokemon: TrainerPokemonOrWildPokemon, is_trainer_mapping=False
):
    bottom_value = ""
    if is_trainer_mapping:
        bottom_value = f"Lv. {pokemon.level}"
    else:
        bottom_value = f"{pokemon.encounter_rate}%"

    return bottom_value


def obj_dict(obj):
    return obj.__dict__


def generate_pokemon_entry_markdown(
    trainer_or_wild_pokemon: TrainerPokemonOrWildPokemon, is_trainer_mapping=False
):
    with open(
        f"{data_folder_route}/{global_var.g_wiki_name}/pokemon.json", encoding="utf-8"
    ) as pokemon_file:
        pokemon = json.load(pokemon_file)
        pokemon_file.close()

    pokemon_markdown = (
        f"{get_markdown_image_for_pokemon(pokemon, trainer_or_wild_pokemon.name)} <br/>"
        f"{get_link_to_pokemon_page(pokemon, trainer_or_wild_pokemon.name)} <br/>"
        f"{get_bottom_value_for_pokemon(trainer_or_wild_pokemon, is_trainer_mapping)}"
    )

    return pokemon_markdown


def map_pokemon_entry_to_markdown(pokemon, is_trainer_mapping=False):
    pokemon_list_markdown = map(
        lambda pokemon: f"{generate_pokemon_entry_markdown(pokemon, is_trainer_mapping)}",
        pokemon,
    )
    pokemon_list_markdown = list(pokemon_list_markdown)
    return pokemon_list_markdown
