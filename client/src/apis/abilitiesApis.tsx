import { useQuery } from "@tanstack/react-query";

export const useGetAbilities = (onSuccess: (data: any) => void) => {
  return useQuery({
    queryKey: ["abilities"],
    queryFn: () =>
      fetch(`${import.meta.env.VITE_BASE_URL}/abilities`).then((res) =>
        res.json()
      ),
    onSuccess,
    refetchOnWindowFocus: false,
  });
};
