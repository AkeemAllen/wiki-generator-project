import json
from snakemd import Document, InlineText, Table, Paragraph
import yaml

from utils import get_pokemon_dex_formatted_name


def get_image_markdown(item_name: str):
    if item_name == "" or item_name is None:
        return ""
    return f"![{item_name}](img/items/{item_name}.png)<br/> {item_name}"


def get_markdown_image_for_pokemon(pokemon_list, pokemon_name: str):
    dex_number = pokemon_list[pokemon_name]["id"]
    file_name = get_pokemon_dex_formatted_name(dex_number)
    return f"![{pokemon_name}](img/pokemon/{file_name}.png)"


def get_link_to_pokemon_page(wiki_name, pokemon_list, pokemon_name: str):
    dex_number = pokemon_list[pokemon_name]["id"]
    url_route = get_pokemon_dex_formatted_name(dex_number)
    # passing the wiki name to this function was tricky
    # using a global variable from a different file that gets updated in the routes_generator file
    # gets around the need to pass the wiki name to this function (which would require deep prop drilling)
    return f"[{pokemon_name.capitalize()}](/{wiki_name}/pokemon/{url_route})"


def get_pokemon_markdown(wiki_name, pokemon_list, pokemon_name):
    return f"{get_markdown_image_for_pokemon(pokemon_list, pokemon_name)}<br/>{get_link_to_pokemon_page(wiki_name, pokemon_list, pokemon_name)}"


def generate_evolution_page(wiki_name: str):
    with open(f"dist/{wiki_name}/mkdocs.yml", "r") as mkdocs_file:
        mkdocs_yaml_dict = yaml.load(mkdocs_file, Loader=yaml.FullLoader)
        mkdocs_file.close()

    with open(
        f"data/{wiki_name}/modifications/modified_pokemon.json", "r"
    ) as pokemon_file:
        modified_pokemon = json.load(pokemon_file)
        pokemon_file.close()

    with open(f"data/{wiki_name}/pokemon.json", "r") as pokemon_file:
        pokemon_list = json.load(pokemon_file)
        pokemon_file.close()

    markdown_file_path = f"dist/{wiki_name}/docs/"
    doc = Document("evolution_changes")
    doc.add_header("Evolution Changes")

    evo_level_changed_pokemon = []
    evo_item_changed_pokemon = []
    other_changed_pokemon = []

    for pokemon in modified_pokemon:
        if "evolution" not in modified_pokemon[pokemon]:
            continue

        evolution = modified_pokemon[pokemon]["evolution"]
        if evolution["method"] == "level-up":
            evo_level_changed_pokemon.append(pokemon)
        elif evolution["method"] == "item":
            evo_item_changed_pokemon.append(pokemon)
        else:
            other_changed_pokemon.append(pokemon)

    if len(evo_level_changed_pokemon) != 0:
        doc.add_header("Level Changes", 2)
        doc.add_table(
            ["Base Pokemon", "Level", "Evolved Pokemon"],
            [
                [
                    get_pokemon_markdown(wiki_name, pokemon_list, pokemon),
                    modified_pokemon[pokemon]["evolution"]["level"],
                    get_pokemon_markdown(
                        wiki_name,
                        pokemon_list,
                        modified_pokemon[pokemon]["evolution"]["evolved_pokemon"],
                    ),
                ]
                for pokemon in evo_level_changed_pokemon
            ],
        )

    if len(evo_item_changed_pokemon) != 0:
        doc.add_header("Item Interaction Changes", 2)
        doc.add_table(
            ["Base Pokemon", "Item", "Evolved Pokemon"],
            [
                [
                    get_pokemon_markdown(wiki_name, pokemon_list, pokemon),
                    get_image_markdown(modified_pokemon[pokemon]["evolution"]["item"]),
                    get_pokemon_markdown(
                        wiki_name,
                        pokemon_list,
                        modified_pokemon[pokemon]["evolution"]["evolved_pokemon"],
                    ),
                ]
                for pokemon in evo_item_changed_pokemon
            ],
        )

    if len(other_changed_pokemon) != 0:
        doc.add_header("Other Changes", 2)
        doc.add_table(
            ["Base Pokemon", "Method", "Evolved Pokemon"],
            [
                [
                    get_pokemon_markdown(wiki_name, pokemon_list, pokemon),
                    modified_pokemon[pokemon]["evolution"]["other"],
                    get_pokemon_markdown(
                        wiki_name,
                        pokemon_list,
                        modified_pokemon[pokemon]["evolution"]["evolved_pokemon"],
                    ),
                ]
                for pokemon in other_changed_pokemon
            ],
        )

    doc.output_page(markdown_file_path)

    # Modify this to search for specific changes
    for nav_item in mkdocs_yaml_dict["nav"][1]["Pokemon"]:
        if "Specific Changes" in nav_item:
            specific_changes = nav_item["Specific Changes"]

    mkdocs_yaml_dict["nav"][1]["Pokemon"] = [
        {
            "Type Changes": "type_changes.md",
        },
        {
            "Evolution Changes": "evolution_changes.md",
        },
        {"Specific Changes": specific_changes},
    ]

    with open(f"dist/{wiki_name}/mkdocs.yml", "w") as mkdocs_file:
        yaml.dump(mkdocs_yaml_dict, mkdocs_file, sort_keys=False, indent=4)
        mkdocs_file.close()


def main():
    generate_evolution_page("blaze-black-wiki")


if __name__ == "__main__":
    main()
