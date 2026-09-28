import { defineStore } from "pinia";
import { useTeamState } from "./state";
import { useTeamActions } from "./actions";

export const useTeamStore = defineStore("teamStore", () => {
  const state = useTeamState();
  const actions = useTeamActions(state);

  return {
    ...state,
    ...actions,
  };
});
