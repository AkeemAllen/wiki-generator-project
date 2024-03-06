import { useQuery } from "@tanstack/react-query";
import { useLocalStorage } from "usehooks-ts";

export const useGetItems = () => {
  const [currentWiki, _] = useLocalStorage("currentWiki", "none");
  return useQuery({
    queryKey: ["items"],
    queryFn: () =>
      fetch(`${import.meta.env.VITE_BASE_URL}/items/${currentWiki}`).then(
        (res) => res.json(),
      ),
    refetchOnWindowFocus: false,
    enabled: false,
  });
};
