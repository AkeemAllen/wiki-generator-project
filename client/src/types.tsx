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

export type Evolution = {
  level?: number;
  item?: string;
  other?: string;
  method?: string;
  evolved_pokemon?: string;
  delete?: boolean;
};

export type PokemonChanges = {
  id?: number;
  types?: string[];
  abilities?: string[];
  stats?: Stats;
  moves?: Move;
  machineMoves?: string[];
  evolution?: Evolution;
};

export type PokemonData = {
  id: number;
  name: string;
  types: string[];
  abilities: string[];
  stats: Stats;
  moves: Move;
  sprite: string;
  evolution?: Evolution;
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

export type Wiki = {
  name: string;
  description: string;
  author: string;
  site_name: string;
  repo_url: string;
  site_url: string;
};

export type Wikis = {
  [key: string]: Wiki;
};

export type PreparationData = {
  wipe_current_data: boolean;
  range_start: number;
  range_end: number;
};

export enum PokemonVersions {
  RED_BLUE = "red-blue",
  YELLOW = "yellow",
  GOLD_SILVER = "gold-silver",
  CRYSTAL = "crystal",
  RUBY_SAPPHIRE = "ruby-sapphire",
  EMERALD = "emerald",
  FIRERED_LEAFGREEN = "firered-leafgreen",
  DIAMOND_PEARL = "diamond-pearl",
  PLATINUM = "platinum",
  HEARTGOLD_SOULSILVER = "heartgold-soulsilver",
  BLACK_WHITE = "black-white",
  BLACKTWO_WHITETWO = "black-2-white-2",
  X_Y = "x-y",
  OMEGARUBY_ALPHASAPPHIRE = "omega-ruby-alpha-sapphire",
  SUN_MOON = "sun-moon",
  ULTRASUN_ULTRAMOON = "ultra-sun-ultra-moon",
  SWORD_SHEILD = "sword-shield",
}

export type GenerationData = {
  wiki_name: string;
  version_group?: string;
  range_start?: number;
  range_end?: number;
};
