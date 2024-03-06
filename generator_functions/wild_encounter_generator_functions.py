from snakemd import new_doc, Document, Heading

from models.game_route_models import AreaLevels, Encounters
from utils import get_markdown_image_for_item, map_pokemon_entry_to_markdown


def get_encounter_table_columns(max_pokemon_on_single_route):
    table_columns = ["Area", "Pokemon"]
    if max_pokemon_on_single_route == 1:
        return table_columns

    for i in range(max_pokemon_on_single_route - 1):
        if i < 5:
            table_columns.append("&nbsp;")
    return table_columns


def get_encounter_table_rows(encounters: Encounters, area_levels: AreaLevels):
    max_number_of_pokemon_on_single_route = 0
    table_array_rows_for_encounters = []

    for encounter_type, pokemon_encounter_list in encounters.root.items():
        # Length of table rows should not exceed 6
        if len(pokemon_encounter_list) >= 6:
            max_number_of_pokemon_on_single_route = 6
        elif len(pokemon_encounter_list) > max_number_of_pokemon_on_single_route:
            max_number_of_pokemon_on_single_route = len(pokemon_encounter_list)

        mapped_encounter_list = map_pokemon_entry_to_markdown(pokemon_encounter_list)
        extra_encounter_array = []
        extra_encounter_list = []

        # If there are more than 6 encounters, split the list into two arrays
        # Note that a scenario for more than 12 encounters is not accounted for
        if len(mapped_encounter_list) > 6:
            extra_encounter_list = mapped_encounter_list[6:]
            mapped_encounter_list = mapped_encounter_list[:6]
            extra_encounter_array = [f"Extra", *extra_encounter_list]

        level_for_encounter_type = ""
        try:
            level_for_encounter_type = f"lv. {area_levels.root[encounter_type]}"
        except KeyError:
            pass

        encounter_type_image = ""
        if (
            "legendary-encounter" not in encounter_type
            and "special-encounter" not in encounter_type
        ):
            encounter_type_image = f"{get_markdown_image_for_item(encounter_type)}<br/>"

        encounter_array = [
            f"{ encounter_type_image }"
            f"{encounter_type}<br/>{level_for_encounter_type}",
            *mapped_encounter_list,
        ]

        table_array_rows_for_encounters.append(encounter_array)
        if extra_encounter_array:
            table_array_rows_for_encounters.append(extra_encounter_array)

    # Add empty strings to the end of each row if the number of pokemon is less than the max
    for row in table_array_rows_for_encounters:
        if len(row) < max_number_of_pokemon_on_single_route + 1:
            while range(len(row), max_number_of_pokemon_on_single_route + 1):
                row.append("")

    return (
        table_array_rows_for_encounters,
        max_number_of_pokemon_on_single_route,
    )


def create_encounter_table(
    route_name: str, route_directory: str, encounters, area_levels
):
    doc = new_doc()
    doc.add_block(Heading(f"{route_name.capitalize()}", 1))

    table_rows, max_number_of_pokemon_on_single_route = get_encounter_table_rows(
        encounters, area_levels
    )

    table_columns = get_encounter_table_columns(max_number_of_pokemon_on_single_route)

    doc.add_table(
        table_columns,
        table_rows,
    )

    doc.dump(f"{route_directory}/wild_encounters")
