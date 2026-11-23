<template>
  <v-dialog
    :model-value="modelValue"
    max-width="400"
    dir="rtl"
    class="blur-dialog"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <v-card rounded="lg">
      <v-card-title
        class="tw:bg-secondary-dark tw:dark:bg-primary-dark! tw:mb-3!"
      >
        <div class="tw:flex tw:justify-between tw:items-center">
          <div class="tw:invisible">
            <v-btn
              icon
              variant="plain"
              size="x-small"
              @click="emit('update:modelValue', false)"
            >
              <icon-close class="tw:text-[18px] tw:text-white!" />
            </v-btn>
          </div>
          <div class="tw:text-[14px]! tw:text-white">
            {{ texts[type].title }}
          </div>
          <div>
            <v-btn
              icon
              variant="plain"
              size="x-small"
              aria-label="بستن"
              @click="emit('update:modelValue', false)"
            >
              <icon-close class="tw:text-[18px] tw:text-white!" />
            </v-btn>
          </div>
        </div>
      </v-card-title>
      <v-card-text class="tw:text-[16px]! tw:text-center!">
        {{ texts[type].text }}
        <div
          v-if="target"
          class="tw:text-gray-600 tw:dark:text-gray-300 tw:text-[13px]! tw:mt-2!"
        >
          {{ target.homeTeam.team.name }} -
          {{ target.awayTeam.team.name }}
        </div>
      </v-card-text>
      <v-card-actions class="tw:justify-end!">
        <v-btn
          variant="text"
          class="tw:text-[12px]!"
          @click="emit('update:modelValue', false)"
        >
          انصراف
        </v-btn>
        <v-btn
          class="tw:bg-secondary-dark! tw:dark:bg-secondary-dark! tw:text-white! tw:rounded-md!"
          :loading="loading"
          :disabled="loading"
          @click="emit('confirm')"
        >
          <icon-trash v-if="type === 'delete'" class="tw:text-[18px]" />
          <icon-check v-else class="tw:text-[18px]" />
          <span class="tw:mr-1! tw:text-[12px]! tw:px-2!">{{
            texts[type].btn
          }}</span>
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import type { GameConfirmType } from "~/composables/competition/types";

defineProps<{
  modelValue: boolean;
  type: GameConfirmType;
  target: any;
  loading: boolean;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
  (e: "confirm"): void;
}>();

const texts = {
  start: {
    title: "شروع بازی",
    text: "بازی در وضعیت «در حال برگزاری» قرار می‌گیرد.",
    btn: "شروع",
  },
  clear: {
    title: "پاک کردن نتیجه",
    text: "نتیجه‌ی بازی پاک می‌شود و بازی به حالت برنامه‌ریزی‌شده برمی‌گردد.",
    btn: "پاک کردن",
  },
  delete: {
    title: "حذف بازی",
    text: "آیا از حذف این بازی مطمئن هستید؟",
    btn: "حذف",
  },
} as const;
</script>
