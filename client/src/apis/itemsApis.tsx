import { useMutation, useQuery } from "@tanstack/react-query";
import { useLocalStorage } from "usehooks-ts";
import { ItemProperties } from "../types";

export const useGetItems = () => {
  const [currentWiki, _] = useLocalStorage("currentWiki", "none");
  return useQuery({
    queryKey: ["items"],
    queryFn: () =>
      fetch(`${import.meta.env.VITE_BASE_URL}/items/${currentWiki}`).then(
        (res) => res.json()
      ),
    refetchOnWindowFocus: false,
    enabled: false,
  });
};

export const useGetItem = ({ itemName }: any) => {
  const [currentWiki, _] = useLocalStorage("currentWiki", "none");

  return useQuery({
    queryKey: ["item", itemName],
    queryFn: async () => {
      const params = new URLSearchParams({ item_name: itemName });
      const URL = `${
        import.meta.env.VITE_BASE_URL
      }/item/single/${currentWiki}?${params}`;

      return fetch(URL).then((res) => res.json());
    },
    refetchOnWindowFocus: false,
    enabled: false,
  });
};

type SaveItemChangesProps = {
  itemName: string;
  itemDetails: ItemProperties;
  onSuccess: (data: any) => void;
  onError: (error: any) => void;
};

export const useSaveItemChanges = ({
  itemName,
  itemDetails,
  onSuccess,
  onError,
}: SaveItemChangesProps) => {
  const [currentWiki, _] = useLocalStorage("currentWiki", "none");
  return useMutation({
    mutationFn: async () => {
      const params = new URLSearchParams({ item_name: itemName });
      const URL = `${
        import.meta.env.VITE_BASE_URL
      }/item/edit/${currentWiki}?${params}`;

      return fetch(URL, {
        method: "PATCH",
        body: JSON.stringify(itemDetails),
        headers: { "Content-Type": "application/json" },
      }).then((res) => res.json());
    },
    onSuccess,
    onError,
  });
};
