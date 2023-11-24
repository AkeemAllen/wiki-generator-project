import json
import yaml

from snakemd import Document, InlineText, Table, Paragraph

from utils import get_pokemon_dex_formatted_name


def get_type_image(type: str):
    return f"![{type}](img/types/{type}.png)"


def get_type_image_markdown(types: list):
    return f"{get_type_image(types[0])} <br/> {get_type_image(types[1]) if len(types) > 1 else ''}"


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


def generate_type_page(wiki_name: str, modified_pokemon: dict = None):
    with open(f"dist/{wiki_name}/mkdocs.yml", "r") as mkdocs_file:
        mkdocs_yaml_dict = yaml.load(mkdocs_file, Loader=yaml.FullLoader)
        mkdocs_file.close()

    if modified_pokemon is None:
        with open(
            f"data/{wiki_name}/modifications/modified_pokemon.json", "r"
        ) as pokemon_file:
            modified_pokemon = json.load(pokemon_file)
            pokemon_file.close()

    with open(f"data/{wiki_name}/pokemon.json", "r") as pokemon_file:
        pokemon_list = json.load(pokemon_file)
        pokemon_file.close()

    markdown_file_path = f"dist/{wiki_name}/docs/"
    doc = Document("type_changes")
    doc.add_header("Type Changes")

    pokemon_with_type_changes = []
    for pokemon in modified_pokemon:
        if "types" not in modified_pokemon[pokemon]:
            continue

        pokemon_with_type_changes.append(pokemon)

    if len(pokemon_with_type_changes) != 0:
        doc.add_table(
            ["Pokemon", "Old Type", "New Type"],
            [
                [
                    get_pokemon_markdown(wiki_name, pokemon_list, pokemon),
                    get_type_image_markdown(
                        modified_pokemon[pokemon]["types"]["original"]
                    ),
                    get_type_image_markdown(modified_pokemon[pokemon]["types"]["new"]),
                ]
                for pokemon in pokemon_with_type_changes
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
    generate_type_page("blaze-black-wiki")


if __name__ == "__main__":
    main()
