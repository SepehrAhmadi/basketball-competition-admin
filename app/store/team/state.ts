import { ref } from "vue";

export function useTeamState() {
  const loading = ref<boolean>(false);

  const teamList = ref<any[]>([]);
  const teamListMeta = ref<{
    total: number;
    page: number;
    pageSize: number;
  } | null>(null);
  const teamDetail = ref<any>(null);

  const rosterLoading = ref<boolean>(false);
  const rosterList = ref<any[]>([]);
  const rosterMeta = ref<{
    total: number;
    page: number;
    pageSize: number;
  } | null>(null);

  return {
    loading,
    teamList,
    teamListMeta,
    teamDetail,
    rosterLoading,
    rosterList,
    rosterMeta,
  };
}
