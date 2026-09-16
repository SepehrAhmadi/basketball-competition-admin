<template>
  <div
    class="tw:fixed tw:bottom-4 tw:right-5 tw:hidden tw:md:flex tw:flex-col tw:justify-center tw:items-center tw:gap-3 tw:py-1.5! tw:px-1! tw:bg-secondary-dark tw:rounded-full tw:z-999!"
  >
    <div
      @click="toggleTheme('light')"
      class="tw:w-8! tw:h-8! tw:flex tw:justify-center tw:items-center tw:rounded-full tw:cursor-pointer tw:hover:bg-primary-dark/60 tw:transition tw:duration-100"
      :class="{ 'tw:bg-primary-dark': !isDark }"
    >
      <icon-sun class="tw:w-5! tw:h-5! tw:text-white" />
    </div>

    <div
      @click="toggleTheme('dark')"
      class="tw:w-8! tw:h-8! tw:flex tw:justify-center tw:items-center tw:rounded-full tw:cursor-pointer tw:hover:bg-primary-dark/60 tw:transition tw:duration-100"
      :class="{ 'tw:bg-primary-dark ': isDark }"
    >
      <icon-moon class="tw:w-5! tw:h-5! tw:text-white" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useTheme } from "vuetify";
const theme = useTheme();

import { useHandlerStore } from "~/store/handler";
const handlerStore = useHandlerStore();

const isDark = ref(false);

const toggleTheme = (mode: "light" | "dark") => {
  if (mode == "light") {
    isDark.value = false;
  } else if (mode == "dark") {
    isDark.value = true;
  }
  localStorage.setItem("theme", isDark.value ? "dark" : "light");
  document.documentElement.classList.toggle("dark", isDark.value);
  theme.global.name.value = isDark.value ? "dark" : "light";
};

onMounted(() => {
  handlerStore.theme = localStorage.getItem("theme");
  isDark.value = localStorage.getItem("theme") === "dark";
  document.documentElement.classList.toggle("dark", isDark.value);
  theme.global.name.value = isDark.value ? "dark" : "light";
});
</script>
