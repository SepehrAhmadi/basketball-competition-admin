import { ref } from "vue";

type ListMeta = {
  total: number;
  page: number;
  pageSize: number;
};

export function useLeagueState() {
  const loading = ref<boolean>(false);

  const leagueList = ref<any[]>([]);
  const leagueListMeta = ref<ListMeta | null>(null);
  const leagueDetail = ref<any>(null);

  // League teams (registered) + eligible teams (add mode)
  const leagueTeamList = ref<any[]>([]);
  const leagueTeamMeta = ref<ListMeta | null>(null);
  const eligibleTeamList = ref<any[]>([]);
  const eligibleTeamMeta = ref<ListMeta | null>(null);
  const leagueTeamLoading = ref<boolean>(false);
  const eligibleLoading = ref<boolean>(false);
  const rosterLoading = ref<boolean>(false);

  return {
    loading,
    leagueList,
    leagueListMeta,
    leagueDetail,
    leagueTeamList,
    leagueTeamMeta,
    eligibleTeamList,
    eligibleTeamMeta,
    leagueTeamLoading,
    eligibleLoading,
    rosterLoading,
  };
}
