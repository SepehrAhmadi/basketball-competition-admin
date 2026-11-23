<template>
  <v-card class="tw:rounded-xl! tw:h-full!">
    <v-card-text>
      <div
        class="tw:flex tw:justify-start tw:items-center tw:gap-1 tw:text-secondary-dark tw:dark:text-white tw:mb-4!"
      >
        <icon-filter class="tw:text-[20px]" />
        <div class="tw:text-[14px]! tw:font-bold!">فیلترها</div>
      </div>
      <v-row align="center">
        <v-col cols="12" md="6">
          <v-text-field
            v-model="filters.search"
            variant="outlined"
            density="compact"
            hide-details
            dir="rtl"
            @update:model-value="emit('search')"
          >
            <template #label>
              <span class="tw:text-[12px]">جستجوی نام تیم</span>
            </template>
            <template #prepend-inner>
              <icon-magnify class="tw:text-[18px] tw:text-color-lighter" />
            </template>
          </v-text-field>
        </v-col>

        <v-col cols="6" md="3">
          <v-select
            v-model="filters.groupId"
            :items="groups"
            item-title="label"
            item-value="value"
            variant="outlined"
            density="compact"
            hide-details
            dir="rtl"
            clearable
            no-data-text="موردی یافت نشد"
            @update:model-value="emit('group-change')"
          >
            <template #label>
              <span class="tw:text-[12px]">گروه</span>
            </template>
          </v-select>
        </v-col>

        <v-col cols="6" sm="3">
          <v-select
            v-model="filters.status"
            :items="statuses"
            item-title="label"
            item-value="value"
            variant="outlined"
            density="compact"
            hide-details
            dir="rtl"
            clearable
            no-data-text="موردی یافت نشد"
            @update:model-value="emit('filter-change')"
          >
            <template #label>
              <span class="tw:text-[12px]">وضعیت</span>
            </template>
          </v-select>
        </v-col>

        <v-col cols="12" md="3">
          <v-autocomplete
            v-model="filters.leagueTeamId"
            :items="teams"
            item-title="label"
            item-value="value"
            :item-props="teamItemProps"
            variant="outlined"
            density="compact"
            hide-details
            dir="rtl"
            clearable
            no-data-text="موردی یافت نشد"
            @update:model-value="emit('filter-change')"
          >
            <template #label>
              <span class="tw:text-[12px]">تیم</span>
            </template>
          </v-autocomplete>
        </v-col>

        <v-col cols="6" md="3">
          <div class="tw:relative!">
            <label
              v-if="filters.dateFrom"
              for="gameFilterFrom"
              class="tw:text-[11px] tw:absolute! tw:bg-white! tw:dark:bg-primary-dark! tw:start-3 tw:-top-1.75 tw:z-10! tw:text-color-reverse"
              >از تاریخ</label
            >
            <date-picker
              v-model="filters.dateFrom"
              id="gameFilterFrom"
              simple
              clearable
              placeholder="از تاریخ"
              format="jYYYY/jMM/jDD"
              display-format="jYYYY/jMM/jDD"
              class="default-scroll tw:text-gray-300! tw:text-[14px]! tw:text-center!"
              color="#1d202e"
              @change="emit('date-change')"
            />
          </div>
        </v-col>

        <v-col cols="6" md="3">
          <div class="tw:relative!">
            <label
              v-if="filters.dateTo"
              for="gameFilterTo"
              class="tw:text-[11px] tw:absolute! tw:bg-white! tw:dark:bg-primary-dark! tw:start-3 tw:-top-1.75 tw:z-10! tw:text-color-reverse"
              >تا تاریخ</label
            >
            <date-picker
              v-model="filters.dateTo"
              id="gameFilterTo"
              simple
              clearable
              placeholder="تا تاریخ"
              format="jYYYY/jMM/jDD"
              display-format="jYYYY/jMM/jDD"
              class="default-scroll tw:text-gray-300! tw:text-[14px]! tw:text-center!"
              color="#1d202e"
              @change="emit('date-change')"
            />
          </div>
        </v-col>

        <v-col
          cols="12"
          md="3"
          class="tw:flex! tw:items-center! tw:justify-center!"
        >
          <v-switch
            v-model="filters.resultPending"
            color="secondary"
            density="compact"
            hide-details
            @update:model-value="emit('filter-change')"
          >
            <template #label>
              <span class="tw:text-[12px]">فقط نتیجه‌ی ثبت نشده</span>
            </template>
          </v-switch>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import type { GameFilterState } from "~/composables/competition/types";

// `filters` is the reactive object owned by useGamesList; only its fields are
// mutated here through v-model, the prop itself is never reassigned.
defineProps<{
  filters: GameFilterState;
  groups: any[];
  teams: any[];
  statuses: any[];
  teamItemProps: (item: any) => object;
}>();

const emit = defineEmits<{
  (e: "search"): void;
  (e: "group-change"): void;
  (e: "filter-change"): void;
  (e: "date-change"): void;
}>();
</script>
