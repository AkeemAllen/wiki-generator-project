export type MoveDetails = {
  accuracy: number;
  pp: number;
  power: number;
  type: string;
  damage_class: string;
  machine_details?: MachineVersion[];
};

export type MachineVersion = {
  game_version?: string;
  technical_name?: string;
};

export type Move = {
  [key: string]: {
    level_learned_at: number;
    learn_method: string | string[];
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

export type MoveChange = {
  move_name: string;
  operation:
    | "add"
    | "shift"
    | "delete"
    | "replace_move"
    | "replace_by_level"
    | "swap_moves";
  secondary_move?: string;
  level?: number;
};

export enum Operation {
  ADD = "add",
  SHIFT = "shift",
  DELETE = "delete",
  REPLACE_MOVE = "replace_move",
  REPLACE_BY_LEVEL = "replace_by_level",
  SWAP_MOVES = "swap_moves",
}

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
  unique_id?: string;
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

export type WikiSettings = {
  version_group: string;
  deployment_url: string;
  matchup_generation: "current" | "gen1" | "gen2";
};

export type Wiki = {
  name: string;
  description: string;
  author: string;
  site_name: string;
  repo_url: string;
  site_url: string;
  settings: WikiSettings;
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

export type DeploymentData = {
  wiki_name: string;
  deployment_url: string;
};

export enum DeploymentState {
  START = "START",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETE = "COMPLETE",
}

export enum PreparationState {
  START = "START",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETE = "COMPLETE",
  FINISHED = "FINISHED",
}

export const EncounterTypes = [
  "grass-normal",
  "grass-doubles",
  "grass-special",
  "sand-normal",
  "surf-normal",
  "surf-special",
  "fishing-normal",
  "fishing-special",
  "cave-normal",
  "cave-special",
  "legendary-encounter",
  "special-encounter",
  "other",
];
