import { useApi } from "~/composables/useApi";
import type { useSeasonState } from "./state";
import { useHandlerStore } from "../handler";

type StateType = ReturnType<typeof useSeasonState>;

export function useSeasonActions(state: StateType) {
  const handlerStore = useHandlerStore();

  const getSeasons = (params: any) => {
    const axios = useApi();
    state.loading.value = true;

    return axios
      .get("/seasons", { params })
      .then((res) => {
        state.seasonList.value = res.data.data.items ?? res.data.data;
        state.seasonListMeta.value = res.data.data.meta ?? {
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
          state.loading.value = false;
        }, 2000);
      });
  };

  const getSeasonById = (id: number) => {
    const axios = useApi();
    state.loading.value = true;

    return axios
      .get(`/seasons/${id}`)
      .then((res) => {
        state.seasonDetail.value = res.data.data;
      })
      .catch((err) => {
        console.log(err);
        const message = err.response?.data?.message || "خطای سرور";
        handlerStore.setError(message);
      })
      .finally(() => {
        setTimeout(() => {
          state.loading.value = false;
        }, 2000);
      });
  };

  const createSeason = (value: any) => {
    const axios = useApi();
    handlerStore.loadingBtn = true;

    return axios
      .post("/seasons", value)
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

  const updateSeason = (id: number, value: any) => {
    const axios = useApi();
    handlerStore.loadingBtn = true;

    return axios
      .put(`/seasons/${id}`, value)
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

  const deleteSeason = (id: number) => {
    const axios = useApi();
    handlerStore.loadingBtn = true;

    return axios
      .delete(`/seasons/${id}`)
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
    getSeasons,
    getSeasonById,
    createSeason,
    updateSeason,
    deleteSeason,
  };
}
