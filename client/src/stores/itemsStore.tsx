import { create } from "zustand";

type ItemsStoreState = {
  itemsList: string[];
};

type ItemsStoreAction = {
  setItemsList: (itemsList: ItemsStoreState["itemsList"]) => void;
};

export const useItemsStore = create<ItemsStoreState & ItemsStoreAction>(
  (set) => ({
    itemsList: [],
    setItemsList: (itemsList) => set(() => ({ itemsList })),
  })
);
