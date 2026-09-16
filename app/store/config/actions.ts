// actions.ts
import { useApi } from "~/composables/useApi";
import type { useConfigState } from "./state";
import { useHandlerStore } from "../handler";

type StateType = ReturnType<typeof useConfigState>;

export function useConfigActions(state: StateType) {
  const handlerStore = useHandlerStore();

  const login = (value: any) => {
    const axios = useApi();
    state.loading.value = true;
    return axios
      .post("/auth", value, { withCredentials: true })
      .then((res) => {
        state.loginResult.value = res.data;
        if (res.data.accessToken) {
          const token = res.data.accessToken;
          localStorage.setItem("username", res.data.username);
          useCookie("token").value = token;
          navigateTo("/");
          handlerStore.setSuccess(res.data.message);
        }
      })
      .catch((err) => {
        console.log(err);

        const message =
          err.response?.data?.message || "خطایی در  سرور رخ داده است";
        handlerStore.setError(message);
      })
      .finally(() => {
        state.loading.value = false;
      });
  };

  const logout = () => {
    const axios = useApi();
    state.loading.value = true;
    return axios
      .get("/logout", { withCredentials: true })
      .then(() => {
        if (useCookie("token").value) {
          useCookie("token").value = null;
          localStorage.setItem("username", "");
        }
        navigateTo("/auth");
      })
      .catch((err) => {
        console.log(err);

        const message =
          err.response?.data?.message || "خطایی در  سرور رخ داده است";
        handlerStore.setError(message);
      })
      .finally(() => {
        state.loading.value = false;
      });
  };
  return {
    login,
    logout,
  };
}
