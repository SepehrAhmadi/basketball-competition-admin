import { defineStore } from "pinia";
import { useAgeCategoryState } from "./state";
import { useAgeCategoryActions } from "./actions";

export const useAgeCategoryStore = defineStore("ageCategoryStore", () => {
  const state = useAgeCategoryState();
  const actions = useAgeCategoryActions(state);

  return {
    ...state,
    ...actions,
  };
});
