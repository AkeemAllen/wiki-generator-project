from typing import Dict
from pydantic import BaseModel, RootModel


class AbilityProperties(BaseModel):
    effect: str


class Abilities(RootModel):
    root: Dict[str, AbilityProperties]
