import { ref } from "vue";

export function useAuthState() {
  const loading = ref<boolean>(false);
  const loginResult = ref<any>(null);
  const adminUser = ref<any>(null);
  const isAuthResolved = ref<boolean>(false);

  return {
    loading,
    loginResult,
    adminUser,
    isAuthResolved,
  };
}