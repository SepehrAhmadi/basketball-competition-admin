import { defineStore } from "pinia";
import { useLeagueState } from "./state";
import { useLeagueActions } from "./actions";

export const useLeagueStore = defineStore("leagueStore", () => {
  const state = useLeagueState();
  const actions = useLeagueActions(state);

  return {
    ...state,
    ...actions,
  };
});
