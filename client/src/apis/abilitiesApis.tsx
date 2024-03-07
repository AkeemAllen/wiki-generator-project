import { useMutation, useQuery } from "@tanstack/react-query";
import { useLocalStorage } from "usehooks-ts";
import { AbilityProperties } from "../types";

export const useGetAbilities = () => {
  const [currentWiki, _] = useLocalStorage("currentWiki", "none");
  return useQuery({
    queryKey: ["abilities"],
    queryFn: () =>
      fetch(`${import.meta.env.VITE_BASE_URL}/abilities/${currentWiki}`).then(
        (res) => res.json()
      ),
    refetchOnWindowFocus: false,
    enabled: false,
  });
};

export const useGetAbility = ({ abilityName }: any) => {
  const [currentWiki, _] = useLocalStorage("currentWiki", "none");

  return useQuery({
    queryKey: ["ability", abilityName],
    queryFn: async () => {
      const params = new URLSearchParams({ ability_name: abilityName });
      const URL = `${
        import.meta.env.VITE_BASE_URL
      }/ability/single/${currentWiki}?${params}`;

      return fetch(URL).then((res) => res.json());
    },
    refetchOnWindowFocus: false,
    enabled: false,
  });
};

type SaveAbilityChangesProps = {
  abilityName: string;
  abilityDetails: AbilityProperties;
  onSuccess: (data: any) => void;
  onError: (error: any) => void;
};

export const useSaveAbilityChanges = ({
  abilityName,
  abilityDetails,
  onSuccess,
  onError,
}: SaveAbilityChangesProps) => {
  const [currentWiki, _] = useLocalStorage("currentWiki", "none");
  return useMutation({
    mutationFn: async () => {
      const params = new URLSearchParams({ ability_name: abilityName });
      const URL = `${
        import.meta.env.VITE_BASE_URL
      }/ability/edit/${currentWiki}?${params}`;

      return fetch(URL, {
        method: "PATCH",
        body: JSON.stringify(abilityDetails),
        headers: { "Content-Type": "application/json" },
      }).then((res) => res.json());
    },
    onSuccess,
    onError,
  });
};
