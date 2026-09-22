import { useApi } from "~/composables/useApi";
import type { useAuthState } from "./state";
import { useHandlerStore } from "../handler";

type StateType = ReturnType<typeof useAuthState>;

export function useAuthActions(state: StateType) {
  const handlerStore = useHandlerStore();

  const adminLogin = (value: any) => {
    const axios = useApi();
    state.loading.value = true;

    return axios
      .post("/auth/admin/login", value, { withCredentials: true })
      .then((res) => {
        state.loginResult.value = res.data;
        state.adminUser.value = res.data.data?.user ?? null;
        console.log("roles" , res.data.data.user.roles)
        if (res.data.data.user.roles.includes("SUPER_ADMIN")) {
          localStorage.setItem("super_admin", "true");
        }
        if (res.data.data?.accessToken) {
          useCookie("token").value = res.data.data.accessToken;
        }
        navigateTo("/");
        handlerStore.setSuccess(res.data.message);
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

  const refreshToken = () => {
    const axios = useApi();

    return axios
      .post("/auth/refresh-token", {}, { withCredentials: true })
      .then((res) => {
        if (res.data.data?.accessToken) {
          useCookie("token").value = res.data.data.accessToken;
        }
      })
      .catch((err) => {
        console.log(err);
        useCookie("token").value = null;
        handlerStore.setUnauthorized();
      });
  };

  const logout = () => {
    const axios = useApi();
    handlerStore.loadingBtn = true;

    return axios
      .post("/auth/logout", { withCredentials: true })
      .then(() => {
        useCookie("token").value = null;
        state.adminUser.value = null;
        localStorage.setItem("super_admin", "false");
        navigateTo("/auth");
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

  return { adminLogin, refreshToken, logout };
}
