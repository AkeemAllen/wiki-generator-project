from enum import Enum
from typing import Literal, Optional
from pydantic import BaseModel

from models.pokemon_models import PokemonVersions


class WikiSettings(BaseModel):
    version_group: PokemonVersions
    deployment_url: Optional[str]
    matchup_generation: Literal["current", "gen1", "gen2"] = "current"


class Wiki(BaseModel):
    name: str
    description: str
    site_name: str
    author: str
    repo_url: str
    site_url: str
    settings: Optional[WikiSettings]


class PreparationData(BaseModel):
    wiki_name: Optional[str]
    range_start: int
    range_end: int
    wipe_current_data: bool = False


class GenerationData(BaseModel):
    wiki_name: str
    version_group: Optional[PokemonVersions]
    range_start: Optional[int]
    range_end: Optional[int]


class DeploymentData(BaseModel):
    wiki_name: str
    deployment_url: str


class DeploymentState(Enum):
    START = "START"
    IN_PROGRESS = "IN_PROGRESS"
    COMPLETE = "COMPLETE"
