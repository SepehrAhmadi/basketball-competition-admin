import { jwtDecode } from "jwt-decode";
import { useApi } from "~/composables/useApi";
import type { AccessTokenPayload, useAuthState } from "./state";
import { useHandlerStore } from "../handler";

type StateType = ReturnType<typeof useAuthState>;

export function useAuthActions(state: StateType) {
  const handlerStore = useHandlerStore();

  const setSession = (token: string) => {
    state.accessToken.value = token;
    try {
      const decoded = jwtDecode<AccessTokenPayload & Record<string, any>>(token);
      const raw: Record<string, any> = decoded as Record<string, any>;
      state.userId.value =
        (decoded.userId as number) ??
        (raw.sub as number) ??
        (raw.id as number) ??
        (raw.userId as number) ??
        null;
      state.roles.value = Array.isArray(decoded.roles)
        ? decoded.roles
        : Array.isArray(raw.role)
          ? raw.role
          : [];
      state.permissions.value = Array.isArray(decoded.permissions)
        ? decoded.permissions
        : Array.isArray(raw.perms)
          ? raw.perms
          : [];
    } catch {
      // Decode-only for UI claims; server remains the enforcer.
      state.userId.value = null;
      state.roles.value = [];
      state.permissions.value = [];
    }
  };

  const clearSession = () => {
    state.accessToken.value = null;
    state.userId.value = null;
    state.roles.value = [];
    state.permissions.value = [];
    state.adminUser.value = null;
    state.loginResult.value = null;
  };

  // Called once at app boot — silently resumes a session from the httpOnly cookie.
  const bootstrapSession = () => {
    const axios = useApi();

    return axios
      .post("/auth/refresh-token", {}, { withCredentials: true })
      .then((res) => {
        const token = res.data?.data?.accessToken;
        if (token) {
          setSession(token);
          state.adminUser.value = res.data.data?.user ?? null;
        } else {
          clearSession();
        }
      })
      .catch(() => {
        // No valid cookie — just means "not logged in", not an error to show.
        clearSession();
      })
      .finally(() => {
        state.isReady.value = true;
      });
  };

  const adminLogin = (value: any) => {
    const axios = useApi();
    state.loading.value = true;

    return axios
      .post("/auth/admin/login", value, { withCredentials: true })
      .then((res) => {
        state.loginResult.value = res.data;
        state.adminUser.value = res.data.data?.user ?? null;
        if (res.data.data?.accessToken) {
          setSession(res.data.data.accessToken);
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
          setSession(res.data.data.accessToken);
        }
      })
      .catch((err) => {
        console.log(err);
        clearSession();
        handlerStore.setUnauthorized();
      });
  };

  const logout = () => {
    const axios = useApi();
    handlerStore.loadingBtn = true;

    return axios
      .post("/auth/logout", {}, { withCredentials: true })
      .then(() => {
        clearSession();
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

  return { setSession, clearSession, bootstrapSession, adminLogin, refreshToken, logout };
}
