from pydantic import BaseModel


class Stats(BaseModel):
    hp: int
    attack: int
    defense: int
    sp_attack: int
    sp_defense: int
    speed: int


class Pokemon(BaseModel):
    dex_number: int
    name: str
    sprite: str
    wiki: str
    # stats: Optional[Stats]
