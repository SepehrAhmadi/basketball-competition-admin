import { useApi } from "~/composables/useApi";
import type { useTeamState } from "./state";
import { useHandlerStore } from "../handler";

type StateType = ReturnType<typeof useTeamState>;

export function useTeamActions(state: StateType) {
  const handlerStore = useHandlerStore();

  // GET /admin/teams — verifyPermission("teams.view")
  const getTeams = (params: any) => {
    const axios = useApi();
    state.loading.value = true;

    return axios
      .get("/admin/teams", { params })
      .then((res) => {
        state.teamList.value = res.data.data.items ?? res.data.data;
        state.teamListMeta.value = res.data.data.meta ?? {
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
state.loading.value = false
      });
  };

  // GET /admin/teams/:teamId — verifyPermission("teams.view")
  const getTeamById = (id: number | string) => {
    const axios = useApi();
    state.loading.value = true;

    return axios
      .get(`/admin/teams/${id}`)
      .then((res) => {
        state.teamDetail.value = res.data.data;
      })
      .catch((err) => {
        console.log(err);
        const message = err.response?.data?.message || "خطای سرور";
        handlerStore.setError(message);
      })
      .finally(() => {
state.loading.value = false
      });
  };

  // POST /admin/teams — verifyPermission("teams.create")
  const createTeam = (value: any) => {
    const axios = useApi();
    handlerStore.loadingBtn = true;

    return axios
      .post("/admin/teams", value)
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

  // PUT /admin/teams/:teamId — verifyPermission("teams.update")
  const updateTeam = (id: number | string, value: any) => {
    const axios = useApi();
    handlerStore.loadingBtn = true;

    return axios
      .put(`/admin/teams/${id}`, value)
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

  // DELETE /admin/teams/:teamId — verifyPermission("teams.delete")
  const deleteTeam = (id: number | string) => {
    const axios = useApi();
    handlerStore.loadingBtn = true;

    return axios
      .delete(`/admin/teams/${id}`)
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

  // POST /admin/teams/:teamId/restore — verifyPermission("teams.restore")
  const restoreTeam = (id: number | string) => {
    const axios = useApi();
    handlerStore.loadingBtn = true;

    return axios
      .post(`/admin/teams/${id}/restore`)
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

  // GET /admin/teams/:teamId/roster — verifyPermission("roster.view")
  const getRoster = (id: number | string, params?: any) => {
    const axios = useApi();
    state.rosterLoading.value = true;

    return axios
      .get(`/admin/teams/${id}/roster`, { params })
      .then((res) => {
        state.rosterList.value = res.data.data.items ?? res.data.data;
        state.rosterMeta.value = res.data.data.meta ?? {
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
        setTimeout(() => {
          state.rosterLoading.value = false;
        }, 2000);
      });
  };

  // POST /admin/teams/:teamId/roster — verifyPermission("roster.create")
  const addRosterMember = (teamId: number | string, value: any) => {
    const axios = useApi();
    handlerStore.loadingBtn = true;

    return axios
      .post(`/admin/teams/${teamId}/roster`, value)
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

  // PUT /admin/teams/:teamId/roster/:memberId — verifyPermission("roster.update")
  const updateRosterMember = (
    teamId: number | string,
    memberId: number | string,
    value: any
  ) => {
    const axios = useApi();
    handlerStore.loadingBtn = true;

    return axios
      .put(`/admin/teams/${teamId}/roster/${memberId}`, value)
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

  // DELETE /admin/teams/:teamId/roster/:memberId — verifyPermission("roster.delete")
  // removeRosterMemberSchema validates the request body (e.g. removal reason)
  const removeRosterMember = (
    teamId: number | string,
    memberId: number | string,
    value?: any
  ) => {
    const axios = useApi();
    handlerStore.loadingBtn = true;

    return axios
      .delete(`/admin/teams/${teamId}/roster/${memberId}`, { data: value })
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

  return {
    getTeams,
    getTeamById,
    createTeam,
    updateTeam,
    deleteTeam,
    restoreTeam,
    getRoster,
    addRosterMember,
    updateRosterMember,
    removeRosterMember,
  };
}
