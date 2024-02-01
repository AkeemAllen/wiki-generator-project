import os
import shutil
from wiki_boilerplate_generator import create_boiler_plate


def test_create_boiler_plate_folder_generation():
    create_boiler_plate(
        "test_create_boiler_plate_wiki", "test_description", "test_author", "test_site"
    )

    assert os.path.exists("dist/test_create_boiler_plate_wiki/docs")
    assert os.path.exists("dist/test_create_boiler_plate_wiki/mkdocs.yml")
    assert os.path.exists("data/test_create_boiler_plate_wiki/modifications")
    shutil.rmtree("dist/test_create_boiler_plate_wiki")
    shutil.rmtree("data/test_create_boiler_plate_wiki")
