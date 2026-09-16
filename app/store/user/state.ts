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

  return {
    loading,
    userList,
    userListMeta,
    userDetail,
  };
}
