import { computed, nextTick, ref, watch } from "vue";
import type { CompetitionContext } from "./useCompetitionContext";
import type { useGamesList } from "./useGamesList";
import type { GroupFormPayload } from "./types";

const UNASSIGNED_PAGE_SIZE = 100;

export function useGroupsBoard(
  ctx: CompetitionContext,
  games: ReturnType<typeof useGamesList>,
) {
  const { groupStore, leagueStore, selectedLeagueId, canGroups } = ctx;

  const unassignedQuery = ref<string>("");
  const unassignedFailed = ref<boolean>(false);
  let unassignedTimeout: ReturnType<typeof setTimeout> | null = null;

  const editingGroupId = ref<number | null>(null);
  const editingGroup = computed(
    () =>
      groupStore.groupList.find((g: any) => g.id === editingGroupId.value) ??
      null,
  );

  const deleteDialogOpen = ref<boolean>(false);
  const deleteTarget = ref<any>(null);

  const hasMoreUnassigned = computed(
    () =>
      groupStore.unassignedList.length <
      (groupStore.unassignedMeta?.total ?? 0),
  );

  const unassignedParams = (pageNo: number) => ({
    page: pageNo,
    pageSize: UNASSIGNED_PAGE_SIZE,
    ...(unassignedQuery.value ? { search: unassignedQuery.value } : {}),
  });

  const fetchGroups = (): Promise<boolean> => {
    const id = selectedLeagueId.value;
    if (!canGroups.value || !id) return Promise.resolve(false);
    return groupStore.getGroups(id);
  };

  const loadUnassigned = (): Promise<void> => {
    const id = selectedLeagueId.value;
    if (!id) return Promise.resolve();
    return groupStore
      .getUnassignedTeams(id, unassignedParams(1))
      .then((ok: boolean) => {
        unassignedFailed.value = !ok;
      });
  };

  const onUnassignedSearch = () => {
    if (unassignedTimeout) clearTimeout(unassignedTimeout);
    unassignedTimeout = setTimeout(() => {
      loadUnassigned();
    }, 300);
  };

  const loadMoreUnassigned = () => {
    const id = selectedLeagueId.value;
    if (!id) return;
    const previous = [...groupStore.unassignedList];
    const nextPage = (groupStore.unassignedMeta?.page ?? 1) + 1;
    groupStore
      .getUnassignedTeams(id, unassignedParams(nextPage))
      .then((ok: boolean) => {
        if (!ok) return;
        const seen = new Set(previous.map((t: any) => t.leagueTeamId));
        groupStore.unassignedList = [
          ...previous,
          ...groupStore.unassignedList.filter(
            (t: any) => !seen.has(t.leagueTeamId),
          ),
        ];
      });
  };

  // Silent refetch (no spinner, form kept) — also the recovery path after failures.
  const refreshData = (withLeague = false): Promise<void> => {
    const id = selectedLeagueId.value;
    if (!id) return Promise.resolve();
    const token = ctx.loadToken.value;
    const groupsTask = fetchGroups();
    const leagueTask: Promise<any> = withLeague
      ? leagueStore.getLeagueById(id).then((lg: any) => {
          if (token === ctx.loadToken.value && lg) ctx.league.value = lg;
        })
      : Promise.resolve();
    return Promise.all([groupsTask, leagueTask]).then(([ok]) => {
      if (token !== ctx.loadToken.value) return;
      if (ok && ctx.isGroupedFormat.value) return loadUnassigned();
    });
  };

  // Bumped on every return to create mode so the form remounts with empty fields.
  const formResetKey = ref(0);

  const openCreate = () => {
    editingGroupId.value = null;
    formResetKey.value++;
  };

  const openEdit = (group: any) => {
    editingGroupId.value = group.id;
    if (ctx.isMobile.value) {
      nextTick(() => {
        ctx.formAnchor.value?.$el?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      });
    }
  };

  const submitGroup = (payload: GroupFormPayload) => {
    const leagueId = selectedLeagueId.value;
    if (!leagueId) return;
    const { name, qualifiersOverride } = payload;

    const request = editingGroupId.value
      ? // Edit always sends both fields; null clears the override.
        groupStore.updateGroup(leagueId, editingGroupId.value, {
          name,
          qualifiersOverride,
        })
      : groupStore.createGroup(leagueId, {
          name,
          ...(qualifiersOverride !== null ? { qualifiersOverride } : {}),
        });

    request.then((ok: any) => {
      if (ok) openCreate();
      // Also surfaces a lock that appeared in the meantime.
      refreshData();
      games.loadFilterOptions();
    });
  };

  const requestDelete = (group: any) => {
    deleteTarget.value = group;
    deleteDialogOpen.value = true;
  };

  const confirmDelete = () => {
    const leagueId = selectedLeagueId.value;
    const target = deleteTarget.value;
    if (!leagueId || !target) return;

    groupStore.deleteGroup(leagueId, target.id).then((data: any) => {
      deleteDialogOpen.value = false;
      deleteTarget.value = null;
      if (data && editingGroupId.value === target.id) openCreate();
      refreshData();
      games.loadFilterOptions();
    });
  };

  const resetBoard = () => {
    unassignedQuery.value = "";
    unassignedFailed.value = false;
    deleteDialogOpen.value = false;
    deleteTarget.value = null;
    editingGroupId.value = null;
  };

  // Leave edit mode when a lock appears or the edited group disappears.
  watch(
    () => [groupStore.groupLock, groupStore.groupList],
    () => {
      if (!editingGroupId.value) return;
      const exists = groupStore.groupList.some(
        (g: any) => g.id === editingGroupId.value,
      );
      if (groupStore.groupLock || !exists) openCreate();
    },
  );

  return {
    unassignedQuery,
    unassignedFailed,
    editingGroupId,
    editingGroup,
    formResetKey,
    deleteDialogOpen,
    deleteTarget,
    hasMoreUnassigned,
    fetchGroups,
    loadUnassigned,
    onUnassignedSearch,
    loadMoreUnassigned,
    refreshData,
    openCreate,
    openEdit,
    submitGroup,
    requestDelete,
    confirmDelete,
    resetBoard,
  };
}
