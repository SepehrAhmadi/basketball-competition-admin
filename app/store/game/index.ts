import { defineStore } from "pinia";
import { useGameState } from "./state";
import { useGameActions } from "./actions";

export const useGameStore = defineStore("gameStore", () => {
  const state = useGameState();
  const actions = useGameActions(state);

  return {
    ...state,
    ...actions,
  };
});
