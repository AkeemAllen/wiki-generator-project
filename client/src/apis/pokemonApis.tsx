import { useMutation, useQuery } from "@tanstack/react-query";
import { useLocalStorage } from "usehooks-ts";
import { PokemonChanges } from "../types";

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
