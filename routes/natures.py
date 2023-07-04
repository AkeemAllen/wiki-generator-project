from fastapi import APIRouter, Depends
import json
from utils import get_db
from sqlalchemy.orm import Session
import schemas

from services.nature_services import get_all_natures, create_nature

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
    natures = get_all_natures(db)
    return natures


@router.post("/v2/natures", response_model=schemas.NatureBase)
async def create_nature(nature: schemas.NatureBase, db: Session = Depends(get_db)):
    db_nature = create_nature(db, nature)
    return db_nature
