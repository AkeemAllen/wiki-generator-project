export type MoveDetails = {
  accuracy: number;
  pp: number;
  power: number;
  type: string;
  damage_class: string;
};

export type Move = {
  [key: string]: {
    level_learned_at: number;
    learn_method: string;
    delete?: boolean;
  };
};

export type Stats = {
  hp: number;
  attack: number;
  defense: number;
  sp_attack: number;
  sp_defense: number;
  speed: number;
};

export type PokemonChanges = {
  id?: number;
  types?: string[];
  abilities?: string[];
  stats?: Stats;
  moves?: Move;
  machineMoves?: string[];
  evolution?: string;
};

export type PokemonData = {
  id: number;
  name: string;
  types: string[];
  abilities: string[];
  stats: Stats;
  moves: Move;
  sprite: string;
  evolution?: string;
};

export type TrainerOrWildPokemon = {
  id?: number;
  name?: string;
  level?: number;
  moves?: string[];
  item?: string;
  nature?: string;
  ability?: string;
  encounter_rate?: number;
  area_level?: number;
  trainer_version?: string[];
};

export type Encounters = {
  [key: string]: TrainerOrWildPokemon[];
};

export type TrainerInfo = {
  is_important: boolean;
  pokemon: TrainerOrWildPokemon[];
  sprite_name: string;
  trainer_versions?: string[];
};

export type Trainers = {
  [key: string]: TrainerInfo;
};

export type AreaLevels = {
  [key: string]: string;
};

export type RouteProperties = {
  wild_encounters?: Encounters;
  trainers?: Trainers;
  wild_encounters_area_levels?: AreaLevels;
  position: number;
};

export type Routes = {
  [key: string]: RouteProperties;
};
