<template>
  <v-card class="tw:rounded-xl! tw:h-full!">
    <v-card-text>
      <div
        class="tw:flex tw:justify-start tw:items-center tw:gap-1 tw:text-secondary-dark tw:dark:text-white tw:mb-4!"
      >
        <icon-chart class="tw:text-[20px]" />
        <div class="tw:text-[14px]! tw:font-bold!">خلاصه بازی‌ها</div>
      </div>
      <v-row>
        <v-col v-for="s in statuses" :key="s.value" cols="6">
          <div
            class="tw:p-4! tw:rounded-md tw:flex tw:justify-center tw:items-center! tw:gap-2 tw:border tw:h-full"
            :class="summaryBoxClass(s.value)"
          >
            <icon-date v-if="s.value === 'SCHEDULED'" class="tw:text-[20px]" />
            <icon-hourglass
              v-else-if="s.value === 'LIVE'"
              class="tw:text-[20px]"
            />
            <icon-check-circle
              v-else-if="s.value === 'FINISHED'"
              class="tw:text-[20px]"
            />
            <icon-close-circle v-else class="tw:text-[20px]" />
            <div class="tw:text-[13px]!">
              {{ s.label }}:
              <span class="tw:font-bold!">
                {{ summary.byStatus?.[s.value] ?? 0 }}
              </span>
            </div>
          </div>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
defineProps<{
  summary: any;
  statuses: any[];
}>();

// Summary box colors mirror the status chip colors (icon + text).
const summaryBoxClass = (v: string) =>
  (
    {
      SCHEDULED:
        "tw:bg-sky-50 tw:dark:bg-sky-900/20 tw:border-sky-200 tw:dark:border-sky-800 tw:text-sky-700 tw:dark:text-sky-300",
      LIVE: "tw:bg-amber-50 tw:dark:bg-amber-900/20 tw:border-amber-200 tw:dark:border-amber-800 tw:text-amber-700 tw:dark:text-amber-300",
      FINISHED:
        "tw:bg-green-50 tw:dark:bg-green-900/20 tw:border-green-200 tw:dark:border-green-800 tw:text-green-700 tw:dark:text-green-300",
      CANCELED:
        "tw:bg-gray-50 tw:dark:bg-gray-800 tw:border-gray-200 tw:dark:border-gray-600 tw:text-gray-600 tw:dark:text-gray-300",
    } as Record<string, string>
  )[v] ??
  "tw:bg-gray-50 tw:dark:bg-gray-800 tw:border-gray-200 tw:dark:border-gray-600 tw:text-gray-600 tw:dark:text-gray-300";
</script>
