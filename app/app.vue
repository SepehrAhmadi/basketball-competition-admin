<template>
  <v-app>
    <Loader />

    <Alert />

    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </v-app>
</template>

<script setup lang="ts">
import { useAuthStore } from "~/store/auth";

const authStore = useAuthStore();

// Bootstrap the session from the httpOnly refresh cookie.
// Must run on the client only — server-side requests can't send browser cookies,
// so the refresh would fail and clear the token.
if (import.meta.client) {
  await authStore.bootstrapSession();
}
</script>

<style>
/* page transition */
.page-enter-active,
.page-leave-active {
  transition: all 0.3s ease;
}

.page-enter-from,
.page-leave-to {
  opacity: 0;
  transform: translateY(50px);
}

/* layout transition */
.layout-enter-active,
.layout-leave-active {
  transition: all 0.3s ease;
}

.layout-enter-from,
.layout-leave-to {
  opacity: 0;
  transform: scale(0.98);
}
</style>
