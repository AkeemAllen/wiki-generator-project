from typing import Dict, Optional
from pydantic import BaseModel, RootModel


class ItemProperties(BaseModel):
    effect: str
    sprite: str
    location: Optional[str] = None


class Items(RootModel):
    root: Dict[str, ItemProperties]
