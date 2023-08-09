from sqlalchemy.orm import Session

# from models.pokemon_models import PokemonBase
from schemas import pokemon_schemas as schemas
from database_models import Pokemon, Stats


def get_all_pokemon(db: Session):
    return db.query(Pokemon).all()


def get_pokemon(db: Session, pokemon_id: int):
    return db.query(Pokemon).filter(Pokemon.id == pokemon_id).first()


def create_pokemon(db: Session, pokemon: schemas.Pokemon):
    db_pokemon = Pokemon(
        name=pokemon.name,
        dex_number=pokemon.dex_number,
        sprite=pokemon.sprite,
        wiki=pokemon.wiki,
        stats=pokemon.stats,
    )
    db.add(db_pokemon)
    # db_stats = Stats(
    #     hp=pokemon.stats.hp,
    #     attack=pokemon.stats.attack,
    #     defense=pokemon.stats.defense,
    #     sp_attack=pokemon.stats.sp_attack,
    #     sp_defense=pokemon.stats.sp_defense,
    #     speed=pokemon.stats.speed,
    #     pokemon_id=db_pokemon.id,
    # )
    # db.add(db_stats)
    db.commit()
    db.refresh(db_pokemon)
    return db_pokemon
