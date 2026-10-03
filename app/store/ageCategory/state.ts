import { ref } from "vue";

export function useAgeCategoryState() {
  const loading = ref<boolean>(false);

  const ageCategoryList = ref<any[]>([]);
  const ageCategoryListMeta = ref<{
    total: number;
    page: number;
    pageSize: number;
  } | null>(null);
  const ageCategoryDetail = ref<any>(null);

  const cutoffLoading = ref<boolean>(false);
  const cutoffList = ref<any[]>([]);
  const cutoffListMeta = ref<{
    total: number;
    page: number;
    pageSize: number;
  } | null>(null);
  const cutoffDetail = ref<any>(null);

  return {
    loading,
    ageCategoryList,
    ageCategoryListMeta,
    ageCategoryDetail,
    cutoffLoading,
    cutoffList,
    cutoffListMeta,
    cutoffDetail,
  };
}
