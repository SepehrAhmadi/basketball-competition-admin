import { ref } from "vue";

export function useUserState() {
  const loading = ref<boolean>(false);

  const userList = ref<any[]>([]);
  const userListMeta = ref<{
    total: number;
    page: number;
    pageSize: number;
  } | null>(null);
  const userDetail = ref<any>(null);
  // Logged-in admin profile (GET /users/me) — display only,
  // session claims come from the JWT in the auth store.
  const currentUser = ref<any>(null);

  return {
    loading,
    userList,
    userListMeta,
    userDetail,
    currentUser,
  };
}
