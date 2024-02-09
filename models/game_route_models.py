from typing import Dict, Optional, Union
from pydantic import BaseModel


class TrainerOrWildPokemon(BaseModel):
    # The pokemon dex number
    id: Optional[int]

    name: Optional[str]
    level: Optional[int]
    moves: Optional[list[str]]
    item: Optional[str]
    nature: Optional[str]
    ability: Optional[str]
    encounter_rate: Optional[int]

    # Trainers can have the same pokemon appear multiple times
    # in their team, so we need to differentiate them with a unique_id
    # Unique id structure: <dex_number>_<number_teammates>_<random_4_digit_number>
    # unique_id: 259_3_9572
    unique_id: Optional[str]

    # Rivals can have different teams depending on certain factors,
    # such as the chosen starter chosen. rival_version lists which version
    # of the rival's team this pokemon is on
    trainer_version: Optional[list[str]]


class Encounters(BaseModel):
    __root__: Dict[str, list[TrainerOrWildPokemon]]


class TrainerInfo(BaseModel):
    is_important: bool
    pokemon: list[TrainerOrWildPokemon]
    sprite_name: Optional[str]

    # the features below this are shelved for now
    # has_diff_versions: Optional[bool]
    trainer_versions: Optional[list[str]]


class Trainers(BaseModel):
    __root__: Dict[str, TrainerInfo]


class AreaLevels(BaseModel):
    __root__: Dict[str, str]


class RouteProperties(BaseModel):
    position: int
    wiki_name: Optional[str]
    wild_encounters: Optional[Encounters]
    trainers: Optional[Trainers]
    wild_encounters_area_levels: Optional[AreaLevels]


class Route(BaseModel):
    __root__: Dict[str, RouteProperties]


class NewRoute(BaseModel):
    current_route_name: Optional[str]
    new_route_name: str


class DuplicateRoute(BaseModel):
    current_route_name: str
    duplicated_route_name: str
