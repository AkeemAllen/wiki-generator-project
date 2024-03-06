import { useMutation, useQuery } from "@tanstack/react-query";
import { useLocalStorage } from "usehooks-ts";
import { MoveDetails, PreparationData } from "../types";

export const useGetMoves = () => {
  const [currentWiki, _] = useLocalStorage("currentWiki", "none");
  return useQuery({
    queryKey: ["moves"],
    queryFn: () =>
      fetch(`${import.meta.env.VITE_BASE_URL}/moves/${currentWiki}`).then(
        (res) => res.json()
      ),
    refetchOnWindowFocus: false,
    enabled: false,
  });
};

export const useGetMovesByName = ({ moveName }: any) => {
  const [currentWiki, _] = useLocalStorage("currentWiki", "none");
  return useQuery({
    queryKey: ["moves", moveName],
    queryFn: async () => {
      const params = new URLSearchParams({ move_name_or_id: moveName });
      const URL = `${
        import.meta.env.VITE_BASE_URL
      }/moves/single/${currentWiki}?${params}`;

      return fetch(URL).then((res) => res.json());
    },
    refetchOnWindowFocus: false,
    enabled: false,
  });
};

type SaveMoveChangesProps = {
  moveName: string;
  moveDetails: MoveDetails;
  onSuccess: (data: any) => void;
  onError: (error: any) => void;
};

export const useSaveMoveChanges = ({
  moveName,
  moveDetails,
  onSuccess,
  onError,
}: SaveMoveChangesProps) => {
  const [currentWiki, _] = useLocalStorage("currentWiki", "none");
  return useMutation({
    mutationFn: async () => {
      const params = new URLSearchParams({ move_name: moveName });
      const URL = `${
        import.meta.env.VITE_BASE_URL
      }/moves/edit/${currentWiki}?${params}`;

      return fetch(URL, {
        method: "POST",
        body: JSON.stringify(moveDetails),
        headers: { "Content-Type": "application/json" },
      }).then((res) => res.json());
    },
    onSuccess,
    onError,
  });
};

export const usePrepareMoveData = ({ onSuccess, onError }: any) => {
  const [currentWiki, _] = useLocalStorage("currentWiki", "none");
  return useMutation({
    mutationFn: async ({
      range_end,
      range_start,
      wipe_current_data,
    }: PreparationData) => {
      return fetch(
        `${import.meta.env.VITE_BASE_URL}/moves/prepare-data/${currentWiki}`,
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
