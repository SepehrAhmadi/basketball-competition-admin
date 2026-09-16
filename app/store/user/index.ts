import { defineStore } from "pinia";
import { useUserState } from "./state";
import { useUserActions } from "./actions";

export const useUserStore = defineStore("userStore", () => {
  const state = useUserState();
  const actions = useUserActions(state);

  return {
    ...state,
    ...actions,
  };
});
