import { computed, watch } from "vue";
import type { CompetitionContext } from "./useCompetitionContext";
import type { useGamesList } from "./useGamesList";
import type { useGroupsBoard } from "./useGroupsBoard";
import type { useGameForm } from "./useGameForm";
import type { useGameActions } from "./useGameActions";

export function useLeagueSelection(
  ctx: CompetitionContext,
  deps: {
    games: ReturnType<typeof useGamesList>;
    board: ReturnType<typeof useGroupsBoard>;
    gameForm: ReturnType<typeof useGameForm>;
    gameActions: ReturnType<typeof useGameActions>;
  },
) {
  const { games, board, gameForm, gameActions } = deps;
  const {
    groupStore,
    gameStore,
    leagueStore,
    dropdownStore,
    selectedLeagueId,
    league,
    pageState,
  } = ctx;

  const route = useRoute();
  const router = useRouter();

  let leagueSearchTimeout: ReturnType<typeof setTimeout> | null = null;
  let loadedLeagueId: number | null = null;

  const leagueLabel = (item: any) =>
    `${item.name} — ${item.season?.name ?? "—"} — ${item.ageCategory?.name ?? "—"}`;

  const leagueOptions = computed(() => {
    const list = [...dropdownStore.leaguesResult];
    if (
      league.value &&
      selectedLeagueId.value === league.value.id &&
      !list.some((o: any) => o.value === league.value.id)
    ) {
      list.unshift({
        value: league.value.id,
        label: leagueLabel(league.value),
        status: league.value.status,
      });
    }
    return list;
  });

  const routeLeagueId = computed<number | null>(() => {
    const n = Number(route.query.leagueId);
    return Number.isInteger(n) && n > 0 ? n : null;
  });

  const loadLeagueOptions = (search?: string) =>
    dropdownStore.getLeagueDropdown({
      page: 1,
      pageSize: 20,
      ...(search ? { search } : {}),
    });

  const onLeagueSearch = (text: string) => {
    // Vuetify emits the chosen title right after a selection — ignore it.
    const selected = leagueOptions.value.find(
      (o: any) => o.value === selectedLeagueId.value,
    );
    if (selected && text === selected.label) return;

    if (leagueSearchTimeout) clearTimeout(leagueSearchTimeout);
    leagueSearchTimeout = setTimeout(() => {
      loadLeagueOptions(text);
    }, 300);
  };

  const onLeagueSelect = (id: number | null) => {
    router.replace({ query: id ? { leagueId: String(id) } : {} });
  };

  const resetLocal = () => {
    league.value = null;
    groupStore.groupList = [];
    groupStore.groupLeague = null;
    groupStore.groupLock = null;
    groupStore.groupIssues = [];
    groupStore.unassignedCount = 0;
    groupStore.unassignedList = [];
    groupStore.unassignedMeta = null;
    board.resetBoard();
    ctx.mutating.value = false;
    ctx.busyTeamId.value = null;
    gameActions.closeAll();
    gameStore.resetGames();
    dropdownStore.clearLeagueDropdowns();
    games.resetGameFilters();
    games.resetGamePage();
    gameForm.resetGameForm();
    board.openCreate();
  };

  const loadLeague = (id: number | null) => {
    const token = ++ctx.loadToken.value;
    loadedLeagueId = id;
    selectedLeagueId.value = id;
    resetLocal();

    if (!id) {
      pageState.value = "idle";
      return;
    }

    pageState.value = "loading";
    // Groups are only requested when the user may view them.
    Promise.all([
      leagueStore.getLeagueById(id),
      ctx.canGroups.value ? groupStore.getGroups(id) : Promise.resolve(true),
    ]).then(([lg, ok]) => {
      if (token !== ctx.loadToken.value) return;
      if (!lg || !ok) {
        pageState.value = "error";
        return;
      }
      league.value = lg;
      pageState.value = "ready";
      if (ctx.canGroups.value && ctx.isGroupedFormat.value)
        board.loadUnassigned();
      if (ctx.activeView.value === "games") games.loadGames();
      games.loadFilterOptions();
    });
  };

  const onRefresh = () => {
    board.refreshData(true);
  };

  const goEditStructure = () => {
    if (!league.value) return;
    navigateTo(`/leagues?editLeagueId=${league.value.id}&tab=format`);
  };

  const init = () => {
    if (!ctx.perms.value.competitionView) return;

    if (ctx.canGames.value && dropdownStore.gameStatuses.length === 0) {
      dropdownStore.getGameStatuses();
    }
    if (dropdownStore.leagueFormats.length === 0) {
      dropdownStore.getLeagueFormats();
    }
    if (dropdownStore.groupRoundTypes.length === 0) {
      dropdownStore.getGroupRoundTypes();
    }

    loadLeagueOptions();
    if (routeLeagueId.value) loadLeague(routeLeagueId.value);
  };

  watch(routeLeagueId, (id) => {
    if (!ctx.perms.value.competitionView) return;
    if (id === loadedLeagueId) return;
    loadLeague(id);
  });

  return {
    leagueOptions,
    loadLeagueOptions,
    onLeagueSearch,
    onLeagueSelect,
    resetLocal,
    loadLeague,
    onRefresh,
    goEditStructure,
    init,
  };
}
