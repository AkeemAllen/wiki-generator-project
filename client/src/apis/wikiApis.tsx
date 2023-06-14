import { useMutation, useQuery } from "@tanstack/react-query";
import { Wiki } from "../types";

export const useGetWikis = (onSuccess: (data: any) => void) => {
  return useQuery({
    queryKey: ["wikis"],
    queryFn: () =>
      fetch(`${import.meta.env.VITE_BASE_URL}/wikis`).then((res) => res.json()),
    onSuccess,
    refetchOnWindowFocus: false,
  });
};

export const useCreateWiki = (onSuccess: (data: any) => void) => {
  return useMutation({
    mutationFn: (wiki: Wiki) =>
      fetch(`${import.meta.env.VITE_BASE_URL}/wikis/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(wiki),
      }).then((res) => res.json()),
    onSuccess,
  });
};
