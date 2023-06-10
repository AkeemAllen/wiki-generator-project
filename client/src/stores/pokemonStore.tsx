import { create } from "zustand";

type Pokemon = {
  name: string;
  id: number;
};

type PokemonStoreState = {
  pokemonList: Pokemon[];
};

type PokemonStoreAction = {
  setPokemonList: (pokemonList: PokemonStoreState["pokemonList"]) => void;
};

export const usePokemonStore = create<PokemonStoreState & PokemonStoreAction>(
  (set) => ({
    pokemonList: [],
    setPokemonList: (pokemonList) => set(() => ({ pokemonList })),
  })
);
