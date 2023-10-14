import { useQuery } from "@tanstack/react-query";
import { useLocalStorage } from "usehooks-ts";

export const useGetAbilities = (onSuccess: (data: any) => void) => {
  const [currentWiki, _] = useLocalStorage("currentWiki", "none");
  return useQuery({
    queryKey: ["abilities"],
    queryFn: () =>
      fetch(`${import.meta.env.VITE_BASE_URL}/abilities/${currentWiki}`).then(
        (res) => res.json()
      ),
    onSuccess,
    refetchOnWindowFocus: false,
    enabled: false,
  });
};
