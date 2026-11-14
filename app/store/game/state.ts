import { ref } from "vue";

type ListMeta = {
  total: number;
  page: number;
  pageSize: number;
};

export function useGameState() {
  const loading = ref<boolean>(false);
  const gameList = ref<any[]>([]);
  const gameListMeta = ref<ListMeta | null>(null);
  const gameSummary = ref<any>(null);
  const gameLock = ref<any>(null);
  const gameLeague = ref<any>(null);

  return {
    loading,
    gameList,
    gameListMeta,
    gameSummary,
    gameLock,
    gameLeague,
  };
}
