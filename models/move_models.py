from typing import Dict, List, Optional
from pydantic import BaseModel


class MachineVersion(BaseModel):
    technical_name: str
    game_version: str


class MoveDetails(BaseModel):
    power: Optional[int] = None
    pp: Optional[int] = None
    accuracy: Optional[int] = None
    type: Optional[str] = None
    damage_class: Optional[str] = None
    machine_details: Optional[List[MachineVersion]] = None
