import { useMutation, useQuery } from "@tanstack/react-query";
import { useLocalStorage } from "usehooks-ts";
import { MachineDetails, PreparationData } from "../types";

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

export const useGetMachines = (onSuccess: (data: any) => void) => {
  const [currentWiki, _] = useLocalStorage("currentWiki", "none");
  return useQuery({
    queryKey: ["machines"],
    queryFn: () =>
      fetch(
        `${import.meta.env.VITE_BASE_URL}/moves/${currentWiki}/machines`
      ).then((res) => res.json()),
    onSuccess,
    refetchOnWindowFocus: false,
    enabled: false,
  });
};

type SaveMachineProps = {
  moveName: string;
  machineChanges: MachineDetails[];
  onSuccess?: (data: any) => void;
  onError?: (data: any) => void;
};

export const useSaveMachineChanges = ({
  moveName,
  machineChanges,
  onError,
  onSuccess,
}: SaveMachineProps) => {
  const [currentWiki, _] = useLocalStorage("currentWiki", "none");
  return useMutation({
    mutationFn: () => {
      return fetch(
        `${
          import.meta.env.VITE_BASE_URL
        }/moves/${currentWiki}/machines/${moveName}`,
        {
          method: "POST",
          body: JSON.stringify(machineChanges),
          headers: { "Content-Type": "application/json" },
        }
      ).then((res) => res.json());
    },
    onError,
    onSuccess,
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

export const useSaveMoveChanges = ({
  moveName,
  moveChanges,
  onSuccess,
  onError,
}: any) => {
  const [currentWiki, _] = useLocalStorage("currentWiki", "none");
  return useMutation({
    mutationFn: () => {
      return fetch(
        `${
          import.meta.env.VITE_BASE_URL
        }/moves/edit/${currentWiki}/${moveName}`,
        {
          method: "POST",
          body: JSON.stringify(moveChanges),
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
