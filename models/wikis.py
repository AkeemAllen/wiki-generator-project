from pydantic import BaseModel


class Wiki(BaseModel):
    name: str
    description: str
    site_name: str
    author: str
    repo_url: str
    site_url: str
