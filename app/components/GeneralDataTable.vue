<script setup lang="ts">
import { computed } from "vue";
import { useDisplay } from "vuetify";

interface Props {
  headers: any[];
  items: any[];
  itemsLength: number;
  loading?: boolean;
  height?: string | number;
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  height: undefined,
});

const { name } = useDisplay();

const getDynamicHeight = (breakpoint: string): number => {
  switch (breakpoint) {
    case "xxl":
    case "xl":
      return 685;
    case "lg":
      return 375;
    case "md":
      return 400;
    case "sm":
      return 300;
    case "xs":
    default:
      return 300;
  }
};

const tableHeight = computed<string | number>(() => {
  if (props.height !== undefined) return props.height;
  return getDynamicHeight(name.value);
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
      :height="tableHeight"
      fixed-header
      fixed-footer
      hide-default-footer
      class="general-data-table tw:bg-white! tw:dark:bg-primary-dark!"
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

<style>
/* tiny scrollbar for data table */
.general-data-table .v-table__wrapper::-webkit-scrollbar {
  width: 4px;
  height: 4px;
}

.general-data-table .v-table__wrapper::-webkit-scrollbar-track {
  background: transparent;
}

.general-data-table .v-table__wrapper::-webkit-scrollbar-thumb {
  background-color: rgba(100, 116, 139, 0.5);
  border-radius: 9999px;
}

.general-data-table .v-table__wrapper::-webkit-scrollbar-thumb:hover {
  background-color: rgba(100, 116, 139, 0.8);
}

.general-data-table .v-table__wrapper::-webkit-scrollbar-corner {
  background: transparent;
}

/* firefox */
.general-data-table .v-table__wrapper {
  scrollbar-width: thin;
  scrollbar-color: rgba(100, 116, 139, 0.5) transparent;
}
</style>
