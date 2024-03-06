import { useQuery } from "@tanstack/react-query";
import { useLocalStorage } from "usehooks-ts";

export const useGetNatures = () => {
  const [currentWiki, _] = useLocalStorage("currentWiki", "none");
  return useQuery({
    queryKey: ["natures"],
    queryFn: () =>
      fetch(`${import.meta.env.VITE_BASE_URL}/natures/${currentWiki}`).then(
        (res) => res.json(),
      ),
    refetchOnWindowFocus: false,
    enabled: false,
  });
};
