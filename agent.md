# AGENT.md — Basketball Competition Admin Panel

This file defines the coding conventions that **must** be followed everywhere in this repository
(`basketball-competition-admin`). It exists so that any contributor — human or AI coding agent —
produces code that looks like it was written by the same person, in the same session.

Stack: **Nuxt 4 / Vue 3**, **Vuetify** (component library), **Tailwind** (utility styling on top
of Vuetify), **Pinia** (composition-style stores), **Axios** via `useApi()`.

Backend response shape (see backend `error-handling.md`) is always:
```json
// success
{ "statusCode": 200, "message": "update", "data": { } }
// error
{ "statusCode": 400, "message": "name: Required" }
```
All frontend code must be written assuming this exact shape — `res.data.message` for the
user-facing message, `res.data.data` for the payload, `err.response?.data?.message` for errors.

---

## 1. Pinia Store Pattern (mandatory, every module, no exceptions)

Every store is split into **three files** inside `store/<module>/`:

```
store/<module>/
├── state.ts     # only ref()s, no logic
├── actions.ts   # only functions that mutate state / call the API
└── index.ts     # glues state + actions together via defineStore
```

### `state.ts`
- Plain function `use<Module>State()` returning an object of `ref()`s only.
- No API calls, no computed, no logic — state only.
- Always include a `loading` ref if the module fetches list/detail data.

```ts
import { ref } from "vue";

export function useTeamState() {
  const loading = ref<boolean>(false);

  const teamList = ref<any>(null);
  const teamListMeta = ref<any>(null);
  const teamDetail = ref<any>(null);

  return {
    loading,
    teamList,
    teamListMeta,
    teamDetail,
  };
}
```

### `actions.ts`
- Exported function `use<Module>Actions(state)` where `state` is
  `ReturnType<typeof use<Module>State>`.
- Always instantiate `useApi()` **inside** each action (not once at the top), matching the
  existing auth/people stores.
- Always inject `useHandlerStore()` for success/error toasts. Inject other stores only if the
  action genuinely needs them (e.g. `useUserStore()` inside auth actions).
- Every request is a `.then().catch().finally()` chain — **never `async/await`**.
- `.catch()` always does:
  ```ts
  .catch((err) => {
    console.log(err);
    const message = err.response?.data?.message || "خطای سرور";
    handlerStore.setError(message);
  })
  ```
- `.finally()` turns off the relevant loading flag. Use `state.loading.value = false` for
  page-level loads, and `handlerStore.loadingBtn = false` for button-level submit actions
  (create/update/delete triggered from a dialog/drawer). Match the existing 2000ms /
  500ms delay convention already used in `auth` and `people` stores for skeletons vs. buttons —
  don't introduce a new timing convention without a reason.
- On successful write actions (create/update/delete), call `handlerStore.setSuccess(res.data.message)`.
- List-fetch actions store both the array and its pagination meta separately
  (`teamList` / `teamListMeta`), never combined into one object — this is what the paginated
  table (§2) reads from.

```ts
import { useApi } from "~/composables/useApi";
import type { useTeamState } from "./state";
import { useHandlerStore } from "../handler";

type StateType = ReturnType<typeof useTeamState>;

export function useTeamActions(state: StateType) {
  const handlerStore = useHandlerStore();

  const getTeamList = (params: any) => {
    const axios = useApi();
    state.loading.value = true;

    return axios
      .get("/teams", { params })
      .then((res) => {
        state.teamList.value = res.data.data.items ?? res.data.data;
        state.teamListMeta.value = res.data.data.meta ?? null;
      })
      .catch((err) => {
        console.log(err);
        const message = err.response?.data?.message || "خطای سرور";
        handlerStore.setError(message);
      })
      .finally(() => {
        setTimeout(() => {
          state.loading.value = false;
        }, 2000);
      });
  };

  const createTeam = (value: any) => {
    const axios = useApi();
    handlerStore.loadingBtn = true;

    return axios
      .post("/teams", value)
      .then((res) => {
        handlerStore.setSuccess(res.data.message);
      })
      .catch((err) => {
        console.log(err);
        const message = err.response?.data?.message || "خطای سرور";
        handlerStore.setError(message);
      })
      .finally(() => {
        handlerStore.loadingBtn = false;
      });
  };

  return { getTeamList, createTeam };
}
```

### `index.ts`
- Always the same shape, no exceptions:

```ts
import { defineStore } from "pinia";
import { useTeamState } from "./state";
import { useTeamActions } from "./actions";

export const useTeamStore = defineStore("teamStore", () => {
  const state = useTeamState();
  const actions = useTeamActions(state);

  return {
    ...state,
    ...actions,
  };
});
```

**Rule:** if a new module's store doesn't fit this 3-file shape, that's a signal the module needs
splitting (like `people`), not a reason to deviate from the pattern.

---

## 2. List Pages — Table Convention

Every list page uses the project's own **`GeneralDataTable`** wrapper component, **not** a raw
`v-data-table` and **not** `v-data-table-virtual` — virtual scrolling and server pagination don't
mix well, and every list in this app is paginated from the backend (see backend `pageSize`/`page`
query convention). `GeneralDataTable` is the standard component precisely so pagination, loading,
and options-change wiring stay identical across every list page.

Required table setup:

```vue
<GeneralDataTable
  v-model:page="page"
  v-model:items-per-page="pageSize"
  :items="someStore.someList"
  :headers="tableHeaders"
  :items-length="totalItems"
  :loading="someStore.loading"
  @update-options="onOptionsChange"
>
  <template #item="{ item, index }">
    <tr>
      <td>{{ (page - 1) * pageSize + index + 1 }}</td>
      <!-- ...cells... -->
      <td>
        <div class="tw:flex tw:justify-center tw:items-center">
          <v-tooltip location="top">
            <template #activator="{ props }">
              <v-btn v-bind="props" size="x-small" variant="plain" rounded="pill" @click="onEdit(item.id)">
                <icon-edit-box class="tw:text-color-lighter tw:text-[21px]" />
              </v-btn>
            </template>
            <span class="tw:text-xs tw:p-2">ویرایش</span>
          </v-tooltip>
          <!-- any domain-specific row action (e.g. reset password) slots in here,
               same tooltip + icon-button pattern, between edit and delete -->
          <!-- delete follows the same tooltip+icon pattern -->
        </div>
      </td>
    </tr>
  </template>

  <template #no-data>
    <div class="tw:h-full! tw:flex tw:justify-center tw:items-center tw:gap-2">
      <icon-row-chart class="tw-text-color-lighter tw:text-[35px]" />
      <div class="tw-text-color-lighter tw:text-[14px]">اطلاعاتی یافت نشد</div>
    </div>
  </template>
</GeneralDataTable>
```

```ts
const onOptionsChange = (options: { page: number; itemsPerPage: number }) => {
  page.value = options.page;
  pageSize.value = options.itemsPerPage;
  loadSomething();
};
```

Rules:
- Row numbering (`#`), status/type chips, and action icons follow the exact styling already
  established (rounded pill badges, `v-tooltip` wrapping every icon button, `v-menu` for
  multi-option row actions like status change).
- **Row action buttons use `variant="plain"`** (not `variant="text"`) — this is the settled choice,
  established across every row action button in the user-management page.
- A row can have more than the base edit/delete pair — any domain-specific single-purpose action
  (e.g. "بازنشانی رمز عبور") is added as its own `v-tooltip` + icon `v-btn`, in between edit and
  delete, following the exact same markup shape as the two base actions.
- `page`/`pageSize` are always owned by the page component (`ref`s, bound via `v-model` into
  `GeneralDataTable`), not the store — the store only holds the fetched `items` + `meta`. Page
  changes and per-page-size changes both flow through the single `onOptionsChange` handler, which
  calls the page's `load<X>()` function.
- The number of rows per page is chosen via the project's own **`TablePageSize`** component
  (`v-model="pageSize"`), placed in the toolbar — not a hand-rolled `v-select`.
- Default `pageSize` is 10 for admin tables (differs from the app-client's 5, since admin screens
  have more vertical room) — confirm per-page if the person wants something else.
- Delete actions always go through a confirm dialog (§6), never a bare click-to-delete.
- Any status/type-like field rendered as a colored `v-chip` (user status, and anything similar
  later — player position, organization type, etc.) uses a small local lookup helper mapping the
  raw value to `{ label, color }`, e.g.:
  ```ts
  const getUserStatusLabel = (status: string): { label: string; color: string } => {
    const map: Record<string, { label: string; color: string }> = {
      ACTIVE: { label: "فعال", color: "success" },
      INACTIVE: { label: "غیر فعال", color: "warning" },
      SUSPENDED: { label: "مسدود", color: "error" },
      DELETED: { label: "حذف شده", color: "error" },
    };
    return map[status] ?? { label: status, color: "default" };
  };
  ```
  Don't inline this mapping in the template — keep it as a named helper the `<template>` calls.

---

## 3. Page Layout Convention

- **Every page has a `BackBtn` component** at the top, used to return to the previous page.
  No page is exempt from this, including top-level list pages (in which case it returns to the
  dashboard/home).
- **List + Form split rule**, based on how many fields the entity's form has:
  - **Fewer than 5 fields:** table and form live side-by-side on the same page.
    Table: `v-col cols="9"` (right side, since layout is RTL). Form: `v-col cols="3"`
    (left side). The form handles both create and edit inline — no dialog.
  - **5 or more fields:** table takes the **full width** (`v-col cols="12"`). An "افزودن" button
    opens a `v-dialog` containing the form, used for both create and edit.
- This split is decided once per module (based on its field count), not per screen size — don't
  make it responsive-conditional unless asked.

```vue
<v-row>
  <v-col cols="12" class="tw:mb-2">
    <BackBtn />
  </v-col>

  <!-- <5 fields: side-by-side -->
  <v-col cols="9">
    <!-- v-data-table -->
  </v-col>
  <v-col cols="3">
    <!-- inline create/edit form -->
  </v-col>
</v-row>
```

---

## 4. Component Usage Policy

- Prefer **Vuetify's own components** (`v-dialog`, `v-btn`, `v-tooltip`, `v-menu`,
  `v-text-field`, `v-select`, `v-autocomplete`, `v-form`, `v-alert`, etc.) over hand-rolled ones or
  a second UI kit. Tailwind is used only for spacing/utility tweaks on top of Vuetify (`tw:` prefix
  classes), never to replace a Vuetify component that already does the job.
- Only build a custom component (like `BackBtn`, `GeneralDataTable`, `TablePageSize`) when Vuetify
  has no equivalent (or, for tables, when the project's standard wrapper adds pagination/loading
  wiring Vuetify doesn't give for free), and once built, reuse it everywhere rather than
  re-implementing it per page. Every list page uses **`GeneralDataTable`** (§2) and every
  page-size selector uses **`TablePageSize`** — these are settled, not per-page choices.
- Icons: keep using whatever icon set is already wired into the project (matching `icon-edit-box`,
  `icon-trash`, `icon-print`, etc. naming already seen) rather than mixing in a new one.

---

## 5. Business Logic Pattern (Pages / `<script setup>`)

Page-level logic (not store logic) follows the shape already used in `PlayerRoster.vue` and the
user-management page:
- Group related state with a `// ─── Section ──` comment header (Pagination, Search & Filters,
  Delete, domain-specific dialogs like Reset Password, Add/Edit Dialog, Data loading, Init).
- `page` as a local `ref`, `pageCount`/`totalItems` as a `computed` off the store's meta.
- A single `load<X>()` function is the one place that calls the store's fetch action; it's called
  from `onMounted` and from every place that should refresh the list (page/page-size change via
  `onOptionsChange`, search/filter change, after create/update/delete/any other row action).
- Store calls always end with `.then(() => { /* close dialog, reset form, reload list */ })` —
  no `async/await` on the page side either, for consistency with the store layer. This includes
  Vuetify's own `v-form` validation: call it as `formRef.value!.validate().then(({ valid }) =>
  { ... })`, never `await formRef.value!.validate()` — the whole page layer stays `.then`-based,
  not just the store layer.
- **Manual required-field guard, inside every submit handler, in addition to `:rules`:** right
  after `v-form` validation passes (or as the first check inside the `.then` callback), re-check
  the same required fields explicitly and bail out with a toast if any are empty:
  ```ts
  if (!form.fullName || !form.phone || !form.email || !form.roles.length) {
    handlerStore.setError("لطفا تمام فیلدهای الزامی را پر کنید.");
    return;
  }
  ```
  This isn't a replacement for `:rules` (§7) — it's a second, explicit guard in the submit handler
  itself, so a submit can never fire with a missing required value even if a rule was skipped or
  misconfigured on some field. List every required field of that specific form here, matching
  §7's required fields exactly (a text field's emptiness is `!form.x`, a multi-select's is
  `!form.x.length`, adjust the check per field type). Every submit handler needs its own version
  of this line, listing that form's own required fields — don't reuse another form's guard.
- Debounced search (like the user combobox search in `PlayerRoster.vue`) uses a manually managed
  `setTimeout`/`clearTimeout` pair, not a debounce library — stay consistent with that unless
  a library is already a project dependency.
- **Add/edit form reset:** define a `defaultForm()` factory function returning the form's initial
  shape, build the reactive form with `const form = reactive(defaultForm())`, and reset it with
  `Object.assign(form, defaultForm())` when opening the create dialog. Don't hand-reset each field
  individually.
- **Edit dialog loading state:** when opening the edit dialog, call the store's `getById` action
  first (per the earlier user-management plan) and, while it's in flight, render a centered
  `v-progress-circular` inside the dialog's `v-card-text` instead of the form:
  ```vue
  <div v-if="dialogMode === 'edit' && someStore.loading" class="tw:flex tw:justify-center tw:py-8">
    <v-progress-circular indeterminate color="primary" />
  </div>
  <v-form v-else ref="formRef">
    <!-- fields -->
  </v-form>
  ```
  Only populate the form fields from the store's detail object once that call resolves, then open
  the dialog (or let it already be open behind the spinner — either way the form itself never
  renders with stale/empty data while the fetch is in flight).

---

## 6. Dialog Convention (every `v-dialog`, everywhere)

Every dialog in the app — confirm dialogs, single-input dialogs, and full add/edit dialogs alike —
shares one header/frame shape. Don't invent a new dialog chrome per feature; reuse this:

```vue
<v-dialog v-model="someDialogOpen" max-width="400" dir="rtl" class="blur-dialog">
  <v-card rounded="lg">
    <v-card-title class="tw:bg-secondary-dark tw:dark:bg-primary-dark! tw:mb-3!">
      <div class="tw:flex tw:justify-between tw:items-center">
        <div class="tw:invisible">
          <v-btn icon variant="plain" size="x-small" @click="someDialogOpen = false">
            <icon-close class="tw:text-[18px] tw:text-white!" />
          </v-btn>
        </div>
        <div class="tw:text-[14px]! tw:text-white">{{ dialogTitle }}</div>
        <div>
          <v-btn icon variant="plain" size="x-small" @click="someDialogOpen = false">
            <icon-close class="tw:text-[18px] tw:text-white!" />
          </v-btn>
        </div>
      </div>
    </v-card-title>

    <v-card-text><!-- confirm text, a single field, or a full v-form --></v-card-text>

    <v-card-actions class="tw:justify-end!">
      <v-btn variant="text" @click="someDialogOpen = false" class="tw:text-[12px]!">انصراف</v-btn>
      <v-btn
        class="tw:bg-secondary-dark! tw:dark:bg-primary-dark! tw:text-white! tw:rounded-md!"
        :loading="handlerStore.loadingBtn"
        :disabled="handlerStore.loadingBtn"
        @click="onConfirm"
      >
        <icon-check class="tw:text-[18px]" />
        <span class="tw:mr-1! tw:text-[12px]! tw:px-2!">تایید</span>
      </v-btn>
    </v-card-actions>
  </v-card>
</v-dialog>
```

- `max-width`, `dir="rtl"`, and `class="blur-dialog"` are always present on the `v-dialog` itself.
- The title bar is always the same three-column flex row: an **invisible** close button on one
  side (kept only so the centered title stays visually centered), the title in the middle, and the
  **real** close button on the other side. Don't drop the invisible one to "simplify" the markup —
  it's load-bearing for the centering.
- Three dialog "weights" all reuse this exact frame, differing only in what goes in
  `v-card-text` and which fields have `:rules`:
  1. **Confirm dialogs** (delete, and any other yes/no action) — `v-card-text` is just the
     confirmation sentence, entity name interpolated in (`"آیا از حذف «{{ name }}» مطمئن
     هستید؟"`), per §9's confirm-before-destructive rule.
  2. **Single-input dialogs** (e.g. "بازنشانی رمز عبور") — `v-card-text` holds one short
     description line plus one field, following the same field convention as §7.
  3. **Full add/edit dialogs** — `v-card-text` holds the complete `v-form`, per §5's
     create/edit + loading-state handling.
- The confirm/submit button in every dialog follows the same style as §8's action-button
  convention, bound to `handlerStore.loadingBtn`.

---

## 7. Form Field Convention (every `v-text-field` / similar input, everywhere)

- Every input uses `variant="outlined"` and `density="compact"`.
- Every input's label is written via the `#label` slot, **not** the plain `label` prop, so a
  required-marker can be appended:
  ```vue
  <v-text-field
    v-model="identifier"
    variant="outlined"
    density="compact"
    :rules="[(v: string) => !!v || '']"
  >
    <template #label>
      <span class="tw:text-[12px]"> شماره موبایل یا ایمیل </span>
      <span class="tw:text-red-900 tw:text-[10px]"> (الزامی) </span>
    </template>
  </v-text-field>
  ```
  - If the field is required, the label slot has **two** spans: the field name, then a smaller
    red `(الزامی)` span.
  - If the field is **not** required, the label slot has only the first span — the
    `(الزامی)` span is omitted entirely, not just hidden.
- Every field carries a `:rules` array, even fields with no real validation need — for a required
  field it's `[(v: string) => !!v || '']`. The message string is **always empty (`''`)**: the rule
  exists only to turn the field's border/label red on failure, never to print an error line under
  the field. Any real, human-readable validation message (format, length, etc.) is shown via the
  page's normal error/toast flow (`handlerStore.setError`), not inside the field's rule string.
- Rule for non-required fields: use a rule appropriate to that field (or no rule at all) — the
  empty-message `!!v || ''` pattern specifically maps to "this field is required," so don't apply
  it to optional fields.
- **Date fields** (`birthDate` and anything similar) use the project's Jalali `date-picker`
  component, not a plain text field:
  ```vue
  <date-picker
    v-model="form.birthDate"
    simple
    placeholder="تاریخ تولد"
    format="jYYYY/jMM/jDD"
    display-format="jYYYY/jMM/jDD"
    class="default-scroll"
  />
  ```
  A raw `v-text-field` for a hand-typed `YYYY/MM/DD` string is not an acceptable substitute once
  this component is available — it's a placeholder from an earlier plan, superseded by this.

---

## 8. Action Button Convention (submit / primary action buttons)

Every primary action button (form submit, "افزودن", confirm actions, etc.) follows the login
button's style:

```vue
<v-btn
  block
  :loading="someStore.loading"
  :disabled="someStore.loading"
  class="tw:bg-primary-dark! tw:text-white! tw:rounded-md!"
  @click="submit"
>
  <icon-login class="tw:text-[20px]" />
  <span class="tw:mr-1!">ورود</span>
</v-btn>
```

- Classes are always `tw:bg-primary-dark! tw:text-white! tw:rounded-md!` — don't reach for
  Vuetify's `color` prop for these buttons, use the tailwind classes instead, for consistency.
- Always pairs an icon (from the project's own `icon-*` component set — the same set already used
  for `icon-edit-box`, `icon-trash`, etc. in §2/§4) with a `<span class="tw:mr-1!">` label next to
  it, icon first, text second.
- The icon must match the action semantically (login icon for a login button, a plus/add icon for
  an "افزودن" button, a save/check icon for a save button, and so on). If no existing icon in the
  project's icon set fits the action, pick the closest available one as a placeholder rather than
  leaving the button icon-less or introducing a new icon library — flag it in a comment so it can
  be swapped for a proper one later.
- `:loading` / `:disabled` are always bound to the same store flag (`state.loading` for
  page-level actions, `handlerStore.loadingBtn` for dialog/drawer-level actions, per §1).

---

## 9. Additional conventions (proposed — confirm before treating as final)

These weren't explicitly requested but follow naturally from the patterns above and from the
backend conventions already established; flagging them so they can be accepted or rejected
explicitly rather than silently assumed by whoever implements a page:

1. **Naming:** store folders/files in `kebab-case` matching the backend module names
   (`teams`, `players`, `coaches`, `referees`, `games`, `series`, `game-officials`, `stats`,
   `media`) so admin store names map 1:1 to backend routes — makes it trivial for an AI agent to
   find the right endpoint.
2. **Types:** define a lightweight `types/<module>.d.ts` per module (e.g. `Team`, `TeamListMeta`)
   instead of `any` everywhere once a module stabilizes — the current stores use `any` because
   they're early-stage; freeze `any` usage to "not yet implemented" modules only.
3. **Permissions:** every page/action gated by `usePermissions()` composable (as already done for
   `canAddAndEditPlayer` / `canDeletePlayer`), checked at both the button-render level and again
   before firing the store action — never rely on hiding the button alone.
4. **Toasts:** all success/error feedback goes through `handlerStore` (`setSuccess`/`setError`) —
   pages never show their own ad-hoc `v-snackbar`.
5. **RTL:** `dir="rtl"` stays explicit on every component that supports directional rendering
   (menus, comboboxes, dialogs), matching the existing pattern — don't rely on a global CSS
   direction rule alone.
6. **Confirm-before-destructive:** every delete action requires an explicit confirm dialog with
   the entity's name interpolated into the description (`"آیا از حذف «{{ name }}» مطمئن هستید؟"`),
   as already done for players.
7. **Loading skeletons vs. spinners:** list loads show a skeleton state matching the shape of a
   real row (as in `PlayerRoster.vue`'s `Card` skeleton) rather than a generic spinner, for admin
   tables too — a few skeleton `<tr>`s with `Skeleton`/Vuetify `v-skeleton-loader` per cell.

---

## 10. Quick checklist for any new module

- [ ] `store/<module>/{state,actions,index}.ts` following §1 exactly
- [ ] List page: `GeneralDataTable` with server pagination + `TablePageSize`, not raw
      `v-data-table` / `v-data-table-virtual`
- [ ] `BackBtn` present on the page
- [ ] Field-count check: <5 → side-by-side (`v-col=9`/`v-col=3`), ≥5 → full-width table + dialog
- [ ] Vuetify components used wherever possible
- [ ] Store actions use `.then/.catch/.finally`, never `async/await` — including page-side
      `formRef.value!.validate().then(...)`
- [ ] Every submit handler has its own manual required-field guard after validation, listing that
      form's required fields, before calling the store action
- [ ] Errors surfaced via `handlerStore.setError`, successes via `handlerStore.setSuccess`
- [ ] Delete flows confirm first, using the shared dialog frame (§6)
- [ ] Every dialog reuses the §6 header/frame — confirm, single-input, or full-form weight
- [ ] Every input: `variant="outlined"`, `density="compact"`, `#label` slot (with `(الزامی)` span
      only if required), `:rules` with empty-string message
- [ ] Date fields use the project's Jalali `date-picker`, not a plain text field
- [ ] Every primary action button: `tw:bg-primary-dark! tw:text-white! tw:rounded-md!`, icon +
      label, `:loading`/`:disabled` bound to the right store flag
- [ ] Row action buttons use `variant="plain"`, wrapped in `v-tooltip`
- [ ] Status/type chips use a named `{label, color}` lookup helper, not inline mapping
- [ ] Add/edit form uses a `defaultForm()` factory + `reactive()`, reset via `Object.assign`
- [ ] Edit dialog shows a `v-progress-circular` while `getById` is in flight, before rendering
      the form