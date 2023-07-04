from sqlalchemy.orm import Session
from database_models import Nature

from models.nature_models import NatureBase


def get_all_natures(db: Session):
    return db.query(Nature).all()


def create_nature(db: Session, nature: NatureBase):
    db_nature = Nature(name=nature.name)
    db.add(db_nature)
    db.commit()
    db.refresh(db_nature)
    return db_nature
