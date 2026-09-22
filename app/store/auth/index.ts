import { computed } from "vue";
import { defineStore } from "pinia";
import { useAuthState } from "./state";
import { useAuthActions } from "./actions";

export const useAuthStore = defineStore("authStore", () => {
  const state = useAuthState();
  const actions = useAuthActions(state);

  return {
    ...state,
    ...actions,
  };
});