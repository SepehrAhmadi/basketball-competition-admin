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
        <Pagination
          v-model:page="page"
          v-model:items-per-page="itemsPerPage"
          :items-length="itemsLength"
          @update-options="onOptionsChange"
        >
          <template #pagination-info="{ page: p, itemsPerPage: ipp, itemsLength: il }">
            <slot
              name="pagination-info"
              :page="p"
              :items-per-page="ipp"
              :items-length="il"
            />
          </template>
        </Pagination>
      </template>
    </v-data-table-server>
  </v-card>
</template>
