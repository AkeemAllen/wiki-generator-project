import { create } from "zustand";

type MovesStoreState = {
  movesList: string[];
  machineMovesList: string[];
};

type MovesStoreAction = {
  setMovesList: (movesList: MovesStoreState["movesList"]) => void;
  setMachineMovesList: (
    machineMovesList: MovesStoreState["machineMovesList"]
  ) => void;
};

export const useMovesStore = create<MovesStoreState & MovesStoreAction>(
  (set) => ({
    movesList: [],
    machineMovesList: [],
    setMovesList: (movesList) => set(() => ({ movesList })),
    setMachineMovesList: (machineMovesList) =>
      set(() => ({ machineMovesList })),
  })
);
