from typing import Dict, List, Optional
from pydantic import BaseModel


class MachineVersion(BaseModel):
    technical_name: str
    game_version: str


class MoveDetails(BaseModel):
    power: Optional[int]
    pp: Optional[int]
    accuracy: Optional[int]
    type: Optional[str]
    damage_class: Optional[str]
    machine_details: Optional[List[MachineVersion]]
