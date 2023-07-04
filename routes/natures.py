from fastapi import APIRouter, Depends
import json

# from models.nature_models import NatureBase
import schemas
from utils import get_db
from sqlalchemy.orm import Session

from services import nature_services

router = APIRouter()

data_folder_route = "data"


# Get all pokemon and return by dict with name and id
@router.get("/natures/{wiki_name}")
async def get_item_list(wiki_name: str):
    with open(
        f"{data_folder_route}/{wiki_name}/natures.json", encoding="utf-8"
    ) as natures_file:
        natures = json.load(natures_file)
        natures_file.close()

    return natures


@router.get("/v2/natures", response_model=list[schemas.NatureBase])
async def get_natures(db: Session = Depends(get_db)):
    natures = nature_services.get_all_natures(db)
    return natures


@router.post("/v2/natures", response_model=schemas.NatureBase)
async def create_nature(nature: schemas.NatureBase, db: Session = Depends(get_db)):
    db_nature = nature_services.create_nature(db, nature)
    print(db_nature)
    return db_nature
