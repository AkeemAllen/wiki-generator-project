import { useMutation, useQuery } from "@tanstack/react-query";
import { useLocalStorage } from "usehooks-ts";
import { NatureProperties } from "../types";

export const useGetNatures = () => {
  const [currentWiki, _] = useLocalStorage("currentWiki", "none");
  return useQuery({
    queryKey: ["natures"],
    queryFn: () =>
      fetch(`${import.meta.env.VITE_BASE_URL}/natures/${currentWiki}`).then(
        (res) => res.json()
      ),
    refetchOnWindowFocus: false,
    enabled: false,
  });
};

export const useGetNature = ({ natureName }: any) => {
  const [currentWiki, _] = useLocalStorage("currentWiki", "none");

  return useQuery({
    queryKey: ["nature", natureName],
    queryFn: async () => {
      const params = new URLSearchParams({ nature_name: natureName });
      const URL = `${
        import.meta.env.VITE_BASE_URL
      }/nature/single/${currentWiki}?${params}`;

      return fetch(URL).then((res) => res.json());
    },
    refetchOnWindowFocus: false,
    enabled: false,
  });
};

type SaveNatureChangesProps = {
  natureName: string;
  natureDetails: NatureProperties;
  onSuccess: (data: any) => void;
  onError: (error: any) => void;
};

export const useSaveNatureChanges = ({
  natureName,
  natureDetails,
  onSuccess,
  onError,
}: SaveNatureChangesProps) => {
  const [currentWiki, _] = useLocalStorage("currentWiki", "none");
  return useMutation({
    mutationFn: async () => {
      const params = new URLSearchParams({ nature_name: natureName });
      const URL = `${
        import.meta.env.VITE_BASE_URL
      }/nature/edit/${currentWiki}?${params}`;

      if (natureDetails.increased_stat === "None") {
        natureDetails.increased_stat = null;
      }

      if (natureDetails.decreased_stat === "None") {
        natureDetails.decreased_stat = null;
      }

      return fetch(URL, {
        method: "PATCH",
        body: JSON.stringify(natureDetails),
        headers: { "Content-Type": "application/json" },
      }).then((res) => res.json());
    },
    onSuccess,
    onError,
  });
};
