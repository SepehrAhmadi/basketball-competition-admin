<template>
  <div
    class="tw:flex tw:justify-center tw:items-center tw:gap-3 tw:py-1.5! tw:px-1! tw:bg-gray-200! tw:dark:bg-secondary-dark! tw:rounded-full tw:z-999!"
  >
    <div
      @click="toggleTheme('light')"
      class="tw:w-7! tw:h-7! tw:flex tw:justify-center tw:items-center tw:rounded-full tw:cursor-pointer tw:hover:bg-gray-50! tw:dark:hover:bg-primary-dark/60! tw:transition tw:duration-100"
      :class="{ 'tw:bg-white! tw:dark:bg-primary-dark!': !isDark }"
    >
      <icon-sun class="tw:w-4.5! tw:h-4.5! tw:text-primary-dark tw:dark:text-white!" />
    </div>

    <div
      @click="toggleTheme('dark')"
      class="tw:w-7! tw:h-7! tw:flex tw:justify-center tw:items-center tw:rounded-full tw:cursor-pointer tw:hover:bg-gray-50! tw:dark:hover:bg-primary-dark/60! tw:transition tw:duration-100"
      :class="{ 'tw:bg-white! tw:dark:bg-primary-dark! ': isDark }"
    >
      <icon-moon class="tw:w-4.5! tw:h-4.5! tw:text-primary-dark tw:dark:text-white!" />
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
