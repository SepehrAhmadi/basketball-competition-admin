import { useApi } from "~/composables/useApi";
import type { useUserState } from "./state";
import { useHandlerStore } from "../handler";

type StateType = ReturnType<typeof useUserState>;

export function useUserActions(state: StateType) {
  const handlerStore = useHandlerStore();

  const getUsers = (params: any) => {
    const axios = useApi();
    state.loading.value = true;

    return axios
      .get("/admin/users", { params })
      .then((res) => {
        state.userList.value = res.data.data.items;
        state.userListMeta.value = {
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

  const getUserById = (id: number) => {
    const axios = useApi();
    state.loading.value = true;

    return axios
      .get(`/admin/users/${id}`)
      .then((res) => {
        state.userDetail.value = res.data.data;
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

  const createUser = (value: any) => {
    const axios = useApi();
    handlerStore.loadingBtn = true;

    return axios
      .post("/auth/admin/users", value)
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

  const updateUser = (id: number, value: any) => {
    const axios = useApi();
    handlerStore.loadingBtn = true;

    return axios
      .put(`/admin/users/${id}`, value)
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

  const deleteUser = (id: number) => {
    const axios = useApi();
    handlerStore.loadingBtn = true;

    return axios
      .delete(`/auth/admin/users/${id}`)
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

  const resetPassword = (id: number, newPassword: string) => {
    const axios = useApi();
    handlerStore.loadingBtn = true;

    return axios
      .patch(`/admin/users/${id}/password`, { newPassword })
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
    getUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
    resetPassword,
  };
}
