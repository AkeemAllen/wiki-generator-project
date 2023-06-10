import { useQuery } from "@tanstack/react-query";

export const useGetItems = (onSuccess: (data: any) => void) => {
  return useQuery({
    queryKey: ["items"],
    queryFn: () =>
      fetch(`${import.meta.env.VITE_BASE_URL}/items`).then((res) => res.json()),
    onSuccess,
    refetchOnWindowFocus: false,
  });
};
