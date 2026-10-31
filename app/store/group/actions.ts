import { useApi } from "~/composables/useApi";
import type { useGroupState } from "./state";
import { useHandlerStore } from "../handler";

type StateType = ReturnType<typeof useGroupState>;

export function useGroupActions(state: StateType) {
  const handlerStore = useHandlerStore();

  const errorMessage = (err: any): string =>
    err.response?.data?.message || "خطای سرور";

  // Stale-response guards: only the latest request may write to the state.
  let latestGroupsRequest = 0;
  let latestUnassignedRequest = 0;

  // GET /admin/leagues/:leagueId/groups — verifyPermission("groups.view")
  // Resolves to `true` on success and `false` on failure.
  const getGroups = (leagueId: number | string) => {
    const axios = useApi();
    const requestId = ++latestGroupsRequest;
    state.loading.value = true;

    return axios
      .get(`/admin/leagues/${leagueId}/groups`)
      .then((res) => {
        if (requestId !== latestGroupsRequest) return true;
        const data = res.data.data;
        state.groupLeague.value = data.league ?? null;
        state.groupLock.value = data.lock ?? null;
        state.groupList.value = data.groups ?? [];
        state.groupIssues.value = data.issues ?? [];
        state.unassignedCount.value = data.unassignedCount ?? 0;
        return true;
      })
      .catch((err) => {
        console.log(err);
        if (requestId !== latestGroupsRequest) return false;
        handlerStore.setError(errorMessage(err));
        return false;
      })
      .finally(() => {
        if (requestId === latestGroupsRequest) state.loading.value = false;
      });
  };

  // GET /admin/leagues/:leagueId/groups/unassigned-teams — verifyPermission("groups.view")
  // Resolves to `true` on success and `false` on failure.
  const getUnassignedTeams = (leagueId: number | string, params: any) => {
    const axios = useApi();
    const requestId = ++latestUnassignedRequest;
    state.unassignedLoading.value = true;

    return axios
      .get(`/admin/leagues/${leagueId}/groups/unassigned-teams`, { params })
      .then((res) => {
        if (requestId !== latestUnassignedRequest) return true;
        const data = res.data.data;
        state.unassignedList.value = data.items ?? data;
        state.unassignedMeta.value = data.meta ?? {
          total: data.total,
          page: data.page,
          pageSize: data.pageSize,
        };
        return true;
      })
      .catch((err) => {
        console.log(err);
        if (requestId !== latestUnassignedRequest) return false;
        handlerStore.setError(errorMessage(err));
        return false;
      })
      .finally(() => {
        if (requestId === latestUnassignedRequest)
          state.unassignedLoading.value = false;
      });
  };

  // POST /admin/leagues/:leagueId/groups — verifyPermission("groups.create")
  const createGroup = (leagueId: number | string, value: any) => {
    const axios = useApi();
    handlerStore.loadingBtn = true;

    return axios
      .post(`/admin/leagues/${leagueId}/groups`, value)
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

  // PUT /admin/leagues/:leagueId/groups/:groupId — verifyPermission("groups.update")
  const updateGroup = (
    leagueId: number | string,
    groupId: number,
    value: any,
  ) => {
    const axios = useApi();
    handlerStore.loadingBtn = true;

    return axios
      .put(`/admin/leagues/${leagueId}/groups/${groupId}`, value)
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

  // DELETE /admin/leagues/:leagueId/groups/:groupId — verifyPermission("groups.delete")
  // Resolves to the response data, or `null` on failure.
  const deleteGroup = (leagueId: number | string, groupId: number) => {
    const axios = useApi();
    handlerStore.loadingBtn = true;

    return axios
      .delete(`/admin/leagues/${leagueId}/groups/${groupId}`)
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

  // PUT /admin/leagues/:leagueId/groups/:groupId/teams/:leagueTeamId — verifyPermission("groups.update")
  // Assigns or moves a team. Resolves to the response data, or `null` on
  // failure. No success toast: the UI change is the feedback.
  const assignTeam = (
    leagueId: number | string,
    groupId: number,
    leagueTeamId: number,
  ) => {
    const axios = useApi();

    return axios
      .put(`/admin/leagues/${leagueId}/groups/${groupId}/teams/${leagueTeamId}`)
      .then((res) => res.data.data ?? {})
      .catch((err) => {
        console.log(err);
        handlerStore.setError(errorMessage(err));
        return null;
      });
  };

  // DELETE /admin/leagues/:leagueId/groups/:groupId/teams/:leagueTeamId — verifyPermission("groups.update")
  // Resolves to the response data, or `null` on failure. No success toast.
  const unassignTeam = (
    leagueId: number | string,
    groupId: number,
    leagueTeamId: number,
  ) => {
    const axios = useApi();

    return axios
      .delete(
        `/admin/leagues/${leagueId}/groups/${groupId}/teams/${leagueTeamId}`,
      )
      .then((res) => res.data.data ?? {})
      .catch((err) => {
        console.log(err);
        handlerStore.setError(errorMessage(err));
        return null;
      });
  };

  return {
    getGroups,
    getUnassignedTeams,
    createGroup,
    updateGroup,
    deleteGroup,
    assignTeam,
    unassignTeam,
  };
}
