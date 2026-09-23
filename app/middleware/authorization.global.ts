import { useAuthStore } from "~/store/auth";
import { useHandlerStore } from "~/store/handler";

export default defineNuxtRouteMiddleware((to) => {
  const authStore = useAuthStore();
  const handlerStore = useHandlerStore();

  // Boot plugin hasn't finished the silent resume attempt yet.
  // Shouldn't normally happen (Nuxt awaits it), but safe to bail out.
  if (!authStore.isReady) return;

  // unauthorized (from axios plugin interceptor)
  if (handlerStore.unauthorized) {
    handlerStore.clearFlags();
    return navigateTo("/auth");
  }

  // forbidden (from axios plugin interceptor)
  if (handlerStore.forbidden) {
    handlerStore.clearFlags();
    return navigateTo("/403");
  }

  // if have redirect path from backend
  if (handlerStore.redirectTo) {
    const target = handlerStore.redirectTo;
    handlerStore.clearFlags();
    return navigateTo(target);
  }

  const hasSession = !!authStore.accessToken;

  // guest guard
  if (!hasSession && to.path !== "/auth") {
    return navigateTo("/auth");
  }

  // logged-in user shouldn't see auth page
  if (hasSession && to.path === "/auth") {
    return navigateTo("/");
  }
});
