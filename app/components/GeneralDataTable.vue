<script setup lang="ts">
interface Props {
  headers: any[];
  items: any[];
  itemsLength: number;
  loading?: boolean;
  height?: string | number;
}

withDefaults(defineProps<Props>(), {
  loading: false,
  height: 720,
});

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

const paginationMeta = (page: number, pageSize: number, totalItems: number) => {
  if (!totalItems) return "نمایش 0 مورد";

  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, totalItems);

  return `نمایش ${start} تا ${end} از ${totalItems} مورد`;
};

const onOptionsChange = (options: { page: number; itemsPerPage: number }) => {
  page.value = options.page;
  itemsPerPage.value = options.itemsPerPage;

  emit("updateOptions", options);
};
</script>

<template>
  <v-card class="tw:rounded-xl!">
    <v-data-table-server
      v-model:page="page"
      v-model:items-per-page="itemsPerPage"
      :items-length="itemsLength"
      :items="items"
      :headers="headers"
      :loading="loading"
      :height="height"
      fixed-header
      fixed-footer
      hide-default-footer
      class="tw:bg-white! tw:dark:bg-primary-dark!"
      @update:options="onOptionsChange"
    >

      <template #item="slotProps">
        <slot name="item" v-bind="slotProps" />
      </template>

      <template #no-data>
        <slot name="no-data">
          <div
            class="tw:h-full! tw:flex tw:justify-center tw:items-center tw:gap-2"
          >
            <icon-row-chart class="tw:text-color-lighter tw:text-[35px]" />

            <div class="tw:text-color-lighter tw:text-[14px]">
              اطلاعاتی یافت نشد
            </div>
          </div>
        </slot>
      </template>

      <template #bottom>
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
      </template>
    </v-data-table-server>
  </v-card>
</template>
