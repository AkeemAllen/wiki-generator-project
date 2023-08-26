import { useMutation, useQuery } from "@tanstack/react-query";
import { GenerationData, Wiki } from "../types";

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

export const useGeneratePokemon = (onSuccess: (data: any) => void) => {
  return useMutation({
    mutationFn: (generateData: GenerationData) =>
      fetch(`${import.meta.env.VITE_BASE_URL}/wikis/generate/pokemon`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(generateData),
      }).then((res) => res.json()),
    onSuccess,
  });
};
export const useGenerateRoutes = (onSuccess: (data: any) => void) => {
  return useMutation({
    mutationFn: (generateData: GenerationData) =>
      fetch(`${import.meta.env.VITE_BASE_URL}/wikis/generate/routes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(generateData),
      }).then((res) => res.json()),
    onSuccess,
  });
};

export const useBackupWiki = (onSuccess: (data: any) => void) => {
  return useMutation({
    mutationFn: () =>
      fetch(`${import.meta.env.VITE_BASE_URL}/wikis/backup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      }).then((res) => res.json()),
    onSuccess,
  });
};
