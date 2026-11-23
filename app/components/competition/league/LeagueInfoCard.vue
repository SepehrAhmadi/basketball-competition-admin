<template>
  <v-card
    rounded="lg"
    class="tw:flex! tw:flex-col! tw:justify-between! tw:relative! tw:px-4! tw:py-4! tw:h-full!"
  >
    <div>
      <div class="tw:flex tw:items-center tw:justify-between tw:gap-2 tw:mb-4!">
        <div
          class="tw:flex tw:justify-start tw:items-center tw:gap-1 tw:text-secondary-dark tw:dark:text-white"
        >
          <icon-cup class="tw:text-[25px]" />
          <div class="tw:text-[15px]! tw:font-bold!">
            {{ league.name }}
          </div>
        </div>
        <div class="tw:flex tw:items-center tw:gap-1">
          <v-chip
            v-if="!format"
            size="x-small"
            variant="tonal"
            color="warning"
          >
            ساختار تعیین نشده
          </v-chip>
          <v-chip
            size="x-small"
            variant="tonal"
            :color="leagueStatusColor(league.status)"
          >
            {{ leagueStatusLabel(league.status) }}
          </v-chip>
        </div>
      </div>

      <!-- grid info -->
      <v-row dense class="compact-chips">
        <v-col
          v-for="item in items"
          :key="item.key"
          cols="6"
          md="3"
          xl="4"
        >
          <div
            class="tw:p-4! tw:bg-gray-50 tw:dark:bg-gray-800 tw:border tw:border-gray-200 tw:dark:border-gray-600 tw:rounded-md tw:flex tw:justify-center tw:items-center! tw:gap-2"
          >
            <component
              :is="icons[item.icon]"
              class="tw:text-[20px] tw:text-gray-500 tw:dark:text-gray-300"
            />
            <div class="tw:text-gray-600 tw:dark:text-gray-300 tw:text-[13px]!">
              {{ item.text }}
            </div>
          </div>
        </v-col>
      </v-row>
    </div>

    <!-- league action -->
    <div
      class="tw:flex tw:flex-wrap tw:items-center tw:justify-end tw:gap-2 tw:mt-4!"
    >
      <ViewSwitch
        v-if="hasBothViews"
        :model-value="modelValue"
        @update:model-value="emit('update:modelValue', $event)"
      />
    </div>
  </v-card>
</template>

<script setup lang="ts">
import ViewSwitch from "~/components/competition/league/ViewSwitch.vue";
import type { CompetitionView } from "~/composables/competition/types";
import { leagueStatusColor, leagueStatusLabel } from "~/utils/league/status";

const props = defineProps<{
  league: any;
  format: string | null;
  isGroupedFormat: boolean;
  hasBothViews: boolean;
  modelValue: CompetitionView;
  formatLabel: string;
  roundTypeLabel: string;
  qualifiersLabel: string;
  defaultQualifiers: number | null;
  minBirthDate: string;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: CompetitionView): void;
}>();

// Icons are auto-registered locally, so a string `is` cannot resolve them.
const icons: Record<string, any> = {
  "icon-layer": resolveComponent("icon-layer"),
  "icon-date": resolveComponent("icon-date"),
  "icon-hourglass": resolveComponent("icon-hourglass"),
  "icon-pie-chart": resolveComponent("icon-pie-chart"),
  "icon-check-circle": resolveComponent("icon-check-circle"),
  "icon-close-circle": resolveComponent("icon-close-circle"),
  "icon-sync": resolveComponent("icon-sync"),
  "icon-check-shield": resolveComponent("icon-check-shield"),
};

const items = computed(() => {
  const l = props.league;
  const list: { key: string; icon: string; text: string }[] = [
    {
      key: "season",
      icon: "icon-layer",
      text: `${l.season?.name ?? "—"} - ${l.ageCategory?.name ?? "—"}`,
    },
    {
      key: "start",
      icon: "icon-date",
      text: `تاریخ شروع: ${l.startDate ?? "—"}`,
    },
    {
      key: "end",
      icon: "icon-date",
      text: `تاریخ پایان: ${l.endDate ?? "—"}`,
    },
    {
      key: "roster",
      icon: "icon-hourglass",
      text: `مهلت ثبت ترکیب: ${l.rosterDeadline ?? "—"}`,
    },
    {
      key: "birth",
      icon: "icon-date",
      text: `حداقل تاریخ تولد: ${props.minBirthDate}`,
    },
  ];
  if (props.format) {
    list.push(
      {
        key: "format",
        icon: "icon-pie-chart",
        text: `ساختار: ${props.formatLabel}`,
      },
      {
        key: "win",
        icon: "icon-check-circle",
        text: `امتیاز برد: ${l.winPoints ?? "—"}`,
      },
      {
        key: "loss",
        icon: "icon-close-circle",
        text: `امتیاز باخت: ${l.lossPoints ?? "—"}`,
      },
    );
    if (props.isGroupedFormat) {
      list.push(
        {
          key: "round",
          icon: "icon-sync",
          text: `نوع دور: ${props.roundTypeLabel}`,
        },
        {
          key: "qualifiers",
          icon: "icon-check-shield",
          text: `${props.qualifiersLabel}: ${props.defaultQualifiers ?? "—"}`,
        },
      );
    }
  }
  return list;
});
</script>
