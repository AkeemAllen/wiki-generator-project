import { useMutation, useQuery } from "@tanstack/react-query";
import { useLocalStorage } from "usehooks-ts";
import { MoveChange, PokemonChanges, PreparationData } from "../types";

export const useGetPokemon = (onSuccess: (data: any) => void) => {
  const [currentWiki, _] = useLocalStorage("currentWiki", "none");
  return useQuery({
    queryKey: ["pokemon"],
    queryFn: () =>
      fetch(`${import.meta.env.VITE_BASE_URL}/pokemon/${currentWiki}`).then(
        (res) => res.json()
      ),
    onSuccess,
    refetchOnWindowFocus: false,
    enabled: false,
  });
};

export const useGetPokemonByName = ({ pokemonName, onSuccess }: any) => {
  const [currentWiki, _] = useLocalStorage("currentWiki", "none");
  return useQuery({
    queryKey: ["pokemon", pokemonName],
    queryFn: () => {
      const params = new URLSearchParams({ pokemon_name_or_id: pokemonName });
      const URL = `${
        import.meta.env.VITE_BASE_URL
      }/pokemon/single/${currentWiki}?${params}`;

      return fetch(URL).then((res) => res.json());
    },
    onSuccess,
    refetchOnWindowFocus: false,
    enabled: false,
  });
};

export const useGetPokemonById = ({ onSuccess, onError }: any) => {
  const [currentWiki, _] = useLocalStorage("currentWiki", "none");
  return useMutation({
    mutationFn: ({ pokemonId }: any) => {
      const params = new URLSearchParams({ pokemon_name_or_id: pokemonId });
      const URL = `${
        import.meta.env.VITE_BASE_URL
      }/pokemon/single/${currentWiki}?${params}`;

      return fetch(URL, {
        method: "GET",
      }).then((res) => res.json());
    },
    onSuccess,
    onError,
  });
};
type SavePokemonProps = {
  pokemonName: string;
  pokemonChanges: PokemonChanges;
};

export const useSavePokemonChanges = ({ onSuccess, onError }: any) => {
  const [currentWiki, _] = useLocalStorage("currentWiki", "none");
  return useMutation({
    mutationFn: ({ pokemonName, pokemonChanges }: SavePokemonProps) => {
      const params = new URLSearchParams({ pokemon_name: pokemonName });
      const URL = `${
        import.meta.env.VITE_BASE_URL
      }/pokemon/edit/${currentWiki}?${params}`;

      return fetch(URL, {
        method: "POST",
        body: JSON.stringify(pokemonChanges),
        headers: { "Content-Type": "application/json" },
      }).then((res) => res.json());
    },
    onSuccess,
    onError,
  });
};

type AddMultipleMovesProps = {
  pokemon_being_modified: string[];
  moves_being_added: string[];
};

export const useAddMultipleMoves = ({ onSuccess, onError }: any) => {
  const [currentWiki, _] = useLocalStorage("currentWiki", "none");
  return useMutation({
    mutationFn: ({
      pokemon_being_modified,
      moves_being_added,
    }: AddMultipleMovesProps) => {
      const params = new URLSearchParams({ wiki_name: currentWiki });
      return fetch(
        `${
          import.meta.env.VITE_BASE_URL
        }/pokemon/add-machine-moves/${currentWiki}`,
        {
          method: "POST",
          body: JSON.stringify({ pokemon_being_modified, moves_being_added }),
          headers: { "Content-Type": "application/json" },
        }
      ).then((res) => res.json());
    },
    onSuccess,
    onError,
  });
};

type ModifyLevelMovesProps = {
  pokemon_move_changes: { pokemon: string; move_changes: MoveChange[] };
};

export const useModifyLevelMoves = ({ onSuccess, onError }: any) => {
  const [currentWiki, _] = useLocalStorage("currentWiki", "none");
  return useMutation({
    mutationFn: ({ pokemon_move_changes }: ModifyLevelMovesProps) => {
      return fetch(
        `${
          import.meta.env.VITE_BASE_URL
        }/pokemon/modify-level-moves/${currentWiki}`,
        {
          method: "POST",
          body: JSON.stringify(pokemon_move_changes),
          headers: { "Content-Type": "application/json" },
        }
      ).then((res) => res.json());
    },
    onSuccess,
    onError,
  });
};

export const usePreparePokemonData = ({ onSuccess, onError }: any) => {
  const [currentWiki, _] = useLocalStorage("currentWiki", "none");
  return useMutation({
    mutationFn: ({
      range_end,
      range_start,
      wipe_current_data,
    }: PreparationData) => {
      return fetch(
        `${import.meta.env.VITE_BASE_URL}/pokemon/prepare-data/${currentWiki}`,
        {
          method: "POST",
          body: JSON.stringify({
            range_end,
            range_start,
            wipe_current_data,
          }),
          headers: { "Content-Type": "application/json" },
        }
      ).then((res) => res.json());
    },
    onSuccess,
    onError,
  });
};
