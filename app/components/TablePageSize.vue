<script setup lang="ts">
const model = defineModel<number>({
  default: 10,
});

withDefaults(
  defineProps<{
    label?: string;
    options?: number[];
  }>(),
  {
    label: "تعداد",
    options: () => [10, 25, 50],
  },
);
</script>

<template>
  <v-select
    v-model="model"
    :items="options"
    variant="outlined"
    density="compact"
    hide-details
  >
    <template #label>
      <span class="tw:text-[12px]">
        {{ label }}
      </span>
    </template>
  </v-select>
</template>
