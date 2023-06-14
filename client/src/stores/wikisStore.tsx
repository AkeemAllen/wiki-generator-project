import { create } from "zustand";
import { Wikis } from "../types";

type WikiStoreState = {
  wikis: Wikis;
  currentWiki: string;
};

type WikiStoreAction = {
  setWikis: (wikis: WikiStoreState["wikis"]) => void;
  setCurrentWiki: (wiki: WikiStoreState["currentWiki"]) => void;
};

export const useWikiStore = create<WikiStoreState & WikiStoreAction>((set) => ({
  wikis: {},
  currentWiki: "none",
  setWikis: (wikis) => set(() => ({ wikis })),
  setCurrentWiki: (currentWiki) => set(() => ({ currentWiki })),
}));
