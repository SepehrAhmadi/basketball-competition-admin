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

Every list page uses Vuetify's `v-data-table` (server-side mode), **not** `v-data-table-virtual` —
virtual scrolling and server pagination don't mix well, and every list in this app is paginated
from the backend (see backend `pageSize`/`page` query convention).

Required table setup:

```vue
<v-data-table
  :headers="tableHeaders"
  :items="items"
  :items-length="totalItems"
  :loading="loading"
  :page="page"
  :items-per-page="pageSize"
  @update:page="onPageChange"
  class="tw:bg-white! tw:dark:bg-primary-dark!"
>
  <template #item="{ item, index }">
    <tr>
      <td>{{ (page - 1) * pageSize + index + 1 }}</td>
      <!-- ...cells... -->
      <td>
        <div class="tw:flex tw:justify-center tw:items-center tw:gap-1">
          <v-tooltip location="top">
            <template #activator="{ props }">
              <v-btn v-bind="props" size="x-small" variant="text" rounded="pill" @click="onEdit(item.id)">
                <icon-edit-box class="tw-text-color-lighter tw:text-[23px]" />
              </v-btn>
            </template>
            <span class="tw:text-xs tw:p-2">ویرایش</span>
          </v-tooltip>
          <!-- delete / other row actions follow the same tooltip+icon pattern -->
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
</v-data-table>
```

Rules:
- Row numbering (`#`), status/type chips, and action icons follow the exact styling already
  established (rounded pill badges, `v-tooltip` wrapping every icon button, `v-menu` for
  multi-option row actions like status change).
- `page`/`pageSize` are always owned by the page component (`ref`s), not the store — the store
  only holds the fetched `items` + `meta`. The page watches `page` and calls the store's
  `get<X>List` action, exactly like `PlayerRoster.vue`'s `watch(page, () => loadRoster())`.
- Default `pageSize` is 10 for admin tables (differs from the app-client's 5, since admin screens
  have more vertical room) — confirm per-page if the person wants something else.
- Delete actions always go through a confirm dialog (Vuetify `v-dialog` styled like an alert),
  never a bare click-to-delete.

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

- Prefer **Vuetify's own components** (`v-data-table`, `v-dialog`, `v-btn`, `v-tooltip`,
  `v-menu`, `v-text-field`, `v-select`, `v-form`, `v-alert`, etc.) over hand-rolled ones or a
  second UI kit. Tailwind is used only for spacing/utility tweaks on top of Vuetify (`tw:` prefix
  classes), never to replace a Vuetify component that already does the job.
- Only build a custom component (like `BackBtn`) when Vuetify has no equivalent, and once built,
  reuse it everywhere rather than re-implementing it per page.
- Icons: keep using whatever icon set is already wired into the project (matching `icon-edit-box`,
  `icon-trash`, `icon-print`, etc. naming already seen) rather than mixing in a new one.

---

## 5. Business Logic Pattern (Pages / `<script setup>`)

Page-level logic (not store logic) follows the shape already used in `PlayerRoster.vue`:
- Group related state with a `// ─── Section ──` comment header (Pagination, Add Drawer/Dialog
  state, Edit Drawer/Dialog state, Delete, Data loading).
- `page` as a local `ref`, `pageCount`/`totalItems` as a `computed` off the store's meta.
- A single `load<X>()` function is the one place that calls the store's fetch action; it's called
  from `onMounted` and from every `watch` that should refresh the list (page change, filter change,
  after create/update/delete).
- Store calls always end with `.then(() => { /* close dialog, reset form, reload list */ })` —
  no `async/await` on the page side either, for consistency with the store layer.
- Debounced search (like the user combobox search in `PlayerRoster.vue`) uses a manually managed
  `setTimeout`/`clearTimeout` pair, not a debounce library — stay consistent with that unless
  a library is already a project dependency.

---

## 6. Form Field Convention (every `v-text-field` / similar input, everywhere)

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

---

## 7. Action Button Convention (submit / primary action buttons)

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

## 8. Additional conventions (proposed — confirm before treating as final)

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

## 9. Quick checklist for any new module

- [ ] `store/<module>/{state,actions,index}.ts` following §1 exactly
- [ ] List page: `v-data-table` with server pagination, not `v-data-table-virtual`
- [ ] `BackBtn` present on the page
- [ ] Field-count check: <5 → side-by-side (`v-col=9`/`v-col=3`), ≥5 → full-width table + dialog
- [ ] Vuetify components used wherever possible
- [ ] Store actions use `.then/.catch/.finally`, never `async/await`
- [ ] Errors surfaced via `handlerStore.setError`, successes via `handlerStore.setSuccess`
- [ ] Delete flows confirm first
- [ ] Every input: `variant="outlined"`, `density="compact"`, `#label` slot (with `(الزامی)` span
      only if required), `:rules` with empty-string message
- [ ] Every primary action button: `tw:bg-primary-dark! tw:text-white! tw:rounded-md!`, icon +
      label, `:loading`/`:disabled` bound to the right store flag