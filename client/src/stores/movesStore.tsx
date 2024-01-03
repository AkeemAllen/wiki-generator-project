import { create } from "zustand";

type MovesStoreState = {
  movesList: string[];
};

type MovesStoreAction = {
  setMovesList: (movesList: MovesStoreState["movesList"]) => void;
};

export const useMovesStore = create<MovesStoreState & MovesStoreAction>(
  (set) => ({
    movesList: [],
    setMovesList: (movesList) => set(() => ({ movesList })),
  })
);
