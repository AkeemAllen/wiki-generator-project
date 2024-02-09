import { useMutation, useQuery } from "@tanstack/react-query";
import { useLocalStorage } from "usehooks-ts";
import { useRouteStore } from "../stores";

export const useGetRoutes = (onSuccess: (data: any) => void) => {
  const [currentWiki, _] = useLocalStorage("currentWiki", "none");
  return useQuery({
    queryKey: ["routes"],
    queryFn: () =>
      fetch(`${import.meta.env.VITE_BASE_URL}/game-routes/${currentWiki}`).then(
        (res) => res.json()
      ),
    onSuccess,
    refetchOnWindowFocus: false,
    enabled: false,
  });
};

export const useAddNewRoute = (onSuccess: (data: any) => void) => {
  const [currentWiki, _] = useLocalStorage("currentWiki", "none");
  return useMutation({
    mutationFn: (routeName: string) => {
      return fetch(
        `${import.meta.env.VITE_BASE_URL}/game-route/create/${currentWiki}`,
        {
          method: "POST",
          body: JSON.stringify({
            new_route_name: routeName,
          }),
          headers: { "Content-Type": "application/json" },
        }
      ).then((res) => res.json());
    },
    onSuccess,
  });
};

export const useEditRoute = ({ routeName, body, onSuccess }: any) => {
  const routes = useRouteStore((state) => state.routes);
  const [currentWiki, _] = useLocalStorage("currentWiki", "none");
  return useMutation({
    mutationFn: () => {
      const params = new URLSearchParams({ route_name: routeName });
      const URL = `${
        import.meta.env.VITE_BASE_URL
      }/game-route/edit/${currentWiki}?${params}`;

      return fetch(URL, {
        method: "POST",
        body: JSON.stringify({
          ...routes[routeName],
          ...body,
          position: routes[routeName].position,
        }),
        headers: { "Content-Type": "application/json" },
      }).then((res) => res.json());
    },
    onSuccess,
  });
};

export const useEditRouteName = (onSuccess: (data: any) => void) => {
  const [currentWiki, _] = useLocalStorage("currentWiki", "none");
  return useMutation({
    mutationFn: ({ routeNameToEdit, newRouteName }: any) => {
      return fetch(
        `${
          import.meta.env.VITE_BASE_URL
        }/game-route/edit-route-name/${currentWiki}`,
        {
          method: "POST",
          body: JSON.stringify({
            new_route_name: newRouteName,
            current_route_name: routeNameToEdit,
          }),
          headers: { "Content-Type": "application/json" },
        }
      ).then((res) => res.json());
    },
    onSuccess,
  });
};

export const useDeleteRoute = (onSuccess: (data: any) => void) => {
  const [currentWiki, _] = useLocalStorage("currentWiki", "none");
  return useMutation({
    mutationFn: (routeName: string) => {
      const params = new URLSearchParams({ route_name: routeName });
      const URL = `${
        import.meta.env.VITE_BASE_URL
      }/game-route/delete/${currentWiki}?${params}`;

      return fetch(URL, {
        method: "DELETE",
      }).then((res) => res.json());
    },
    onSuccess,
  });
};

export const useUpdateRoutePosition = (onSuccess: (data: any) => void) => {
  const routes = useRouteStore((state) => state.routes);
  const [currentWiki, _] = useLocalStorage("currentWiki", "none");
  return useMutation({
    mutationFn: ({ routeNameToEdit, newPosition }: any) => {
      return fetch(
        `${
          import.meta.env.VITE_BASE_URL
        }/game-route/${currentWiki}/edit/${routeNameToEdit}`,
        {
          method: "PATCH",
          body: JSON.stringify({
            ...routes[routeNameToEdit],
            position: newPosition,
          }),
          headers: { "Content-Type": "application/json" },
        }
      ).then((res) => res.json());
    },
    onSuccess,
  });
};

export const useDuplicateRoute = (onSuccess: (data: any) => void) => {
  const [currentWiki, _] = useLocalStorage("currentWiki", "none");
  return useMutation({
    mutationFn: ({ routeName, newRouteName }: any) => {
      return fetch(
        `${import.meta.env.VITE_BASE_URL}/game-route/duplicate/${currentWiki}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            current_route_name: routeName,
            duplicated_route_name: newRouteName,
          }),
        }
      ).then((res) => res.json());
    },
    onSuccess,
  });
};

export const useUpdateRoutePositions = (onSuccess: (data: any) => void) => {
  const [currentWiki, _] = useLocalStorage("currentWiki", "none");
  return useMutation({
    mutationFn: (organizeRoutesList: string[]) => {
      return fetch(
        `${
          import.meta.env.VITE_BASE_URL
        }/game-route/edit-route-positions/${currentWiki}`,
        {
          method: "PATCH",
          body: JSON.stringify(organizeRoutesList),
          headers: { "Content-Type": "application/json" },
        }
      ).then((res) => res.json());
    },
    onSuccess,
  });
};
