import { useApi } from "~/composables/useApi";
import type { useLeagueState } from "./state";
import { useHandlerStore } from "../handler";

type StateType = ReturnType<typeof useLeagueState>;

export function useLeagueActions(state: StateType) {
  const handlerStore = useHandlerStore();

  // GET /admin/leagues — verifyPermission("leagues.view")
  const getLeagues = (params: any) => {
    const axios = useApi();
    state.loading.value = true;

    return axios
      .get("/admin/leagues", { params })
      .then((res) => {
        state.leagueList.value = res.data.data.items ?? res.data.data;
        state.leagueListMeta.value = res.data.data.meta ?? {
          total: res.data.data.total,
          page: res.data.data.page,
          pageSize: res.data.data.pageSize,
        };
      })
      .catch((err) => {
        console.log(err);
        const message = err.response?.data?.message || "خطای سرور";
        handlerStore.setError(message);
      })
      .finally(() => {
        state.loading.value = false;
      });
  };

  // GET /admin/leagues/:leagueId — verifyPermission("leagues.view")
  const getLeagueById = (id: number | string) => {
    const axios = useApi();
    state.loading.value = true;

    return axios
      .get(`/admin/leagues/${id}`)
      .then((res) => {
        state.leagueDetail.value = res.data.data;
      })
      .catch((err) => {
        console.log(err);
        const message = err.response?.data?.message || "خطای سرور";
        handlerStore.setError(message);
      })
      .finally(() => {
        state.loading.value = false;
      });
  };

  // POST /admin/leagues — verifyPermission("leagues.create")
  const createLeague = (value: any) => {
    const axios = useApi();
    handlerStore.loadingBtn = true;

    return axios
      .post("/admin/leagues", value)
      .then((res) => {
        handlerStore.setSuccess(res.data.message);
      })
      .catch((err) => {
        console.log(err);
        const message = err.response?.data?.message || "خطای سرور";
        handlerStore.setError(message);
      })
      .finally(() => {
        handlerStore.loadingBtn = false;
      });
  };

  // PUT /admin/leagues/:leagueId — verifyPermission("leagues.update")
  const updateLeague = (id: number | string, value: any) => {
    const axios = useApi();
    handlerStore.loadingBtn = true;

    return axios
      .put(`/admin/leagues/${id}`, value)
      .then((res) => {
        handlerStore.setSuccess(res.data.message);
      })
      .catch((err) => {
        console.log(err);
        const message = err.response?.data?.message || "خطای سرور";
        handlerStore.setError(message);
      })
      .finally(() => {
        handlerStore.loadingBtn = false;
      });
  };

  // PATCH /admin/leagues/:leagueId/status — verifyPermission("leagues.update")
  const updateLeagueStatus = (id: number | string, status: string) => {
    const axios = useApi();
    handlerStore.loadingBtn = true;

    return axios
      .patch(`/admin/leagues/${id}/status`, { status })
      .then((res) => {
        handlerStore.setSuccess(res.data.message);
      })
      .catch((err) => {
        console.log(err);
        const message = err.response?.data?.message || "خطای سرور";
        handlerStore.setError(message);
      })
      .finally(() => {
        handlerStore.loadingBtn = false;
      });
  };

  // DELETE /admin/leagues/:leagueId — verifyPermission("leagues.delete")
  const deleteLeague = (id: number | string) => {
    const axios = useApi();
    handlerStore.loadingBtn = true;

    return axios
      .delete(`/admin/leagues/${id}`)
      .then((res) => {
        handlerStore.setSuccess(res.data.message);
      })
      .catch((err) => {
        console.log(err);
        const message = err.response?.data?.message || "خطای سرور";
        handlerStore.setError(message);
      })
      .finally(() => {
        handlerStore.loadingBtn = false;
      });
  };

  const errorMessage = (err: any): string =>
    err.response?.data?.message || "خطای سرور";

  // ─── League teams ───────────────────────────────────────────
  // Mutations resolve to `true` on success and `false` on failure, so
  // callers update the UI only when the request actually succeeded.

  // GET /admin/leagues/:leagueId/teams — verifyPermission("league-teams.view")
  const getLeagueTeams = (leagueId: number | string, params: any) => {
    const axios = useApi();
    state.leagueTeamLoading.value = true;

    return axios
      .get(`/admin/leagues/${leagueId}/teams`, { params })
      .then((res) => {
        const data = res.data.data;
        state.leagueTeamList.value = data.items ?? data;
        state.leagueTeamMeta.value = data.meta ?? {
          total: data.total,
          page: data.page,
          pageSize: data.pageSize,
        };
      })
      .catch((err) => {
        console.log(err);
        handlerStore.setError(errorMessage(err));
      })
      .finally(() => {
        state.leagueTeamLoading.value = false;
      });
  };

  // GET /admin/leagues/:leagueId/eligible-teams — verifyPermission("league-teams.create")
  const getEligibleTeams = (leagueId: number | string, params: any) => {
    const axios = useApi();
    state.eligibleLoading.value = true;

    return axios
      .get(`/admin/leagues/${leagueId}/eligible-teams`, { params })
      .then((res) => {
        const data = res.data.data;
        state.eligibleTeamList.value = data.items ?? data;
        state.eligibleTeamMeta.value = data.meta ?? {
          total: data.total,
          page: data.page,
          pageSize: data.pageSize,
        };
      })
      .catch((err) => {
        console.log(err);
        handlerStore.setError(errorMessage(err));
      })
      .finally(() => {
        state.eligibleLoading.value = false;
      });
  };

  // POST /admin/leagues/:leagueId/teams — verifyPermission("league-teams.create")
  const addTeamToLeague = (leagueId: number | string, teamId: number) => {
    const axios = useApi();
    handlerStore.loadingBtn = true;

    return axios
      .post(`/admin/leagues/${leagueId}/teams`, { teamId })
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

  // DELETE /admin/leagues/:leagueId/teams/:leagueTeamId — verifyPermission("league-teams.delete")
  const removeTeamFromLeague = (
    leagueId: number | string,
    leagueTeamId: number,
  ) => {
    const axios = useApi();
    handlerStore.loadingBtn = true;

    return axios
      .delete(`/admin/leagues/${leagueId}/teams/${leagueTeamId}`)
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

  // ─── League roster ──────────────────────────────────────────

  // GET .../teams/:leagueTeamId/members/candidates — verifyPermission("league-roster.view")
  const getRosterCandidates = (
    leagueId: number | string,
    leagueTeamId: number,
  ): Promise<any[]> => {
    const axios = useApi();

    return axios
      .get(
        `/admin/leagues/${leagueId}/teams/${leagueTeamId}/members/candidates`,
        { params: { page: 1, pageSize: 100 } },
      )
      .then((res) => res.data.data.items ?? res.data.data)
      .catch((err) => {
        console.log(err);
        handlerStore.setError(errorMessage(err));
        throw err;
      });
  };

  // GET .../teams/:leagueTeamId/members — verifyPermission("league-roster.view")
  const getLeagueMembers = (
    leagueId: number | string,
    leagueTeamId: number,
  ): Promise<any[]> => {
    const axios = useApi();

    return axios
      .get(`/admin/leagues/${leagueId}/teams/${leagueTeamId}/members`, {
        params: { page: 1, pageSize: 100 },
      })
      .then((res) => res.data.data.items ?? res.data.data)
      .catch((err) => {
        console.log(err);
        handlerStore.setError(errorMessage(err));
        throw err;
      });
  };

  // POST .../teams/:leagueTeamId/members — verifyPermission("league-roster.create")
  const addRosterMembers = (
    leagueId: number | string,
    leagueTeamId: number,
    teamSeasonMemberIds: number[],
  ) => {
    const axios = useApi();

    return axios
      .post(`/admin/leagues/${leagueId}/teams/${leagueTeamId}/members`, {
        teamSeasonMemberIds,
      })
      .then((res) => {
        handlerStore.setSuccess(res.data.message);
        return true;
      })
      .catch((err) => {
        console.log(err);
        handlerStore.setError(errorMessage(err));
        return false;
      });
  };

  // DELETE .../teams/:leagueTeamId/members/:memberId — verifyPermission("league-roster.delete")
  const removeRosterMember = (
    leagueId: number | string,
    leagueTeamId: number,
    memberId: number,
  ) => {
    const axios = useApi();

    return axios
      .delete(
        `/admin/leagues/${leagueId}/teams/${leagueTeamId}/members/${memberId}`,
      )
      .then((res) => {
        handlerStore.setSuccess(res.data.message);
        return true;
      })
      .catch((err) => {
        console.log(err);
        handlerStore.setError(errorMessage(err));
        return false;
      });
  };

  return {
    getLeagueTeams,
    getEligibleTeams,
    addTeamToLeague,
    removeTeamFromLeague,
    getRosterCandidates,
    getLeagueMembers,
    addRosterMembers,
    removeRosterMember,
    getLeagues,
    getLeagueById,
    createLeague,
    updateLeague,
    updateLeagueStatus,
    deleteLeague,
  };
}
