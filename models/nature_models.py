from typing import Dict, Literal, Optional
from pydantic import BaseModel, RootModel


class NatureProperties(BaseModel):
    increased_stat: Optional[
        Literal["attack", "defense", "special-attack", "special-defense", "speed"]
    ]
    decreased_stat: Optional[
        Literal["attack", "defense", "special-attack", "special-defense", "speed"]
    ]


class Natures(RootModel):
    root: Dict[str, NatureProperties]
