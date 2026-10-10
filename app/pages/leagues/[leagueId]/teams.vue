<template>
  <div dir="rtl">
    <!-- ── league-teams.view guard ── -->
    <v-row v-if="!hasPermission('league-teams.view')">
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

    <v-row v-else>
      <!-- ── header ── -->
      <v-col cols="12" md="8">
        <div class="tw:flex tw:items-center tw:gap-2">
          <icon-users class="tw:text-[20px] tw:text-color-lighter" />
          <div>
            <div class="tw:text-[15px] tw:font-medium">
              {{ mode === "add" ? "افزودن تیم به لیگ" : "مدیریت تیم‌های لیگ" }}
            </div>
            <div class="tw:text-[11px] tw:text-color-lighter">
              {{ leagueStore.leagueTeamMeta?.total ?? 0 }} تیم ثبت‌شده
            </div>
          </div>
        </div>
      </v-col>
      <v-col cols="12" md="4" class="tw:justify-end! tw:flex">
        <BackBtn />
      </v-col>

      <!-- ── toolbar (full width) ── -->
      <v-col cols="12">
        <v-card class="tw:rounded-xl!">
          <v-card-text>
            <div class="tw:flex tw:flex-wrap tw:items-center tw:gap-3">
              <v-text-field
                v-model="query"
                class="tw:flex-1 tw:min-w-50"
                variant="outlined"
                density="compact"
                hide-details
                dir="rtl"
                @update:model-value="onSearchChange"
              >
                <template #label>
                  <span class="tw:text-[12px]">جستجوی نام تیم</span>
                </template>
                <template #prepend-inner>
                  <icon-magnify class="tw:text-[18px] tw:text-color-lighter" />
                </template>
              </v-text-field>

              <v-btn
                v-if="mode === 'list' && hasPermission('league-teams.create')"
                class="tw:bg-secondary-dark! tw:text-white! tw:rounded-md!"
                @click="switchMode('add')"
              >
                <icon-plus class="tw:text-[20px]" />
                <span class="tw:mr-1!">افزودن تیم</span>
              </v-btn>
              <v-btn
                v-else-if="mode === 'add'"
                variant="outlined"
                @click="switchMode('list')"
              >
                <icon-arrow-left class="tw:text-[18px]" />
                <span class="tw:mr-1!">بازگشت به لیست تیم‌ها</span>
              </v-btn>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- ── main column ── -->
      <v-col cols="12" :md="mode === 'add' ? 8 : 12">
        <div
          v-if="isLoading && items.length === 0"
          class="tw:flex tw:justify-center tw:py-16"
        >
          <v-progress-circular indeterminate color="primary" />
        </div>

        <div
          v-else-if="items.length === 0"
          class="tw:flex tw:justify-center tw:items-center tw:gap-2 tw:py-16!"
        >
          <icon-row-chart class="tw:text-color-lighter tw:text-[35px]" />
          <div class="tw:text-color-lighter tw:text-[14px]">
            {{
              mode === "add"
                ? "تیم مجاز دیگری برای افزودن یافت نشد"
                : "هنوز تیمی به این لیگ اضافه نشده است"
            }}
          </div>
        </div>

        <v-row v-else dense>
          <v-col
            v-for="item in items"
            :key="mode === 'add' ? item.team.id : item.id"
            cols="12"
            md="6"
            lg="4"
            xl="2"
          >
            <v-card
              rounded="lg"
              class="tw:px-4! tw:py-6! tw:h-full! tw:flex tw:flex-col tw:items-center tw:justify-center tw:text-center!"
            >
              <v-avatar size="72" class="tw:bg-secondary-dark! tw:p-2!">
                <v-img
                  v-if="item.team?.logoUrl"
                  :src="item.team.logoUrl"
                  cover
                />
                <v-img v-else :src="defaultTeamLogo" cover />
              </v-avatar>

              <div
                class="tw:text-[15px]! tw:font-bold! tw:truncate tw:mt-3! tw:w-full tw:text-center"
              >
                {{ item.team?.name ?? "—" }}
              </div>
              <div
                class="tw:text-gray-600 tw:dark:text-gray-300 tw:text-[13px]! tw:mt-1! tw:text-center"
              >
                {{
                  (mode === "add"
                    ? item.activeRosterCount
                    : item.membersCount) ?? 0
                }}
                عضو
              </div>

              <div
                class="tw:flex tw:items-center tw:justify-center tw:gap-2 tw:mt-4! tw:w-full"
              >
                <template v-if="mode === 'list'">
                  <v-btn
                    v-if="
                      hasPermission('league-roster.view') &&
                      item.can?.manageRoster !== false
                    "
                    size="x-small"
                    variant="outlined"
                    @click="openRoster(item)"
                  >
                    <icon-users class="tw:text-[16px]" />
                    <span class="tw:mr-1!">مدیریت تیم</span>
                  </v-btn>
                  <v-btn
                    v-if="
                      hasPermission('league-teams.delete') && item.can?.unregister
                    "
                    size="x-small"
                    variant="outlined"
                    @click="confirmRemove(item)"
                  >
                    <icon-trash class="tw:text-[16px]" />
                    <span class="tw:mr-1!">حذف از لیگ</span>
                  </v-btn>
                </template>
                <v-btn
                  v-else
                  size="x-small"
                  variant="outlined"
                  :loading="addingTeamId === item.team.id"
                  :disabled="addingTeamId !== null"
                  @click="confirmAdd(item)"
                >
                  <icon-plus class="tw:text-[16px]" />
                  <span class="tw:mr-1!">افزودن به لیگ</span>
                </v-btn>
              </div>
            </v-card>
          </v-col>
        </v-row>

        <v-card rounded="lg" class="tw:mt-4!" v-if="totalItems > pageSize">
          <Pagination
            v-model:page="page"
            v-model:items-per-page="pageSize"
            :items-length="totalItems"
            @update-options="onOptionsChange"
          />
        </v-card>
      </v-col>

      <!-- ── sidebar: already added teams (add mode) ── -->
      <v-col v-if="mode === 'add'" cols="12" md="4">
        <v-card rounded="lg" class="tw:p-4!">
          <div class="tw:text-[14px] tw:font-bold tw:mb-3!">
            تیم‌های افزوده‌شده ({{ leagueStore.leagueTeamMeta?.total ?? 0 }})
          </div>
          <div
            class="tw:max-h-[70vh] tw:overflow-y-auto tw:flex tw:flex-col tw:gap-2"
          >
            <div
              v-for="lt in leagueStore.leagueTeamList"
              :key="lt.id"
              class="tw:flex tw:justify-between tw:items-center tw:gap-2 tw:rounded-lg!  tw:p-3! tw:shadow-none! tw:border! tw:border-gray-300! tw:dark:border-gray-600!"
            >
              <div class="tw:flex tw:justify-start tw:items-center tw:gap-2 tw:min-w-0">
                <v-avatar size="50" class="tw:bg-secondary-dark! tw:p-1!">
                  <v-img v-if="lt.team?.logoUrl" :src="lt.team.logoUrl" cover />
                  <v-img v-else :src="defaultTeamLogo" cover />
                </v-avatar>
                <div class="tw:min-w-0">
                  <div class="tw:text-[13px] tw:font-medium tw:truncate">
                    {{ lt.team.name }}
                  </div>
                  <div class="tw:text-[11px] tw:text-color-lighter tw:truncate">
                    {{ lt.organization?.name ?? "—" }}
                  </div>
                </div>
              </div>
              <v-tooltip
                v-if="hasPermission('league-teams.delete') && lt.can?.unregister !== false"
                location="top"
              >
                <template #activator="{ props }">
                  <v-btn
                    v-bind="props"
                    icon
                    size="small"
                    variant="text"
                    color="error"
                    aria-label="حذف از لیگ"
                    @click="confirmRemove(lt)"
                  >
                    <icon-trash class="tw:text-[20px]" />
                  </v-btn>
                </template>
                <span class="tw:text-xs tw:p-2">حذف از لیگ</span>
              </v-tooltip>
            </div>
            <div
              v-if="leagueStore.leagueTeamList.length === 0"
              class="tw:text-center tw:text-color-lighter tw:text-[13px] tw:py-6"
            >
              هنوز تیمی اضافه نشده است
            </div>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- ─── Confirm dialog (add / remove) ── -->
    <v-dialog
      v-model="confirmOpen"
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
              <v-btn icon variant="plain" size="x-small">
                <icon-close class="tw:text-[18px] tw:text-white!" />
              </v-btn>
            </div>
            <div class="tw:text-[14px]! tw:text-white">
              {{
                confirmType === "add" ? "افزودن تیم به لیگ" : "حذف تیم از لیگ"
              }}
            </div>
            <v-btn
              icon
              variant="plain"
              size="x-small"
              aria-label="بستن"
              @click="confirmOpen = false"
            >
              <icon-close class="tw:text-[18px] tw:text-white!" />
            </v-btn>
          </div>
        </v-card-title>
        <v-card-text class="tw:text-[16px]! tw:text-center!">
          {{
            confirmType === "add"
              ? `آیا از افزودن «${confirmTarget?.team?.name}» به لیگ مطمئن هستید؟`
              : `آیا از حذف «${confirmTarget?.team?.name}» از لیگ مطمئن هستید؟`
          }}
        </v-card-text>
        <v-card-actions class="tw:justify-end!">
          <v-btn
            variant="text"
            class="tw:text-[12px]!"
            @click="confirmOpen = false"
          >
            انصراف
          </v-btn>
          <v-btn
            class="tw:bg-secondary-dark! tw:dark:bg-secondary-dark! tw:text-white! tw:rounded-md!"
            :loading="handlerStore.loadingBtn"
            :disabled="handlerStore.loadingBtn"
            @click="onConfirm"
          >
            <icon-check v-if="confirmType === 'add'" class="tw:text-[18px]" />
            <icon-trash v-else class="tw:text-[18px]" />
            <span class="tw:mr-1! tw:text-[12px]! tw:px-2!">
              {{ confirmType === "add" ? "افزودن" : "حذف" }}
            </span>
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- ─── Manage Roster Dialog ── -->
    <v-dialog
      v-model="rosterOpen"
      max-width="560"
      scrollable
      dir="rtl"
      class="blur-dialog"
    >
      <v-card rounded="lg">
        <v-card-title
          class="tw:bg-secondary-dark tw:dark:bg-primary-dark! tw:mb-3!"
        >
          <div class="tw:flex tw:justify-between tw:items-center">
            <div class="tw:invisible">
              <v-btn icon variant="plain" size="x-small">
                <icon-close class="tw:text-[18px] tw:text-white!" />
              </v-btn>
            </div>
            <div class="tw:text-[14px]! tw:text-white">
              مدیریت ترکیب «{{ rosterTarget?.team?.name }}»
            </div>
            <v-btn
              icon
              variant="plain"
              size="x-small"
              aria-label="بستن"
              @click="rosterOpen = false"
            >
              <icon-close class="tw:text-[18px] tw:text-white!" />
            </v-btn>
          </div>
        </v-card-title>

        <v-card-text class="tw:max-h-[65vh]">
          <div
            v-if="leagueStore.rosterLoading"
            class="tw:flex tw:justify-center tw:py-12"
          >
            <v-progress-circular indeterminate color="primary" />
          </div>

          <div
            v-else-if="people.length === 0"
            class="tw:flex tw:justify-center tw:items-center tw:gap-2 tw:py-12"
          >
            <icon-row-chart class="tw:text-color-lighter tw:text-[35px]" />
            <div class="tw:text-color-lighter tw:text-[14px]">
              عضوی برای این تیم در فصل لیگ یافت نشد
            </div>
          </div>

          <div v-else class="tw:flex tw:flex-col tw:gap-2">
            <div
              v-for="person in people"
              :key="person.teamSeasonMemberId"
              class="tw:flex tw:items-center tw:gap-3 tw:rounded-lg tw:border-2 tw:p-2! tw:transition"
              :class="[
                person.selected
                  ? 'tw:border-green-500 tw:bg-green-100'
                  : 'tw:border-transparent tw:bg-black/5 tw:dark:bg-white/5',
                { 'tw:opacity-50': isLocked(person) },
              ]"
            >
              <v-avatar size="40" color="grey-lighten-2">
                <v-img v-if="person.avatarUrl" :src="person.avatarUrl" />
                <icon-user v-else class="tw:text-[20px]" />
              </v-avatar>

              <div class="tw:flex-1 tw:min-w-0">
                <div class="tw:text-[13px] tw:font-medium tw:truncate">
                  {{ person.fullName }}
                </div>
                <div
                  class="tw:flex tw:flex-wrap tw:items-center tw:gap-1! tw:mt-1!"
                >
                  <v-chip size="x-small" variant="tonal">
                    {{ person.role === "COACH" ? "مربی" : "بازیکن" }}
                  </v-chip>
                  <v-chip v-if="person.jerseyNumber != null" size="x-small">
                    شماره {{ person.jerseyNumber }}
                  </v-chip>
                  <v-chip
                    v-if="!person.eligible && !person.selected"
                    size="x-small"
                    color="error"
                    variant="tonal"
                  >
                    {{ reasonLabel(person.ineligibleReason) }}
                  </v-chip>
                </div>
              </div>

              <v-tooltip location="top">
                <template #activator="{ props }">
                  <v-btn
                    v-bind="props"
                    icon
                    size="small"
                    variant="text"
                    :color="person.selected ? 'success' : 'default'"
                    :loading="busyId === person.teamSeasonMemberId"
                    :disabled="isLocked(person) || busyId !== null"
                    :aria-label="
                      person.selected ? 'حذف از ترکیب' : 'افزودن به ترکیب'
                    "
                    @click="toggle(person)"
                  >
                    <icon-check
                      v-if="person.selected"
                      class="tw:text-[20px]"
                    />
                    <icon-plus v-else class="tw:text-[20px]" />
                  </v-btn>
                </template>
                <span class="tw:text-xs tw:p-2">
                  {{ person.selected ? "حذف از ترکیب" : "افزودن به ترکیب" }}
                </span>
              </v-tooltip>
            </div>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { useLeagueStore } from "~/store/league";
import { useHandlerStore } from "~/store/handler";
import defaultTeamLogo from "~/assets/image/icon/team.png";

const leagueStore = useLeagueStore();
const handlerStore = useHandlerStore();
const { hasPermission } = usePermission();

// leagueId comes from the route only — it is never editable.
const route = useRoute();
const leagueId = computed(() => String(route.params.leagueId));

const { setPageTitle } = usePageTitle();
watchEffect(() => {
  setPageTitle("مدیریت تیم‌های لیگ");
});

const mode = ref<"list" | "add">("list");
const query = ref<string>("");
const page = ref<number>(1);
const pageSize = ref<number>(8);

const items = computed(() =>
  mode.value === "add"
    ? leagueStore.eligibleTeamList.filter((t: any) => !t.alreadyRegistered)
    : leagueStore.leagueTeamList,
);
const totalItems = computed(() =>
  mode.value === "add"
    ? (leagueStore.eligibleTeamMeta?.total ?? 0)
    : (leagueStore.leagueTeamMeta?.total ?? 0),
);
const isLoading = computed(() =>
  mode.value === "add"
    ? leagueStore.eligibleLoading
    : leagueStore.leagueTeamLoading,
);

// ─── Data loading ──
// Key of the most recent fetch — drops duplicate "update:options" echoes.
let lastLoadedKey = `${page.value}:${pageSize.value}`;

const loadLeagueTeams = () => {
  const params: Record<string, any> = {
    page: page.value,
    pageSize: pageSize.value,
  };
  if (query.value) params.search = query.value;
  return leagueStore.getLeagueTeams(leagueId.value, params);
};

const loadEligible = () => {
  const params: Record<string, any> = {
    page: page.value,
    pageSize: pageSize.value,
  };
  if (query.value) params.search = query.value;
  return leagueStore.getEligibleTeams(leagueId.value, params);
};

// Sidebar always shows every league team, unaffected by search/pagination.
const loadSidebar = () =>
  leagueStore.getLeagueTeams(leagueId.value, { page: 1, pageSize: 100 });

const loadMain = () => {
  lastLoadedKey = `${page.value}:${pageSize.value}`;
  return mode.value === "add" ? loadEligible() : loadLeagueTeams();
};

const onOptionsChange = (options: { page: number; itemsPerPage: number }) => {
  const key = `${options.page}:${options.itemsPerPage}`;
  if (key === lastLoadedKey) return;
  page.value = options.page;
  pageSize.value = options.itemsPerPage;
  loadMain();
};

let searchTimeout: ReturnType<typeof setTimeout> | null = null;
const onSearchChange = () => {
  if (searchTimeout) clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    page.value = 1;
    loadMain();
  }, 300);
};

const switchMode = (next: "list" | "add") => {
  mode.value = next;
  query.value = "";
  page.value = 1;
  if (next === "add") {
    loadSidebar();
  }
  loadMain();
};

// ─── Add / remove with confirmation ──
const confirmOpen = ref<boolean>(false);
const confirmType = ref<"add" | "remove">("remove");
const confirmTarget = ref<any>(null);
const addingTeamId = ref<number | null>(null);

const confirmAdd = (item: any) => {
  confirmType.value = "add";
  confirmTarget.value = item;
  confirmOpen.value = true;
};

const confirmRemove = (item: any) => {
  confirmType.value = "remove";
  confirmTarget.value = item;
  confirmOpen.value = true;
};

const onConfirm = async () => {
  const target = confirmTarget.value;
  if (!target) return;

  if (confirmType.value === "add") {
    addingTeamId.value = target.team.id;
    const ok = await leagueStore.addTeamToLeague(
      leagueId.value,
      target.team.id,
    );
    addingTeamId.value = null;
    if (!ok) return;
    confirmOpen.value = false;
    loadSidebar();
    loadEligible();
  } else {
    const ok = await leagueStore.removeTeamFromLeague(
      leagueId.value,
      target.id,
    );
    if (!ok) return;
    confirmOpen.value = false;
    if (mode.value === "add") {
      // Refresh both the sidebar and the eligible list in add mode.
      loadSidebar();
      loadEligible();
    } else {
      // Step back a page if the removed card was the last one on it.
      if (leagueStore.leagueTeamList.length === 1 && page.value > 1) page.value--;
      loadMain();
    }
  }
  confirmTarget.value = null;
};

// ─── Roster dialog ──
const rosterOpen = ref<boolean>(false);
const rosterTarget = ref<any>(null);

const people = ref<any[]>([]);
// teamSeasonMemberId → league member id (required by DELETE .../members/:memberId)
const memberIdMap = ref<Record<number, number>>({});
const busyId = ref<number | null>(null);

const reasonLabel = (reason: string | null): string =>
  ({
    BIRTH_DATE_MISSING: "تاریخ تولد ثبت نشده",
    TOO_OLD: "خارج از رده سنی",
    IN_OTHER_TEAM: "در تیم دیگری عضو است",
  })[reason ?? ""] ?? "غیرمجاز";

// Only the direction of the toggle (add / remove) needs its own permission.
const isLocked = (person: any): boolean => {
  if (rosterTarget.value?.can?.manageRoster === false) return true;
  if (person.selected) return !hasPermission("league-roster.delete");
  return !person.eligible || !hasPermission("league-roster.create");
};

const loadMembers = async () => {
  const members = await leagueStore.getLeagueMembers(
    leagueId.value,
    rosterTarget.value.id,
  );
  memberIdMap.value = Object.fromEntries(
    members.map((m: any) => [m.teamSeasonMemberId, m.id]),
  );
};

const loadRoster = async () => {
  if (!rosterTarget.value) return;
  leagueStore.rosterLoading = true;
  try {
    const [candidates] = await Promise.all([
      leagueStore.getRosterCandidates(leagueId.value, rosterTarget.value.id),
      loadMembers(),
    ]);
    people.value = candidates;
  } catch {
    people.value = [];
  } finally {
    leagueStore.rosterLoading = false;
  }
};

const toggle = async (person: any) => {
  const tsmId = person.teamSeasonMemberId;
  busyId.value = tsmId;
  try {
    if (person.selected) {
      const memberId = memberIdMap.value[tsmId];
      if (memberId === undefined) return;
      const ok = await leagueStore.removeRosterMember(
        leagueId.value,
        rosterTarget.value.id,
        memberId,
      );
      if (!ok) return;
      person.selected = false;
      delete memberIdMap.value[tsmId];
    } else {
      const ok = await leagueStore.addRosterMembers(
        leagueId.value,
        rosterTarget.value.id,
        [tsmId],
      );
      if (!ok) return;
      person.selected = true;
      // The new league member id is only known server-side — refresh the map.
      await loadMembers().catch(() => {});
    }
    loadLeagueTeams();
  } finally {
    busyId.value = null;
  }
};

const openRoster = (item: any) => {
  rosterTarget.value = item;
  people.value = [];
  rosterOpen.value = true;
  loadRoster();
};

onMounted(() => {
  if (hasPermission("league-teams.view")) loadMain();
});
</script>
