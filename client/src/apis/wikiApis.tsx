import { useMutation, useQuery } from "@tanstack/react-query";
import { DeploymentData, GenerationData, Wiki, WikiSettings } from "../types";

export const useGetWikis = (onSuccess: (data: any) => void) => {
  return useQuery({
    queryKey: ["wikis"],
    queryFn: () =>
      fetch(`${import.meta.env.VITE_BASE_URL}/wikis`).then((res) => res.json()),
    onSuccess,
    refetchOnWindowFocus: false,
  });
};

type SettingsData = {
  wikiName: string;
  settings: WikiSettings;
};

export const useEditWikiSettings = (onSuccess: (data: any) => void) => {
  return useMutation({
    mutationFn: ({ wikiName, settings }: SettingsData) => {
      const params = new URLSearchParams({ wiki_name: wikiName });
      const URL = `${import.meta.env.VITE_BASE_URL}/wikis/settings?${params}`;

      return fetch(URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(settings),
      }).then((res) => res.json());
    },
    onSuccess,
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

export const useDeleteWiki = (onSuccess: (data: any) => void) => {
  return useMutation({
    mutationFn: (wikiName: string) => {
      const params = new URLSearchParams({ wiki_name: wikiName });
      const URL = `${import.meta.env.VITE_BASE_URL}/wikis/delete?${params}`;

      return fetch(URL, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      }).then((res) => res.json());
    },
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

export const useDeployWiki = (onSuccess: (data: any) => void) => {
  return useMutation({
    mutationFn: (deploymentData: DeploymentData) =>
      fetch(`${import.meta.env.VITE_BASE_URL}/wikis/deploy`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(deploymentData),
      }).then((res) => res.json()),
    onSuccess,
  });
};
