from pydantic import ConfigDict, BaseModel


class NatureBase(BaseModel):
    id: int
    name: str
    model_config = ConfigDict(from_attributes=True)
