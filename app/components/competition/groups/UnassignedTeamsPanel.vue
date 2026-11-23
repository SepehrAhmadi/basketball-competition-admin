<template>
  <v-card rounded="lg" class="tw:p-4! tw:md:sticky">
    <div class="tw:flex tw:items-center tw:justify-between tw:gap-2 tw:mb-3!">
      <div class="tw:text-[14px] tw:font-bold">تیم‌های بدون گروه</div>
      <v-chip size="x-small" variant="tonal">{{ unassignedCount }} تیم</v-chip>
    </div>

    <v-text-field
      :model-value="query"
      variant="outlined"
      density="compact"
      hide-details
      dir="rtl"
      class="tw:mb-3!"
      @update:model-value="onQueryInput"
    >
      <template #label>
        <span class="tw:text-[12px]">جستجوی نام تیم</span>
      </template>
      <template #prepend-inner>
        <icon-magnify class="tw:text-[18px] tw:text-color-lighter" />
      </template>
    </v-text-field>

    <div v-if="loading" class="tw:flex tw:justify-center tw:py-8">
      <v-progress-circular indeterminate color="primary" />
    </div>

    <div
      v-else-if="failed"
      class="tw:flex tw:flex-col tw:items-center tw:gap-3 tw:py-8"
    >
      <div class="tw:text-color-lighter tw:text-[14px]">
        دریافت تیم‌ها ناموفق بود.
      </div>
      <v-btn
        class="tw:bg-secondary-dark! tw:text-white! tw:rounded-md!"
        @click="emit('retry')"
      >
        <icon-refresh class="tw:text-[18px]" />
        <span class="tw:mr-1!">تلاش دوباره</span>
      </v-btn>
    </div>

    <div
      v-else
      class="tw:max-h-[50vh] tw:md:max-h-[70vh] tw:overflow-y-auto"
    >
      <draggable
        :model-value="teams"
        item-key="leagueTeamId"
        group="teams"
        :sort="false"
        :disabled="!canEdit"
        filter=".no-drag"
        :animation="150"
        :delay="150"
        :delay-on-touch-only="true"
        ghost-class="team-ghost"
        class="tw:flex tw:flex-col tw:gap-2 tw:min-h-20"
        @change="onDragChange"
        @start="emit('drag-start')"
        @end="emit('drag-end')"
      >
        <template #item="{ element }">
          <div
            :class="[
              teamRowClass,
              isRowDraggable(element) ? 'tw:cursor-grab' : 'no-drag',
              busyTeamId === element.leagueTeamId ? 'no-drag' : '',
            ]"
          >
            <div
              class="tw:flex tw:justify-start tw:items-center tw:gap-2 tw:min-w-0"
            >
              <v-avatar size="50" class="tw:bg-secondary-dark! tw:p-1!">
                <v-img
                  v-if="element.team?.logoUrl"
                  :src="element.team.logoUrl"
                  cover
                />
                <v-img v-else :src="defaultTeamLogo" cover />
              </v-avatar>
              <div class="tw:min-w-0">
                <div class="tw:text-[13px] tw:font-medium tw:truncate">
                  {{ element.team?.name ?? "—" }}
                </div>
                <div class="tw:text-[11px] tw:text-color-lighter tw:truncate">
                  {{ element.organization?.name ?? "—" }}
                </div>
              </div>
            </div>

            <v-progress-circular
              v-if="busyTeamId === element.leagueTeamId"
              indeterminate
              size="18"
              width="2"
              color="primary"
            />
            <GroupTeamRowMenu
              v-else-if="canManage"
              mode="assign"
              :league-team-id="element.leagueTeamId"
              :groups="groups"
              :can-edit="canEdit"
              :no-groups="groups.length === 0"
              @move="emit('move', $event)"
            />
          </div>
        </template>
        <template #footer>
          <div
            v-if="teams.length === 0"
            class="tw:text-center tw:text-color-lighter tw:text-[13px] tw:py-7!"
          >
            <template v-if="query">موردی یافت نشد</template>
            <template v-else-if="noRegisteredTeams">
              <div>هنوز تیمی در این لیگ ثبت‌نام نشده است.</div>
              <v-btn
                v-if="canViewLeagueTeams"
                size="small"
                variant="outlined"
                class="tw:mt-3!"
                @click="navigateTo(`/leagues/${leagueId}/teams`)"
              >
                <icon-users class="tw:text-[16px]" />
                <span class="tw:mr-1!">مدیریت تیم‌های لیگ</span>
              </v-btn>
            </template>
            <template v-else>همه تیم‌ها در گروه قرار گرفته‌اند.</template>
          </div>
        </template>
      </draggable>

      <div v-if="hasMore" class="tw:flex tw:justify-center tw:mt-3!">
        <v-btn
          size="small"
          variant="text"
          class="tw:text-[12px]!"
          :loading="loadingMore"
          @click="emit('load-more')"
        >
          نمایش بیشتر
        </v-btn>
      </div>
    </div>
  </v-card>
</template>

<script setup lang="ts">
import draggable from "vuedraggable";
import GroupTeamRowMenu from "~/components/competition/groups/GroupTeamRowMenu.vue";
import defaultTeamLogo from "~/assets/image/icon/team.png";
import type { MoveRequest } from "~/composables/competition/types";

const props = defineProps<{
  teams: any[];
  unassignedCount: number;
  query: string;
  loading: boolean;
  failed: boolean;
  hasMore: boolean;
  loadingMore: boolean;
  groups: any[];
  canEdit: boolean;
  canManage: boolean;
  busyTeamId: number | null;
  isDragging: boolean;
  isMobile: boolean;
  noRegisteredTeams: boolean;
  canViewLeagueTeams: boolean;
  leagueId: number;
}>();

const emit = defineEmits<{
  (e: "update:query", text: string): void;
  (e: "search"): void;
  (e: "retry"): void;
  (e: "load-more"): void;
  (e: "move", payload: MoveRequest): void;
  (e: "drag-start"): void;
  (e: "drag-end"): void;
}>();

const teamRowClass =
  "tw:group tw:flex tw:justify-between tw:items-center tw:gap-2 tw:rounded-lg! tw:p-3! tw:shadow-none! tw:border! tw:border-gray-300! tw:dark:border-gray-600!";

const isRowDraggable = (team: any) =>
  props.canEdit && team.teamStatus !== "DELETED";

const onQueryInput = (text: string) => {
  emit("update:query", text);
  emit("search");
};

// Sorting is disabled (:sort="false"); ignore within-list reorder events.
const onDragChange = (evt: any) => {
  if (evt?.moved) return;
  if (evt?.added?.element) {
    emit("move", {
      leagueTeamId: evt.added.element.leagueTeamId,
      toGroupId: null,
    });
  }
};
</script>
