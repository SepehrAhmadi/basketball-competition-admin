import { ref } from "vue";

type ListMeta = {
  total: number;
  page: number;
  pageSize: number;
};

export function useGroupState() {
  const loading = ref<boolean>(false);

  const groupList = ref<any[]>([]);
  const groupLeague = ref<any>(null); // { id, format, defaultQualifiersPerGroup }
  const groupLock = ref<any>(null);
  const groupIssues = ref<any[]>([]);
  const unassignedCount = ref<number>(0);

  const unassignedList = ref<any[]>([]);
  const unassignedMeta = ref<ListMeta | null>(null);
  const unassignedLoading = ref<boolean>(false);

  return {
    loading,
    groupList,
    groupLeague,
    groupLock,
    groupIssues,
    unassignedCount,
    unassignedList,
    unassignedMeta,
    unassignedLoading,
  };
}
