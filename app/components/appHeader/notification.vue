<template>
  <div class="tw:relative">
    <v-menu v-model="menu" class="tw:relative tw:z-9999!">
      <template v-slot:activator="{ props }">
        <div
          class="tw:w-10 tw:h-10 tw:flex tw:justify-center tw:items-center tw:bg-white tw:dark:bg-gray-800 tw:border-3 tw:border-white tw:dark:border-gray-800 tw:rounded-full tw:overflow-hidden tw:hover:bg-gray-50 tw:hover:border-gray-50 tw:dark:hover:border-gray-800 tw:dark:hover:bg-primary-dark tw:transition tw:duration-200 tw:cursor-pointer"
          v-bind="props"
        >
          <icon-bell class="tw:text-[22px]" />
        </div>
      </template>
      <div
        class="tw:bg-white tw:dark:bg-primary-dark tw:rounded-lg tw:min-w-60 tw:max-w-80 tw:overflow-hidden tw:mt-3! tw:border tw:border-gray-200 tw:dark:border-gray-700"
      >
        <div class="tw:flex tw:flex-col tw:gap-2">
          <div>در آینده در این قسمت اعلان ها نمایش داده می‌شوند</div>
        </div>
      </div>
    </v-menu>
  </div>
</template>

<script setup lang="ts">
// ======= data ========
const menu = ref(false);
</script>
