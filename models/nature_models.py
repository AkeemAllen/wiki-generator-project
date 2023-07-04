from pydantic import BaseModel


class NatureBase(BaseModel):
    id: int
    name: str

    class Config:
        orm_mode = True
