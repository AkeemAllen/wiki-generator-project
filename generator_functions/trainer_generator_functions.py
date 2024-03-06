from typing import Dict
from models.game_route_models import ImportantTrainerInfo, ImportantTrainers, Trainers
from snakemd import new_doc, Document, Heading

from utils import (
    generate_move_string,
    generate_pokemon_entry_markdown,
    get_markdown_image_for_item,
    map_pokemon_entry_to_markdown,
)


def get_item_entry_markdown(item_name):
    if item_name == None or item_name == "":
        return "N/A"
    return f"{get_markdown_image_for_item(item_name)} <br/> {item_name.replace('-', ' ').capitalize()}"


def get_trainer_table_columns(max_pokemon_on_single_tainer):
    table_columns = ["Trainer", 1]
    if max_pokemon_on_single_tainer == 1:
        return table_columns

    for i in range(max_pokemon_on_single_tainer - 1):
        if i < 5:
            table_columns.append(i + 2)
    return table_columns


def get_trainer_table_rows(trainers: Trainers | ImportantTrainers):
    max_number_of_pokemon_single_trainer = 0
    table_array_rows_for_trainers = []

    for trainer_name, trainer_info in trainers.root.items():
        if len(trainer_info.pokemon) > max_number_of_pokemon_single_trainer:
            max_number_of_pokemon_single_trainer = len(trainer_info.pokemon)

        mapped_pokemon = map_pokemon_entry_to_markdown(
            trainer_info.pokemon, is_trainer_mapping=True
        )

        table_array_trainer = trainer_name.title()
        if isinstance(trainer_info, ImportantTrainerInfo) and trainer_info.sprite_name:
            sprite_url = f"https://play.pokemonshowdown.com/sprites/trainers/{trainer_info.sprite_name}.png"
            table_array_trainer = (
                f"{ trainer_name.title() }<br/> ![{trainer_name}]({ sprite_url })"
            )

        trainer_array = [
            table_array_trainer,
            *mapped_pokemon,
        ]
        table_array_rows_for_trainers.append(trainer_array)

    # Add empty strings to the end of each row if the number of pokemon is less than the max
    # This avoids error from doc.add_table where the number of columns in each row is not the same
    for row in table_array_rows_for_trainers:
        if len(row) < max_number_of_pokemon_single_trainer + 1:
            while range(len(row), max_number_of_pokemon_single_trainer + 1):
                row.append("")

    return (table_array_rows_for_trainers, max_number_of_pokemon_single_trainer)


def create_trainer_details_table(
    file_abilities: Dict,
    file_items: Dict,
    trainer_info: ImportantTrainerInfo,
    doc: Document,
    trainer_name: str,
    indent: int = 0,
):
    table_rows = []
    for pokemon in trainer_info.pokemon:
        item_entry = get_item_entry_markdown(pokemon.item)
        item_entry_markdown = (
            f'<abbr title="{file_items[pokemon.item]["effect"]}">{item_entry}</abbr>'
            if item_entry != "N/A"
            else item_entry
        )

        nature_entry = (
            pokemon.nature if pokemon.nature != None and pokemon.nature != "" else "N/A"
        )

        ability_entry = (
            pokemon.ability
            if pokemon.ability != None and pokemon.ability != ""
            else "N/A"
        )
        ability_entry_markdown = (
            f'<abbr title="{file_abilities[ability_entry]["effect"]}">{ability_entry.title()}</abbr>'
            if ability_entry != "N/A"
            else ability_entry
        )

        table_rows.append(
            [
                generate_pokemon_entry_markdown(pokemon, is_trainer_mapping=True),
                item_entry_markdown,
                nature_entry.title(),
                ability_entry_markdown,
                generate_move_string(pokemon.moves),
            ]
        )
    first_item = trainer_name.capitalize()
    if trainer_info.sprite_name:
        sprite_url = f"https://play.pokemonshowdown.com/sprites/trainers/{trainer_info.sprite_name}.png"
        first_item = f"![{trainer_name}]({ sprite_url })"
    doc.add_table(
        [first_item, "Item", "Nature", "Ability", "Moves"],
        table_rows,
        indent=indent,
    )


def create_trainer_table(
    route_name: str,
    route_directory: str,
    trainers: Trainers,
):
    doc = new_doc()
    doc.add_block(Heading(f"{route_name.capitalize()}", 1))

    table_rows, max_number_of_pokemon_on_single_trainer = get_trainer_table_rows(
        trainers
    )
    table_columns = get_trainer_table_columns(max_number_of_pokemon_on_single_trainer)

    doc.add_table(
        table_columns,
        table_rows,
    )

    doc.dump(f"{route_directory}/trainers")


def create_important_trainer_table(
    route_name: str,
    important_trainers: ImportantTrainers,
    route_directory: str,
    file_abilities,
    file_items,
):
    doc = new_doc()
    doc.add_block(Heading(f"{route_name.capitalize()}", 1))

    trainers_with_diff_versions = {}
    trainers_without_diff_versions = {}

    for trainer_name, trainer_info in important_trainers.root.items():
        if trainer_info.trainer_versions is None or trainer_info.trainer_versions == []:
            trainers_without_diff_versions[trainer_name] = trainer_info
            continue

        trainers_with_diff_versions[trainer_name] = trainer_info

    trainers_without_diff_versions = ImportantTrainers(
        root=trainers_without_diff_versions
    )
    trainers_with_diff_versions = ImportantTrainers(root=trainers_with_diff_versions)

    # Create table for trainers without different versions
    for trainer_name, trainer_info in trainers_without_diff_versions.root.items():
        doc.add_block(Heading(trainer_name.title(), 2))
        create_trainer_details_table(
            file_abilities, file_items, trainer_info, doc, trainer_name
        )

    # Create table for trainers with different versions
    for trainer_name, trainer_info in trainers_with_diff_versions.root.items():
        any_pokemon_has_version = any(
            pokemon.trainer_version is not None and pokemon.trainer_version != []
            for pokemon in trainer_info.pokemon
        )

        if not any_pokemon_has_version:
            continue

        doc.add_block(Heading(trainer_name.title(), 2))
        for version in trainer_info.trainer_versions:
            filtered_pokemon = []
            for pokemon in trainer_info.pokemon:
                if (
                    pokemon.trainer_version is not None
                    and version in pokemon.trainer_version
                ):
                    filtered_pokemon.append(pokemon)

            if len(filtered_pokemon) == 0:
                continue

            # Indent needs to be 4 if there are multiple versions
            # or else markdown will not render properly
            indent = 2
            if len(trainer_info.trainer_versions) > 1:
                doc.add_paragraph(f'=== "{version.title()}"')
                indent = 4

            filtered_trainer_info = ImportantTrainerInfo(
                trainer_versions=trainer_info.trainer_versions,
                sprite_name=trainer_info.sprite_name,
                pokemon=filtered_pokemon,
            )
            create_trainer_details_table(
                file_abilities,
                file_items,
                filtered_trainer_info,
                doc,
                trainer_name,
                indent,
            )

    doc.dump(f"{route_directory}/important_trainers")
