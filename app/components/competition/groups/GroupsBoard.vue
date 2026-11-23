<template>
  <div>
    <!-- ── Format not grouped ── -->
    <div
      v-if="!isGroupedFormat"
      class="tw:flex tw:flex-col tw:justify-center tw:items-center tw:gap-3 tw:py-16!"
    >
      <div class="tw:flex tw:items-center tw:gap-2">
        <icon-row-chart class="tw:text-color-lighter tw:text-[35px]" />
        <div class="tw:text-color-lighter tw:text-[14px]">
          {{
            format === "KNOCKOUT_ONLY"
              ? "این لیگ مرحله گروهی ندارد."
              : "ساختار مسابقات این لیگ هنوز تعیین نشده است."
          }}
        </div>
      </div>
      <v-btn
        v-if="!format && perms.leaguesUpdate"
        class="tw:bg-secondary-dark! tw:text-white! tw:rounded-md!"
        @click="selection.goEditStructure()"
      >
        <icon-edit-box class="tw:text-[18px]" />
        <span class="tw:mr-1!">ویرایش ساختار</span>
      </v-btn>
    </div>

    <!-- ── Board ── -->
    <ClientOnly v-else>
      <v-row>
        <!-- Unassigned column -->
        <v-col cols="12" md="4" lg="4" xl="3">
          <UnassignedTeamsPanel
            :teams="groupStore.unassignedList"
            :unassigned-count="groupStore.unassignedCount"
            :query="unassignedQuery"
            :loading="
              groupStore.unassignedLoading &&
              groupStore.unassignedList.length === 0
            "
            :failed="unassignedFailed"
            :has-more="hasMoreUnassigned"
            :loading-more="groupStore.unassignedLoading"
            :groups="groupStore.groupList"
            :can-edit="canEdit"
            :can-manage="canManage"
            :busy-team-id="busyTeamId"
            :is-dragging="isDragging"
            :is-mobile="isMobile"
            :no-registered-teams="summary.noRegisteredTeams"
            :can-view-league-teams="perms.leagueTeamsView"
            :league-id="league.id"
            @update:query="unassignedQuery = $event"
            @search="board.onUnassignedSearch()"
            @retry="board.loadUnassigned()"
            @load-more="board.loadMoreUnassigned()"
            @move="teamMove.moveTeam($event.leagueTeamId, $event.toGroupId)"
            @drag-start="isDragging = true"
            @drag-end="isDragging = false"
          />
        </v-col>

        <!-- Groups column -->
        <v-col cols="12" md="8" lg="8" xl="9">
          <div
            v-if="groupStore.groupList.length === 0"
            class="tw:flex tw:justify-center tw:items-center tw:gap-2 tw:py-16"
          >
            <icon-row-chart class="tw:text-color-lighter tw:text-[35px]" />
            <div class="tw:text-color-lighter tw:text-[14px]">
              هنوز گروهی ساخته نشده است.
            </div>
          </div>

          <v-row v-else dense>
            <v-col
              v-for="g in groupStore.groupList"
              :key="g.id"
              cols="12"
              xl="6"
            >
              <GroupCard
                :group="g"
                :groups="groupStore.groupList"
                :can-edit="canEdit"
                :can-manage="canManage"
                :can-edit-group="perms.groupsUpdate"
                :can-delete-group="perms.groupsDelete"
                :can-open-games="perms.gamesView"
                :edit-disabled="!!groupStore.groupLock || mutating"
                :delete-disabled="
                  !!g.lock || !!groupStore.groupLock || mutating
                "
                :busy-team-id="busyTeamId"
                :is-dragging="isDragging"
                :is-mobile="isMobile"
                :is-editing="editingGroupId === g.id"
                @move="teamMove.moveTeam($event.leagueTeamId, $event.toGroupId)"
                @open-games="games.openForGroup($event)"
                @edit="board.openEdit($event)"
                @delete="board.requestDelete($event)"
                @drag-start="isDragging = true"
                @drag-end="isDragging = false"
              />
            </v-col>
          </v-row>
        </v-col>
      </v-row>

      <template #fallback>
        <div class="tw:flex tw:justify-center tw:py-16">
          <v-progress-circular indeterminate color="primary" />
        </div>
      </template>
    </ClientOnly>

    <!-- ─── Delete Confirm Dialog ── -->
    <v-dialog
      v-model="deleteDialogOpen"
      max-width="400"
      dir="rtl"
      class="blur-dialog"
    >
      <v-card rounded="lg">
        <v-card-title
          class="tw:bg-secondary-dark tw:dark:bg-primary-dark! tw:mb-3!"
        >
          <div class="tw:flex tw:justify-between tw:items-center">
            <div class="tw:invisible">
              <v-btn
                icon
                variant="plain"
                size="x-small"
                @click="deleteDialogOpen = false"
              >
                <icon-close class="tw:text-[18px] tw:text-white!" />
              </v-btn>
            </div>
            <div class="tw:text-[14px]! tw:text-white">حذف گروه</div>
            <div>
              <v-btn
                icon
                variant="plain"
                size="x-small"
                aria-label="بستن"
                @click="deleteDialogOpen = false"
              >
                <icon-close class="tw:text-[18px] tw:text-white!" />
              </v-btn>
            </div>
          </div>
        </v-card-title>
        <v-card-text class="tw:text-[16px]! tw:text-center!">
          آیا از حذف «{{ deleteTarget?.name }}» مطمئن هستید؟
          <div
            v-if="deleteTarget?.teams?.length"
            class="tw:text-gray-600 tw:dark:text-gray-300 tw:text-[13px]! tw:mt-2!"
          >
            {{ deleteTarget.teams.length }} تیم این گروه بدون گروه می‌شوند.
          </div>
        </v-card-text>
        <v-card-actions class="tw:justify-end!">
          <v-btn
            variant="text"
            class="tw:text-[12px]!"
            @click="deleteDialogOpen = false"
          >
            انصراف
          </v-btn>
          <v-btn
            class="tw:bg-secondary-dark! tw:dark:bg-secondary-dark! tw:text-white! tw:rounded-md!"
            :loading="handlerStore.loadingBtn"
            :disabled="handlerStore.loadingBtn"
            @click="board.confirmDelete()"
          >
            <icon-trash class="tw:text-[18px]" />
            <span class="tw:mr-1! tw:text-[12px]! tw:px-2!">حذف</span>
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import GroupCard from "~/components/competition/groups/GroupCard.vue";
import UnassignedTeamsPanel from "~/components/competition/groups/UnassignedTeamsPanel.vue";
import { useCompetition } from "~/composables/competition/useCompetitionContext";

const competition = useCompetition();
// Refs must be top-level bindings to be unwrapped in the template.
const {
  groupStore,
  handlerStore,
  board,
  teamMove,
  games,
  selection,
  perms,
  canEdit,
  canManage,
  isMobile,
  busyTeamId,
  isDragging,
  mutating,
  isGroupedFormat,
  format,
  league,
  summary,
} = competition;
const {
  unassignedQuery,
  unassignedFailed,
  hasMoreUnassigned,
  editingGroupId,
  deleteDialogOpen,
  deleteTarget,
} = board;
</script>
