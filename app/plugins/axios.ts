import axios from "axios";
import { useAuthStore } from "~/store/auth";
import { useHandlerStore } from "~/store/handler";

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig();
  const handlerStore = useHandlerStore();

  const api = axios.create({
    baseURL: config.public.API_URL,
    withCredentials: true,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  });

  // Attach the in-memory access token. The httpOnly refresh cookie is sent
  // automatically by the browser (withCredentials above).
  api.interceptors.request.use((requestConfig) => {
    try {
      const token = useCookie<string | null>("token").value;
      if (token) {
        requestConfig.headers["Authorization"] =
          `Bearer ${token}`;
      }
    } catch {
      // Store may not be ready in some edge contexts — send without token.
    }
    return requestConfig;
  });

  // get access token and handle redirects , difrrent status codes
  interface FailedRequest {
    resolve: (token: string) => void;
    reject: (error: any) => void;
  }
  let isRefreshing = false;
  let failedQueue: FailedRequest[] = [];

  const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach((prom) => {
      if (error) {
        prom.reject(error);
      } else if (token) {
        prom.resolve(token);
      }
    });
    failedQueue = [];
  };

  api.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;
      const status = error.response?.status;
      const url: string = originalRequest?.url ?? "";

      // Never retry the auth endpoints themselves (avoids boot/refresh loops).
      const isAuthEndpoint =
        url.includes("/auth/admin/login") ||
        url.includes("/auth/refresh-token") ||
        url.includes("/auth/logout");

      if (status === 401 && !originalRequest._retry && !isAuthEndpoint) {
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then((token) => {
              originalRequest.headers["Authorization"] = `Bearer ${token}`;
              return api(originalRequest);
            })
            .catch((err) => Promise.reject(err));
        }

        originalRequest._retry = true;
        isRefreshing = true;

        return new Promise(async (resolve, reject) => {
          try {
            const { data } = await axios.post(
              `${config.public.API_URL}/auth/refresh-token`,
              {},
              {
                withCredentials: true,
              },
            );

            const newToken = data.data.accessToken;
            // Old tokens without adminLevel get 401 — refresh either yields a
            // new split-claim token or fails and forces re-login below.
            if (!newToken) throw new Error("Missing accessToken in refresh response");
            const authStore = useAuthStore();
            authStore.setSession(newToken);
            api.defaults.headers.common["Authorization"] =
              `Bearer ${newToken}`;

            processQueue(null, newToken);

            originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
            resolve(api(originalRequest));
          } catch (err) {
            processQueue(err, null);
            try {
              const authStore = useAuthStore();
              authStore.clearSession();
            } catch {
              // store unavailable — still flag unauthorized below
            }
            delete api.defaults.headers.common["Authorization"];
            handlerStore.setUnauthorized();
            reject(err);
          } finally {
            isRefreshing = false;
          }
        });
      }

      if (status === 403) {
        handlerStore.setForbidden();
      }

      if (error.response?.data?.redirect) {
        handlerStore.setRedirect(error.response.data.redirect);
      }

      return Promise.reject(error);
    },
  );

  return {
    provide: {
      axios: api,
    },
  };
});
