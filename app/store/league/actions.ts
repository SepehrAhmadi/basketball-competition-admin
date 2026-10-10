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

  return {
    getLeagues,
    getLeagueById,
    createLeague,
    updateLeague,
    updateLeagueStatus,
    deleteLeague,
  };
}
