import { useMutation, useQuery } from "@tanstack/react-query";

export const useGetMoves = (onSuccess: (data: any) => void) => {
  return useQuery({
    queryKey: ["moves"],
    queryFn: () =>
      fetch(`${import.meta.env.VITE_BASE_URL}/moves`).then((res) => res.json()),
    onSuccess,
    refetchOnWindowFocus: false,
  });
};

export const useGetMovesByName = ({ moveName, onSuccess }: any) => {
  return useQuery({
    queryKey: ["moves", moveName],
    queryFn: () =>
      fetch(`${import.meta.env.VITE_BASE_URL}/moves/${moveName}`).then((res) =>
        res.json()
      ),
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
  return useMutation({
    mutationFn: () => {
      return fetch(`${import.meta.env.VITE_BASE_URL}/moves/edit/${moveName}`, {
        method: "POST",
        body: JSON.stringify(moveChanges),
        headers: { "Content-Type": "application/json" },
      }).then((res) => res.json());
    },
    onSuccess,
    onError,
  });
};
