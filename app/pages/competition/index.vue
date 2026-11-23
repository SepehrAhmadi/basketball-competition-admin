<template>
  <div dir="rtl">
    <!-- ── competition.view guard ── -->
    <v-row v-if="!perms.competitionView">
      <v-col cols="12">
        <v-card class="tw:rounded-xl!">
          <v-card-text
            class="tw:flex tw:flex-col tw:items-center tw:justify-center tw:gap-2 tw:py-16!"
          >
            <icon-lock class="tw:text-[35px] tw:text-color-lighter" />
            <div class="tw:text-color-lighter tw:text-[14px]">
              شما دسترسی لازم برای مشاهده این بخش را ندارید.
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <template v-else>
      <LeagueToolbar
        :model-value="selectedLeagueId"
        :items="selection.leagueOptions.value"
        :select-disabled="mutating"
        :refresh-disabled="!selectedLeagueId || mutating"
        @select="selection.onLeagueSelect($event)"
        @search="selection.onLeagueSearch($event)"
        @refresh="selection.onRefresh()"
      />

      <!-- ── No league selected ── -->
      <div
        v-if="pageState === 'idle'"
        class="tw:flex tw:justify-center tw:items-center tw:gap-2 tw:py-16!"
      >
        <icon-row-chart class="tw:text-color-lighter tw:text-[35px]" />
        <div class="tw:text-color-lighter tw:text-[14px]">
          برای شروع، یک لیگ را انتخاب کنید.
        </div>
      </div>

      <!-- ── Loading ── -->
      <div
        v-else-if="pageState === 'loading'"
        class="tw:flex tw:justify-center tw:py-16"
      >
        <v-progress-circular indeterminate color="primary" />
      </div>

      <!-- ── Load failed / not found ── -->
      <div
        v-else-if="pageState === 'error'"
        class="tw:flex tw:flex-col tw:justify-center tw:items-center tw:gap-3 tw:py-16!"
      >
        <div class="tw:flex tw:items-center tw:gap-2">
          <icon-row-chart class="tw:text-color-lighter tw:text-[35px]" />
          <div class="tw:text-color-lighter tw:text-[14px]">
            دریافت اطلاعات لیگ ناموفق بود یا لیگ مورد نظر یافت نشد.
          </div>
        </div>
        <v-btn
          class="tw:bg-secondary-dark! tw:text-white! tw:rounded-md!"
          @click="selection.loadLeague(selectedLeagueId)"
        >
          <icon-refresh class="tw:text-[18px]" />
          <span class="tw:mr-1!">تلاش دوباره</span>
        </v-btn>
      </div>

      <template v-else-if="pageState === 'ready' && league">
        <v-row>
          <v-col cols="12" xl="7">
            <LeagueInfoCard
              v-model="activeView"
              :league="league"
              :format="format"
              :is-grouped-format="isGroupedFormat"
              :has-both-views="hasBothViews"
              :format-label="formatLabel"
              :round-type-label="roundTypeLabel"
              :qualifiers-label="qualifiersLabel"
              :default-qualifiers="defaultQualifiers"
              :min-birth-date="minBirthDate"
            />
          </v-col>
          <v-col cols="12" xl="5">
            <CompetitionSidePanel />
          </v-col>
        </v-row>

        <!-- ── No accessible view ── -->
        <div
          v-if="!canGroups && !canGames"
          class="tw:flex tw:justify-center tw:items-center tw:gap-2 tw:py-16!"
        >
          <icon-lock class="tw:text-color-lighter tw:text-[35px]" />
          <div class="tw:text-color-lighter tw:text-[14px]">
            برای مشاهده‌ی بخش‌های این صفحه دسترسی لازم را ندارید.
          </div>
        </div>

        <GroupsBoard v-else-if="activeView === 'groups'" />
        <GamesView v-else-if="activeView === 'games' && canGames" />
      </template>
    </template>
  </div>
</template>

<script setup lang="ts">
import {
  createCompetitionContext,
  provideCompetition,
} from "~/composables/competition/useCompetitionContext";
import { useGamesList } from "~/composables/competition/useGamesList";
import { useGroupsBoard } from "~/composables/competition/useGroupsBoard";
import { useTeamMove } from "~/composables/competition/useTeamMove";
import { useGameForm } from "~/composables/competition/useGameForm";
import { useGameActions } from "~/composables/competition/useGameActions";
import { useLeagueSelection } from "~/composables/competition/useLeagueSelection";
import LeagueToolbar from "~/components/competition/league/LeagueToolbar.vue";
import LeagueInfoCard from "~/components/competition/league/LeagueInfoCard.vue";
import CompetitionSidePanel from "~/components/competition/CompetitionSidePanel.vue";
import GroupsBoard from "~/components/competition/groups/GroupsBoard.vue";
import GamesView from "~/components/competition/games/GamesView.vue";

const { setPageTitle } = usePageTitle();
watchEffect(() => {
  setPageTitle("مدیریت مسابقات");
});

const ctx = createCompetitionContext();
const games = useGamesList(ctx);
const board = useGroupsBoard(ctx, games);
const teamMove = useTeamMove(ctx, board);
const gameForm = useGameForm(ctx, games, board);
const gameActions = useGameActions(ctx, games, gameForm);
const selection = useLeagueSelection(ctx, {
  games,
  board,
  gameForm,
  gameActions,
});

provideCompetition({
  ...ctx,
  games,
  board,
  teamMove,
  gameForm,
  gameActions,
  selection,
});

// Refs must be top-level bindings to be unwrapped in the template.
const {
  perms,
  selectedLeagueId,
  league,
  pageState,
  activeView,
  mutating,
  format,
  isGroupedFormat,
  hasBothViews,
  formatLabel,
  roundTypeLabel,
  qualifiersLabel,
  defaultQualifiers,
  minBirthDate,
  canGroups,
  canGames,
} = ctx;

watch(activeView, (view) => {
  // The hidden form must never keep stale edit data.
  gameForm.resetGameForm();
  board.openCreate();
  if (view === "games" && selectedLeagueId.value) {
    games.loadGames();
    games.loadFilterOptions();
  }
});

onMounted(() => selection.init());
</script>

<style>
.team-ghost {
  opacity: 0.5;
}
.compact-chips > .v-col {
  padding: 2px !important;
}
.compact-chips > .v-col > div {
  padding: 4px 8px !important;
  gap: 6px !important;
  min-height: 34px !important;
}
</style>
