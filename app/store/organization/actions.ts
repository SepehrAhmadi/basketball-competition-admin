import { useApi } from "~/composables/useApi";
import type { useOrganizationState } from "./state";
import { useHandlerStore } from "../handler";

type StateType = ReturnType<typeof useOrganizationState>;

export function useOrganizationActions(state: StateType) {
  const handlerStore = useHandlerStore();

  const getOrganizations = (params: any) => {
    const axios = useApi();
    state.loading.value = true;

    return axios
      .get("/admin/organizations", { params })
      .then((res) => {
        state.organizationList.value = res.data.data.items;
        state.organizationListMeta.value = {
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

  const getOrganizationById = (id: number) => {
    const axios = useApi();
    state.loading.value = true;

    return axios
      .get(`/admin/organizations/${id}`)
      .then((res) => {
        state.organizationDetail.value = res.data.data;
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

  const createOrganization = (value: FormData) => {
    const axios = useApi();
    handlerStore.loadingBtn = true;

    return axios
      .post("/admin/organizations", value, {
        headers: { "Content-Type": "multipart/form-data" },
      })
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

  const updateOrganization = (id: number, value: FormData) => {
    const axios = useApi();
    handlerStore.loadingBtn = true;

    return axios
      .put(`/admin/organizations/${id}`, value, {
        headers: { "Content-Type": "multipart/form-data" },
      })
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

  const deleteOrganization = (id: number) => {
    const axios = useApi();
    handlerStore.loadingBtn = true;

    return axios
      .delete(`/admin/organizations/${id}`)
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

  const restoreOrganization = (id: number) => {
    const axios = useApi();
    handlerStore.loadingBtn = true;

    return axios
      .post(`/admin/organizations/${id}/restore`)
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
    getOrganizations,
    getOrganizationById,
    createOrganization,
    updateOrganization,
    deleteOrganization,
    restoreOrganization,
  };
}
