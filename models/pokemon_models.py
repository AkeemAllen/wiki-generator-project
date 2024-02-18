from enum import Enum
from typing import Dict, List, Literal, Optional
from pydantic import BaseModel


class Stats(BaseModel):
    hp: Optional[int]
    attack: Optional[int]
    defense: Optional[int]
    sp_attack: Optional[int]
    sp_defense: Optional[int]
    speed: Optional[int]


class MoveDetails(BaseModel):
    power: Optional[int]
    accuracy: Optional[int]
    pp: Optional[int]
    type: Optional[str]
    damage_class: Optional[str]


class MoveData(BaseModel):
    level_learned_at: int
    learn_method: str | List[str]
    delete: Optional[bool] = False


class Move(BaseModel):
    __root__: Dict[str, MoveData]


class Evolution(BaseModel):
    level: Optional[int]
    item: Optional[str]
    other: Optional[str]
    method: Optional[str]
    evolved_pokemon: Optional[str]
    delete: Optional[bool] = False


class PokemonChanges(BaseModel):
    id: Optional[int]
    types: Optional[list[str]]
    abilities: Optional[list[str]]
    stats: Optional[Stats]
    moves: Optional[Move]
    machine_moves: Optional[list[str]]
    evolution: Optional[Evolution]


class PokemonData(BaseModel):
    id: Optional[int]
    name: Optional[str]
    types: Optional[list[str]]
    abilities: Optional[list[str]]
    stats: Optional[Stats]
    moves: Optional[Move]
    sprite: Optional[str]
    evolution: Optional[Evolution]


class PokemonVersions(Enum):
    RED_BLUE = "red-blue"
    YELLOW = "yellow"
    GOLD_SILVER = "gold-silver"
    CRYSTAL = "crystal"
    RUBY_SAPPHIRE = "ruby-sapphire"
    EMERALD = "emerald"
    FIRERED_LEAFGREEN = "firered-leafgreen"
    DIAMOND_PEARL = "diamond-pearl"
    PLATINUM = "platinum"
    HEARTGOLD_SOULSILVER = "heartgold-soulsilver"
    BLACK_WHITE = "black-white"
    BLACKTWO_WHITETWO = "black-2-white-2"
    X_Y = "x-y"
    OMEGARUBY_ALPHASAPPHIRE = "omega-ruby-alpha-sapphire"
    SUN_MOON = "sun-moon"
    ULTRASUN_ULTRAMOON = "ultra-sun-ultra-moon"
    SWORD_SHEILD = "sword-shield"
    LETS_GO_PIKACHU_EEVEE = "lets-go-pikachu-lets-go-eevee"
    COLLOSEUM = "colosseum"
    XD = "xd"


class MoveChange(BaseModel):
    move_name: str
    operation: Literal[
        "add",
        "shift",
        "delete",
        "replace_move",
        "replace_by_level",
        "replace_move_and_level",
        "swap_moves",
    ]
    secondary_move: Optional[str]
    level: Optional[int]


class Operation(Enum):
    ADD = "add"  # Add <move_name> at level <level>
    SHIFT = "shift"  # Shift <move_name> to level <level>
    DELETE = "delete"  # Delete <move_name>
    REPLACE_MOVE = "replace_move"  # Replace move <move_name> with <secondary_move>
    REPLACE_BY_LEVEL = (
        "replace_by_level"  # Replace move at level <level> with <move_name>
    )
    REPLACE_MOVE_AND_LEVEL = "replace_move_and_level"  # Replace move <move_name> with <secondary_move> at level <level>
    SWAP_MOVES = "swap_moves"  # Swap <move_name> with <secondary_move>


class PokemonMoveChanges(BaseModel):
    pokemon: str
    move_changes: List[MoveChange]


pokemon_versions_ordered = {
    PokemonVersions.RED_BLUE: 0,
    PokemonVersions.YELLOW: 1,
    PokemonVersions.GOLD_SILVER: 2,
    PokemonVersions.CRYSTAL: 3,
    PokemonVersions.RUBY_SAPPHIRE: 4,
    PokemonVersions.EMERALD: 5,
    PokemonVersions.FIRERED_LEAFGREEN: 6,
    PokemonVersions.DIAMOND_PEARL: 7,
    PokemonVersions.PLATINUM: 8,
    PokemonVersions.HEARTGOLD_SOULSILVER: 9,
    PokemonVersions.BLACK_WHITE: 10,
    PokemonVersions.BLACKTWO_WHITETWO: 11,
    PokemonVersions.X_Y: 12,
    PokemonVersions.OMEGARUBY_ALPHASAPPHIRE: 13,
    PokemonVersions.SUN_MOON: 14,
    PokemonVersions.ULTRASUN_ULTRAMOON: 15,
    PokemonVersions.SWORD_SHEILD: 16,
    PokemonVersions.LETS_GO_PIKACHU_EEVEE: 17,
    PokemonVersions.COLLOSEUM: 18,
    PokemonVersions.XD: 19,
}


class PreparationState(Enum):
    START = "START"
    IN_PROGRESS = "IN_PROGRESS"
    COMPLETE = "COMPLETE"
    FINISHED = "FINISHED"
