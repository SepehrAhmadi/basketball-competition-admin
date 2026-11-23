<template>
  <div
    class="tw:inline-flex tw:items-stretch tw:overflow-hidden tw:rounded-lg tw:border tw:border-gray-300 tw:dark:border-gray-600 tw:me-auto"
  >
    <v-btn
      variant="text"
      rounded="0"
      class="tw:px-6! tw:w-6!"
      :class="
        modelValue === 'groups' ? 'tw:bg-secondary-dark! tw:text-white!' : ''
      "
      @click="emit('update:modelValue', 'groups')"
    >
      <icon-layer class="tw:text-[16px]" />
      <span class="tw:text-[12px] tw:ms-1!">گروه‌ها</span>
    </v-btn>
    <v-btn
      variant="text"
      rounded="0"
      class="tw:px-6! tw:w-6! tw:border-s! tw:border-gray-300! tw:dark:border-gray-600!"
      :class="
        modelValue === 'games' ? 'tw:bg-secondary-dark! tw:text-white!' : ''
      "
      @click="emit('update:modelValue', 'games')"
    >
      <icon-cup class="tw:text-[16px]" />
      <span class="tw:text-[12px] tw:ms-1!">بازی‌ها</span>
    </v-btn>
  </div>
</template>

<script setup lang="ts">
import type { CompetitionView } from "~/composables/competition/types";

defineProps<{ modelValue: CompetitionView }>();
const emit = defineEmits<{
  (e: "update:modelValue", value: CompetitionView): void;
}>();
</script>
