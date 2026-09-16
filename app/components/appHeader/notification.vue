<template>
  <div class="tw:relative">
    <v-menu v-model="menu" class="tw:relative tw:z-9999!">
      <template v-slot:activator="{ props }">
        <div
          class="tw:w-10 tw:h-10 tw:flex tw:justify-center tw:items-center tw:bg-secondary-dark! tw:dark:bg-gray-800 tw:rounded-full tw:overflow-hidden tw:hover:bg-secondary-dark/80 tw:transition tw:duration-200 tw:cursor-pointer"
          v-bind="props"
        >
          <icon-bell class="tw:text-[22px] tw:text-white" />
        </div>
      </template>
      <div
        class="tw:bg-white tw:dark:bg-primary-dark tw:rounded-lg tw:min-w-60 tw:max-w-80 tw:overflow-hidden tw:mt-3! tw:border tw:border-gray-200 tw:dark:border-gray-700"
      >
        <div class="tw:flex tw:flex-col tw:gap-2 tw:text-sm tw:p-2! ">
          <div class="tw:px-2">در آینده در این قسمت اعلان ها نمایش داده می‌شوند</div>
        </div>
      </div>
    </v-menu>
  </div>
</template>

<script setup lang="ts">
// ======= data ========
const menu = ref(false);
</script>
