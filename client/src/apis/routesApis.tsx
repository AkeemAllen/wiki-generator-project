import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouteStore } from "../stores";

export const useGetRoutes = (onSuccess: (data: any) => void) => {
  return useQuery({
    queryKey: ["routes"],
    queryFn: () =>
      fetch(`${import.meta.env.VITE_BASE_URL}/game-routes`).then((res) =>
        res.json()
      ),
    onSuccess,
    refetchOnWindowFocus: false,
  });
};

export const useAddNewRoute = (onSuccess: (data: any) => void) => {
  return useMutation({
    mutationFn: (routeName: string) => {
      return fetch(`${import.meta.env.VITE_BASE_URL}/game-route`, {
        method: "POST",
        body: JSON.stringify({
          new_route_name: routeName,
        }),
        headers: { "Content-Type": "application/json" },
      }).then((res) => res.json());
    },
    onSuccess,
  });
};

export const useEditRoute = ({ routeName, body, onSuccess }: any) => {
  const routes = useRouteStore((state) => state.routes);
  return useMutation({
    mutationFn: () => {
      return fetch(
        `${import.meta.env.VITE_BASE_URL}/game-route/edit/${routeName}`,
        {
          method: "PATCH",
          body: JSON.stringify({
            ...routes[routeName],
            ...body,
            position: routes[routeName].position,
          }),
          headers: { "Content-Type": "application/json" },
        }
      ).then((res) => res.json());
    },
    onSuccess,
  });
};

export const useDeleteRoute = (onSuccess: (data: any) => void) => {
  return useMutation({
    mutationFn: (routeName: string) => {
      return fetch(
        `${import.meta.env.VITE_BASE_URL}/game-route/delete/${routeName}`,
        {
          method: "DELETE",
        }
      ).then((res) => res.json());
    },
    onSuccess,
  });
};

export const useEditRouteName = (onSuccess: (data: any) => void) => {
  return useMutation({
    mutationFn: ({ routeNameToEdit, newRouteName }: any) => {
      return fetch(
        `${import.meta.env.VITE_BASE_URL}/game-route/edit-route-name/`,
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

export const useUpdateRoutePosition = (onSuccess: (data: any) => void) => {
  const routes = useRouteStore((state) => state.routes);
  return useMutation({
    mutationFn: ({ routeNameToEdit, newPosition }: any) => {
      return fetch(
        `${import.meta.env.VITE_BASE_URL}/game-route/edit/${routeNameToEdit}`,
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
  return useMutation({
    mutationFn: ({ routeName, newRouteName }: any) => {
      return fetch(
        `${
          import.meta.env.VITE_BASE_URL
        }/game-route/duplicate/${routeName}/${newRouteName}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        }
      ).then((res) => res.json());
    },
    onSuccess,
  });
};

export const useUpdateRoutePositions = (onSuccess: (data: any) => void) => {
  return useMutation({
    mutationFn: (organizeRoutesList: string[]) => {
      return fetch(
        `${import.meta.env.VITE_BASE_URL}/game-route/edit-route-positions`,
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
