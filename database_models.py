from sqlalchemy import Column, Integer, String, ForeignKey, Table
from sqlalchemy.orm import relationship
from database import Base


class Pokemon(Base):
    __tablename__ = "pokemon"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    dex_number = Column(Integer, index=True)
    name = Column(String, index=True)
    sprite = Column(String)
    wiki = Column(String)

    stats = relationship("Stats", uselist=False, back_populates="pokemon")


class Stats(Base):
    __tablename__ = "stats"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    hp = Column(Integer)
    attack = Column(Integer)
    defense = Column(Integer)
    sp_attack = Column(Integer)
    sp_defense = Column(Integer)
    speed = Column(Integer)
    pokemon_id = Column(Integer, ForeignKey("pokemon.id"))

    pokemon = relationship("Pokemon", back_populates="stats")


class Pokemon_Type(Base):
    __tablename__ = "pokemon_type"
    pokemon_id = Column(Integer, ForeignKey("pokemon.id"), primary_key=True)
    type_id = Column(Integer, ForeignKey("types.id"), primary_key=True)


class Types(Base):
    __tablename__ = "types"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String, index=True)


class Pokemon_Ability(Base):
    __tablename__ = "pokemon_ability"
    pokemon_id = Column(Integer, ForeignKey("pokemon.id"), primary_key=True)
    ability_id = Column(Integer, ForeignKey("abilities.id"), primary_key=True)


class Abilities(Base):
    __tablename__ = "abilities"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String, index=True)
    effect = Column(String)
    wiki = Column(String)


# class Pokemon_Nature(Base):
#     __tablename__ = "pokemon_nature"
#     pokemon_id = Column(Integer, ForeignKey("pokemon.id"), primary_key=True)
#     nature_id = Column(Integer, ForeignKey("nature.id"), primary_key=True)


class Nature(Base):
    __tablename__ = "nature"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String, index=True)
    increased_stat = Column(String)
    decreased_stat = Column(String)


class Pokemon_Move(Base):
    __tablename__ = "pokemon_move"
    pokemon_id = Column(Integer, ForeignKey("pokemon.id"), primary_key=True)
    move_id = Column(Integer, ForeignKey("moves.id"), primary_key=True)
    learn_method = Column(String)
    learn_level = Column(Integer)


class Moves(Base):
    __tablename__ = "moves"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String, index=True)
    power = Column(Integer)
    accuracy = Column(Integer)
    power_points = Column(Integer)
    type = Column(Integer, ForeignKey("types.id"))
    damage_class = Column(String)
