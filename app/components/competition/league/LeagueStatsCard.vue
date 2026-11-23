<template>
  <v-card-text>
    <div
      class="tw:flex tw:justify-start tw:items-center tw:gap-1 tw:text-secondary-dark tw:dark:text-white tw:mb-4!"
    >
      <icon-chart class="tw:text-[25px]" />
      <div class="tw:text-[15px]! tw:font-bold!">وضعیت لیگ</div>
    </div>

    <v-alert
      v-if="canGroups && groupLock"
      type="warning"
      variant="tonal"
      density="compact"
      class="tw:text-[12px]! tw:mb-4!"
    >
      {{ groupLock.message }}
    </v-alert>

    <!-- stats -->
    <v-row dense class="compact-chips">
      <v-col v-for="stat in stats" :key="stat.key" cols="6" md="4">
        <div
          class="tw:p-4! tw:bg-gray-50 tw:dark:bg-gray-800 tw:border tw:border-gray-200 tw:dark:border-gray-600 tw:rounded-md tw:flex tw:justify-center tw:items-center! tw:gap-2"
        >
          <component
            :is="icons[stat.icon]"
            class="tw:text-[20px] tw:text-gray-500 tw:dark:text-gray-300"
          />
          <div class="tw:flex tw:items-center tw:gap-2">
            <div class="tw:text-gray-600 tw:dark:text-gray-300 tw:text-[11px]!">
              {{ stat.label }}
            </div>
            <div
              class="tw:text-gray-800 tw:dark:text-gray-100 tw:text-[15px]! tw:font-bold!"
            >
              {{ stat.value }}
            </div>
          </div>
        </div>
      </v-col>
    </v-row>

    <div
      v-if="canGroups && groupIssues.length"
      class="tw:flex tw:flex-wrap tw:gap-2 tw:mt-3!"
    >
      <AdvisoryChip
        v-for="(issue, i) in groupIssues"
        :key="`${issue.code}-${i}`"
        :advisory="issue"
      />
    </div>
  </v-card-text>
</template>

<script setup lang="ts">
import AdvisoryChip from "~/components/AdvisoryChip.vue";
import type { Advisory } from "~/composables/competition/types";

const props = defineProps<{
  canGroups: boolean;
  isGroupedFormat: boolean;
  teamsCount: number;
  groupCount: number;
  assignedCount: number;
  unassignedCount: number;
  totalQualifiers: number | string;
  groupLock: Advisory | null;
  groupIssues: Advisory[];
}>();

// Icons are auto-registered locally, so a string `is` cannot resolve them.
const icons: Record<string, any> = {
  "icon-users": resolveComponent("icon-users"),
  "icon-layer": resolveComponent("icon-layer"),
  "icon-check-circle": resolveComponent("icon-check-circle"),
  "icon-box": resolveComponent("icon-box"),
  "icon-cup": resolveComponent("icon-cup"),
};

const stats = computed(() => {
  const list: {
    key: string;
    icon: string;
    label: string;
    value: number | string;
  }[] = [
    {
      key: "teams",
      icon: "icon-users",
      label: "تیم‌های ثبت نام شده:",
      value: props.teamsCount ?? 0,
    },
  ];
  if (props.isGroupedFormat && props.canGroups) {
    list.push(
      {
        key: "groups",
        icon: "icon-layer",
        label: "تعداد گروه ها:",
        value: props.groupCount,
      },
      {
        key: "assigned",
        icon: "icon-check-circle",
        label: "تیم‌های دارای گروه:",
        value: props.assignedCount,
      },
      {
        key: "unassigned",
        icon: "icon-box",
        label: "تیم‌های بدون گروه:",
        value: props.unassignedCount,
      },
      {
        key: "qualifiers",
        icon: "icon-cup",
        label: "مجموع صعودکننده ها:",
        value: props.totalQualifiers,
      },
    );
  }
  return list;
});
</script>
