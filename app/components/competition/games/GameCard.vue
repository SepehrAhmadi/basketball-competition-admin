<template>
  <v-card
    rounded="lg"
    class="tw:p-4! tw:h-full!"
    :class="[
      hasIssue(game, 'RESULT_PENDING')
        ? 'tw:border-2! tw:border-orange-400!'
        : '',
      game.status === 'CANCELED' ? 'tw:opacity-70' : '',
    ]"
  >
    <div class="tw:flex tw:items-center tw:justify-between tw:gap-2">
      <div
        class="tw:flex tw:items-center tw:gap-1 tw:text-[12px] tw:text-gray-600 tw:dark:text-gray-300 tw:min-w-0"
      >
        <icon-date class="tw:text-[16px] tw:shrink-0" />
        <span class="tw:truncate">
          {{ game.scheduledDate ?? "تاریخ نامشخص" }}
          <template v-if="game.scheduledTime">
            - {{ game.scheduledTime }}
          </template>
        </span>
      </div>
      <div class="tw:flex tw:items-center tw:gap-1 tw:shrink-0">
        <v-chip v-if="game.group" size="x-small" variant="tonal">
          {{ game.group.name }}
        </v-chip>
        <v-tooltip location="top" :disabled="!game.cancelReason">
          <template #activator="{ props: tipProps }">
            <v-chip
              v-bind="tipProps"
              size="x-small"
              variant="tonal"
              :color="statusColor(game.status)"
            >
              {{ statusLabel(game.status) }}
            </v-chip>
          </template>
          <span class="tw:text-xs tw:p-2">{{ game.cancelReason }}</span>
        </v-tooltip>
      </div>
    </div>

    <!-- Teams row -->
    <div class="tw:flex tw:items-center tw:justify-between tw:gap-2 tw:mt-4!">
      <!-- Home (right) -->
      <div
        class="tw:flex tw:flex-col tw:items-center tw:gap-1 tw:flex-1 tw:min-w-0 tw:text-center"
      >
        <v-avatar size="44" class="tw:bg-secondary-dark! tw:p-1!">
          <v-img
            :src="game.homeTeam.team.logoUrl || defaultTeamLogo"
            cover
          />
        </v-avatar>
        <div
          class="tw:text-[13px] tw:truncate tw:w-full"
          :class="[
            isWinner(game, game.homeTeam) ? 'tw:font-bold!' : '',
            game.status === 'CANCELED' ? 'tw:line-through' : '',
            game.homeTeam.teamStatus === 'DELETED' ? 'tw:opacity-60' : '',
          ]"
        >
          {{ game.homeTeam.team.name }}
        </div>
        <div
          class="tw:text-[11px] tw:text-color-lighter tw:truncate tw:w-full"
        >
          {{ game.homeTeam.organization?.name ?? "—" }}
        </div>
      </div>

      <!-- Center: score or VS -->
      <div class="tw:flex tw:flex-col tw:items-center tw:gap-1">
        <div v-if="game.homeScore !== null" class="tw:flex tw:items-center tw:gap-1">
          <div
            class="tw:px-4! tw:py-2! tw:rounded-md tw:text-[16px]"
            :class="
              isWinner(game, game.homeTeam)
                ? 'tw:bg-green-100 tw:dark:bg-green-900/30 tw:font-bold'
                : 'tw:bg-gray-100 tw:dark:bg-gray-700'
            "
          >
            {{ game.homeScore }}
          </div>
          <span>:</span>
          <div
            class="tw:px-4! tw:py-2! tw:rounded-md tw:text-[16px]"
            :class="
              isWinner(game, game.awayTeam)
                ? 'tw:bg-green-100 tw:dark:bg-green-900/30 tw:font-bold'
                : 'tw:bg-gray-100 tw:dark:bg-gray-700'
            "
          >
            {{ game.awayScore }}
          </div>
        </div>
        <div v-else class="tw:text-[14px] tw:text-color-lighter">VS</div>
        <div
          v-if="game.scheduledTime"
          class="tw:text-[11px] tw:text-color-lighter"
        >
          {{ game.scheduledTime }}
        </div>
      </div>

      <!-- Away (left) -->
      <div
        class="tw:flex tw:flex-col tw:items-center tw:gap-1 tw:flex-1 tw:min-w-0 tw:text-center"
      >
        <v-avatar size="44" class="tw:bg-secondary-dark! tw:p-1!">
          <v-img
            :src="game.awayTeam.team.logoUrl || defaultTeamLogo"
            cover
          />
        </v-avatar>
        <div
          class="tw:text-[13px] tw:truncate tw:w-full"
          :class="[
            isWinner(game, game.awayTeam) ? 'tw:font-bold!' : '',
            game.status === 'CANCELED' ? 'tw:line-through' : '',
            game.awayTeam.teamStatus === 'DELETED' ? 'tw:opacity-60' : '',
          ]"
        >
          {{ game.awayTeam.team.name }}
        </div>
        <div
          class="tw:text-[11px] tw:text-color-lighter tw:truncate tw:w-full"
        >
          {{ game.awayTeam.organization?.name ?? "—" }}
        </div>
      </div>
    </div>

    <div class="tw:flex tw:justify-end tw:mt-6!">
      <div
        class="tw:inline-flex tw:items-stretch tw:overflow-hidden tw:rounded-lg tw:border tw:border-gray-300 tw:dark:border-gray-600"
      >
        <v-tooltip location="top">
          <template #activator="{ props: tooltipProps }">
            <span v-bind="tooltipProps">
              <v-menu :open-on-hover="!isMobile" location="bottom end">
                <template #activator="{ props: menuProps }">
                  <v-btn
                    v-bind="menuProps"
                    size="small"
                    variant="text"
                    rounded="0"
                    class="tw:min-w-2!"
                    aria-label="اطلاعات بازی"
                  >
                    <icon-info-circle class="tw:text-[16px]" />
                  </v-btn>
                </template>
                <v-list density="compact" class="tw:min-w-55!">
                  <v-list-item class="tw:m-h-10!">
                    <div class="tw:flex tw:items-center tw:gap-2 tw:text-[12px]">
                      <icon-circle class="tw:text-[10px] tw:text-gray-400" />
                      <span
                        >{{ game.homeTeam.team.name }} -
                        {{ game.awayTeam.team.name }}</span
                      >
                    </div>
                  </v-list-item>
                  <v-list-item class="tw:m-h-10!">
                    <div class="tw:flex tw:items-center tw:gap-2 tw:text-[12px]">
                      <icon-circle class="tw:text-[10px] tw:text-gray-400" />
                      <span>
                        {{ game.scheduledDate ?? "تاریخ نامشخص" }}
                        <template v-if="game.scheduledTime">
                          - {{ game.scheduledTime }}
                        </template>
                      </span>
                    </div>
                  </v-list-item>
                  <v-list-item v-if="game.group" class="tw:m-h-10!">
                    <div class="tw:flex tw:items-center tw:gap-2 tw:text-[12px]">
                      <icon-circle class="tw:text-[10px] tw:text-gray-400" />
                      <span>گروه: {{ game.group.name }}</span>
                    </div>
                  </v-list-item>
                  <v-list-item class="tw:m-h-10!">
                    <div class="tw:flex tw:items-center tw:gap-2 tw:text-[12px]">
                      <icon-circle class="tw:text-[10px] tw:text-gray-400" />
                      <span>
                        وضعیت: {{ statusLabel(game.status) }}
                        <template v-if="game.cancelReason">
                          - {{ game.cancelReason }}
                        </template>
                      </span>
                    </div>
                  </v-list-item>
                  <v-list-item
                    v-if="game.resultType === 'FORFEIT'"
                    class="tw:m-h-10!"
                  >
                    <div class="tw:flex tw:items-center tw:gap-2 tw:text-[12px]">
                      <icon-circle class="tw:text-[10px] tw:text-gray-400" />
                      <span
                        >فورفیت: تیم {{ forfeitTeamName(game) }} حاضر نشد؛ نتیجه
                        {{ Math.max(game.homeScore, game.awayScore) }} بر
                        {{ Math.min(game.homeScore, game.awayScore) }} ثبت شده
                        است.</span
                      >
                    </div>
                  </v-list-item>
                  <v-list-item v-if="game.rescheduledTo" class="tw:m-h-10!">
                    <div class="tw:flex tw:items-center tw:gap-2 tw:text-[12px]">
                      <icon-circle class="tw:text-[10px] tw:text-gray-400" />
                      <span
                        >این بازی کنسل شده است؛ بازی جایگزین: شماره
                        {{ game.rescheduledTo.id }}.</span
                      >
                    </div>
                  </v-list-item>
                  <v-list-item v-if="game.rescheduledFrom" class="tw:m-h-10!">
                    <div class="tw:flex tw:items-center tw:gap-2 tw:text-[12px]">
                      <icon-circle class="tw:text-[10px] tw:text-gray-400" />
                      <span
                        >این بازی جایگزین بازی کنسل‌شده‌ی شماره
                        {{ game.rescheduledFrom.id }} است.</span
                      >
                    </div>
                  </v-list-item>
                  <v-list-item
                    v-if="hasIssue(game, 'RESULT_PENDING')"
                    class="tw:m-h-10!"
                  >
                    <div
                      class="tw:flex tw:items-center tw:gap-2 tw:text-[12px] tw:text-orange-600"
                    >
                      <icon-circle class="tw:text-[10px] tw:text-orange-500" />
                      <span>تاریخ بازی گذشته و نتیجه ثبت نشده است.</span>
                    </div>
                  </v-list-item>
                  <v-list-item
                    v-for="(issue, i) in otherIssues(game)"
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
            </span>
          </template>
          <span class="tw:text-xs tw:p-2">اطلاعات بازی</span>
        </v-tooltip>

        <template v-for="a in actionList" :key="a.key">
          <v-tooltip location="top">
            <template #activator="{ props: tipProps }">
              <span v-bind="tipProps">
                <v-btn
                  size="small"
                  variant="text"
                  rounded="0"
                  class="tw:min-w-2! tw:border-s! tw:border-gray-300! tw:dark:border-gray-600!"
                  :disabled="!!a.lock"
                  :aria-label="a.title"
                  @click="emit('action', { key: a.key, game })"
                >
                  <icon-refresh v-if="a.key === 'reschedule'" class="tw:text-[16px]" />
                  <icon-document-edit v-else-if="a.key === 'result'" class="tw:text-[16px]" />
                  <icon-date v-else-if="a.key === 'schedule'" class="tw:text-[16px]" />
                  <icon-check-circle v-else-if="a.key === 'start'" class="tw:text-[16px]" />
                  <icon-close-circle v-else-if="a.key === 'cancel'" class="tw:text-[16px]" />
                  <icon-close v-else-if="a.key === 'clear'" class="tw:text-[16px]" />
                  <icon-trash v-else-if="a.key === 'delete'" class="tw:text-[16px]" />
                </v-btn>
              </span>
            </template>
            <span class="tw:text-xs tw:p-2">{{ a.lock?.message ?? a.title }}</span>
          </v-tooltip>
        </template>
      </div>
    </div>
  </v-card>
</template>

<script setup lang="ts">
import defaultTeamLogo from "~/assets/image/icon/team.png";
import type {
  Advisory,
  GameActionKey,
} from "~/composables/competition/types";

const props = defineProps<{
  game: any;
  statuses: any[];
  can: { create: boolean; update: boolean; result: boolean; delete: boolean };
  createLock: Advisory | null;
  isMobile: boolean;
}>();

const emit = defineEmits<{
  (e: "action", payload: { key: GameActionKey; game: any }): void;
}>();

const statusLabel = (v: string) =>
  props.statuses.find((s: any) => s.value === v)?.label ?? v;

const statusColor = (v: string) =>
  (
    ({
      SCHEDULED: "info",
      LIVE: "warning",
      FINISHED: "success",
    }) as Record<string, string>
  )[v] ?? "default";

// The winner always comes from winnerLeagueTeamId, never from the scores.
const isWinner = (game: any, team: any) =>
  game.winnerLeagueTeamId !== null &&
  game.winnerLeagueTeamId === team.leagueTeamId;

const forfeitTeamName = (game: any) =>
  [game.homeTeam, game.awayTeam].find(
    (t: any) => t.leagueTeamId === game.forfeitLeagueTeamId,
  )?.team.name ?? "—";

const hasIssue = (game: any, code: string) =>
  (game.issues ?? []).some((i: any) => i.code === code);
const otherIssues = (game: any) =>
  (game.issues ?? []).filter((i: any) => i.code !== "RESULT_PENDING");

interface ActionItem {
  key: GameActionKey;
  title: string;
  lock: any;
  icon: string;
}

const actionList = computed<ActionItem[]>(() => {
  const game = props.game;
  const can = props.can;
  const list: ActionItem[] = [];

  if (game.status === "CANCELED" && !game.rescheduledTo && can.create)
    list.push({
      key: "reschedule",
      title: "برگزاری مجدد",
      lock: props.createLock,
      icon: "icon-refresh",
    });

  if (game.status !== "CANCELED" && can.result)
    list.push({
      key: "result",
      title: game.status === "FINISHED" ? "ویرایش نتیجه" : "ثبت نتیجه",
      lock: game.resultLock,
      icon: "icon-document-edit",
    });

  if (can.update) {
    list.push({
      key: "schedule",
      title: "ویرایش زمان‌بندی",
      lock: game.scheduleLock,
      icon: "icon-date",
    });
    if (game.status === "SCHEDULED")
      list.push({
        key: "start",
        title: "شروع بازی",
        lock: game.startLock,
        icon: "icon-check-circle",
      });
    if (game.status === "SCHEDULED" || game.status === "LIVE")
      list.push({
        key: "cancel",
        title: "لغو بازی",
        lock: game.cancelLock,
        icon: "icon-close-circle",
      });
  }
  if (can.result && game.status === "FINISHED")
    list.push({
      key: "clear",
      title: "پاک کردن نتیجه",
      lock: game.resultLock,
      icon: "icon-close",
    });
  if (can.delete)
    list.push({
      key: "delete",
      title: "حذف بازی",
      lock: game.deleteLock,
      icon: "icon-trash",
    });
  return list;
});
</script>
