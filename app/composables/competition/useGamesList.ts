import { computed, reactive, ref } from "vue";
import type { CompetitionContext } from "./useCompetitionContext";
import type { GameFilterState } from "./types";

const defaultFilters = (): GameFilterState => ({
  search: "",
  groupId: null,
  status: null,
  leagueTeamId: null,
  dateFrom: "",
  dateTo: "",
  resultPending: false,
});

export function useGamesList(ctx: CompetitionContext) {
  const { selectedLeagueId, canGames, gameStore, dropdownStore, handlerStore } =
    ctx;

  const gameFilters = reactive<GameFilterState>(defaultFilters());
  const gamePage = ref<number>(1);
  const gamePageSize = ref<number>(12); // multiple of 2 and 3
  const gameTotal = computed(() => gameStore.gameListMeta?.total ?? 0);

  // Key of the last fetch; drops duplicate Pagination echoes.
  let lastGamesKey = `${gamePage.value}:${gamePageSize.value}`;
  let gameSearchTimeout: ReturnType<typeof setTimeout> | null = null;

  const loadGames = () => {
    const id = selectedLeagueId.value;
    if (!id || !canGames.value) return;
    lastGamesKey = `${gamePage.value}:${gamePageSize.value}`;

    const params: Record<string, any> = {
      page: gamePage.value,
      pageSize: gamePageSize.value,
    };
    if (gameFilters.search) params.search = gameFilters.search;
    if (gameFilters.groupId) params.groupId = gameFilters.groupId;
    if (gameFilters.status) params.status = gameFilters.status;
    if (gameFilters.leagueTeamId)
      params.leagueTeamId = gameFilters.leagueTeamId;
    if (gameFilters.dateFrom) params.dateFrom = gameFilters.dateFrom;
    if (gameFilters.dateTo) params.dateTo = gameFilters.dateTo;
    if (gameFilters.resultPending) params.resultPending = "true";

    return gameStore.getGames(id, params);
  };

  const onGamesOptionsChange = (options: {
    page: number;
    itemsPerPage: number;
  }) => {
    const key = `${options.page}:${options.itemsPerPage}`;
    if (key === lastGamesKey) return;
    gamePage.value = options.page;
    gamePageSize.value = options.itemsPerPage;
    loadGames();
  };

  const onGameFilterChange = () => {
    gamePage.value = 1;
    loadGames();
  };

  const onGameSearchChange = () => {
    if (gameSearchTimeout) clearTimeout(gameSearchTimeout);
    gameSearchTimeout = setTimeout(onGameFilterChange, 300);
  };

  const onGameGroupFilterChange = () => {
    const id = selectedLeagueId.value;
    if (id) {
      dropdownStore
        .getLeagueTeamDropdown(id, gameFilters.groupId)
        .then(() => {
          const ok = dropdownStore.leagueTeamsResult.some(
            (t: any) => t.value === gameFilters.leagueTeamId,
          );
          if (!ok && gameFilters.leagueTeamId !== null) {
            gameFilters.leagueTeamId = null;
            onGameFilterChange();
          }
        });
    }
    onGameFilterChange();
  };

  const onGameDateChange = () => {
    if (
      gameFilters.dateFrom &&
      gameFilters.dateTo &&
      gameFilters.dateFrom > gameFilters.dateTo // zero-padded Jalali strings compare correctly
    ) {
      handlerStore.setError("تاریخ شروع نمی‌تواند بعد از تاریخ پایان باشد.");
      return;
    }
    onGameFilterChange();
  };

  const resetGameFilters = () => {
    Object.assign(gameFilters, defaultFilters());
  };

  const resetGamePage = () => {
    gamePage.value = 1;
  };

  const teamItemProps = (t: any) => ({
    title: t.label,
    subtitle: t.organizationName ?? undefined,
  });

  const loadFilterOptions = () => {
    const id = selectedLeagueId.value;
    if (!id || !canGames.value) return;
    dropdownStore.getLeagueGroupDropdown(id);
    dropdownStore.getLeagueTeamDropdown(id, gameFilters.groupId);
  };

  // "Games of this group" button on a group card.
  const openForGroup = (groupId: number) => {
    resetGameFilters();
    gameFilters.groupId = groupId;
    gamePage.value = 1;
    ctx.activeView.value = "games"; // the view watcher loads the list
    const id = selectedLeagueId.value;
    if (id) dropdownStore.getLeagueTeamDropdown(id, groupId);
  };

  return {
    gameFilters,
    gamePage,
    gamePageSize,
    gameTotal,
    loadGames,
    onGamesOptionsChange,
    onGameFilterChange,
    onGameSearchChange,
    onGameGroupFilterChange,
    onGameDateChange,
    resetGameFilters,
    resetGamePage,
    teamItemProps,
    loadFilterOptions,
    openForGroup,
  };
}
