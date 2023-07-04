from sqlalchemy import Column, Integer, String
from database import Base


class Nature(Base):
    __tablename__ = "nature"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
