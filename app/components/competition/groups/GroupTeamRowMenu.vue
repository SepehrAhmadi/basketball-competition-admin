<template>
  <!-- Assign mode: unassigned team -> pick a group -->
  <template v-if="mode === 'assign'">
    <v-tooltip v-if="noGroups" location="top">
      <template #activator="{ props: tooltipProps }">
        <span v-bind="tooltipProps">
          <v-btn
            size="x-small"
            variant="plain"
            rounded="pill"
            icon
            disabled
            aria-label="انتقال به گروه"
          >
            <icon-arrow-left class="tw:text-color-lighter tw:text-[20px]" />
          </v-btn>
        </span>
      </template>
      <span class="tw:text-xs tw:p-2">ابتدا یک گروه بسازید.</span>
    </v-tooltip>
    <v-menu v-else>
      <template #activator="{ props: menuProps }">
        <v-btn
          v-bind="menuProps"
          size="x-small"
          variant="plain"
          rounded="pill"
          icon
          :disabled="!canEdit"
          aria-label="انتقال به گروه"
          title="انتقال به گروه"
        >
          <icon-arrow-left class="tw:text-color-lighter tw:text-[20px]" />
        </v-btn>
      </template>
      <v-list density="compact" class="tw:py-0!">
        <v-list-item
          v-for="g in groups"
          :key="g.id"
          :disabled="!!g.lock"
          :subtitle="g.lock?.message"
          class="tw:py-2!"
          @click="emit('move', { leagueTeamId, toGroupId: g.id })"
        >
          <v-list-item-title>
            <div class="tw:flex tw:items-center tw:gap-2">
              <icon-arrow-left class="tw:text-[17px]" />
              <div class="tw:text-[12px]!">
                {{ g.name }} - {{ g.teamsCount }} تیم
              </div>
            </div>
          </v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>
  </template>

  <!-- Manage mode: team inside a group -->
  <v-menu v-else>
    <template #activator="{ props: menuProps }">
      <v-btn
        v-bind="menuProps"
        size="x-small"
        variant="plain"
        icon
        :disabled="!canEdit || groupLocked"
        aria-label="عملیات تیم"
        :title="groupLockMessage ?? 'عملیات تیم'"
      >
        <icon-more-vertical class="tw:text-[20px]" />
      </v-btn>
    </template>
    <v-list density="compact" class="tw:py-0!">
      <v-list-item
        v-if="groups.length > 1"
        :disabled="!canEdit || groupLocked"
        :subtitle="groupLockMessage"
      >
        <v-list-item-title class="tw:text-[12px]! tw:ps-1!">
          انتقال به گروه دیگر
        </v-list-item-title>
        <template #prepend>
          <icon-sync class="tw:text-[16px]" />
        </template>
        <v-menu activator="parent" location="start">
          <v-list density="compact" class="tw:py-0!">
            <v-list-item
              v-for="target in otherGroups"
              :key="target.id"
              :disabled="!!target.lock || !canEdit || groupLocked"
              :subtitle="target.lock?.message"
              @click="emit('move', { leagueTeamId, toGroupId: target.id })"
            >
              <v-list-item-title class="tw:text-[12px]!">
                {{ target.name }} - {{ target.teamsCount }} تیم
              </v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </v-list-item>
      <v-list-item
        :disabled="!canEdit || groupLocked"
        :subtitle="groupLockMessage"
        @click="emit('move', { leagueTeamId, toGroupId: null })"
      >
        <v-list-item-title class="tw:text-[12px]! tw:ps-1!">
          حذف از گروه
        </v-list-item-title>
        <template #prepend>
          <icon-close class="tw:text-[16px]" />
        </template>
      </v-list-item>
    </v-list>
  </v-menu>
</template>

<script setup lang="ts">
import type { MoveRequest } from "~/composables/competition/types";

const props = withDefaults(
  defineProps<{
    mode: "assign" | "manage";
    leagueTeamId: number;
    groups: any[];
    currentGroupId?: number | null;
    canEdit: boolean;
    groupLocked?: boolean;
    groupLockMessage?: string;
    noGroups?: boolean;
  }>(),
  {
    currentGroupId: null,
    groupLocked: false,
    groupLockMessage: undefined,
    noGroups: false,
  },
);

const emit = defineEmits<{
  (e: "move", payload: MoveRequest): void;
}>();

const otherGroups = computed(() =>
  props.groups.filter((g: any) => g.id !== props.currentGroupId),
);
</script>
