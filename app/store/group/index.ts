import { defineStore } from "pinia";
import { useGroupState } from "./state";
import { useGroupActions } from "./actions";

export const useGroupStore = defineStore("groupStore", () => {
  const state = useGroupState();
  const actions = useGroupActions(state);

  return {
    ...state,
    ...actions,
  };
});
