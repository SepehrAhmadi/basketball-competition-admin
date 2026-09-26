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
      .post("/admin/users", value)
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
      .delete(`/admin/users/${id}`)
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

  // ─── Admin Status Toggle ──
  const setAdminStatus = (userId: number | string, isAdmin: boolean) => {
    const axios = useApi();
    handlerStore.loadingBtn = true;

    return axios
      .put(`/admin/users/${userId}/admin-status`, { isAdmin })
      .then((res) => {
        handlerStore.setSuccess(res.data.message);
        return res.data.data;
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

  // ─── Permissions ──
  const getPermissionCatalog = () => {
    const axios = useApi();
    return axios
      .get("/admin/users/permissions")
      .then((res) => res.data.data ?? [])
      .catch((err) => {
        console.log(err);
        const message = err.response?.data?.message || "خطای سرور";
        handlerStore.setError(message);
        return [];
      });
  };

  const getUserPermissions = (userId: number | string) => {
    const axios = useApi();
    return axios
      .get(`/admin/users/${userId}/permissions`)
      .then((res) => res.data.data?.permissions ?? [])
      .catch((err) => {
        console.log(err);
        const message = err.response?.data?.message || "خطای سرور";
        handlerStore.setError(message);
        return [];
      });
  };

  const replaceUserPermissions = (userId: number | string, permissions: string[]) => {
    const axios = useApi();
    handlerStore.loadingBtn = true;

    return axios
      .put(`/admin/users/${userId}/permissions`, { permissions })
      .then((res) => {
        handlerStore.setSuccess(res.data.message);
        return res.data.data?.permissions ?? [];
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

  const getCurrentUser = () => {
    const axios = useApi();

    return axios
      .get("/users/me")
      .then((res) => {
        state.currentUser.value = res.data?.data ?? res.data ?? null;
        return state.currentUser.value;
      })
      .catch((err) => {
        console.log(err);
        state.currentUser.value = null;
        return null;
      });
  };

  return {
    getUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
    resetPassword,
    setAdminStatus,
    getPermissionCatalog,
    getUserPermissions,
    replaceUserPermissions,
    getCurrentUser,
  };
}
