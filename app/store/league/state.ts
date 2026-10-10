import { ref } from "vue";

export function useLeagueState() {
  const loading = ref<boolean>(false);

  const leagueList = ref<any[]>([]);
  const leagueListMeta = ref<{
    total: number;
    page: number;
    pageSize: number;
  } | null>(null);
  const leagueDetail = ref<any>(null);

  return {
    loading,
    leagueList,
    leagueListMeta,
    leagueDetail,
  };
}
