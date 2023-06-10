import { useQuery } from "@tanstack/react-query";

export const useGetNatures = (onSuccess: (data: any) => void) => {
  return useQuery({
    queryKey: ["natures"],
    queryFn: () =>
      fetch(`${import.meta.env.VITE_BASE_URL}/natures`).then((res) =>
        res.json()
      ),
    onSuccess,
    refetchOnWindowFocus: false,
  });
};
