import { create } from "zustand";

type NatureStoreState = {
  naturesList: string[];
};

type NatureStoreAction = {
  setNaturesList: (naturesList: NatureStoreState["naturesList"]) => void;
};

export const useNatureStore = create<NatureStoreState & NatureStoreAction>(
  (set) => ({
    naturesList: [],
    setNaturesList: (naturesList) => set(() => ({ naturesList })),
  })
);
