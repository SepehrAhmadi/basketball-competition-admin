import { computed, nextTick, reactive, ref, watch } from "vue";
import type { CompetitionContext } from "./useCompetitionContext";
import type { useGamesList } from "./useGamesList";
import type { useGroupsBoard } from "./useGroupsBoard";

const defaultGameForm = () => ({
  groupId: null as number | null,
  homeId: null as number | null,
  awayId: null as number | null,
  date: "",
  time: "",
});

export function useGameForm(
  ctx: CompetitionContext,
  games: ReturnType<typeof useGamesList>,
  board: ReturnType<typeof useGroupsBoard>,
) {
  const { groupStore, gameStore, handlerStore, selectedLeagueId } = ctx;

  const gameForm = reactive(defaultGameForm());
  const editingGame = ref<any>(null);
  const rescheduleSource = ref<any>(null);
  const pairCount = ref<number | null>(null);

  const gameFormMode = computed<"create" | "edit" | "reschedule">(() =>
    rescheduleSource.value
      ? "reschedule"
      : editingGame.value
        ? "edit"
        : "create",
  );
  const gameFormTitle = computed(
    () =>
      ({
        create: "ثبت بازی",
        edit: "ویرایش زمان‌بندی بازی",
        reschedule: "برگزاری مجدد بازی",
      })[gameFormMode.value],
  );

  // Pair quota hint (a hint only; the backend is the final authority).
  const pairMax = computed(() =>
    ctx.league.value?.groupRoundType === "DOUBLE_ROUND" ? 2 : 1,
  );
  const pairBlocked = computed(
    () => pairCount.value !== null && pairCount.value >= pairMax.value,
  );

  // Options come from groupStore (teams are loaded with the groups already).
  const activeTeams = (g: any) =>
    g.teams.filter((t: any) => t.teamStatus !== "DELETED");

  const formGroupOptions = computed(() =>
    groupStore.groupList.map((g: any) => ({
      value: g.id,
      title: activeTeams(g).length < 2 ? `${g.name} (کمتر از دو تیم)` : g.name,
      props: { disabled: activeTeams(g).length < 2 },
    })),
  );

  const formTeamOptions = computed(() => {
    const g = groupStore.groupList.find((x: any) => x.id === gameForm.groupId);
    return g
      ? activeTeams(g).map((t: any) => ({
          value: t.leagueTeamId,
          title: t.team.name,
        }))
      : [];
  });
  const homeOptions = computed(() =>
    formTeamOptions.value.filter((o: any) => o.value !== gameForm.awayId),
  );
  const awayOptions = computed(() =>
    formTeamOptions.value.filter((o: any) => o.value !== gameForm.homeId),
  );

  const resetGameForm = () => {
    editingGame.value = null;
    rescheduleSource.value = null;
    Object.assign(gameForm, defaultGameForm());
    pairCount.value = null;
  };

  const onFormGroupChange = () => {
    gameForm.homeId = null;
    gameForm.awayId = null;
    pairCount.value = null;
  };

  const scrollFormIntoView = () => {
    if (!ctx.isMobile.value) return;
    nextTick(() => {
      ctx.formAnchor.value?.$el?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  };

  const openEditSchedule = (game: any) => {
    resetGameForm();
    editingGame.value = game;
    gameForm.date = game.scheduledDate ?? "";
    gameForm.time = game.scheduledTime ?? "";
    scrollFormIntoView();
  };

  const openReschedule = (game: any) => {
    resetGameForm();
    rescheduleSource.value = game;
    gameForm.groupId = game.group?.id ?? null;
    gameForm.homeId = game.homeTeam.leagueTeamId;
    gameForm.awayId = game.awayTeam.leagueTeamId;
    scrollFormIntoView();
  };

  // After every successful game change: list, group counters/locks and dropdowns.
  const onGamesChanged = () => {
    games.loadGames();
    board.refreshData(true);
    games.loadFilterOptions();
  };

  const submitGameForm = () => {
    const leagueId = selectedLeagueId.value;
    if (!leagueId) return;

    const date = gameForm.date || null;
    const time = gameForm.time || null;
    if ((date === null) !== (time === null)) {
      handlerStore.setError("تاریخ و ساعت باید همزمان وارد شوند.");
      return;
    }

    // Edit: schedule only
    if (gameFormMode.value === "edit") {
      if (editingGame.value.scheduleLock) {
        handlerStore.setError(editingGame.value.scheduleLock.message);
        resetGameForm();
        return;
      }
      gameStore
        .updateGameSchedule(leagueId, editingGame.value.id, {
          scheduledDate: date,
          scheduledTime: time,
        })
        .then((ok: any) => {
          if (!ok) return;
          resetGameForm();
          onGamesChanged();
        });
      return;
    }

    // Create and reschedule
    if (!gameForm.groupId || !gameForm.homeId || !gameForm.awayId) {
      handlerStore.setError("لطفا تمام فیلدهای الزامی را پر کنید.");
      return;
    }
    gameStore
      .createGame(leagueId, {
        homeLeagueTeamId: gameForm.homeId,
        awayLeagueTeamId: gameForm.awayId,
        ...(date ? { scheduledDate: date, scheduledTime: time } : {}),
        ...(rescheduleSource.value
          ? { rescheduledFromGameId: rescheduleSource.value.id }
          : {}),
      })
      .then((created: any) => {
        if (!created) return;
        resetGameForm();
        onGamesChanged();
      });
  };

  watch(
    () => [gameForm.homeId, gameForm.awayId],
    ([home, away]) => {
      pairCount.value = null;
      const id = selectedLeagueId.value;
      if (!id || !home || !away || gameFormMode.value === "edit") return;
      gameStore
        .fetchPairGames(id, { leagueTeamId: home, page: 1, pageSize: 100 })
        .then((list: any[]) => {
          // Selection changed in the meantime: drop this result.
          if (gameForm.homeId !== home || gameForm.awayId !== away) return;
          pairCount.value = list.filter(
            (g: any) =>
              g.status !== "CANCELED" &&
              (g.homeTeam.leagueTeamId === away ||
                g.awayTeam.leagueTeamId === away),
          ).length;
        });
    },
  );

  return {
    gameForm,
    editingGame,
    rescheduleSource,
    gameFormMode,
    gameFormTitle,
    pairCount,
    pairMax,
    pairBlocked,
    formGroupOptions,
    homeOptions,
    awayOptions,
    onFormGroupChange,
    openEditSchedule,
    openReschedule,
    resetGameForm,
    submitGameForm,
    onGamesChanged,
    scrollFormIntoView,
  };
}
