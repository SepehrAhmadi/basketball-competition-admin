import { computed, inject, provide, ref } from "vue";
import { useDisplay } from "vuetify";
import { useGroupStore } from "~/store/group";
import { useGameStore } from "~/store/game";
import { useLeagueStore } from "~/store/league";
import { useHandlerStore } from "~/store/handler";
import { useDeopdownStore } from "~/store/dropdown";
import type { CompetitionView, PageState } from "./types";

export function createCompetitionContext() {
  const groupStore = useGroupStore();
  const gameStore = useGameStore();
  const leagueStore = useLeagueStore();
  const dropdownStore = useDeopdownStore();
  const handlerStore = useHandlerStore();
  const { hasPermission } = usePermission();
  const { mobile } = useDisplay();

  const selectedLeagueId = ref<number | null>(null);
  const league = ref<any>(null);
  const pageState = ref<PageState>("idle");
  const mutating = ref<boolean>(false);
  const busyTeamId = ref<number | null>(null);
  const isDragging = ref<boolean>(false);
  const formAnchor = ref<any>(null);
  const loadToken = ref<number>(0);

  const isMobile = computed(() => mobile.value);

  const perms = computed(() => ({
    competitionView: hasPermission("competition.view"),
    groupsView: hasPermission("groups.view"),
    groupsCreate: hasPermission("groups.create"),
    groupsUpdate: hasPermission("groups.update"),
    groupsDelete: hasPermission("groups.delete"),
    gamesView: hasPermission("games.view"),
    gamesCreate: hasPermission("games.create"),
    gamesUpdate: hasPermission("games.update"),
    gamesResult: hasPermission("games.result"),
    gamesDelete: hasPermission("games.delete"),
    leaguesUpdate: hasPermission("leagues.update"),
    leagueTeamsView: hasPermission("league-teams.view"),
  }));

  const activeView = ref<CompetitionView>(
    perms.value.groupsView ? "groups" : "games",
  );

  const canGroups = computed(() => perms.value.groupsView);
  const canGames = computed(() => perms.value.gamesView);
  const hasBothViews = computed(() => canGroups.value && canGames.value);

  const format = computed<string | null>(
    () => league.value?.format ?? groupStore.groupLeague?.format ?? null,
  );
  const defaultQualifiers = computed(
    () =>
      league.value?.defaultQualifiersPerGroup ??
      groupStore.groupLeague?.defaultQualifiersPerGroup ??
      null,
  );
  const isGroupedFormat = computed(
    () =>
      format.value === "GROUPS_KNOCKOUT" ||
      format.value === "SINGLE_GROUP_KNOCKOUT",
  );
  const isSingleGroup = computed(
    () => format.value === "SINGLE_GROUP_KNOCKOUT",
  );

  const canManage = computed(
    () =>
      perms.value.groupsUpdate &&
      groupStore.groupLock === null &&
      isGroupedFormat.value,
  );
  const canEdit = computed(() => canManage.value && !mutating.value);

  const formatLabel = computed(
    () =>
      dropdownStore.leagueFormats.find((f: any) => f.value === format.value)
        ?.label ??
      format.value ??
      "—",
  );
  const roundTypeLabel = computed(
    () =>
      dropdownStore.groupRoundTypes.find(
        (r: any) => r.value === league.value?.groupRoundType,
      )?.label ??
      league.value?.groupRoundType ??
      "—",
  );
  const qualifiersLabel = computed(() =>
    isSingleGroup.value ? "تعداد کل صعودکننده‌ها" : "تعداد صعودکننده هر گروه",
  );
  const qualifiersPlaceholder = computed(() => {
    const d = defaultQualifiers.value;
    return d != null ? `خالی = پیش‌فرض لیگ (${d})` : "";
  });
  const minBirthDate = computed(
    () =>
      league.value?.minBirthDate ??
      league.value?.ageCategoryCutoff?.minBirthDate ??
      "—",
  );

  const groupCount = computed(() => groupStore.groupList.length);
  const assignedCount = computed(() =>
    groupStore.groupList.reduce(
      (s: number, g: any) => s + (g.teamsCount ?? 0),
      0,
    ),
  );
  const totalQualifiers = computed<number | string>(() => {
    if (groupStore.groupList.some((g: any) => g.qualifiers == null)) return "—";
    return groupStore.groupList.reduce(
      (s: number, g: any) => s + g.qualifiers,
      0,
    );
  });
  const noRegisteredTeams = computed(
    () => (league.value?.teamsCount ?? 0) === 0 && assignedCount.value === 0,
  );

  const summary = computed(() => ({
    groupCount: groupCount.value,
    assignedCount: assignedCount.value,
    totalQualifiers: totalQualifiers.value,
    noRegisteredTeams: noRegisteredTeams.value,
  }));

  const isDraggable = (team: any) =>
    canEdit.value && team.teamStatus !== "DELETED";

  return {
    selectedLeagueId,
    league,
    pageState,
    activeView,
    mutating,
    busyTeamId,
    isDragging,
    formAnchor,
    loadToken,
    groupStore,
    gameStore,
    leagueStore,
    dropdownStore,
    handlerStore,
    isMobile,
    perms,
    canGroups,
    canGames,
    hasBothViews,
    format,
    defaultQualifiers,
    isGroupedFormat,
    isSingleGroup,
    canManage,
    canEdit,
    formatLabel,
    roundTypeLabel,
    qualifiersLabel,
    qualifiersPlaceholder,
    minBirthDate,
    groupCount,
    assignedCount,
    totalQualifiers,
    noRegisteredTeams,
    summary,
    isDraggable,
  };
}

export type CompetitionContext = ReturnType<typeof createCompetitionContext>;

export const COMPETITION_KEY = Symbol("competition");

export function provideCompetition(api: any) {
  provide(COMPETITION_KEY, api);
}

export function useCompetition<T = any>(): T {
  const api = inject<T | undefined>(COMPETITION_KEY, undefined);
  if (!api) throw new Error("Competition context is not provided");
  return api;
}
