<template>
  <v-card class="tw:rounded-xl! tw:mb-4!">
    <v-card-text>
      <v-row align="center">
        <v-col cols="12" sm="2">
          <BackBtn class="tw:w-full!" />
        </v-col>

        <v-col cols="12" sm="8">
          <v-autocomplete
            :model-value="modelValue"
            :items="items"
            item-title="label"
            item-value="value"
            variant="outlined"
            density="compact"
            hide-details
            dir="rtl"
            clearable
            no-filter
            :disabled="selectDisabled"
            no-data-text="موردی یافت نشد"
            @update:search="(t: string) => emit('search', t)"
            @update:model-value="(id: number | null) => emit('select', id)"
          >
            <template #label>
              <span class="tw:text-[12px]">انتخاب لیگ</span>
            </template>
            <template #item="{ props: itemProps, item }">
              <v-list-item v-bind="itemProps">
                <template #append>
                  <v-chip
                    v-if="item.raw.status"
                    size="x-small"
                    variant="tonal"
                    :color="leagueStatusColor(item.raw.status)"
                  >
                    {{ leagueStatusLabel(item.raw.status) }}
                  </v-chip>
                </template>
              </v-list-item>
            </template>
          </v-autocomplete>
        </v-col>

        <v-col cols="12" sm="2">
          <v-btn
            block
            class="tw:bg-secondary-dark! tw:text-white! tw:rounded-md!"
            :disabled="refreshDisabled"
            @click="emit('refresh')"
          >
            <icon-refresh class="tw:text-[18px]" />
            <span class="tw:mr-1!">بروزرسانی</span>
          </v-btn>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import BackBtn from "~/components/BackBtn.vue";
import { leagueStatusColor, leagueStatusLabel } from "~/utils/league/status";

defineProps<{
  modelValue: number | null;
  items: any[];
  selectDisabled: boolean;
  refreshDisabled: boolean;
}>();

const emit = defineEmits<{
  (e: "select", id: number | null): void;
  (e: "search", text: string): void;
  (e: "refresh"): void;
}>();
</script>
