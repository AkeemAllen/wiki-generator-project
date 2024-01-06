import { useMutation, useQuery } from "@tanstack/react-query";
import { useLocalStorage } from "usehooks-ts";
import { PokemonChanges, PreparationData } from "../types";

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
    queryFn: () =>
      fetch(
        `${import.meta.env.VITE_BASE_URL}/pokemon/${currentWiki}/${pokemonName}`
      ).then((res) => res.json()),
    onSuccess,
    refetchOnWindowFocus: false,
    enabled: false,
  });
};

export const useGetPokemonById = ({ onSuccess, onError }: any) => {
  const [currentWiki, _] = useLocalStorage("currentWiki", "none");
  return useMutation({
    mutationFn: ({ pokemonId }: any) => {
      return fetch(
        `${import.meta.env.VITE_BASE_URL}/pokemon/${currentWiki}/${pokemonId}`,
        {
          method: "GET",
        }
      ).then((res) => res.json());
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
      return fetch(
        `${
          import.meta.env.VITE_BASE_URL
        }/pokemon/edit/${currentWiki}/${pokemonName}`,
        {
          method: "POST",
          body: JSON.stringify(pokemonChanges),
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
        `${import.meta.env.VITE_BASE_URL}/pokemon/${currentWiki}/prepare-data`,
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
