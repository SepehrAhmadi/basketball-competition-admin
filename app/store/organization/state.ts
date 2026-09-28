import { ref } from "vue";

export function useOrganizationState() {
  const loading = ref<boolean>(false);

  const organizationList = ref<any[]>([]);
  const organizationListMeta = ref<{
    total: number;
    page: number;
    pageSize: number;
  } | null>(null);
  const organizationDetail = ref<any>(null);

  return {
    loading,
    organizationList,
    organizationListMeta,
    organizationDetail,
  };
}
