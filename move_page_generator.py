import json
from snakemd import new_doc, Heading
import yaml


def generate_move_page(wiki_name: str):
    with open(f"dist/{wiki_name}/mkdocs.yml", "r") as mkdocs_file:
        mkdocs_yaml_dict = yaml.load(mkdocs_file, Loader=yaml.FullLoader)
        mkdocs_file.close()

    with open(f"data/{wiki_name}/modifications/modified_moves.json", "r") as move_file:
        modified_moves = json.load(move_file)
        move_file.close()

    markdown_file_path = f"dist/{wiki_name}/docs/move_changes"
    doc = new_doc()
    doc.add_block(Heading("Move Changes", 1))

    for move, move_details in modified_moves.items():
        if len(move_details.keys()) == 1 and "machine_details" in move_details.keys():
            continue

        doc.add_block(Heading(move.title(), 2))
        doc.add_table(
            ["Attribute", "Old", "New"],
            [
                [attribute, change_details["original"], change_details["new"]]
                for attribute, change_details in move_details.items()
                if attribute != "machine_details"
            ],
        )

    doc.dump(markdown_file_path)

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
        {
            "Move Changes": "move_changes.md",
        },
        {"Specific Changes": specific_changes},
    ]

    with open(f"dist/{wiki_name}/mkdocs.yml", "w") as mkdocs_file:
        yaml.dump(mkdocs_yaml_dict, mkdocs_file, sort_keys=False, indent=4)
        mkdocs_file.close()


def main():
    generate_move_page("blaze-black-volt-white-two-wiki")


if __name__ == "__main__":
    main()
