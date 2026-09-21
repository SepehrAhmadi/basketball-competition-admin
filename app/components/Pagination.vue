<script setup lang="ts">
interface Props {
  itemsLength: number;
}

defineProps<Props>();

const page = defineModel<number>("page", {
  default: 1,
});

const itemsPerPage = defineModel<number>("itemsPerPage", {
  default: 10,
});

const emit = defineEmits<{
  updateOptions: [
    options: {
      page: number;
      itemsPerPage: number;
    },
  ];
}>();

const paginationMeta = (p: number, pageSize: number, totalItems: number) => {
  if (!totalItems) return "نمایش 0 مورد";

  const start = (p - 1) * pageSize + 1;
  const end = Math.min(p * pageSize, totalItems);

  return `نمایش ${start} تا ${end} از ${totalItems} مورد`;
};

watch([page, itemsPerPage], ([newPage, newItemsPerPage]) => {
  emit("updateOptions", {
    page: newPage,
    itemsPerPage: newItemsPerPage,
  });
});
</script>

<template>
  <div>
    <v-divider />

    <div
      class="tw:px-3! tw:my-3! tw:flex tw:justify-between tw:items-center"
    >
      <div class="tw:text-[12px]">
        <slot
          name="pagination-info"
          :page="page"
          :items-per-page="itemsPerPage"
          :items-length="itemsLength"
        >
          {{ paginationMeta(page, itemsPerPage, itemsLength) }}
        </slot>
      </div>

      <div class="tw:flex tw:items-center tw:gap-2">
        <v-pagination
          v-if="itemsLength"
          v-model="page"
          :length="Math.ceil(itemsLength / itemsPerPage)"
          density="compact"
          total-visible="true"
        >
          <template #prev="slotProps">
            <v-btn
              variant="tonal"
              color="default"
              v-bind="slotProps"
              size="small"
              :icon="false"
            >
              قبلی
            </v-btn>
          </template>

          <template #next="slotProps">
            <v-btn
              variant="tonal"
              color="default"
              v-bind="slotProps"
              size="small"
              :icon="false"
            >
              بعدی
            </v-btn>
          </template>
        </v-pagination>
      </div>
    </div>
  </div>
</template>
