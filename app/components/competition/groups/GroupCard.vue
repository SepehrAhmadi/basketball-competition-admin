<template>
  <v-card
    rounded="lg"
    class="tw:relative! tw:p-4! tw:h-full! tw:flex tw:flex-col"
    :class="
      isEditing ? 'tw:border! tw:border-gray-400! tw:dark:border-gray-300!' : ''
    "
  >
    <div class="tw:flex tw:items-center tw:justify-between tw:gap-2">
      <div class="tw:min-w-0">
        <div class="tw:text-[15px]! tw:font-bold! tw:truncate">
          {{ group.name }}
        </div>
        <div
          v-if="group.gamesCount > 0"
          class="tw:text-[11px] tw:text-color-lighter tw:truncate"
        >
          {{ group.finishedGamesCount }} از {{ group.gamesCount }} بازی دارای
          نتیجه
        </div>
      </div>
      <div
        class="tw:inline-flex tw:items-stretch tw:overflow-hidden tw:rounded-lg tw:border tw:border-gray-300 tw:dark:border-gray-600"
      >
        <v-menu :open-on-hover="!isMobile" location="bottom end">
          <template #activator="{ props: menuProps }">
            <v-btn
              v-bind="menuProps"
              size="small"
              variant="text"
              rounded="0"
              class="tw:min-w-2!"
              aria-label="اطلاعات گروه"
              title="اطلاعات گروه"
            >
              <icon-info-circle class="tw:text-[16px]" />
            </v-btn>
          </template>
          <v-list density="compact" class="tw:min-w-55!">
            <v-list-item class="tw:m-h-10!">
              <div class="tw:flex tw:items-center tw:gap-2 tw:text-[12px]">
                <icon-circle class="tw:text-[10px] tw:text-gray-400" />
                <span
                  >{{ group.teamsCount ?? group.teams.length }} تیم</span
                >
              </div>
            </v-list-item>
            <v-list-item class="tw:m-h-10!">
              <div class="tw:flex tw:items-center tw:gap-2 tw:text-[12px]">
                <icon-circle
                  class="tw:text-[10px]"
                  :class="
                    group.qualifiersOverride !== null
                      ? 'tw:text-sky-500'
                      : 'tw:text-gray-400'
                  "
                />
                <span>
                  صعود: {{ group.qualifiers ?? "—" }}
                  {{ group.qualifiersOverride !== null ? "(سفارشی)" : "" }}
                </span>
              </div>
            </v-list-item>
            <v-list-item v-if="group.lock" class="tw:m-h-10!">
              <div class="tw:flex tw:items-center tw:gap-2 tw:text-[12px]">
                <icon-circle class="tw:text-[10px] tw:text-red-500" />
                <span>{{ group.lock.message }}</span>
              </div>
            </v-list-item>
            <v-list-item
              v-for="(issue, i) in group.issues ?? []"
              :key="`${issue.code}-${i}`"
              class="tw:m-h-10!"
            >
              <div class="tw:flex tw:items-center tw:gap-2 tw:text-[12px]">
                <icon-circle
                  class="tw:text-[10px]"
                  :class="{
                    'tw:text-red-500': issue.severity === 'BLOCKER',
                    'tw:text-amber-500': issue.severity === 'WARNING',
                    'tw:text-sky-500':
                      issue.severity !== 'BLOCKER' &&
                      issue.severity !== 'WARNING',
                  }"
                />
                <span>{{ issue.message }}</span>
              </div>
            </v-list-item>
          </v-list>
        </v-menu>

        <v-tooltip v-if="canOpenGames" location="top">
          <template #activator="{ props: tipProps }">
            <v-btn
              v-bind="tipProps"
              size="small"
              variant="text"
              rounded="0"
              class="tw:min-w-2! tw:border-s! tw:border-gray-300! tw:dark:border-gray-600!"
              aria-label="بازی‌های این گروه"
              @click="emit('open-games', group.id)"
            >
              <icon-list class="tw:text-[16px]" />
            </v-btn>
          </template>
          <span class="tw:text-xs tw:p-2">بازی‌های این گروه</span>
        </v-tooltip>

        <v-tooltip v-if="canEditGroup" location="top">
          <template #activator="{ props: tipProps }">
            <v-btn
              v-bind="tipProps"
              size="small"
              variant="text"
              rounded="0"
              class="tw:min-w-2! tw:border-s! tw:border-gray-300! tw:dark:border-gray-600!"
              :disabled="editDisabled"
              aria-label="ویرایش گروه"
              @click="emit('edit', group)"
            >
              <icon-edit-box class="tw:text-[16px]" />
            </v-btn>
          </template>
          <span class="tw:text-xs tw:p-2">ویرایش</span>
        </v-tooltip>

        <v-tooltip v-if="canDeleteGroup" location="top">
          <template #activator="{ props: tipProps }">
            <v-btn
              v-bind="tipProps"
              size="small"
              variant="text"
              rounded="0"
              class="tw:min-w-2! tw:border-s! tw:border-gray-300! tw:dark:border-gray-600!"
              :disabled="deleteDisabled"
              aria-label="حذف گروه"
              @click="emit('delete', group)"
            >
              <icon-trash class="tw:text-[16px]" />
            </v-btn>
          </template>
          <span class="tw:text-xs tw:p-2">{{
            group.lock?.message ?? "حذف"
          }}</span>
        </v-tooltip>
      </div>
    </div>

    <div class="tw:mt-3! tw:w-full tw:overflow-x-auto">
      <table class="tw:w-full tw:min-w-125 tw:table-fixed tw:text-right">
        <thead>
          <tr class="tw:text-[11px] tw:text-color-lighter">
            <th class="tw:w-[42%] tw:py-2! tw:px-3.25! tw:font-normal">تیم</th>
            <th class="tw:w-12 tw:py-2 tw:text-center tw:font-normal">بازی</th>
            <th class="tw:w-12 tw:py-2 tw:text-center tw:font-normal">امتیاز</th>
            <th class="tw:w-10 tw:py-2 tw:text-center tw:font-normal">برد</th>
            <th class="tw:w-10 tw:py-2 tw:text-center tw:font-normal">باخت</th>
            <th class="tw:w-12 tw:py-2 tw:text-center tw:font-normal">تفاضل</th>
            <th class="tw:w-10 tw:py-2" />
          </tr>
        </thead>
        <draggable
          tag="tbody"
          :model-value="groupRows"
          item-key="leagueTeamId"
          :group="{
            name: 'teams',
            pull: !group.lock,
            put: !group.lock,
          }"
          :sort="false"
          :disabled="!canEdit"
          filter=".no-drag"
          :animation="150"
          :delay="150"
          :delay-on-touch-only="true"
          ghost-class="team-ghost"
          class="tw:min-h-20"
          @change="onDropChange"
          @start="emit('drag-start')"
          @end="emit('drag-end')"
        >
          <template #item="{ element }">
            <tr
              :class="[
                'tw:border-t! tw:border-gray-100! tw:dark:border-gray-800!',
                element.qualified
                  ? 'tw:bg-green-100 tw:dark:bg-green-900/30  tw:rounded-lg!'
                  : '',
                element.teamStatus === 'DELETED' ? 'tw:opacity-60' : '',
                isRowDraggable(element) ? 'tw:cursor-grab' : 'no-drag',
                busyTeamId === element.leagueTeamId ? 'no-drag' : '',
              ]"
            >
              <td class="tw:my-3! tw:ps-2!">
                <div class="tw:flex tw:items-center tw:gap-2 tw:min-w-0">
                  <v-avatar
                    size="28"
                    class="tw:bg-secondary-dark! tw:p-1! tw:shrink-0"
                  >
                    <v-img
                      v-if="element.team?.logoUrl"
                      :src="element.team.logoUrl"
                      cover
                    />
                    <v-img v-else :src="defaultTeamLogo" cover />
                  </v-avatar>
                  <div class="tw:min-w-0">
                    <v-tooltip location="top" :disabled="isMobile || isDragging">
                      <template #activator="{ props: tipProps }">
                        <div
                          v-bind="tipProps"
                          class="tw:text-[12px] tw:font-medium tw:truncate"
                        >
                          {{ element.team?.name ?? "—" }}
                        </div>
                      </template>
                      <span class="tw:text-xs tw:p-2">
                        {{ element.organization?.name ?? "—" }}
                      </span>
                    </v-tooltip>
                    <div
                      v-if="isMobile"
                      class="tw:text-[10px] tw:text-color-lighter tw:truncate"
                    >
                      {{ element.organization?.name ?? "—" }}
                    </div>
                  </div>
                  <v-chip
                    v-if="element.teamStatus === 'DELETED'"
                    size="x-small"
                    variant="tonal"
                  >
                    حذف‌شده
                  </v-chip>
                </div>
              </td>
              <td class="tw:py-2 tw:text-center tw:text-[12px]">
                {{ element.played ?? "—" }}
              </td>
              <td
                class="tw:py-2 tw:text-center tw:text-[12px] tw:font-semibold"
              >
                {{ element.points ?? "—" }}
              </td>
              <td class="tw:py-2 tw:text-center tw:text-[12px]">
                {{ element.won ?? "—" }}
              </td>
              <td class="tw:py-2 tw:text-center tw:text-[12px]">
                {{ element.lost ?? "—" }}
              </td>
              <td class="tw:py-2 tw:text-center tw:text-[12px]">
                <span dir="ltr" class="tw:inline-block">
                  {{
                    element.difference == null
                      ? "—"
                      : formatDiff(element.difference)
                  }}
                </span>
              </td>
              <td class="tw:py-2 tw:text-center">
                <v-progress-circular
                  v-if="busyTeamId === element.leagueTeamId"
                  indeterminate
                  size="18"
                  width="2"
                  color="primary"
                />
                <GroupTeamRowMenu
                  v-else-if="canManage && !isDragging"
                  mode="manage"
                  :league-team-id="element.leagueTeamId"
                  :groups="groups"
                  :current-group-id="group.id"
                  :can-edit="canEdit"
                  :group-locked="!!group.lock"
                  :group-lock-message="group.lock?.message"
                  @move="emit('move', $event)"
                />
              </td>
            </tr>
          </template>
          <template #footer>
            <tr v-if="group.teams.length === 0">
              <td
                colspan="7"
                class="tw:border-t tw:border-dashed tw:border-gray-300 tw:dark:border-gray-600 tw:py-6 tw:text-center tw:text-[12px] tw:text-color-lighter"
              >
                <div
                  class="tw:flex tw:flex-col tw:items-center tw:gap-1 tw:pt-4!"
                >
                  <icon-exchange class="tw:text-[25px]!" />
                  <div>
                    {{
                      canManage
                        ? "تیمی را به اینجا بکشید یا از منوی عملیات استفاده کنید."
                        : "این گروه تیمی ندارد."
                    }}
                  </div>
                </div>
              </td>
            </tr>
          </template>
        </draggable>
      </table>
    </div>
  </v-card>
</template>

<script setup lang="ts">
import draggable from "vuedraggable";
import GroupTeamRowMenu from "~/components/competition/groups/GroupTeamRowMenu.vue";
import defaultTeamLogo from "~/assets/image/icon/team.png";
import type { MoveRequest } from "~/composables/competition/types";

const props = defineProps<{
  group: any;
  groups: any[];
  canEdit: boolean;
  canManage: boolean;
  canEditGroup: boolean;
  canDeleteGroup: boolean;
  canOpenGames: boolean;
  editDisabled: boolean;
  deleteDisabled: boolean;
  busyTeamId: number | null;
  isDragging: boolean;
  isMobile: boolean;
  isEditing: boolean;
}>();

const emit = defineEmits<{
  (e: "move", payload: MoveRequest): void;
  (e: "open-games", groupId: number): void;
  (e: "edit", group: any): void;
  (e: "delete", group: any): void;
  (e: "drag-start"): void;
  (e: "drag-end"): void;
}>();

const formatDiff = (value: number) =>
  value > 0 ? `+ ${value}` : value < 0 ? `− ${Math.abs(value)}` : "0";

// Teams are merged with their standings row; a team without one (e.g. just
// moved here, before the refresh) stays visible and sorts last.
const groupRows = computed(() => {
  const standings = new Map<number, any>(
    (props.group.standings ?? []).map(
      (row: any) => [row.leagueTeamId, row] as const,
    ),
  );
  return [...props.group.teams]
    .map((team: any) => ({
      ...team,
      ...(standings.get(team.leagueTeamId) ?? {}),
    }))
    .sort((a: any, b: any) => (a.rank ?? Infinity) - (b.rank ?? Infinity));
});

const isRowDraggable = (team: any) =>
  props.canEdit && team.teamStatus !== "DELETED";

// Sorting is disabled (:sort="false"); ignore within-list reorder events.
const onDropChange = (evt: any) => {
  if (evt?.moved) return;
  if (evt?.added?.element) {
    emit("move", {
      leagueTeamId: evt.added.element.leagueTeamId,
      toGroupId: props.group.id,
    });
  }
};
</script>
