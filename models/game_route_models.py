from typing import Dict, Optional, Union
from pydantic import BaseModel, RootModel


class TrainerOrWildPokemon(BaseModel):
    # The pokemon dex number
    id: Optional[int] = None

    name: Optional[str] = None
    level: Optional[int] = None
    moves: Optional[list[str]] = None
    item: Optional[str] = None
    nature: Optional[str] = None
    ability: Optional[str] = None
    encounter_rate: Optional[int] = None

    # Trainers can have the same pokemon appear multiple times
    # in their team, so we need to differentiate them with a unique_id
    # Unique id structure: <dex_number>_<number_teammates>_<random_4_digit_number>
    # unique_id: 259_3_9572
    unique_id: Optional[str] = None

    # Rivals can have different teams depending on certain factors,
    # such as the chosen starter chosen. rival_version lists which version
    # of the rival's team this pokemon is on
    trainer_version: Optional[list[str]] = None


class Encounters(RootModel):
    root: Dict[str, list[TrainerOrWildPokemon]]


class TrainerInfo(BaseModel):
    is_important: bool
    pokemon: list[TrainerOrWildPokemon]
    sprite_name: Optional[str] = None

    # the features below this are shelved for now
    # has_diff_versions: Optional[bool]
    trainer_versions: Optional[list[str]] = None


class Trainers(RootModel):
    root: Dict[str, TrainerInfo]


class AreaLevels(RootModel):
    root: Dict[str, str]


class RouteProperties(BaseModel):
    position: int
    wiki_name: Optional[str] = None
    wild_encounters: Optional[Encounters] = None
    trainers: Optional[Trainers] = None
    wild_encounters_area_levels: Optional[AreaLevels] = None


class Route(RootModel):
    root: Dict[str, RouteProperties]


class NewRoute(BaseModel):
    current_route_name: Optional[str] = None
    new_route_name: str


class DuplicateRoute(BaseModel):
    current_route_name: str
    duplicated_route_name: str
