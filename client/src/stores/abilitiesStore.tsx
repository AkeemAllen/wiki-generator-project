import { create } from "zustand";

type AbilityStoreState = {
  abilityList: string[];
};

type AbilityStoreAction = {
  setAbilityList: (abilityList: AbilityStoreState["abilityList"]) => void;
};

export const useAbilityStore = create<AbilityStoreState & AbilityStoreAction>(
  (set) => ({
    abilityList: [],
    setAbilityList: (abilityList) => set(() => ({ abilityList })),
  })
);
