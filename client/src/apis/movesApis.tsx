import { useMutation, useQuery } from "@tanstack/react-query";
import { useLocalStorage } from "usehooks-ts";

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
