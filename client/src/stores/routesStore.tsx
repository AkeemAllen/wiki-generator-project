import { create } from "zustand";
import { Routes } from "../types";

type RouteStoreState = {
  routes: Routes;
};

type RouteStoreAction = {
  setRoutes: (routes: RouteStoreState["routes"]) => void;
};

export const useRouteStore = create<RouteStoreState & RouteStoreAction>(
  (set) => ({
    routes: {},
    setRoutes: (routes) => set(() => ({ routes })),
  })
);
