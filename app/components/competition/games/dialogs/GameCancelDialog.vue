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
          <div class="tw:text-[14px]! tw:text-white">لغو بازی</div>
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
      <v-card-text>
        <div v-if="target" class="tw:text-[13px] tw:text-center tw:mb-4!">
          لغو بازی «{{ target.homeTeam.team.name }} -
          {{ target.awayTeam.team.name }}»
        </div>
        <v-textarea
          v-model="reason"
          rows="2"
          auto-grow
          variant="outlined"
          density="compact"
          hide-details
          dir="rtl"
        >
          <template #label>
            <span class="tw:text-[12px]">دلیل لغو (اختیاری)</span>
          </template>
        </v-textarea>
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
          @click="emit('submit', reason)"
        >
          <icon-check class="tw:text-[18px]" />
          <span class="tw:mr-1! tw:text-[12px]! tw:px-2!">تأیید لغو</span>
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
const props = defineProps<{
  modelValue: boolean;
  target: any;
  loading: boolean;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
  (e: "submit", reason: string): void;
}>();

const reason = ref("");

watch(
  () => props.modelValue,
  (open) => {
    if (open) reason.value = "";
  },
);
</script>
