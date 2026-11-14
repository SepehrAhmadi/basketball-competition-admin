# پلن فرانت: بخش بازی‌ها در صفحه‌ی مسابقات + UI وابستگی دسترسی‌ها

وضعیت: آماده‌ی پیاده‌سازی (نسخه‌ی ۲، بازنویسی‌شده طبق بازخورد).
دامنه: فقط پنل ادمین (Nuxt).

1. `app/pages/competition/index.vue` کنار نمای «گروه‌ها»، نمای «بازی‌ها» هم می‌گیرد.
2. UI تخصیص دسترسی در `app/pages/users/index.vue` وابستگی‌ها را رعایت می‌کند.

پیش‌نیاز: `backend-competition-ui-support-plan.md` اول پیاده شود (دسترسی `competition.view`، فیلد `requires` در کاتالوگ دسترسی، دو dropdown لیگ، فیلترهای `search` و `resultPending` بازی‌ها، فیلدهای `gamesCount`/`finishedGamesCount`/`lock` گروه).

---

## 0. قواعد پیاده‌سازی (مهم‌ترین بخش این نسخه)

1. **دقیقاً به سبک بقیه‌ی پنل نوشته شود.** مرجع‌ها:
   - `app/pages/leagues/index.vue` (فرم سمت چپ، کارت‌ها، تولبار، `watchEffect(setPageTitle)`)
   - `app/pages/organizations/index.vue` و `app/pages/teams/index.vue` (الگوی `lastLoadedKey` برای Pagination، debounce جستجو با `setTimeout`)
   - `app/pages/leagues/[leagueId]/teams.vue` (الگوی دیالوگ تأیید با `confirmType/confirmTarget`، `busyId`)
   - ساختار استور: `index.ts` + `state.ts` + `actions.ts`.
2. **همه‌چیز در همان صفحه‌ی `competition/index.vue` هندل می‌شود.** نه composable جدید، نه کامپوننت جدید. فقط:
   - یک استور جدید `game` (مثل بقیه‌ی ماژول‌ها)،
   - اضافه‌شدن چند state/action به استور `dropdown`.
3. **سوییچ بین گروه‌ها و بازی‌ها = دو دکمه‌ی معمولی (`v-btn`) + یک متغیر `activeView`.** از `v-tabs` یا هر کامپوننت تب Vuetify استفاده نمی‌شود.
4. **فرم سمت چپ (کارت «وضعیت لیگ» + فرم) یکی است** و با همان `activeView` یا فرم گروه را نشان می‌دهد یا فرم بازی را.
5. وضعیت فیلترها و `activeView` متغیر محلی صفحه است (ref/reactive). فقط `leagueId` مثل قبل در URL می‌ماند (نیازی به URL contract یا composable نیست).
6. صفحه‌ی `users/index.vue` هم همین‌طور: منطق وابستگی دسترسی‌ها به‌صورت چند تابع داخل خود صفحه نوشته می‌شود، بدون composable و بدون کامپوننت اشتراکی.
7. بورد گروه‌ها refactor نمی‌شود؛ کدش در صفحه می‌ماند و فقط تغییرهای افزایشی (بخش ۹) می‌گیرد.

### آنچه نسبت به نسخه‌ی قبل حذف شد
`useGameFilters`، `GamesPanel`، `GameCard`، `GameFilters`، `GamesSummaryBar`، `GameForm`، `GameResultDialog`، `GameCancelDialog`، `ConfirmDialog`، `usePermissionDependencies`، `PermissionsChecklist`، قرارداد `tab`/فیلتر در URL.

---

## 1. تصمیم‌ها

| # | تصمیم |
|---|---|
| U1 | یک صفحه، دو نما؛ سوییچ با دو دکمه در کارت اطلاعات لیگ و متغیر `activeView` (`"groups" \| "games"`). |
| U2 | فیلترها از dropdownهای اختصاصی (گروه، تیم لیگ، وضعیت بازی) پر می‌شوند، نه از endpointهای لیست. |
| U3 | فرم سمت چپ بر اساس `activeView` عوض می‌شود: فرم گروه یا فرم بازی (ثبت، ویرایش زمان‌بندی، برگزاری مجدد). |
| U4 | ثبت/ویرایش نتیجه و لغو بازی دیالوگ هستند؛ شروع، پاک‌کردن نتیجه و حذف یک دیالوگ تأیید مشترک (با `confirmType`) دارند. همه داخل صفحه. |
| U5 | کارت هر گروه یک دکمه‌ی «بازی‌های این گروه» دارد که `activeView="games"` و فیلتر گروه را ست می‌کند. |
| U6 | بازی‌ها کارت هستند، سه‌تا در هر ردیف روی صفحه‌ی بزرگ. |
| U7 | گارد صفحه از `groups.view` به `competition.view` تغییر می‌کند؛ هر نما دسترسی خودش را دارد. |
| U8 | استور بازی پاسخ‌های کهنه را نادیده می‌گیرد (`latestRequest`، مثل `groupStore`). |
| U9 | خارج از دامنه: skeleton، تست، دکمه‌ی پاک‌کردن فیلترها، endpoint جفت‌ها. |

---

## 2. قراردادهای API

### 2.1 بازی‌ها (ادمین)

پایه: `/admin/leagues/:leagueId/games`

| عملیات | متد و مسیر | بدنه |
|---|---|---|
| لیست | `GET /` | query: `page`, `pageSize`, `status`, `groupId`, `leagueTeamId`, `dateFrom`, `dateTo`, `search`, `resultPending` (فقط `"true"`) |
| ساخت | `POST /` | `homeLeagueTeamId`, `awayLeagueTeamId`, `scheduledDate?`, `scheduledTime?`, `rescheduledFromGameId?` |
| ویرایش زمان‌بندی | `PUT /:gameId` | `scheduledDate`, `scheduledTime` (هر دو مقدار، یا هر دو `null`) |
| شروع / لغو | `PATCH /:gameId/status` | `{ status: "LIVE" }` یا `{ status: "CANCELED", cancelReason?: string \| null }` |
| ثبت/ویرایش نتیجه | `PUT /:gameId/result` | `{ resultType: "NORMAL", homeScore, awayScore, resultNote? }` یا `{ resultType: "FORFEIT", forfeitLeagueTeamId, resultNote? }` |
| پاک‌کردن نتیجه | `DELETE /:gameId/result` | — |
| حذف | `DELETE /:gameId` | — |

آیتم بازی:

```
id, status (SCHEDULED|LIVE|FINISHED|CANCELED), resultType (NORMAL|FORFEIT|null),
group {id,name}|null,
homeTeam / awayTeam { leagueTeamId, team{id,name,logoUrl}, organization{id,name}|null, teamStatus? },
scheduledDate (Jalali|null), scheduledTime ("HH:mm"|null),
homeScore, awayScore, winnerLeagueTeamId, forfeitLeagueTeamId,
rescheduledFrom {id,status}|null, rescheduledTo {id,status}|null,
resultNote, cancelReason,
scheduleLock, startLock, cancelLock, resultLock, deleteLock  // null یا Advisory
issues: Advisory[]  // RESULT_PENDING, UNSCHEDULED, HOME_AWAY_NOT_SWAPPED, OUTSIDE_LEAGUE_PERIOD
```

Advisory: `{ code, severity, message, params }`. قفل `null` یعنی مجاز؛ وگرنه `lock.message` دلیل است.

پاسخ لیست: `{ league:{id,format}, lock, items, total, page, pageSize, summary }`؛ `lock` قفل «ساخت بازی» است (`FINISHED`, `LEAGUE_NOT_ACTIVE`, `FORMAT_NOT_SET`, `FORMAT_NOT_GROUPED`)؛ `summary = { byStatus:{SCHEDULED,LIVE,FINISHED,CANCELED}, resultPending, unfinished, issues }`.

### 2.2 Dropdownها

| کاربرد | Endpoint | آیتم |
|---|---|---|
| فیلتر گروه | `GET /dropdowns/admin/league-groups?leagueId=&page=1&pageSize=100` | `{ value, label }` |
| فیلتر تیم | `GET /dropdowns/admin/league-teams?leagueId=&groupId=&page=1&pageSize=100` | `{ value, label, organizationName, groupId }` |
| فیلتر وضعیت | `GET /dropdown/game-statuses` (در `data.statuses`) | `{ value, label }` |

### 2.3 گروه‌ها (فیلدهای جدید آیتم لیست ادمین)
`lock` (`HAS_GAMES` یا `null`: ترکیب تیم‌ها قفل و حذف گروه ممنوع؛ نام و qualifiers قابل ویرایش)، `gamesCount` (غیرکنسل)، `finishedGamesCount`.

### 2.4 کاتالوگ دسترسی
`GET /admin/users/permissions` → گروه‌هایی از `{ code, label, requires: string[] }` (پیش‌نیازهای مستقیم). `GET/PUT /admin/users/:id/permissions` → `{ permissions: string[] }` (کدهای ذخیره‌شده‌ی expand شده).

---

## 3. استورها

### 3.1 استور جدید `app/store/game/`

`index.ts` دقیقاً مثل `app/store/group/index.ts` (`defineStore("gameStore", ...)` با `...state, ...actions`).

**`state.ts`**

```ts
import { ref } from "vue";

type ListMeta = { total: number; page: number; pageSize: number };

export function useGameState() {
  const loading = ref<boolean>(false);
  const gameList = ref<any[]>([]);
  const gameListMeta = ref<ListMeta | null>(null);
  const gameSummary = ref<any>(null);   // { byStatus, resultPending, unfinished, issues }
  const gameLock = ref<any>(null);      // قفل «ساخت بازی»
  const gameLeague = ref<any>(null);    // { id, format }

  return { loading, gameList, gameListMeta, gameSummary, gameLock, gameLeague };
}
```

**`actions.ts`** (سبک `group/actions.ts`)

```ts
import { useApi } from "~/composables/useApi";
import type { useGameState } from "./state";
import { useHandlerStore } from "../handler";

type StateType = ReturnType<typeof useGameState>;

export function useGameActions(state: StateType) {
  const handlerStore = useHandlerStore();
  const errorMessage = (err: any): string =>
    err.response?.data?.message || "خطای سرور";

  let latestGamesRequest = 0; // فقط آخرین درخواست اجازه‌ی نوشتن در state را دارد

  // GET /admin/leagues/:leagueId/games — games.view
  const getGames = (leagueId: number | string, params: any) => {
    const axios = useApi();
    const requestId = ++latestGamesRequest;
    state.loading.value = true;

    return axios
      .get(`/admin/leagues/${leagueId}/games`, { params })
      .then((res) => {
        if (requestId !== latestGamesRequest) return true;
        const data = res.data.data;
        state.gameList.value = data.items ?? [];
        state.gameListMeta.value = {
          total: data.total, page: data.page, pageSize: data.pageSize,
        };
        state.gameSummary.value = data.summary ?? null;
        state.gameLock.value = data.lock ?? null;
        state.gameLeague.value = data.league ?? null;
        return true;
      })
      .catch((err) => {
        console.log(err);
        if (requestId !== latestGamesRequest) return false;
        handlerStore.setError(errorMessage(err));
        return false;
      })
      .finally(() => {
        if (requestId === latestGamesRequest) state.loading.value = false;
      });
  };

  // همان endpoint، بدون دست‌زدن به state؛ فقط برای راهنمای سهمیه‌ی جفت تیم‌ها
  const fetchPairGames = (leagueId: number | string, params: any): Promise<any[]> => {
    const axios = useApi();
    return axios
      .get(`/admin/leagues/${leagueId}/games`, { params })
      .then((res) => res.data.data.items ?? [])
      .catch(() => []); // بدون toast
  };

  // POST — games.create. آیتم ساخته‌شده یا null
  const createGame = (leagueId: number | string, value: any) => {
    const axios = useApi();
    handlerStore.loadingBtn = true;
    return axios
      .post(`/admin/leagues/${leagueId}/games`, value)
      .then((res) => {
        handlerStore.setSuccess(res.data.message);
        return res.data.data ?? {};
      })
      .catch((err) => {
        console.log(err);
        handlerStore.setError(errorMessage(err));
        return null;
      })
      .finally(() => { handlerStore.loadingBtn = false; });
  };

  // بقیه‌ی mutationها همین قالب را دارند و true/false برمی‌گردانند:
  const mutate = (
    method: "put" | "patch" | "delete",
    url: string,
    body?: any,
  ) => {
    const axios = useApi();
    handlerStore.loadingBtn = true;
    return axios
      .request({ method, url, ...(body !== undefined ? { data: body } : {}) })
      .then((res) => {
        handlerStore.setSuccess(res.data.message);
        return true;
      })
      .catch((err) => {
        console.log(err);
        handlerStore.setError(errorMessage(err));
        return false;
      })
      .finally(() => { handlerStore.loadingBtn = false; });
  };

  const base = (l: number | string) => `/admin/leagues/${l}/games`;

  const updateGameSchedule = (l: number | string, id: number, body: any) =>
    mutate("put", `${base(l)}/${id}`, body);                 // games.update
  const updateGameStatus = (l: number | string, id: number, body: any) =>
    mutate("patch", `${base(l)}/${id}/status`, body);        // games.update
  const enterGameResult = (l: number | string, id: number, body: any) =>
    mutate("put", `${base(l)}/${id}/result`, body);          // games.result
  const clearGameResult = (l: number | string, id: number) =>
    mutate("delete", `${base(l)}/${id}/result`);             // games.result
  const deleteGame = (l: number | string, id: number) =>
    mutate("delete", `${base(l)}/${id}`);                    // games.delete

  const resetGames = () => {
    state.gameList.value = [];
    state.gameListMeta.value = null;
    state.gameSummary.value = null;
    state.gameLock.value = null;
    state.gameLeague.value = null;
  };

  return {
    getGames, fetchPairGames, createGame, updateGameSchedule, updateGameStatus,
    enterGameResult, clearGameResult, deleteGame, resetGames,
  };
}
```

> Mutationها خودشان لیست را reload نمی‌کنند؛ صفحه این کار را می‌کند (بخش ۴.۸).

### 3.2 اضافه‌شدن به استور `dropdown`

`state.ts`:

```ts
const leagueGroupsResult = ref<{ value: number; label: string }[]>([]);
const leagueTeamsResult = ref<
  { value: number; label: string; organizationName: string | null; groupId: number | null }[]
>([]);
const gameStatuses = ref<{ value: string; label: string }[]>([]);
// ...و در return اضافه شوند
```

`actions.ts` (بدون `handlerStore.loading` سراسری، مثل بقیه‌ی dropdownهای ثابت):

```ts
let latestLeagueTeamsRequest = 0;

const getLeagueGroupDropdown = (leagueId: number | string) => {
  const axios = useApi();
  return axios
    .get("/dropdowns/admin/league-groups", { params: { leagueId, page: 1, pageSize: 100 } })
    .then((res) => {
      const list = res.data.data.items ?? [];
      state.leagueGroupsResult.value = Array.isArray(list) ? list : [];
    })
    .catch((err) => {
      console.log(err);
      state.leagueGroupsResult.value = [];
      handlerStore.setError(err.response?.data?.message || "خطای سرور");
    });
};

const getLeagueTeamDropdown = (leagueId: number | string, groupId?: number | null) => {
  const axios = useApi();
  const requestId = ++latestLeagueTeamsRequest;
  return axios
    .get("/dropdowns/admin/league-teams", {
      params: { leagueId, page: 1, pageSize: 100, ...(groupId ? { groupId } : {}) },
    })
    .then((res) => {
      if (requestId !== latestLeagueTeamsRequest) return;
      const list = res.data.data.items ?? [];
      state.leagueTeamsResult.value = Array.isArray(list) ? list : [];
    })
    .catch((err) => {
      console.log(err);
      if (requestId !== latestLeagueTeamsRequest) return;
      state.leagueTeamsResult.value = [];
      handlerStore.setError(err.response?.data?.message || "خطای سرور");
    });
};

const getGameStatuses = () => {
  const axios = useApi();
  return axios
    .get("/dropdown/game-statuses")
    .then((res) => {
      const list = res.data.data.statuses ?? [];
      state.gameStatuses.value = Array.isArray(list) ? list : [];
    })
    .catch((err) => {
      console.log(err);
      handlerStore.setError(err.response?.data?.message || "خطا در دریافت وضعیت‌های بازی");
    });
};

const clearLeagueDropdowns = () => {
  state.leagueGroupsResult.value = [];
  state.leagueTeamsResult.value = [];
};
```

سه تابع اول و `clearLeagueDropdowns` به `return` اضافه شوند.

### 3.3 استورهای موجود
- `groupStore`: بدون تغییر؛ آیتم گروه‌ها `lock/gamesCount/finishedGamesCount` را خودکار دارند.
- `leagueStore.getLeagueById` منبع اطلاعات کارت لیگ است (بخش ۴.۳).

---

## 4. تغییرات `app/pages/competition/index.vue`

همه‌ی کد این بخش داخل همین فایل است.

### 4.1 import و متغیرهای اصلی

```ts
import { useGameStore } from "~/store/game";
const gameStore = useGameStore();

const { hasPermission } = usePermission();

const canGroups = computed(() => hasPermission("groups.view"));
const canGames = computed(() => hasPermission("games.view"));

// ─── متغیر اصلی سوییچ: گروه‌ها یا بازی‌ها ──
const activeView = ref<"groups" | "games">(canGroups.value ? "groups" : "games");

// وقتی فقط یکی از نماها مجاز است، دکمه‌ها نمایش داده نمی‌شوند
const hasBothViews = computed(() => canGroups.value && canGames.value);
```

### 4.2 دو دکمه‌ی سوییچ (در ردیف اکشن‌های کارت اطلاعات لیگ)

بالای دکمه‌های «ویرایش ساختار» و «مدیریت تیم‌های لیگ» اضافه شود:

```vue
<div v-if="hasBothViews" class="tw:flex tw:items-center tw:gap-2 tw:me-auto">
  <v-btn
    rounded="lg"
    size="small"
    :variant="activeView === 'groups' ? 'flat' : 'outlined'"
    :class="activeView === 'groups' ? 'tw:bg-secondary-dark! tw:text-white!' : ''"
    @click="activeView = 'groups'"
  >
    <icon-layer class="tw:text-[16px]" />
    <span class="tw:text-[12px] tw:ms-1!">گروه‌ها</span>
  </v-btn>
  <v-btn
    rounded="lg"
    size="small"
    :variant="activeView === 'games' ? 'flat' : 'outlined'"
    :class="activeView === 'games' ? 'tw:bg-secondary-dark! tw:text-white!' : ''"
    @click="activeView = 'games'"
  >
    <icon-cup class="tw:text-[16px]" />
    <span class="tw:text-[12px] tw:ms-1!">بازی‌ها</span>
  </v-btn>
</div>
```

### 4.3 مقادیر مشتق‌شده (بدون وابستگی به `groups.view`)

```ts
const format = computed<string | null>(
  () => league.value?.format ?? groupStore.groupLeague?.format ?? null,
);
const defaultQualifiers = computed(
  () =>
    league.value?.defaultQualifiersPerGroup ??
    groupStore.groupLeague?.defaultQualifiersPerGroup ??
    null,
);
```

در template به‌جای `groupStore.groupLeague?.defaultQualifiersPerGroup` از `defaultQualifiers` استفاده شود. تایل‌های مخصوص گروه در کارت وضعیت (`isGroupedFormat`) با `v-if="canGroups"` هم محافظت شوند.

### 4.4 گارد صفحه و حالت بدون نما

- `v-if="!hasPermission('competition.view')"` (قبلاً `groups.view`).
- اگر `competition.view` هست ولی `canGroups` و `canGames` هیچ‌کدام نیست: کارت لیگ نشان داده شود و به‌جای بخش پایینی یک پیام: «برای مشاهده‌ی بخش‌های این صفحه دسترسی لازم را ندارید.»

### 4.5 کارت سمت چپ: یک فرم، دو محتوا

ساختار کارت (`formCardRef`) همان است. بعد از بخش آمار و `v-divider`:

```vue
<template v-if="activeView === 'groups' && (hasPermission('groups.create') || hasPermission('groups.update'))">
  <!-- فرم گروه فعلی بدون تغییر -->
</template>

<template v-else-if="activeView === 'games' && (hasPermission('games.create') || hasPermission('games.update'))">
  <v-card-title dir="rtl" class="tw:flex! tw:items-center! tw:gap-1! tw:text-[14px]! tw:font-bold! tw:mb-2! tw:mt-2!">
    <icon-plus v-if="gameFormMode === 'create'" class="tw:text-[20px]" />
    <icon-edit-box v-else class="tw:text-[20px]" />
    <span>{{ gameFormTitle }}</span>
  </v-card-title>

  <v-card-text>
    <!-- قفل «ساخت بازی» (فقط حالت ثبت/برگزاری مجدد) -->
    <v-alert
      v-if="gameFormMode !== 'edit' && gameStore.gameLock"
      type="warning" variant="tonal" density="compact" class="tw:text-[12px]!"
    >
      {{ gameStore.gameLock.message }}
    </v-alert>

    <v-form v-else ref="gameFormRef">
      <!-- حالت ویرایش: فقط خواندنی -->
      <div v-if="gameFormMode === 'edit'" class="tw:text-[13px] tw:mb-3!">
        {{ editingGame.homeTeam.team.name }} - {{ editingGame.awayTeam.team.name }}
        <v-chip v-if="editingGame.group" size="x-small" variant="tonal" class="tw:ms-1!">
          {{ editingGame.group.name }}
        </v-chip>
      </div>

      <v-alert v-if="gameFormMode === 'reschedule'" type="info" variant="tonal"
               density="compact" class="tw:text-[12px]! tw:mb-3!">
        برگزاری مجدد بازی کنسل‌شده‌ی شماره {{ rescheduleSource.id }}
      </v-alert>

      <template v-if="gameFormMode !== 'edit'">
        <v-select
          v-model="gameForm.groupId" :items="formGroupOptions"
          item-title="title" item-value="value"
          variant="outlined" density="compact" hide-details dir="rtl"
          :disabled="gameFormMode === 'reschedule'"
          :rules="[(v: any) => !!v || '']"
          @update:model-value="onFormGroupChange"
        >
          <template #label>
            <span class="tw:text-[12px]">گروه</span>
            <span class="tw:text-red-900 tw:dark:text-red-400 tw:text-[10px]">(الزامی)</span>
          </template>
        </v-select>

        <v-select
          v-model="gameForm.homeId" :items="homeOptions"
          item-title="title" item-value="value"
          variant="outlined" density="compact" hide-details dir="rtl" class="tw:mt-4!"
          :disabled="!gameForm.groupId || gameFormMode === 'reschedule'"
          :rules="[(v: any) => !!v || '']"
        >
          <template #label>
            <span class="tw:text-[12px]">تیم میزبان</span>
            <span class="tw:text-red-900 tw:dark:text-red-400 tw:text-[10px]">(الزامی)</span>
          </template>
        </v-select>

        <v-select
          v-model="gameForm.awayId" :items="awayOptions"
          item-title="title" item-value="value"
          variant="outlined" density="compact" hide-details dir="rtl" class="tw:mt-4!"
          :disabled="!gameForm.groupId || gameFormMode === 'reschedule'"
          :rules="[(v: any) => !!v || '']"
        >
          <template #label>
            <span class="tw:text-[12px]">تیم میهمان</span>
            <span class="tw:text-red-900 tw:dark:text-red-400 tw:text-[10px]">(الزامی)</span>
          </template>
        </v-select>

        <!-- راهنمای سهمیه (فقط راهنما؛ بک‌اند مرجع نهایی است) -->
        <div v-if="pairCount !== null" class="tw:text-[12px] tw:mt-2!"
             :class="pairBlocked ? 'tw:text-red-700 tw:dark:text-red-400' : 'tw:text-color-lighter'">
          {{ pairCount }} از {{ pairMax }} بازی بین این دو تیم ثبت شده است
        </div>
      </template>

      <!-- تاریخ و ساعت: در هر سه حالت -->
      <div class="tw:relative! tw:mt-4!">
        <label v-if="gameForm.date" for="gameDate"
          class="tw:text-[11px] tw:absolute! tw:bg-white! tw:dark:bg-primary-dark! tw:start-3 tw:-top-1.75 tw:z-10! tw:text-color-reverse">
          <span class="tw:text-[12px]">تاریخ بازی</span>
        </label>
        <date-picker
          v-model="gameForm.date" id="gameDate" simple clearable
          placeholder="تاریخ بازی" format="jYYYY/jMM/jDD" display-format="jYYYY/jMM/jDD"
          class="default-scroll tw:text-gray-300! tw:text-[14px]! tw:text-center!"
          color="#1d202e"
        />
      </div>

      <v-text-field
        v-model="gameForm.time" type="time"
        variant="outlined" density="compact" hide-details class="tw:mt-4!"
      >
        <template #label><span class="tw:text-[12px]">ساعت بازی</span></template>
      </v-text-field>

      <v-row class="tw:mt-1!">
        <v-col :cols="gameFormMode === 'create' ? '12' : '6'">
          <v-btn
            block :loading="handlerStore.loadingBtn"
            :disabled="handlerStore.loadingBtn || (gameFormMode !== 'edit' && pairBlocked)"
            class="tw:bg-secondary-dark! tw:dark:bg-secondary-dark! tw:text-white! tw:rounded-md!"
            @click="onGameFormSubmit"
          >
            <icon-check class="tw:text-[18px]" />
            <span class="tw:mr-1!">{{ gameFormMode === "edit" ? "ذخیره" : "افزودن" }}</span>
          </v-btn>
        </v-col>
        <v-col v-if="gameFormMode !== 'create'" cols="6">
          <v-btn block variant="outlined" class="tw:text-[12px]!" @click="resetGameForm">
            انصراف
          </v-btn>
        </v-col>
      </v-row>
    </v-form>
  </v-card-text>
</template>
```

### 4.6 بخش پایین صفحه

- بورد فعلی گروه‌ها (و پیام «format not grouped») داخل `v-if="activeView === 'groups'"`.
- `v-else-if="activeView === 'games'"` بخش بازی‌ها (بخش‌های ۴.۷ تا ۴.۹).

### 4.7 فیلترها و لیست بازی‌ها

**State و بارگذاری**

```ts
const gameFilters = reactive({
  search: "",
  groupId: null as number | null,
  status: null as string | null,
  leagueTeamId: null as number | null,
  dateFrom: "",
  dateTo: "",
  resultPending: false,
});
const gamePage = ref<number>(1);
const gamePageSize = ref<number>(12);       // مضرب ۲ و ۳
const gameTotal = computed(() => gameStore.gameListMeta?.total ?? 0);

// کلید آخرین fetch؛ برای حذف echoهای تکراری Pagination (مثل organizations/teams)
let lastGamesKey = `${gamePage.value}:${gamePageSize.value}`;

const loadGames = () => {
  const id = selectedLeagueId.value;
  if (!id || !canGames.value) return;
  lastGamesKey = `${gamePage.value}:${gamePageSize.value}`;

  const params: Record<string, any> = {
    page: gamePage.value,
    pageSize: gamePageSize.value,
  };
  if (gameFilters.search) params.search = gameFilters.search;
  if (gameFilters.groupId) params.groupId = gameFilters.groupId;
  if (gameFilters.status) params.status = gameFilters.status;
  if (gameFilters.leagueTeamId) params.leagueTeamId = gameFilters.leagueTeamId;
  if (gameFilters.dateFrom) params.dateFrom = gameFilters.dateFrom;
  if (gameFilters.dateTo) params.dateTo = gameFilters.dateTo;
  if (gameFilters.resultPending) params.resultPending = "true";

  return gameStore.getGames(id, params);
};

const onGamesOptionsChange = (options: { page: number; itemsPerPage: number }) => {
  const key = `${options.page}:${options.itemsPerPage}`;
  if (key === lastGamesKey) return;
  gamePage.value = options.page;
  gamePageSize.value = options.itemsPerPage;
  loadGames();
};

const onGameFilterChange = () => {
  gamePage.value = 1;
  loadGames();
};

let gameSearchTimeout: ReturnType<typeof setTimeout> | null = null;
const onGameSearchChange = () => {
  if (gameSearchTimeout) clearTimeout(gameSearchTimeout);
  gameSearchTimeout = setTimeout(onGameFilterChange, 300);
};

const onGameGroupFilterChange = () => {
  const id = selectedLeagueId.value;
  if (id) {
    dropdownStore.getLeagueTeamDropdown(id, gameFilters.groupId).then(() => {
      const ok = dropdownStore.leagueTeamsResult.some(
        (t) => t.value === gameFilters.leagueTeamId,
      );
      if (!ok && gameFilters.leagueTeamId !== null) {
        gameFilters.leagueTeamId = null;
        onGameFilterChange();
      }
    });
  }
  onGameFilterChange();
};

const onGameDateChange = () => {
  if (
    gameFilters.dateFrom && gameFilters.dateTo &&
    gameFilters.dateFrom > gameFilters.dateTo   // رشته‌ی جلالی صفرپر → مقایسه‌ی لغوی درست است
  ) {
    handlerStore.setError("تاریخ شروع نمی‌تواند بعد از تاریخ پایان باشد.");
    return;
  }
  onGameFilterChange();
};

const resetGameFilters = () =>
  Object.assign(gameFilters, {
    search: "", groupId: null, status: null, leagueTeamId: null,
    dateFrom: "", dateTo: "", resultPending: false,
  });
```

**نوار خلاصه (چیپ‌ها داخل همان صفحه)**

```vue
<div v-if="gameStore.gameSummary" class="tw:flex tw:flex-wrap tw:gap-2 tw:mb-4!">
  <v-chip
    v-for="s in dropdownStore.gameStatuses" :key="s.value" size="small"
    :variant="gameFilters.status === s.value ? 'flat' : 'tonal'"
    :color="gameStatusColor(s.value)"
    @click="gameFilters.status = gameFilters.status === s.value ? null : s.value; onGameFilterChange()"
  >
    {{ s.label }}: {{ gameStore.gameSummary.byStatus?.[s.value] ?? 0 }}
  </v-chip>
  <v-chip
    v-if="gameStore.gameSummary.resultPending > 0" size="small" color="warning"
    :variant="gameFilters.resultPending ? 'flat' : 'tonal'"
    @click="gameFilters.resultPending = !gameFilters.resultPending; onGameFilterChange()"
  >
    نتیجه‌ی ثبت‌نشده: {{ gameStore.gameSummary.resultPending }}
  </v-chip>
</div>
```

**کارت فیلتر** (`v-card class="tw:rounded-xl! tw:mb-4!"` + `v-row` با ستون‌های ریسپانسیو؛ همه‌ی فیلدها `variant="outlined" density="compact" hide-details dir="rtl"`):

| فیلتر | کنترل | منبع | رویداد |
|---|---|---|---|
| جستجوی نام تیم | `v-text-field` + `icon-magnify` | `gameFilters.search` | `@update:model-value="onGameSearchChange"` |
| گروه | `v-select clearable` | `dropdownStore.leagueGroupsResult` | `onGameGroupFilterChange` |
| وضعیت | `v-select clearable` | `dropdownStore.gameStatuses` | `onGameFilterChange` |
| تیم | `v-autocomplete clearable` (`item-props` برای `organizationName` به‌عنوان subtitle) | `dropdownStore.leagueTeamsResult` | `onGameFilterChange` |
| از تاریخ / تا تاریخ | `date-picker simple clearable` (با label شناور مثل صفحه‌ی seasons) | `dateFrom` / `dateTo` | `@change="onGameDateChange"` |
| فقط نتیجه‌ی ثبت‌نشده | `v-switch color="secondary" density="compact"` | `resultPending` | `onGameFilterChange` |

### 4.8 کارت بازی (inline با `v-for`)

شبکه: `v-row dense` ← `v-col v-for="game in gameStore.gameList" :key="game.id" cols="12" md="6" lg="4"`. کارت: `v-card rounded="lg" class="tw:p-4!"`.

چیدمان (RTL؛ اولین آیتم سمت راست):

```
[تاریخ / «تاریخ نامشخص»]            [چیپ گروه] [چیپ وضعیت]
[لوگو+نام میزبان+سازمان]  [نمره VS نمره]  [لوگو+نام میهمان+سازمان]
                                [ساعت]
خطوط توضیح + چیپ‌های issue
[دکمه‌ی اصلی]                                  [منوی ⋮]
```

```vue
<v-card
  rounded="lg" class="tw:p-4! tw:h-full!"
  :class="[
    hasIssue(game, 'RESULT_PENDING') ? 'tw:border-2! tw:border-orange-400!' : '',
    game.status === 'CANCELED' ? 'tw:opacity-70' : '',
  ]"
>
  <div class="tw:flex tw:items-center tw:justify-between tw:gap-2">
    <div class="tw:flex tw:items-center tw:gap-1 tw:text-[12px] tw:text-gray-600 tw:dark:text-gray-300">
      <icon-date class="tw:text-[16px]" />
      {{ game.scheduledDate ?? "تاریخ نامشخص" }}
    </div>
    <div class="tw:flex tw:items-center tw:gap-1">
      <v-chip v-if="game.group" size="x-small" variant="tonal">{{ game.group.name }}</v-chip>
      <v-tooltip location="top" :disabled="!game.cancelReason">
        <template #activator="{ props }">
          <v-chip v-bind="props" size="x-small" variant="tonal" :color="gameStatusColor(game.status)">
            {{ gameStatusLabel(game.status) }}
          </v-chip>
        </template>
        <span class="tw:text-xs tw:p-2">{{ game.cancelReason }}</span>
      </v-tooltip>
    </div>
  </div>

  <!-- ردیف تیم‌ها -->
  <div class="tw:flex tw:items-center tw:justify-between tw:gap-2 tw:mt-4!">
    <!-- میزبان (راست) -->
    <div class="tw:flex tw:flex-col tw:items-center tw:gap-1 tw:flex-1 tw:min-w-0 tw:text-center">
      <v-avatar size="44" class="tw:bg-secondary-dark! tw:p-1!">
        <v-img :src="game.homeTeam.team.logoUrl || defaultTeamLogo" cover />
      </v-avatar>
      <div class="tw:text-[13px] tw:truncate tw:w-full"
           :class="[isWinner(game, game.homeTeam) ? 'tw:font-bold!' : '',
                    game.status === 'CANCELED' ? 'tw:line-through' : '',
                    game.homeTeam.teamStatus === 'DELETED' ? 'tw:opacity-60' : '']">
        {{ game.homeTeam.team.name }}
      </div>
      <div class="tw:text-[11px] tw:text-color-lighter tw:truncate tw:w-full">
        {{ game.homeTeam.organization?.name ?? "—" }}
      </div>
    </div>

    <!-- مرکز: نمره یا VS -->
    <div class="tw:flex tw:flex-col tw:items-center tw:gap-1">
      <div v-if="game.homeScore !== null" class="tw:flex tw:items-center tw:gap-1">
        <div class="tw:px-3 tw:py-1 tw:rounded-md tw:text-[16px]"
             :class="isWinner(game, game.homeTeam)
               ? 'tw:bg-green-100 tw:dark:bg-green-900/30 tw:font-bold'
               : 'tw:bg-gray-100 tw:dark:bg-gray-700'">
          {{ game.homeScore }}
        </div>
        <span>:</span>
        <div class="tw:px-3 tw:py-1 tw:rounded-md tw:text-[16px]"
             :class="isWinner(game, game.awayTeam)
               ? 'tw:bg-green-100 tw:dark:bg-green-900/30 tw:font-bold'
               : 'tw:bg-gray-100 tw:dark:bg-gray-700'">
          {{ game.awayScore }}
        </div>
      </div>
      <div v-else class="tw:text-[14px] tw:text-color-lighter">VS</div>
      <div v-if="game.scheduledTime" class="tw:text-[11px] tw:text-color-lighter">
        {{ game.scheduledTime }}
      </div>
    </div>

    <!-- میهمان (چپ): همان ساختار میزبان با game.awayTeam -->
  </div>

  <!-- توضیح‌ها -->
  <div class="tw:text-[12px] tw:mt-3! tw:flex tw:flex-col tw:gap-1">
    <div v-if="game.resultType === 'FORFEIT'">
      فورفیت: تیم {{ forfeitTeamName(game) }} حاضر نشد؛ نتیجه
      {{ Math.max(game.homeScore, game.awayScore) }} بر
      {{ Math.min(game.homeScore, game.awayScore) }} ثبت شده است.
    </div>
    <div v-if="game.rescheduledTo">
      این بازی کنسل شده است؛ بازی جایگزین: شماره {{ game.rescheduledTo.id }}.
    </div>
    <div v-if="game.rescheduledFrom">
      این بازی جایگزین بازی کنسل‌شده‌ی شماره {{ game.rescheduledFrom.id }} است.
    </div>
    <div v-if="hasIssue(game, 'RESULT_PENDING')" class="tw:text-orange-600">
      تاریخ بازی گذشته و نتیجه ثبت نشده است.
    </div>
  </div>
  <div v-if="otherIssues(game).length" class="tw:flex tw:flex-wrap tw:gap-1 tw:mt-2!">
    <AdvisoryChip v-for="(issue, i) in otherIssues(game)" :key="`${issue.code}-${i}`" :advisory="issue" />
  </div>

  <!-- اکشن‌ها -->
  <div class="tw:flex tw:items-center tw:justify-between tw:gap-2 tw:mt-4!">
    <v-tooltip v-if="primaryAction(game)" location="top" :disabled="!primaryAction(game)!.lock">
      <template #activator="{ props }">
        <span v-bind="props">
          <v-btn size="small" variant="outlined" :disabled="!!primaryAction(game)!.lock"
                 @click="primaryAction(game)!.run()">
            {{ primaryAction(game)!.title }}
          </v-btn>
        </span>
      </template>
      <span class="tw:text-xs tw:p-2">{{ primaryAction(game)!.lock?.message }}</span>
    </v-tooltip>
    <div v-else></div>

    <v-menu v-if="menuActions(game).length">
      <template #activator="{ props }">
        <v-btn v-bind="props" size="x-small" variant="plain" rounded="pill" icon aria-label="عملیات">
          <icon-more-vertical class="tw:text-[20px] tw:text-color-lighter" />
        </v-btn>
      </template>
      <v-list density="compact" class="tw:py-0!">
        <v-tooltip v-for="a in menuActions(game)" :key="a.key" location="start" :disabled="!a.lock">
          <template #activator="{ props }">
            <div v-bind="props">
              <v-list-item :disabled="!!a.lock" class="tw:py-2!" @click="a.run()">
                <v-list-item-title class="tw:text-[12px]!">{{ a.title }}</v-list-item-title>
              </v-list-item>
            </div>
          </template>
          <span class="tw:text-xs tw:p-2">{{ a.lock?.message }}</span>
        </v-tooltip>
      </v-list>
    </v-menu>
  </div>
</v-card>
```

بعد از شبکه: حالت لودینگ/خالی مثل صفحه‌ی leagues (`v-progress-circular` و بلوک «اطلاعاتی یافت نشد» با `icon-row-chart`) و Pagination:

```vue
<v-card rounded="lg" class="tw:mt-4!" v-if="gameTotal > gamePageSize">
  <Pagination v-model:page="gamePage" v-model:items-per-page="gamePageSize"
              :items-length="gameTotal" @update-options="onGamesOptionsChange" />
</v-card>
```

قفل لیست (`gameStore.gameLock`) بالای شبکه با `v-alert type="warning"` نشان داده می‌شود.

**توابع کمکی کارت (داخل script صفحه)**

```ts
const gameStatusLabel = (v: string) =>
  dropdownStore.gameStatuses.find((s) => s.value === v)?.label ?? v;

const gameStatusColor = (v: string) =>
  ({ SCHEDULED: "info", LIVE: "warning", FINISHED: "success" } as Record<string, string>)[v] ?? "default";

// برنده را از winnerLeagueTeamId می‌گیریم، هرگز از روی نمره محاسبه نمی‌کنیم
const isWinner = (game: any, team: any) =>
  game.winnerLeagueTeamId !== null && game.winnerLeagueTeamId === team.leagueTeamId;

const forfeitTeamName = (game: any) =>
  [game.homeTeam, game.awayTeam].find((t) => t.leagueTeamId === game.forfeitLeagueTeamId)?.team.name ?? "—";

const hasIssue = (game: any, code: string) =>
  (game.issues ?? []).some((i: any) => i.code === code);
const otherIssues = (game: any) =>
  (game.issues ?? []).filter((i: any) => i.code !== "RESULT_PENDING");

const primaryAction = (game: any) => {
  if (game.status === "CANCELED") {
    if (game.rescheduledTo || !hasPermission("games.create")) return null;
    return { title: "برگزاری مجدد", lock: gameStore.gameLock, run: () => openReschedule(game) };
  }
  if (!hasPermission("games.result")) return null;
  return {
    title: game.status === "FINISHED" ? "ویرایش نتیجه" : "ثبت نتیجه",
    lock: game.resultLock,
    run: () => openResultDialog(game),
  };
};

const menuActions = (game: any) => {
  const list: { key: string; title: string; lock: any; run: () => void }[] = [];
  if (hasPermission("games.update")) {
    list.push({ key: "schedule", title: "ویرایش زمان‌بندی", lock: game.scheduleLock, run: () => openEditSchedule(game) });
    if (game.status === "SCHEDULED")
      list.push({ key: "start", title: "شروع بازی", lock: game.startLock, run: () => openConfirm("start", game) });
    if (game.status === "SCHEDULED" || game.status === "LIVE")
      list.push({ key: "cancel", title: "لغو بازی", lock: game.cancelLock, run: () => openCancelDialog(game) });
  }
  if (hasPermission("games.result") && game.status === "FINISHED")
    list.push({ key: "clear", title: "پاک کردن نتیجه", lock: game.resultLock, run: () => openConfirm("clear", game) });
  if (hasPermission("games.delete"))
    list.push({ key: "delete", title: "حذف بازی", lock: game.deleteLock, run: () => openConfirm("delete", game) });
  return list;
};
```

قاعده: کنترل قفل‌شده **مخفی نمی‌شود**، disabled با tooltip دلیل نمایش داده می‌شود؛ کنترل بدون دسترسی اصلاً نمایش داده نمی‌شود.

### 4.9 فرم بازی (کد script)

```ts
const gameFormRef = ref<any>(null);
const editingGame = ref<any>(null);
const rescheduleSource = ref<any>(null);

const gameFormMode = computed<"create" | "edit" | "reschedule">(() =>
  rescheduleSource.value ? "reschedule" : editingGame.value ? "edit" : "create",
);
const gameFormTitle = computed(
  () => ({ create: "ثبت بازی", edit: "ویرایش زمان‌بندی بازی", reschedule: "برگزاری مجدد بازی" })[gameFormMode.value],
);

const defaultGameForm = () => ({
  groupId: null as number | null,
  homeId: null as number | null,
  awayId: null as number | null,
  date: "",
  time: "",
});
const gameForm = reactive(defaultGameForm());

const resetGameForm = () => {
  editingGame.value = null;
  rescheduleSource.value = null;
  Object.assign(gameForm, defaultGameForm());
  pairCount.value = null;
};

// گزینه‌ها از groupStore (تیم‌ها همراه گروه‌ها لود شده‌اند؛ درخواست جدید لازم نیست)
const activeTeams = (g: any) => g.teams.filter((t: any) => t.teamStatus !== "DELETED");

const formGroupOptions = computed(() =>
  groupStore.groupList.map((g: any) => ({
    value: g.id,
    title: activeTeams(g).length < 2 ? `${g.name} (کمتر از دو تیم)` : g.name,
    props: { disabled: activeTeams(g).length < 2 },
  })),
);

const formTeamOptions = computed(() => {
  const g = groupStore.groupList.find((x: any) => x.id === gameForm.groupId);
  return g
    ? activeTeams(g).map((t: any) => ({ value: t.leagueTeamId, title: t.team.name }))
    : [];
});
const homeOptions = computed(() => formTeamOptions.value.filter((o) => o.value !== gameForm.awayId));
const awayOptions = computed(() => formTeamOptions.value.filter((o) => o.value !== gameForm.homeId));

const onFormGroupChange = () => {
  gameForm.homeId = null;
  gameForm.awayId = null;
  pairCount.value = null;
};

// راهنمای سهمیه‌ی جفت تیم‌ها
const pairCount = ref<number | null>(null);
const pairMax = computed(() => (league.value?.groupRoundType === "DOUBLE_ROUND" ? 2 : 1));
const pairBlocked = computed(() => pairCount.value !== null && pairCount.value >= pairMax.value);

watch(
  () => [gameForm.homeId, gameForm.awayId],
  async ([home, away]) => {
    pairCount.value = null;
    const id = selectedLeagueId.value;
    if (!id || !home || !away || gameFormMode.value === "edit") return;
    const games = await gameStore.fetchPairGames(id, { leagueTeamId: home, page: 1, pageSize: 100 });
    // اگر در این فاصله انتخاب عوض شده، نتیجه را دور بریز
    if (gameForm.homeId !== home || gameForm.awayId !== away) return;
    pairCount.value = games.filter(
      (g: any) =>
        g.status !== "CANCELED" &&
        (g.homeTeam.leagueTeamId === away || g.awayTeam.leagueTeamId === away),
    ).length;
  },
);

const openEditSchedule = (game: any) => {
  resetGameForm();
  editingGame.value = game;
  gameForm.date = game.scheduledDate ?? "";
  gameForm.time = game.scheduledTime ?? "";
  scrollFormIntoView();
};

const openReschedule = (game: any) => {
  resetGameForm();
  rescheduleSource.value = game;
  gameForm.groupId = game.group?.id ?? null;
  gameForm.homeId = game.homeTeam.leagueTeamId;
  gameForm.awayId = game.awayTeam.leagueTeamId;
  scrollFormIntoView();
};

const scrollFormIntoView = () => {
  if (!mobile.value) return;
  nextTick(() => {
    formCardRef.value?.$el?.scrollIntoView({ behavior: "smooth", block: "start" });
  });
};

const onGameFormSubmit = () => {
  const leagueId = selectedLeagueId.value;
  if (!leagueId) return;

  const date = gameForm.date || null;
  const time = gameForm.time || null;
  if ((date === null) !== (time === null)) {
    handlerStore.setError("تاریخ و ساعت باید همزمان وارد شوند.");
    return;
  }

  // ویرایش: فقط زمان‌بندی
  if (gameFormMode.value === "edit") {
    if (editingGame.value.scheduleLock) {
      handlerStore.setError(editingGame.value.scheduleLock.message);
      resetGameForm();
      return;
    }
    gameStore
      .updateGameSchedule(leagueId, editingGame.value.id, { scheduledDate: date, scheduledTime: time })
      .then((ok) => {
        if (!ok) return;
        resetGameForm();
        onGamesChanged();
      });
    return;
  }

  // ثبت و برگزاری مجدد
  if (!gameForm.groupId || !gameForm.homeId || !gameForm.awayId) {
    handlerStore.setError("لطفا تمام فیلدهای الزامی را پر کنید.");
    return;
  }
  gameStore
    .createGame(leagueId, {
      homeLeagueTeamId: gameForm.homeId,
      awayLeagueTeamId: gameForm.awayId,
      ...(date ? { scheduledDate: date, scheduledTime: time } : {}),
      ...(rescheduleSource.value ? { rescheduledFromGameId: rescheduleSource.value.id } : {}),
    })
    .then((created) => {
      if (!created) return;
      resetGameForm();
      onGamesChanged();
    });
};
```

### 4.10 دیالوگ نتیجه، لغو و تأیید (همه در صفحه)

دیالوگ‌ها با همان پوسته‌ی دیالوگ‌های موجود (`max-width`، `dir="rtl"`، `class="blur-dialog"`، نوار عنوان تیره).

```ts
// ── نتیجه ──
const resultDialogOpen = ref(false);
const resultTarget = ref<any>(null);
const resultForm = reactive({
  type: "NORMAL" as "NORMAL" | "FORFEIT",
  homeScore: "" as string | number,
  awayScore: "" as string | number,
  forfeitId: null as number | null,
  note: "",
});

const openResultDialog = (game: any) => {
  resultTarget.value = game;
  const finished = game.status === "FINISHED";
  resultForm.type = finished && game.resultType === "FORFEIT" ? "FORFEIT" : "NORMAL";
  resultForm.homeScore = finished && game.resultType === "NORMAL" ? game.homeScore : "";
  resultForm.awayScore = finished && game.resultType === "NORMAL" ? game.awayScore : "";
  resultForm.forfeitId = game.forfeitLeagueTeamId ?? null;
  resultForm.note = game.resultNote ?? "";
  resultDialogOpen.value = true;
};

const resultIsTie = computed(
  () =>
    resultForm.type === "NORMAL" &&
    resultForm.homeScore !== "" && resultForm.awayScore !== "" &&
    Number(resultForm.homeScore) === Number(resultForm.awayScore),
);

// فقط نمایش؛ تکرار قانون بک‌اند (forfeitScores در games.rules.ts). سرور خودش 0/20 می‌نویسد.
const FORFEIT_DISPLAY_SCORE = 20;

const onResultSubmit = () => {
  const leagueId = selectedLeagueId.value;
  const game = resultTarget.value;
  if (!leagueId || !game) return;

  let body: any;
  if (resultForm.type === "NORMAL") {
    const h = Number(resultForm.homeScore);
    const a = Number(resultForm.awayScore);
    if (resultForm.homeScore === "" || resultForm.awayScore === "" ||
        !Number.isInteger(h) || !Number.isInteger(a) || h < 0 || a < 0) {
      handlerStore.setError("امتیازها باید عدد صحیح و غیرمنفی باشند.");
      return;
    }
    if (h === a) {
      handlerStore.setError("در بسکتبال نتیجه‌ی مساوی ثبت نمی‌شود.");
      return;
    }
    body = { resultType: "NORMAL", homeScore: h, awayScore: a, resultNote: resultForm.note.trim() || null };
  } else {
    if (!resultForm.forfeitId) {
      handlerStore.setError("تیم فورفیت‌کننده را انتخاب کنید.");
      return;
    }
    body = { resultType: "FORFEIT", forfeitLeagueTeamId: resultForm.forfeitId, resultNote: resultForm.note.trim() || null };
  }

  gameStore.enterGameResult(leagueId, game.id, body).then((ok) => {
    if (!ok) return;
    resultDialogOpen.value = false;
    onGamesChanged();
  });
};
```

محتوای دیالوگ نتیجه: عنوان «ثبت نتیجه» یا «ویرایش نتیجه» (بر اساس `resultTarget.status`)؛ نمایش دو تیم؛ دو دکمه‌ی انتخاب نوع («عادی» / «فورفیت») با `resultForm.type`؛ حالت عادی دو `v-text-field type="number"` (`min=0`) با label نام تیم‌ها و پیام خطای تساوی؛ حالت فورفیت `v-radio-group` دو تیم + متن پیش‌نمایش «{تیم فورفیت} ۰ و {تیم دیگر} ۲۰»؛ `v-textarea` اختیاری «یادداشت نتیجه» (۲ ردیف). دکمه‌ی ثبت `:disabled="resultIsTie || handlerStore.loadingBtn"`.

```ts
// ── لغو ──
const cancelDialogOpen = ref(false);
const cancelTarget = ref<any>(null);
const cancelReason = ref("");

const openCancelDialog = (game: any) => {
  cancelTarget.value = game;
  cancelReason.value = "";
  cancelDialogOpen.value = true;
};
const onCancelConfirm = () => {
  const leagueId = selectedLeagueId.value;
  if (!leagueId || !cancelTarget.value) return;
  gameStore
    .updateGameStatus(leagueId, cancelTarget.value.id, {
      status: "CANCELED",
      cancelReason: cancelReason.value.trim() || null,
    })
    .then((ok) => {
      if (!ok) return;
      cancelDialogOpen.value = false;
      onGamesChanged();
    });
};

// ── تأیید مشترک: شروع / پاک‌کردن نتیجه / حذف (الگوی teams.vue) ──
const confirmOpen = ref(false);
const confirmType = ref<"start" | "clear" | "delete">("delete");
const confirmTarget = ref<any>(null);

const confirmTexts = {
  start:  { title: "شروع بازی",     text: "بازی در وضعیت «در حال برگزاری» قرار می‌گیرد.", btn: "شروع" },
  clear:  { title: "پاک کردن نتیجه", text: "نتیجه‌ی بازی پاک می‌شود و بازی به حالت برنامه‌ریزی‌شده برمی‌گردد.", btn: "پاک کردن" },
  delete: { title: "حذف بازی",      text: "آیا از حذف این بازی مطمئن هستید؟", btn: "حذف" },
} as const;

const openConfirm = (type: "start" | "clear" | "delete", game: any) => {
  confirmType.value = type;
  confirmTarget.value = game;
  confirmOpen.value = true;
};

const onConfirm = () => {
  const leagueId = selectedLeagueId.value;
  const game = confirmTarget.value;
  if (!leagueId || !game) return;
  const request =
    confirmType.value === "start"
      ? gameStore.updateGameStatus(leagueId, game.id, { status: "LIVE" })
      : confirmType.value === "clear"
        ? gameStore.clearGameResult(leagueId, game.id)
        : gameStore.deleteGame(leagueId, game.id);
  request.then((ok) => {
    if (!ok) return;
    confirmOpen.value = false;
    confirmTarget.value = null;
    onGamesChanged();
  });
};
```

### 4.11 هماهنگی (orchestration) و رفتار تغییر نما

```ts
// بعد از هر تغییر موفق بازی: لیست، شمارنده/قفل گروه‌ها و dropdownها تازه شوند
const onGamesChanged = () => {
  loadGames();
  refreshData(true);      // گروه‌ها + لیگ (قفل HAS_GAMES و شمارنده‌ها)
  loadFilterOptions();
};

const loadFilterOptions = () => {
  const id = selectedLeagueId.value;
  if (!id || !canGames.value) return;
  dropdownStore.getLeagueGroupDropdown(id);
  dropdownStore.getLeagueTeamDropdown(id, gameFilters.groupId);
};

// تغییر نما
watch(activeView, (view) => {
  // فرم پنهان هرگز داده‌ی ویرایشی کهنه نگه ندارد
  resetGameForm();
  openCreateMode();                     // فرم گروه (موجود)
  if (view === "games" && selectedLeagueId.value) {
    loadGames();
    loadFilterOptions();
  }
});
```

تغییرات `loadLeague(id)`:

```ts
// داخل loadLeague، بعد از resetLocal():
gameStore.resetGames();
dropdownStore.clearLeagueDropdowns();
resetGameFilters();
resetGameForm();
gamePage.value = 1;

// گروه‌ها فقط وقتی دسترسی هست
Promise.all([
  leagueStore.getLeagueById(id),
  canGroups.value ? groupStore.getGroups(id) : Promise.resolve(true),
]).then(([lg, ok]) => {
  if (token !== loadToken) return;
  if (!lg || !ok) { pageState.value = "error"; return; }
  league.value = lg;
  pageState.value = "ready";
  if (canGroups.value && isGroupedFormat.value) loadUnassigned();
  if (activeView.value === "games") { loadGames(); }
  loadFilterOptions();
});
```

تغییرات `onMounted`: اگر `canGames` و `dropdownStore.gameStatuses` خالی است → `dropdownStore.getGameStatuses()`. بعد از ساخت/حذف گروه (در `onFormSubmit` و `onDeleteConfirm` گروه) → `loadFilterOptions()`.

---

## 5. تغییرات بورد گروه‌ها (افزایشی)

۱. **دکمه‌ی «بازی‌های این گروه»** در دکمه‌های هدر کارت گروه (کنار info/edit/delete)، با `v-if="canGames"`:

```vue
<v-tooltip v-if="canGames" location="top">
  <template #activator="{ props }">
    <v-btn v-bind="props" size="small" variant="text" rounded="0"
           class="tw:min-w-2! tw:border-s! tw:border-gray-300! tw:dark:border-gray-600!"
           aria-label="بازی‌های این گروه" @click="openGroupGames(group.id)">
      <icon-list class="tw:text-[16px]" />
    </v-btn>
  </template>
  <span class="tw:text-xs tw:p-2">بازی‌های این گروه</span>
</v-tooltip>
```

```ts
const openGroupGames = (groupId: number) => {
  resetGameFilters();
  gameFilters.groupId = groupId;
  gamePage.value = 1;
  activeView.value = "games";           // watcher نما، لیست را لود می‌کند
  const id = selectedLeagueId.value;
  if (id) dropdownStore.getLeagueTeamDropdown(id, groupId);
};
```

زیر نام گروه (وقتی `group.gamesCount > 0`): «{{ group.finishedGamesCount }} از {{ group.gamesCount }} بازی دارای نتیجه».

۲. **قفل هر گروه** (`group.lock` برابر `null` یا advisory):
- در منوی info یک ردیف با پیام قفل و نقطه‌ی قرمز.
- `draggable` هر گروه: `:group="{ name: 'teams', pull: !group.lock, put: !group.lock }"` (لیست «بدون گروه» همان `group="teams"` می‌ماند).
- در `moveTeam` قبل از تغییر خوش‌بینانه:

```ts
const srcGroup = groupStore.groupList.find((g: any) => g.id === fromGroupId);
const dstGroup = groupStore.groupList.find((g: any) => g.id === toGroupId);
const lock = srcGroup?.lock ?? dstGroup?.lock;
if (lock) {
  handlerStore.setError(lock.message);
  return Promise.resolve();
}
```

- منوهای «انتقال» و دکمه‌ی «حذف از گروه»: آیتم/دکمه‌ی گروه قفل‌شده `disabled` با پیام قفل.
- دکمه‌ی **حذف گروه**: `:disabled="!!group.lock || !!groupStore.groupLock || mutating"` با tooltip پیام قفل. **ویرایش گروه** با وجود بازی فعال می‌ماند (نام و qualifiers قابل ویرایش‌اند).

---

## 6. دسترسی‌ها (بیرون از صفحه)

- `app/components/appHeader/index.vue`: آیتم `competition` با `hasPermission("competition.view")` فیلتر شود (قبلاً `groups.view`).
- `app/pages/leagues/index.vue`: شرط دکمه‌ی جام «مدیریت مسابقات» → `hasPermission('competition.view')`.
- باقی نیاز به تغییر ندارد؛ بک‌اند هنگام صدور توکن وابستگی‌ها را expand می‌کند.

ماتریس دسترسی:

| عنصر | دسترسی |
|---|---|
| صفحه، منو، لینک از صفحه‌ی لیگ‌ها | `competition.view` |
| نمای گروه‌ها و درخواست‌هایش | `groups.view` |
| نمای بازی‌ها و درخواست‌هایش | `games.view` |
| ثبت بازی و برگزاری مجدد | `games.create` |
| ویرایش زمان‌بندی، شروع، لغو | `games.update` |
| ثبت/ویرایش/پاک‌کردن نتیجه | `games.result` |
| حذف بازی | `games.delete` |

هر اکشن علاوه بر دسترسی، با قفل خودش کنترل می‌شود (disabled + دلیل).

---

## 7. UI وابستگی دسترسی‌ها (`app/pages/users/index.vue`) — همه داخل همین صفحه

بدون composable و بدون کامپوننت جدید. دو نقطه‌ی نمایش (پنل دسکتاپ و دیالوگ موبایل) همان مارک‌آپ فعلی را نگه می‌دارند و فقط به توابع زیر وصل می‌شوند.

### 7.1 توابع داخل script

```ts
// ─── وابستگی دسترسی‌ها ──
type CatalogItem = { code: string; label: string; requires: string[] };

const permissionItems = computed<CatalogItem[]>(() =>
  permissionCatalog.value.flatMap((g) => g.permissions as CatalogItem[]),
);
const labelByCode = computed(
  () => new Map(permissionItems.value.map((p) => [p.code, p.label])),
);
const requiresByCode = computed(
  () => new Map(permissionItems.value.map((p) => [p.code, p.requires ?? []])),
);

// کدها + همه‌ی پیش‌نیازهای transitive (بدون تکرار)
const closure = (codes: string[]): string[] => {
  const result = new Set<string>();
  const queue = [...codes];
  while (queue.length) {
    const code = queue.pop()!;
    if (result.has(code)) continue;
    result.add(code);
    queue.push(...(requiresByCode.value.get(code) ?? []));
  }
  return [...result];
};

// دسترسی‌های تیک‌خورده‌ی دیگری که به این کد نیاز دارند
const dependentsOf = (code: string): string[] =>
  checkedPermissions.value.filter(
    (c) => c !== code && closure([c]).includes(code),
  );

const isPermissionLocked = (code: string) => dependentsOf(code).length > 0;

const lockHint = (code: string) =>
  `لازمه‌ی: ${dependentsOf(code).map((c) => labelByCode.value.get(c) ?? c).join("، ")}`;

const togglePermission = (code: string) => {
  const idx = checkedPermissions.value.indexOf(code);
  if (idx !== -1) {
    if (isPermissionLocked(code)) return;           // چک‌باکس در UI هم disabled است
    checkedPermissions.value.splice(idx, 1);
    return;
  }
  const needed = closure([code]).filter(
    (c) => c !== code && !checkedPermissions.value.includes(c),
  );
  checkedPermissions.value.push(code, ...needed);
  if (needed.length) {
    handlerStore.setInfo(
      `برای «${labelByCode.value.get(code) ?? code}» دسترسی‌های «${needed
        .map((c) => labelByCode.value.get(c) ?? c)
        .join("، ")}» هم لازم است و به‌صورت خودکار اضافه شد.`,
    );
  }
};
```

نوع `permissionCatalog` به `{ title; permissions: { code; label; requires: string[] }[] }[]` تغییر کند.

### 7.2 `openPermissionsDrawer`

```ts
.then(([catalogRes, userPermissions]) => {
  permissionCatalog.value = catalogRes;
  // دسترسی‌هایی که بدون پیش‌نیاز ذخیره شده‌اند هم (چون عملاً مؤثرند) تیک بخورند
  checkedPermissions.value = closure(userPermissions);
})
```

> `closure` به `requiresByCode` که از `permissionCatalog` ساخته می‌شود وابسته است؛ پس باید **بعد از** ست‌شدن `permissionCatalog.value` صدا زده شود (همان ترتیب بالا درست است).

### 7.3 template (دو جا: پنل دسکتاپ و دیالوگ موبایل)

```vue
<div v-for="perm in group.permissions" :key="perm.code">
  <v-tooltip location="top" :disabled="!isPermissionLocked(perm.code)">
    <template #activator="{ props }">
      <div v-bind="props">
        <v-checkbox
          :model-value="checkedPermissions.includes(perm.code)"
          :disabled="isPermissionLocked(perm.code)"
          density="compact" hide-details
          @update:model-value="togglePermission(perm.code)"
        >
          <template #label>
            <span class="tw:text-[13px]">{{ perm.label }}</span>
          </template>
        </v-checkbox>
      </div>
    </template>
    <span class="tw:text-xs tw:p-2">{{ lockHint(perm.code) }}</span>
  </v-tooltip>
</div>
```

ذخیره (`onPermissionsSubmit`) همان است و مجموعه‌ی بسته‌شده را می‌فرستد؛ بک‌اند هم expand می‌کند. `app/store/user/actions.ts` تغییری ندارد.

---

## 8. ترتیب اجرا

هر مرحله پنل را سالم می‌گذارد.

1. سوئیچ دسترسی به `competition.view` (گارد صفحه، منو، لینک صفحه‌ی لیگ‌ها).
2. استور `game` و افزودنی‌های استور `dropdown` (بخش ۳).
3. صفحه‌ی مسابقات: `canGroups/canGames`، `activeView`، دو دکمه‌ی سوییچ، مقادیر مشتق‌شده، `loadLeague` جدید، wrap کردن بورد و فرم گروه با `v-if="activeView === 'groups'"` (۴.۱ تا ۴.۴ و ۴.۶). نمای بازی‌ها فعلاً placeholder.
4. سمت خواندن بازی‌ها: فیلترها، چیپ‌های خلاصه، کارت‌ها، Pagination (۴.۷، ۴.۸).
5. فرم و دیالوگ‌ها: فرم بازی در کارت سمت چپ، دیالوگ نتیجه/لغو/تأیید، `onGamesChanged` (۴.۵، ۴.۹ تا ۴.۱۱).
6. افزودنی‌های بورد گروه‌ها (بخش ۵).
7. UI وابستگی دسترسی‌ها (بخش ۷).
8. مرور حالت‌ها: لیگ `FINISHED` / غیرفعال، بدون دسترسی، موبایل.

---

## 9. چک‌لیست تست دستی

دسترسی و ناوبری
- [ ] کاربر فقط با `groups.view`: منوی مسابقات را می‌بیند، فقط نمای گروه‌ها، بدون دکمه‌های سوییچ.
- [ ] کاربر فقط با `competition.view`: کارت لیگ + پیام «دسترسی لازم را ندارید»؛ هیچ درخواستی به groups/games نمی‌رود (۴۰۳ نداریم).
- [ ] کاربر با `games.view`: هر دو دکمه دیده می‌شوند و سوییچ بدون reload کار می‌کند.
- [ ] تغییر لیگ: نما می‌ماند، فیلترها و فرم‌ها ریست می‌شوند.

نمای بازی‌ها
- [ ] هر فیلتر لیست را محدود و صفحه را ۱ می‌کند؛ تغییر گروه، گزینه‌های تیم را عوض و تیم ناسازگار را پاک می‌کند؛ جستجو debounce دارد.
- [ ] چیپ‌های خلاصه چهار وضعیت (با کنسل) را نشان می‌دهند و کلیک فیلتر می‌کند؛ چیپ هشدار فیلتر `resultPending` را toggle می‌کند.
- [ ] کارت: میزبان راست؛ برنده سبز و بولد؛ VS برای بازی بدون نتیجه؛ «تاریخ نامشخص»؛ خط فورفیت؛ خط جایگزین/مبدأ؛ کادر نارنجی برای `RESULT_PENDING`.
- [ ] اکشن قفل‌شده disabled با دلیل؛ بدون دسترسی اصلاً دیده نمی‌شود.
- [ ] لیگ غیرفعال/بدون ساختار/غیرگروهی/پایان‌یافته: پیام قفل لیست و بدون فرم ثبت.
- [ ] پاسخ کهنه: تغییر سریع فیلتر/لیگ، فقط آخرین پاسخ نمایش داده می‌شود؛ جابه‌جایی صفحه فقط یک درخواست می‌زند.

فرم و دیالوگ‌ها
- [ ] ثبت: گروه → دو تیم همان گروه؛ راهنمای سهمیه به‌روز می‌شود و در سقف submit را می‌بندد؛ بعد از ثبت لیست، خلاصه، شمارنده‌ی گروه و قفل گروه تازه می‌شود.
- [ ] تاریخ بدون ساعت (یا برعکس) قبل از درخواست رد می‌شود.
- [ ] برگزاری مجدد: گروه/تیم‌ها پر و قفل، `rescheduledFromGameId` ارسال می‌شود، کارت مبدأ خط جایگزین می‌گیرد.
- [ ] ویرایش زمان‌بندی: فقط تاریخ/ساعت؛ پاک‌کردن هر دو کار می‌کند؛ قفل‌شدن زمان‌بندی از حالت ویرایش خارج می‌کند.
- [ ] نتیجه: عادی (تساوی بسته)، فورفیت (پیش‌نمایش، نمره ارسال نمی‌شود)، ویرایش نتیجه‌ی ثبت‌شده (پرشده)، پاک‌کردن نتیجه.
- [ ] لغو (با/بدون دلیل)، شروع، حذف: کارت، خلاصه و شمارنده‌ی گروه به‌روز می‌شود.
- [ ] تعویض نما، فرم پنهان را ریست می‌کند.

نمای گروه‌ها
- [ ] «بازی‌های این گروه» نما را عوض و فیلتر گروه را اعمال می‌کند.
- [ ] گروه دارای بازی: شمارنده، ردیف قفل در منوی info، درگ ورودی/خروجی ممنوع، منوها و حذف disabled با دلیل؛ تغییر نام و qualifiers هنوز ممکن.
- [ ] ساخت اولین بازی گروه را قفل و حذف آخرین بازی آن را باز می‌کند.

دسترسی‌ها (صفحه‌ی کاربران)
- [ ] تیک `games.view` همه‌ی پیش‌نیازها را تیک می‌زند و پیام info می‌دهد.
- [ ] تا وقتی `groups.view` تیک است، `competition.view` disabled با «لازمه‌ی: …» است.
- [ ] کاربری که پیش‌نیازها در DB ندارد، با پیش‌نیازهای تیک‌خورده باز می‌شود؛ ذخیره، مجموعه‌ی کامل را می‌نویسد.
- [ ] پنل دسکتاپ و دیالوگ موبایل رفتار یکسان دارند (هر دو از یک توابع استفاده می‌کنند).

---

## 10. خارج از دامنه

- skeleton و حالت‌های خالی پیشرفته، دکمه‌ی پاک‌کردن فیلترها.
- تست واحد/کامپوننت.
- نمای جدول رده‌بندی و براکت (دو دکمه‌ی سوییچ بعداً به‌راحتی دکمه‌ی سوم می‌گیرد؛ `activeView` یک union است).
- refactor بورد گروه‌ها به کامپوننت، و استخراج اسکیمای مشترک تاریخ/شناسه.
- endpoint جفت‌ها (راهنمای سهمیه از همان لیست بازی‌ها استفاده می‌کند).

---

## گزارش تغییرات این نسخه (توضیح کارهایی که انجام دادم)

طبق درخواستت پلن را این‌طور بازنویسی کردم:

1. **سبک پیاده‌سازی:** بخش ۰ اضافه شد: همه‌چیز باید با دست‌خط بقیه‌ی پنل نوشته شود و مرجع‌های مشخص (leagues، organizations/teams، `leagues/[leagueId]/teams.vue`) نام برده شد.
2. **تب → دو دکمه:** `v-btn-toggle`/تب حذف شد. دو `v-btn` معمولی داریم که با متغیر `activeView` (`"groups" | "games"`) کنترل می‌شوند؛ دکمه‌ی فعال `variant="flat"` با رنگ `secondary-dark` و دکمه‌ی دیگر `outlined` است. وقتی کاربر فقط به یکی از نماها دسترسی دارد دکمه‌ها نمایش داده نمی‌شوند (کد کامل در ۴.۲).
3. **همه‌چیز داخل صفحه:** composable `useGameFilters` و همه‌ی کامپوننت‌ها (`GamesPanel`، `GameCard`، `GameFilters`، `GamesSummaryBar`، `GameForm`، دیالوگ‌ها، `ConfirmDialog`) حذف شدند. فیلترها، کارت بازی، فرم، دیالوگ نتیجه/لغو/تأیید همه با `ref/reactive` و تابع داخل `competition/index.vue` نوشته شده‌اند. تنها چیز جدید بیرون از صفحه، استور `game` و چند state/action در استور `dropdown` است (مثل الگوی بقیه‌ی ماژول‌ها).
4. **قرارداد URL حذف شد:** `tab` و فیلترها دیگر در URL نیستند؛ متغیر محلی‌اند. فقط `leagueId` مثل قبل در URL می‌ماند.
5. **فرم سمت چپ مشترک:** کارت سمت چپ با `activeView` یا فرم گروه (موجود) یا فرم بازی را نشان می‌دهد؛ فرم بازی سه حالت دارد: ثبت، ویرایش زمان‌بندی، برگزاری مجدد؛ با `gameFormMode` (computed) و عنوان متناسب. کد کامل template و script در ۴.۵ و ۴.۹ آمده است.
6. **کد واقعی به‌جای توضیح کلی:** برای استورها، فیلترها (با debounce و guard کلید صفحه‌بندی مثل صفحه‌ی teams)، کارت بازی، توابع کمکی (`primaryAction`, `menuActions`, `isWinner`...)، فرم، راهنمای سهمیه، دیالوگ نتیجه، لغو و تأیید و هماهنگی بعد از تغییر (`onGamesChanged`) کد ارائه شد.
7. **یک دیالوگ تأیید مشترک** برای شروع/پاک‌کردن نتیجه/حذف با `confirmType`، مثل `leagues/[leagueId]/teams.vue`، به‌جای کامپوننت جدید.
8. **صفحه‌ی کاربران بدون composable/کامپوننت:** منطق وابستگی دسترسی‌ها (`closure`، `dependentsOf`، `togglePermission` جدید، tooltip «لازمه‌ی: …») به‌صورت چند تابع داخل خود صفحه نوشته شد و مارک‌آپ پنل دسکتاپ و دیالوگ موبایل همان‌طور که هست می‌ماند.
9. **بقیه‌ی منطق پلن قبلی حفظ شد:** قراردادهای API، قفل‌ها (disabled + دلیل به‌جای مخفی‌کردن)، تغییرات بورد گروه‌ها (دکمه‌ی «بازی‌های این گروه»، قفل `HAS_GAMES`)، سوئیچ دسترسی به `competition.view`، ترتیب اجرا و چک‌لیست تست.

نکته‌ی فنی که باید حواست باشد: چون دکمه‌ی «ایجاد بازی» از `groupStore.groupList` گزینه می‌گیرد، نمای بازی‌ها به داده‌ی گروه‌ها وابسته است؛ این مشکلی نیست چون `games.view` در بک‌اند `groups.view` را هم implies می‌کند.