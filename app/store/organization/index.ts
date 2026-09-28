import { defineStore } from "pinia";
import { useOrganizationState } from "./state";
import { useOrganizationActions } from "./actions";

export const useOrganizationStore = defineStore("organizationStore", () => {
  const state = useOrganizationState();
  const actions = useOrganizationActions(state);

  return {
    ...state,
    ...actions,
  };
});
