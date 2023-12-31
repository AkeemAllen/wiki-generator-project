import { useMutation, useQuery } from "@tanstack/react-query";
import { useLocalStorage } from "usehooks-ts";
import { MoveDetails, PreparationData } from "../types";

export const useGetMoves = (onSuccess: (data: any) => void) => {
  const [currentWiki, _] = useLocalStorage("currentWiki", "none");
  return useQuery({
    queryKey: ["moves"],
    queryFn: () =>
      fetch(`${import.meta.env.VITE_BASE_URL}/moves/${currentWiki}`).then(
        (res) => res.json()
      ),
    onSuccess,
    refetchOnWindowFocus: false,
    enabled: false,
  });
};

export const useGetMovesByName = ({ moveName, onSuccess }: any) => {
  const [currentWiki, _] = useLocalStorage("currentWiki", "none");
  return useQuery({
    queryKey: ["moves", moveName],
    queryFn: () =>
      fetch(
        `${import.meta.env.VITE_BASE_URL}/moves/${currentWiki}/${moveName}`
      ).then((res) => res.json()),
    onSuccess,
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
    mutationFn: () => {
      return fetch(
        `${
          import.meta.env.VITE_BASE_URL
        }/moves/edit/${currentWiki}/${moveName}`,
        {
          method: "POST",
          body: JSON.stringify(moveDetails),
          headers: { "Content-Type": "application/json" },
        }
      ).then((res) => res.json());
    },
    onSuccess,
    onError,
  });
};

export const usePrepareMoveData = ({ onSuccess, onError }: any) => {
  const [currentWiki, _] = useLocalStorage("currentWiki", "none");
  return useMutation({
    mutationFn: ({
      range_end,
      range_start,
      wipe_current_data,
    }: PreparationData) => {
      return fetch(
        `${import.meta.env.VITE_BASE_URL}/moves/${currentWiki}/prepare-data`,
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
