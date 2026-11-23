<template>
  <v-card :ref="setAnchor" class="tw:rounded-xl! tw:h-full!">
    <LeagueStatsCard
      :can-groups="canGroups"
      :is-grouped-format="isGroupedFormat"
      :teams-count="league.teamsCount ?? 0"
      :group-count="summary.groupCount"
      :assigned-count="summary.assignedCount"
      :unassigned-count="groupStore.unassignedCount"
      :total-qualifiers="summary.totalQualifiers"
      :group-lock="groupStore.groupLock"
      :group-issues="groupStore.groupIssues"
    />

    <template
      v-if="
        activeView === 'groups' && (perms.groupsCreate || perms.groupsUpdate)
      "
    >
      <v-divider />
      <GroupForm
        :key="formResetKey"
        :editing-group="editingGroup"
        :form-block-state="groupFormBlock"
        :qualifiers-label="qualifiersLabel"
        :qualifiers-placeholder="qualifiersPlaceholder"
        :loading="handlerStore.loadingBtn"
        @submit="board.submitGroup($event)"
        @cancel="board.openCreate()"
        @invalid="handlerStore.setError($event)"
      />
    </template>

    <template
      v-else-if="
        activeView === 'games' && (perms.gamesCreate || perms.gamesUpdate)
      "
    >
      <v-divider />
      <GameForm />
    </template>
  </v-card>
</template>

<script setup lang="ts">
import LeagueStatsCard from "~/components/competition/league/LeagueStatsCard.vue";
import GroupForm from "~/components/competition/groups/GroupForm.vue";
import GameForm from "~/components/competition/games/GameForm.vue";
import { useCompetition } from "~/composables/competition/useCompetitionContext";

const competition = useCompetition();
const {
  groupStore,
  handlerStore,
  perms,
  canGroups,
  isGroupedFormat,
  isSingleGroup,
  league,
  activeView,
  summary,
  qualifiersLabel,
  qualifiersPlaceholder,
  board,
} = competition;
// Refs must be top-level bindings to be unwrapped in the template.
const { editingGroup, editingGroupId, formResetKey } = board;

// Function ref: lets the page scroll this card into view from composables.
const setAnchor = (el: any) => {
  competition.formAnchor.value = el;
};

const groupFormBlock = computed<{
  type: "info" | "warning";
  text: string;
} | null>(() => {
  if (editingGroupId.value) return null;
  if (!perms.value.groupsCreate)
    return { type: "info", text: "برای ویرایش، دکمه ویرایش گروه را بزنید." };
  if (groupStore.groupLock)
    return { type: "warning", text: groupStore.groupLock.message };
  if (!isGroupedFormat.value)
    return { type: "info", text: "ابتدا ساختار مسابقات را تعیین کنید." };
  if (isSingleGroup.value && groupStore.groupList.length >= 1)
    return { type: "info", text: "در این ساختار فقط یک گروه مجاز است." };
  return null;
});
</script>
