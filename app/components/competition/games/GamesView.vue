<template>
  <div>
    <v-row class="tw:my-2!">
      <!-- Filters card -->
      <v-col cols="12" xl="7">
        <GameFilters
          :filters="gameFilters"
          :groups="dropdownStore.leagueGroupsResult"
          :teams="dropdownStore.leagueTeamsResult"
          :statuses="dropdownStore.gameStatuses"
          :team-item-props="games.teamItemProps"
          @search="games.onGameSearchChange()"
          @group-change="games.onGameGroupFilterChange()"
          @filter-change="games.onGameFilterChange()"
          @date-change="games.onGameDateChange()"
        />
      </v-col>

      <!-- Summary card -->
      <v-col v-if="gameStore.gameSummary" cols="12" xl="5">
        <GamesSummary
          :summary="gameStore.gameSummary"
          :statuses="dropdownStore.gameStatuses"
        />
      </v-col>
    </v-row>

    <!-- Create lock -->
    <v-alert
      v-if="gameStore.gameLock"
      type="warning"
      variant="tonal"
      density="compact"
      class="tw:text-[12px]! tw:mb-4!"
    >
      {{ gameStore.gameLock.message }}
    </v-alert>

    <!-- Loading / empty -->
    <div
      v-if="gameStore.loading && gameStore.gameList.length === 0"
      class="tw:flex tw:justify-center tw:py-16"
    >
      <v-progress-circular indeterminate color="primary" />
    </div>

    <div
      v-else-if="gameStore.gameList.length === 0"
      class="tw:flex tw:justify-center tw:items-center tw:gap-2 tw:py-16"
    >
      <icon-row-chart class="tw:text-color-lighter tw:text-[35px]" />
      <div class="tw:text-color-lighter tw:text-[14px]">اطلاعاتی یافت نشد</div>
    </div>

    <!-- Game cards -->
    <v-row v-else dense>
      <v-col
        v-for="game in gameStore.gameList"
        :key="game.id"
        cols="12"
        md="6"
        lg="4"
      >
        <GameCard
          :game="game"
          :statuses="dropdownStore.gameStatuses"
          :can="{
            create: perms.gamesCreate,
            update: perms.gamesUpdate,
            result: perms.gamesResult,
            delete: perms.gamesDelete,
          }"
          :create-lock="gameStore.gameLock"
          :is-mobile="isMobile"
          @action="gameActions.handle($event.key, $event.game)"
        />
      </v-col>
    </v-row>

    <v-card v-if="gameTotal > gamePageSize" rounded="lg" class="tw:mt-4!">
      <Pagination
        v-model:page="gamePage"
        v-model:items-per-page="gamePageSize"
        :items-length="gameTotal"
        @update-options="games.onGamesOptionsChange"
      />
    </v-card>

    <GameResultDialog
      v-model="resultDialogOpen"
      :target="resultTarget"
      :loading="gameActions.loading.value"
      @submit="gameActions.submitResult($event)"
    />
    <GameCancelDialog
      v-model="cancelDialogOpen"
      :target="cancelTarget"
      :loading="gameActions.loading.value"
      @submit="gameActions.submitCancel($event)"
    />
    <GameConfirmDialog
      v-model="confirmOpen"
      :type="confirmType"
      :target="confirmTarget"
      :loading="gameActions.loading.value"
      @confirm="gameActions.confirmAction()"
    />
  </div>
</template>

<script setup lang="ts">
import GameFilters from "~/components/competition/games/GameFilters.vue";
import GamesSummary from "~/components/competition/games/GamesSummary.vue";
import GameCard from "~/components/competition/games/GameCard.vue";
import GameResultDialog from "~/components/competition/games/dialogs/GameResultDialog.vue";
import GameCancelDialog from "~/components/competition/games/dialogs/GameCancelDialog.vue";
import GameConfirmDialog from "~/components/competition/games/dialogs/GameConfirmDialog.vue";
import { useCompetition } from "~/composables/competition/useCompetitionContext";

const competition = useCompetition();
// Refs must be top-level bindings to be unwrapped in the template.
const { games, gameActions, gameStore, dropdownStore, perms, isMobile } =
  competition;
const { gameFilters, gamePage, gamePageSize, gameTotal } = games;
const {
  resultDialogOpen,
  resultTarget,
  cancelDialogOpen,
  cancelTarget,
  confirmOpen,
  confirmType,
  confirmTarget,
} = gameActions;
</script>
