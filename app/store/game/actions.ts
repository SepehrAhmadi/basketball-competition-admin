import { useApi } from "~/composables/useApi";
import type { useGameState } from "./state";
import { useHandlerStore } from "../handler";

type StateType = ReturnType<typeof useGameState>;

export function useGameActions(state: StateType) {
  const handlerStore = useHandlerStore();
  const errorMessage = (err: any): string =>
    err.response?.data?.message || "خطای سرور";

  let latestGamesRequest = 0;
  let latestPairRequest = 0;
  let activeLeagueId: number | string | null = null;

  const getGames = (leagueId: number | string, params: any) => {
    const axios = useApi();
    activeLeagueId = leagueId;
    const requestId = ++latestGamesRequest;
    state.loading.value = true;

    return axios
      .get(`/admin/leagues/${leagueId}/games`, { params })
      .then((res) => {
        if (requestId !== latestGamesRequest) return true;
        const data = res.data.data;
        state.gameList.value = data.items ?? [];
        state.gameListMeta.value = {
          total: data.total,
          page: data.page,
          pageSize: data.pageSize,
        };
        state.gameSummary.value = data.summary ?? null;
        state.gameLock.value = data.lock ?? null;
        state.gameLeague.value = data.league ?? null;
        return true;
      })
      .catch((err) => {
        console.log(err);
        if (requestId !== latestGamesRequest) return false;
        handlerStore.setError(errorMessage(err));
        return false;
      })
      .finally(() => {
        if (requestId === latestGamesRequest) state.loading.value = false;
      });
  };

  const fetchPairGames = (
    leagueId: number | string,
    params: any,
  ): Promise<any[]> => {
    const axios = useApi();
    const requestId = ++latestPairRequest;
    const requestedLeagueId = leagueId;

    return axios
      .get(`/admin/leagues/${leagueId}/games`, { params })
      .then((res) =>
        requestId === latestPairRequest && activeLeagueId === requestedLeagueId
          ? (res.data.data.items ?? [])
          : [],
      )
      .catch(() => []);
  };

  const createGame = (leagueId: number | string, value: any) => {
    const axios = useApi();
    handlerStore.loadingBtn = true;

    return axios
      .post(`/admin/leagues/${leagueId}/games`, value)
      .then((res) => {
        handlerStore.setSuccess(res.data.message);
        return res.data.data ?? {};
      })
      .catch((err) => {
        console.log(err);
        handlerStore.setError(errorMessage(err));
        return null;
      })
      .finally(() => {
        handlerStore.loadingBtn = false;
      });
  };

  const mutate = (
    method: "put" | "patch" | "delete",
    url: string,
    body?: any,
  ) => {
    const axios = useApi();
    handlerStore.loadingBtn = true;

    return axios
      .request({ method, url, ...(body !== undefined ? { data: body } : {}) })
      .then((res) => {
        handlerStore.setSuccess(res.data.message);
        return true;
      })
      .catch((err) => {
        console.log(err);
        handlerStore.setError(errorMessage(err));
        return false;
      })
      .finally(() => {
        handlerStore.loadingBtn = false;
      });
  };

  const base = (leagueId: number | string) =>
    `/admin/leagues/${leagueId}/games`;

  const updateGameSchedule = (
    leagueId: number | string,
    gameId: number,
    body: any,
  ) => mutate("put", `${base(leagueId)}/${gameId}`, body);

  const updateGameStatus = (
    leagueId: number | string,
    gameId: number,
    body: any,
  ) => mutate("patch", `${base(leagueId)}/${gameId}/status`, body);

  const enterGameResult = (
    leagueId: number | string,
    gameId: number,
    body: any,
  ) => mutate("put", `${base(leagueId)}/${gameId}/result`, body);

  const clearGameResult = (leagueId: number | string, gameId: number) =>
    mutate("delete", `${base(leagueId)}/${gameId}/result`);

  const deleteGame = (leagueId: number | string, gameId: number) =>
    mutate("delete", `${base(leagueId)}/${gameId}`);

  const resetGames = () => {
    latestGamesRequest += 1;
    latestPairRequest += 1;
    activeLeagueId = null;
    state.loading.value = false;
    state.gameList.value = [];
    state.gameListMeta.value = null;
    state.gameSummary.value = null;
    state.gameLock.value = null;
    state.gameLeague.value = null;
  };

  return {
    getGames,
    fetchPairGames,
    createGame,
    updateGameSchedule,
    updateGameStatus,
    enterGameResult,
    clearGameResult,
    deleteGame,
    resetGames,
  };
}
