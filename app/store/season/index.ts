import { defineStore } from "pinia";
import { useSeasonState } from "./state";
import { useSeasonActions } from "./actions";

export const useSeasonStore = defineStore("seasonStore", () => {
  const state = useSeasonState();
  const actions = useSeasonActions(state);

  return {
    ...state,
    ...actions,
  };
});
