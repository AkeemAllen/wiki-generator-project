from sqlalchemy.orm import Session

# from models.pokemon_models import PokemonBase
from database_models import Pokemon


def get_all_pokemon(db: Session):
    return db.query(Pokemon).all()


# def get_pokemon(db: Session, pokemon_id: int):
#     return db.query(Pokemon).filter(PokemonBase.id == pokemon_id).first()


# def create_pokemon(db: Session, pokemon: PokemonBase):
#     db_pokemon = PokemonBase(id=pokemon.id, name=pokemon.name, wiki=pokemon.wiki)
#     db.add(db_pokemon)
#     db.commit()
#     db.refresh(db_pokemon)
#     return db_pokemon
