from typing import Optional
from pydantic import BaseModel


class Stats(BaseModel):
    hp: int
    attack: int
    defense: int
    sp_attack: int
    sp_defense: int
    speed: int


class Pokemon(BaseModel):
    # id: int
    dex_number: int
    name: str
    sprite: str
    wiki: str
    stats: Stats
