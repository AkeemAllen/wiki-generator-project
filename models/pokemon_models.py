from enum import Enum
from typing import Dict, List, Literal, Optional
from pydantic import BaseModel, RootModel


class Stats(BaseModel):
    hp: Optional[int] = None
    attack: Optional[int] = None
    defense: Optional[int] = None
    sp_attack: Optional[int] = None
    sp_defense: Optional[int] = None
    speed: Optional[int] = None


class MoveDetails(BaseModel):
    power: Optional[int] = None
    accuracy: Optional[int] = None
    pp: Optional[int] = None
    type: Optional[str] = None
    damage_class: Optional[str] = None


class MoveData(BaseModel):
    level_learned_at: int
    learn_method: str | List[str]
    delete: Optional[bool] = False


class Move(RootModel):
    root: Dict[str, MoveData]

    def __iter__(self):
        return iter(self.root)

    def __getitem__(self, key):
        return self.root[key]


class Evolution(BaseModel):
    level: Optional[int] = None
    item: Optional[str] = None
    other: Optional[str] = None
    method: Optional[str] = None
    evolved_pokemon: Optional[str] = None
    delete: Optional[bool] = False


class PokemonChanges(BaseModel):
    id: Optional[int] = None
    types: Optional[list[str]] = None
    abilities: Optional[list[str]] = None
    stats: Optional[Stats] = None
    moves: Optional[Move] = None
    machine_moves: Optional[list[str]] = None
    evolution: Optional[Evolution] = None


class PokemonData(BaseModel):
    id: Optional[int] = None
    name: Optional[str] = None
    types: Optional[list[str]] = None
    abilities: Optional[list[str]] = None
    stats: Optional[Stats] = None
    moves: Optional[Move] = None
    sprite: Optional[str] = None
    evolution: Optional[Evolution] = None


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
        "swap_moves",
    ]
    secondary_move: Optional[str] = None
    level: Optional[int] = None


class Operation(Enum):
    ADD = "add"  # Add <move_name> at level <level>
    SHIFT = "shift"  # Shift <move_name> to level <level>
    DELETE = "delete"  # Delete <move_name>
    REPLACE_MOVE = "replace_move"  # Replace move <move_name> with <secondary_move>
    REPLACE_BY_LEVEL = (
        "replace_by_level"  # Replace move at level <level> with <move_name>
    )
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
