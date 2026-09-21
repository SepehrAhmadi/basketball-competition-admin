import { ref } from "vue";

export function useSeasonState() {
  const loading = ref<boolean>(false);

  const seasonList = ref<any[]>([]);
  const seasonListMeta = ref<{
    total: number;
    page: number;
    pageSize: number;
  } | null>(null);
  const seasonDetail = ref<any>(null);

  return {
    loading,
    seasonList,
    seasonListMeta,
    seasonDetail,
  };
}
