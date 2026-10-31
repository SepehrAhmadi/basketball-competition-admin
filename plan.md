# Frontend Plan: Competition Management Page (Groups) — Admin Panel

Scope: a new admin page where an admin picks a league, sees the league's info card, and manages its groups (create, edit, delete, assign, move, remove) with buttons and drag & drop.

This plan is based on the code snapshot and on the decisions made in the conversation. Nothing has been run.

---

## 1. Decisions already made

| # | Topic | Decision |
|---|---|---|
| 1 | Page | A new page "مدیریت مسابقات" (Competition Management). Today it only has the Groups section; later it hosts games, standings and bracket. |
| 2 | League selection | An autocomplete at the top of the page. The chosen league lives in the URL as `?leagueId=`. No picker dialog (unlike teams / roster pages). |
| 3 | Layout | League info card, then the groups section. Two columns: unassigned teams on the **right**, groups on the **left** (first element in the DOM is the right-hand one under `dir="rtl"`). |
| 4 | Right column | Team logo, team name, organization name, and a "move to group" button. |
| 5 | Group card (left column) | Header with name, edit and delete buttons. Each team shows only logo + name. Organization name on hover. Hover also reveals "move to another group" and "remove from group". |
| 6 | Drag & drop | `vuedraggable`. Dragging between the unassigned column and any group, and between groups. **No reordering** anywhere (`sort: false`). |
| 7 | Buttons are the primary path | Buttons work everywhere (mobile, keyboard). Drag & drop is an enhancement. |
| 8 | Team order | No sorting feature. A team added or moved to a group goes to the **end** of that group. |
| 9 | Locks | After the first game nothing can change: no add / remove / move of teams, no create / delete / rename of groups, no qualifier change. Until `Game` exists, only `FINISHED` locks. |
| 10 | No `can` object | The admin API has no `can`. The frontend reads `lock` and `format` from responses. The backend re-checks every mutation and answers `409`. |
| 11 | "Add group" button | Shown only when creation is possible (see 12.4). If it is shown wrongly, the backend `409` is the safety net. |
| 12 | Hover info | Organization name on hover is available with no extra request (it is in the groups response). |

---

## 2. Backend contract used by this page

### 2.1 Endpoints (all exist today)

| Purpose | Endpoint | Permission |
|---|---|---|
| League info card | `GET /admin/leagues/:leagueId` | `leagues.view` |
| Groups + teams + lock + issues + unassignedCount | `GET /admin/leagues/:leagueId/groups` | `groups.view` |
| Unassigned teams (paged, search) | `GET /admin/leagues/:leagueId/groups/unassigned-teams?page&pageSize&search` | `groups.view` |
| Create group | `POST /admin/leagues/:leagueId/groups` body `{ name, qualifiersOverride? }` | `groups.create` |
| Update group | `PUT /admin/leagues/:leagueId/groups/:groupId` body `{ name?, qualifiersOverride? }` | `groups.update` |
| Delete group | `DELETE /admin/leagues/:leagueId/groups/:groupId` | `groups.delete` |
| Assign / move team | `PUT /admin/leagues/:leagueId/groups/:groupId/teams/:leagueTeamId` | `groups.update` |
| Remove team from group | `DELETE /admin/leagues/:leagueId/groups/:groupId/teams/:leagueTeamId` | `groups.update` |
| League selector | `GET /dropdowns/admin/leagues?search&page&pageSize` (see 2.3) | admin level |
| Format / round-type labels | `GET /dropdown/league-formats`, `GET /dropdown/group-round-types` | public |

`groups.view` implicitly grants `leagues.view` and `league-teams.view` (`expandPermissions`), so the league card and the "league teams" link work for anyone who can open this page.

### 2.2 Response shapes (what the UI reads)

`GET .../groups`
```
data: {
  league: { id, format, defaultQualifiersPerGroup },
  lock: Advisory | null,
  groups: [{
    id, name, qualifiersOverride, qualifiers, teamsCount,
    issues: Advisory[],
    teams: [{ leagueTeamId, team: { id, name, logoUrl }, organization: { id, name } | null, teamStatus? }]
  }],
  unassignedCount,
  issues: Advisory[]          // league level, e.g. TEAM_UNASSIGNED
}
```
For `format = null` or `KNOCKOUT_ONLY`: `groups: []`, `unassignedCount: 0`, `issues: []`.

`GET .../unassigned-teams` → `{ items: [{ leagueTeamId, team, organization, teamStatus? }], total, page, pageSize }`, ordered by `leagueTeamId asc`.

Create / update group → one group item (create returns `teams: []`; update returns the full group with teams).

Delete group → `{ unassignedCount, issues }`.

Assign / remove → `{ affectedGroups: [{ id, teamsCount, qualifiers, issues }], unassignedCount, issues }`.

`Advisory = { code, severity: INFO|WARNING|BLOCKER, message (Persian), params }`.

### 2.3 Dependencies and pending backend work

| Item | Status | Effect on the frontend |
|---|---|---|
| **B1** Team moved/added goes to the end of the group (new `GroupTeam` row on move) | Planned, not done | Frontend always places the team at the end locally. Until B1 ships, a refetch may show a moved team at its old position. Harmless, no frontend change when B1 ships. |
| **B2** League dropdown | The snapshot already has `GET /dropdowns/admin/leagues` (admin only, all statuses, same item shape `{ value, label, status, seasonId, ageCategoryId }`). The planned `GET /dropdowns/leagues` (any user) is for the app. | **The admin panel should use the existing admin endpoint now and not wait.** Keep the path in one constant so it can be swapped. |
| **B3** `HAS_GAMES` lock (Stage 3) | Future | None, as long as the frontend reads only `lock` (rule 12.1). |
| Lock must also cover rename and qualifiers | Backend change needed in Stage 3 | None on the frontend. |

---

## 3. Open points (need your answer, defaults in bold)

| # | Question | Default |
|---|---|---|
| D1 | Format editing from this page: link only, or deep link? | **Deep link.** The card button opens `/leagues?editLeagueId=:id&tab=format`; `leagues/index.vue` gets about 10 lines in `onMounted` to read it. |
| D2 | Error toast timeout in `Alert.vue` is 500000 ms (about 8 minutes). Drag & drop produces errors often. | **Change to 8000 ms (global, affects all pages).** |
| D3 | Success toast on moves? | **No.** The UI change is the feedback. Errors only. |
| D4 | Install `vuedraggable` (v4, Vue 3 build)? `agent.md` requires confirmation before adding packages. | Needs your explicit OK. |
| D5 | `agent.md` says shadcn-vue + Tailwind-only, but every existing admin page uses **Vuetify + `tw:` classes**. | **Follow the existing pages (Vuetify).** Please confirm. |
| D6 | Route path | **`/competition`** (name `competition`). Future sections become tabs inside the page, not nested routes. |

---

## 4. Tooling

- Add `vuedraggable` (Vue 3 version, 4.x). Built on SortableJS: touch support, groups, filters.
- Risk: the package is old and barely maintained. If it fights Nuxt 4 / Vite (default-import or SSR problems), the fallback is `vue-draggable-plus` (same SortableJS core). The logic in section 9 does not change.
- Wrap the board in `<ClientOnly>` (the app is SSR-capable and SortableJS touches `window`). Fallback slot: the usual centered `v-progress-circular`.
- **Spike first** (step 1 in section 17): verify controlled lists, empty-list drop, touch delay and autoscroll inside the layout's scroll container before building the rest.

---

## 5. Files

### New
```
app/pages/competition/index.vue                 # page: URL sync, orchestration only
app/store/group/state.ts
app/store/group/actions.ts
app/store/group/index.ts                        # three-file store pattern
app/composables/useGroupsBoard.ts               # moveTeam(), optimistic apply, rollback, busy flags
app/components/competition/LeagueSelector.vue
app/components/competition/LeagueCard.vue
app/components/competition/GroupsBoard.vue      # two columns + summary strip
app/components/competition/UnassignedColumn.vue
app/components/competition/GroupCard.vue
app/components/competition/TeamRow.vue          # used by both columns (variant prop)
app/components/competition/MoveMenu.vue         # v-menu listing target groups
app/components/competition/GroupFormDialog.vue  # create + edit
app/components/competition/GroupDeleteDialog.vue
```
Components use `<script setup lang="ts">`, typed `defineProps<T>()` / `defineEmits<T>()`, and stay under about 150 lines (split further if not). Auto-import names: `<CompetitionGroupCard>` etc.

### Changed
| File | Change |
|---|---|
| `app/components/appHeader/index.vue` | Add menu item `competition` ("مدیریت مسابقات", route `competition`, icon `icon-pie-chart`). Add `if (item.id === "competition") return hasPermission("groups.view");` to the filter (the filter returns `true` for unknown ids, so this line is required). |
| `app/store/league/actions.ts` | `getLeagueById` also `return res.data.data` (one line, backward compatible). Needed for stale-response checks. |
| `app/store/dropdown/actions.ts` | Add `getLeagueOptions(params)`: returns `{ items, total }`, no shared state, no global loading flag. |
| `app/components/Alert.vue` | Error timeout 500000 → 8000 (D2). |
| `app/pages/leagues/index.vue` (optional) | (a) Card button "مدیریت مسابقات" → `/competition?leagueId=:id`, shown for `groups.view`. (b) D1 deep-link handling. |
| `package.json` | `vuedraggable` (after D4). |

No backend files change for this page.

---

## 6. Route, menu, permissions

- Page guard like the teams page: if `!hasPermission("groups.view")` render the lock card ("شما دسترسی لازم برای مشاهده این بخش را ندارید.") and make **no** API calls.
- `setPageTitle("مدیریت مسابقات")`.
- Root element `dir="rtl"`.

| Action | Permission |
|---|---|
| See page, columns, league card | `groups.view` |
| "Add group" button | `groups.create` |
| Edit group (name, qualifiers) | `groups.update` |
| Move / assign / remove team, drag & drop | `groups.update` |
| Delete group | `groups.delete` |
| "Edit structure" link on league card | `leagues.update` |
| "Manage league teams" link | `league-teams.view` (implied by `groups.view`) |

Read-only user (`groups.view` only): columns visible, no drag, no buttons, no add.

---

## 7. Page layout

```
[ Title: مدیریت مسابقات ]                                  [ BackBtn ]
[ League selector (autocomplete)                ] [ Refresh ]
[ League info card ]
[ Lock banner (only when lock != null) ]
[ Board summary strip: groups · assigned · unassigned · league issues ]   [ + Add group ]
[ Right: Unassigned column (md 4 / lg 3) ] [ Left: Groups grid (md 8 / lg 9, cards cols 12 / xl 6) ]
```

- Unassigned column is the **first** child of the `v-row`, so RTL puts it on the right.
- Desktop: unassigned column is `sticky` with its own `max-height` and `overflow-y-auto`, so the admin can drag from it while scrolling the groups.
- Mobile (`< md`): columns stack, unassigned first, with a capped height and its own scroll. Drag still works (see 9.6), buttons are the main path.
- Organization name: on desktop, groups rows show it in a tooltip; on touch devices there is no hover, so show it as a small second line on every row (media query `hover: none`, or `useDisplay().mobile`). The unassigned column always shows it as a second line.

---

## 8. State and data flow

### 8.1 Store `groupStore` (`app/store/group/`)

State:
```
groupsLoading, unassignedLoading: boolean
groupsError, unassignedError: { status?: number; message: string } | null
leagueMeta: { id, format, defaultQualifiersPerGroup } | null
lock: Advisory | null
groups: GroupItem[]                 // local, mutable copy
unassignedItems: UnassignedItem[]   // sorted by leagueTeamId asc
unassignedCount: number             // from the server, authoritative
unassignedPage, unassignedHasMore
leagueIssues: Advisory[]
mutating: boolean                   // one mutation at a time
busyLeagueTeamId: number | null     // spinner on the row being moved
```

Actions (HTTP only, no UI rules): `fetchGroups`, `fetchUnassigned`, `createGroup`, `updateGroup`, `deleteGroup`, `assignTeam`, `unassignTeam`.

Convention differences from the other stores (needed by drag rollback):
- Each action resolves to `{ ok: true, data }` or `{ ok: false, status, message }`.
- Errors still call `handlerStore.setError(message)` like every other store.
- Dialog submit buttons use `handlerStore.loadingBtn` (as elsewhere). Moves use `mutating` + `busyLeagueTeamId` instead, because `loadingBtn` is global.

### 8.2 Loading a league

1. Read `leagueId` from the URL. Not a positive integer → treat as "no league".
2. Fire in parallel: `leagueStore.getLeagueById(id)` and `groupStore.fetchGroups(id)`.
3. When groups arrive and the format is grouped (`GROUPS_KNOCKOUT` or `SINGLE_GROUP_KNOCKOUT`): `fetchUnassigned(id, { page: 1, pageSize: 100 })`. For `null` / `KNOCKOUT_ONLY` skip it.
4. Load `dropdownStore.leagueFormats` and `groupRoundTypes` once if empty (for the card labels).

**Stale responses:** every load captures the `leagueId` it was started for. When a response arrives and the current `leagueId` differs, drop it (same pattern as `loadCutoffs` in the age-categories page). Switching leagues clears lists, search text, dialogs and busy flags first.

### 8.3 URL sync

- Selecting a league: `router.replace({ query: { leagueId } })`. `replace`, not `push`, because `BackBtn` uses `router.go(-1)` and extra history entries would make Back confusing.
- Clearing the selector removes the query param and resets the page to the "no league" state.
- Watch `route.query.leagueId` so a link or browser navigation loads the league.
- `?leagueId=` is the only state in the URL.

### 8.4 Refresh

A refresh button (next to the selector) refetches league, groups and unassigned. It is disabled while `mutating`. Use it after any `409`/`404` (section 14) and when the admin suspects stale data.

---

## 9. Drag & drop specification

### 9.1 One code path

Buttons and drag call the same function:

`moveTeam({ leagueTeamId, fromGroupId: number | null, toGroupId: number | null })`

| from → to | Request | Local change |
|---|---|---|
| `null → G` | `PUT .../groups/G/teams/:leagueTeamId` | remove from unassigned, push to **end** of G |
| `A → B` (A ≠ B) | `PUT .../groups/B/teams/:leagueTeamId` (upsert moves it) | remove from A, push to **end** of B |
| `A → null` | `DELETE .../groups/A/teams/:leagueTeamId` | remove from A, insert into unassigned at its `leagueTeamId` sorted position |
| `A → A` | none | none (no-op) |

The source is looked up from the store (it knows where every team currently is), so no `dataset` tricks are needed.

### 9.2 Sequence

1. Guard: `canEdit` true and `!mutating`.
2. Set `mutating = true`, `busyLeagueTeamId = id`. Take a snapshot of the affected lists.
3. Apply the local change (optimistic).
4. Send the request.
5. Success: for each `affectedGroups[i]`, update that group's `teamsCount`, `qualifiers`, `issues` by id; set `unassignedCount` and `leagueIssues` from the response. No refetch.
6. Failure: roll back from the snapshot, show the error toast (done by the action), then:
   - `404` or `409` → also refetch groups (+ unassigned): the local state is stale or a lock appeared.
   - `400`, `5xx`, network → rollback only.
7. `mutating = false`, `busyLeagueTeamId = null`.

Only one mutation runs at a time. This avoids two responses arriving out of order and writing stale counters.

### 9.3 vuedraggable configuration (all lists)

```
group="teams"                (same name on the unassigned list and every group list; pull + put enabled)
:sort="false"                (no reordering, only moving between lists)
:disabled="!canEdit"
filter=".no-drag"            (applied to the row that is busy; preventOnFilter=false)
:animation="150"
:delay="150" :delay-on-touch-only="true"    (so scrolling by touch does not start a drag)
ghost-class / chosen-class   (visual feedback)
item-key="leagueTeamId"
```
- Use **controlled lists**: pass `:model-value`, do not write back from `update:modelValue`. In `@change`, act only on `added` of the **target** list and call `moveTeam(...)` with that list's group id. The store applies the change, so drag and button share one path.
- If the spike shows controlled lists do not revert the DOM correctly, fallback: `v-model` on local arrays, and `moveTeam` skips step 3 for drag (already applied) but rolls back by moving the item back.
- Do **not** trust the drop index. `sort: false` does not guarantee append. The store always re-places the team at the end (groups) or in sorted position (unassigned).
- An **empty group list must still be a valid drop target**: give the list a `min-height` and show the hint text inside it.
- `@start` / `@end` set `isDragging`; tooltips and hover action buttons are disabled while `isDragging` is true.
- Test autoscroll: the scroll container is the layout's `overflow-y-auto` div, and the unassigned column is sticky.

### 9.4 What is draggable

| Case | Draggable? |
|---|---|
| Any team row when `canEdit` | Yes |
| Row with `busyLeagueTeamId` | No (`.no-drag`) |
| Anything when `lock != null` | No |
| Anything without `groups.update` | No |
| Team with `teamStatus === "DELETED"` (FINISHED leagues only) | No (and the league is locked anyway) |

### 9.5 Buttons (primary path)

- **Right column row:** "انتقال به گروه" button (arrow pointing left, toward the groups column) opens `MoveMenu` with all groups (name + team count). Disabled with tooltip "ابتدا یک گروه بسازید." when there are no groups.
- **Group row:** "انتقال به گروه دیگر" (`MoveMenu`, current group excluded; disabled if it is the only group) and "حذف از گروه" (direct `moveTeam(..., null)`, no confirmation, since it is reversible).
- Desktop: row buttons appear on hover and keyboard focus. Touch devices: always visible.
- Every icon button has an `aria-label`.

### 9.6 Mobile notes

Drag works on touch with the 150 ms delay, but long stacked lists make it awkward. The design relies on the buttons for mobile. Keep touch targets at least 36 px.

---

## 10. League selector

- `v-autocomplete`, server-side search (`no-filter`), `@update:search` debounced 300 ms, loading indicator, `clearable`, `no-data-text="موردی یافت نشد"`.
- Source: `dropdownStore.getLeagueOptions({ search, page: 1, pageSize: 20 })` → `GET /dropdowns/admin/leagues`.
- Item title is `label` ("نام لیگ — فصل — رده سنی"); show `status` as a small chip.
- **Selected league not in the first page of results** (typical on reload with `?leagueId=`): after the league detail loads, build the same label from `name`, `season.name`, `ageCategory.name` and merge it into the items (dedupe by `value`).
- **Gotcha:** Vuetify fires `update:search` with the chosen title right after a selection. Ignore the search event when its text equals the selected item's label, otherwise the list is refetched and collapses to one item.
- Disabled while `mutating`.
- Loading options is silent (no global loader), like `getSeasons`. A failure shows the error toast and leaves the list empty.

---

## 11. League info card

Shows (from `GET /admin/leagues/:id`): name, status chip, season, age category, `minBirthDate`, start date, end date, roster deadline, `teamsCount`, format label, `winPoints` / `lossPoints`, round type label, `defaultQualifiersPerGroup`. Dates are already Jalali strings.

| Field state | Display |
|---|---|
| Any date null | "—" |
| `format` null | Warning chip "ساختار تعیین نشده" |
| `KNOCKOUT_ONLY` | Round type and qualifiers hidden |
| `SINGLE_GROUP_KNOCKOUT` | Qualifiers label is "تعداد کل صعودکننده‌ها" |
| Group formats | Qualifiers label is "تعداد صعودکننده هر گروه" |

Actions: "ویرایش ساختار" (needs `leagues.update`, D1) and "مدیریت تیم‌های لیگ" → `/leagues/:id/teams` (needs `league-teams.view`).

Status labels / colors: a small shared constant in a composable (`useLeagueStatus`), same values as the leagues page. Do not refactor the leagues page now. (Note: the leagues page has no color for `FINISHED`; use a neutral color here.)

---

## 12. Board

### 12.1 Golden rule: lock and format come from the response only

- Never write logic like "if league status is ACTIVE then disable". Only `lock != null` disables editing, and only `league.format` decides which sections exist.
- When Stage 3 adds `HAS_GAMES` (and covers rename and qualifiers), the backend changes and this page needs no change.

`canEdit = hasPermission("groups.update") && lock === null && isGroupedFormat && !mutating`

### 12.2 Unassigned column

- Header: "تیم‌های بدون گروه" with `unassignedCount`.
- Search box (debounced 300 ms) → `unassigned-teams?search=`. Team names are **not** normalized on save, so do not normalize the search text.
- Rows: logo (fallback `~/assets/image/icon/team.png`), name (truncate, full name in `title`), organization name as second line (`—` if null), move button.
- Page size 100. If `total > loaded`, show "نمایش بیشتر" (fetch the next page and dedupe by `leagueTeamId`). Known limitation: after many assignments the server offset shifts and a team can be skipped; "به‌روزرسانی" refetches from page 1. Real leagues rarely have more than 100 teams.
- Sorted by `leagueTeamId asc` locally, to match the server order.
- When a team is dropped here while a search is active, it is still inserted locally (the user sees where it went); the next fetch applies the filter again.

### 12.3 Group card

- Header: group name, teams-count chip, qualifiers chip (`qualifiers`; if `qualifiersOverride !== null` mark it as custom), `issues` as `AdvisoryChip` list (warnings: too small, qualifiers ≥ teams), edit button, delete button. Edit/delete hidden without the permission and disabled when locked.
- Body: draggable list of team rows (logo + name; hover tooltip with organization on desktop; second line on touch).
- Empty group: dashed drop area with "تیمی را به اینجا بکشید یا از دکمه انتقال استفاده کنید." (when editing is not possible: "این گروه تیمی ندارد.").
- Teams with `teamStatus === "DELETED"` (only FINISHED leagues): grayed row with a "حذف‌شده" chip.

### 12.4 Add-group button

Visible only when all are true:
`hasPermission("groups.create") && lock === null && isGroupedFormat && !(format === "SINGLE_GROUP_KNOCKOUT" && groups.length >= 1)`.
This duplicates a small backend rule on purpose (decision 11). If it is ever wrong, the backend answers `409` and the page refetches.

### 12.5 Group form dialog (create + edit)

| Field | Rule |
|---|---|
| Name | required, trimmed, 2–100 characters (backend also normalizes Arabic ي/ك to Persian). |
| Qualifiers (optional) | integer 1–64, empty means "use the league default". Helper text: "خالی = پیش‌فرض لیگ ({n})" (n omitted when the league default is null). For `SINGLE_GROUP_KNOCKOUT`: "تعداد کل صعودکننده‌ها". |

- Create sends `{ name, qualifiersOverride }` (`null` when empty).
- Edit sends **both** fields; `qualifiersOverride: null` clears the override, `undefined` would keep it. The backend rejects a body with neither field.
- Success: toast with the backend message. Create → push the returned group (with `teams: []`) to the end of the list. Edit → replace the group object from the response.
- Errors: dialog stays open with the backend message (`409` duplicate name, `400` validation). Any `409` also triggers a silent refetch of groups so a new `lock` is noticed; when `lock` appears, close the dialog (watch `lock`).
- Submit uses `handlerStore.loadingBtn` and a disabled state.

### 12.6 Delete-group dialog

- Text: "آیا از حذف «{name}» مطمئن هستید؟" and, when the group has teams, "{n} تیم این گروه بدون گروه می‌شوند."
- Success: remove the group, move its teams to the unassigned list (sorted insert), set `unassignedCount` and `leagueIssues` from the response, toast with the backend message.
- Errors: toast; `404`/`409` → refetch.

---

## 13. State matrix (every state the page can be in)

| # | State | Trigger | UI |
|---|---|---|---|
| 1 | No permission | no `groups.view` | Lock card, no API calls |
| 2 | No league selected | no / invalid `leagueId` | Selector only + hint "برای شروع، یک لیگ را انتخاب کنید." |
| 3 | League loading | selecting / initial URL | Centered spinner under the selector |
| 4 | League not found | `404` from league or groups | Error card "لیگ مورد نظر یافت نشد." + clear selection |
| 5 | Load failed | network / `5xx` | Error card with message + "تلاش دوباره" |
| 6 | Partial failure | groups ok, unassigned failed | Groups shown; right column shows error + retry |
| 7 | Format not set | `format === null` | League card + empty state "ساختار مسابقات این لیگ هنوز تعیین نشده است." + button to edit structure (D1). No columns, no unassigned request |
| 8 | Knockout only | `KNOCKOUT_ONLY` | Empty state "این لیگ مرحله گروهی ندارد." No columns |
| 9 | No registered teams | grouped format, `teamsCount = 0` (no groups' teams, no unassigned) | Both columns empty; right column message "هنوز تیمی در این لیگ ثبت‌نام نشده است." with link to `/leagues/:id/teams` |
| 10 | No groups yet | grouped, `groups = []` | Left: "هنوز گروهی ساخته نشده است." + Add group (if allowed). Right: teams listed, move buttons disabled with tooltip, nothing to drop onto |
| 11 | Everything assigned | `unassignedCount = 0`, groups exist | Right column positive empty state "همه تیم‌ها در گروه قرار گرفته‌اند." |
| 12 | Normal | all above false | Both columns populated |
| 13 | Single-group format | `SINGLE_GROUP_KNOCKOUT` | One group max; Add group hidden once it exists; qualifiers wording changes (11) |
| 14 | Locked | `lock != null` | Banner with `lock.message` (error color via `AdvisoryChip` / alert), drag off, all action buttons hidden or disabled, Add group hidden. Reading still works |
| 15 | Read-only user | only `groups.view` | Same as locked but without a banner; no buttons |
| 16 | Move in flight | `mutating` | Spinner on the moving row, drag and buttons disabled, selector disabled |
| 17 | Move failed | request error | Row returns to its origin, error toast, refetch on `404`/`409` |
| 18 | Warnings present | `issues` not empty | Chips on group headers; league-level chip(s) in the summary strip. Never block anything |
| 19 | Deleted teams visible | FINISHED league | Gray rows with "حذف‌شده" chip (everything is locked anyway) |
| 20 | Switching league | selector change | Previous data cleared, stale responses ignored |

---

## 14. Error handling matrix

| Where | Status / case | Behavior |
|---|---|---|
| any request | `401` | Handled by the axios interceptor (refresh token or redirect to `/auth`). Rollback happens on rejection. |
| any request | `403` | Interceptor flags forbidden; toast shows the backend message. |
| league / groups load | `404` | State 4. |
| league / groups load | other | State 5 (retry). |
| unassigned load | any | State 6 (retry on the column). |
| move (assign / remove) | `404` (group, team, or team no longer in that group) | Rollback + toast + refetch all. |
| move | `409` (league finished / locked, team already placed elsewhere in a race) | Rollback + toast + refetch all (this also surfaces the new `lock`). |
| move | `5xx` / network | Rollback + toast. |
| create group | `400` | Dialog stays, message shown. |
| create group | `409` (duplicate name, format not grouped, single-group limit, locked) | Dialog stays, message shown, silent refetch; close dialog if `lock` appears. |
| edit group | `404` | Toast, close dialog, refetch. |
| edit group | `409` | Same as create. |
| delete group | `404` / `409` | Toast, close dialog, refetch. |
| selector search | any | Toast, empty list. |

Do not compare message strings to decide behavior. Decide by status code and by refetching.

---

## 15. Lock handling (current and future)

- Today the only lock is `FINISHED` (code `FINISHED`, severity `BLOCKER`). After Stage 3 the same field will also carry `HAS_GAMES`.
- Because every write path in the backend already runs the same editability check, adding `HAS_GAMES` there makes the existing `409` and `lock` flow work for free.
- The page reacts to **any** non-null `lock`: banner, drag off, buttons off, dialogs close.
- Remember to refetch after `409` so a lock that appeared during the session is displayed.

---

## 16. Copy (Persian UI strings)

| Key | Text |
|---|---|
| Page / menu | مدیریت مسابقات |
| Selector label | انتخاب لیگ |
| No league | برای شروع، یک لیگ را انتخاب کنید. |
| League not found | لیگ مورد نظر یافت نشد. |
| Format not set | ساختار مسابقات این لیگ هنوز تعیین نشده است. |
| Knockout only | این لیگ مرحله گروهی ندارد. |
| No teams | هنوز تیمی در این لیگ ثبت‌نام نشده است. |
| No groups | هنوز گروهی ساخته نشده است. |
| All assigned | همه تیم‌ها در گروه قرار گرفته‌اند. |
| Unassigned header | تیم‌های بدون گروه |
| Empty group hint | تیمی را به اینجا بکشید یا از دکمه انتقال استفاده کنید. |
| Move | انتقال به گروه |
| Move (other) | انتقال به گروه دیگر |
| Remove from group | حذف از گروه |
| No group to move to | ابتدا یک گروه بسازید. |
| Add / Edit / Delete group | افزودن گروه / ویرایش گروه / حذف گروه |
| Group name | نام گروه |
| Qualifiers | تعداد صعودکننده (اختیاری) |
| Retry / Refresh / More | تلاش دوباره / به‌روزرسانی / نمایش بیشتر |
| Deleted team chip | حذف‌شده |

Warnings, locks and server errors come from the backend in Persian; do not rewrite them.

---

## 17. Implementation order

1. **Spike (half a day max):** install `vuedraggable` (after D4); a throwaway page with two lists, controlled `:model-value`, `sort: false`, shared `group`, empty-list drop, touch delay, `<ClientOnly>`, autoscroll in the layout. Decide controlled vs `v-model`.
2. `groupStore` (state, actions, index) + `getLeagueById` return + `getLeagueOptions`.
3. Route, menu item and permission filter; empty page with guard and URL sync.
4. League selector + league card (+ states 1–5, 7, 8).
5. Fetch flow (8.2) with stale-response guard; board read-only (columns, rows, issues, lock banner; states 9–15, 18, 19).
6. `useGroupsBoard.moveTeam` + `MoveMenu` buttons (assign, move, remove) with rollback and refetch rules.
7. Drag & drop on top of `moveTeam`.
8. Group form dialog (create / edit) and delete dialog.
9. `Alert.vue` timeout (D2); optional leagues-page changes (button + D1 deep link).
10. Manual QA (section 18), then report the files created / modified (per `agent.md`).

---

## 18. QA checklist

- Direct link `/competition?leagueId=3` loads correctly; reload keeps the league; selecting another league replaces the URL.
- Invalid / unknown `leagueId`; league from another season; league without format; `KNOCKOUT_ONLY`; `SINGLE_GROUP_KNOCKOUT` (second group blocked, wording changes); league with no teams.
- Move every direction by button and by drag: unassigned → group, group → group, group → unassigned; moved team lands at the end of the target group; counters and warning chips update with no refetch.
- Drop on an empty group; drop on the same group (no request); drag while another move is in flight (blocked).
- Failure injection: stop the server, or change the league to `FINISHED` in another tab, then move; expect rollback, toast, and `lock` banner after refetch.
- Create group: duplicate name; qualifiers 0 and 65; empty qualifiers; Arabic ي/ك in the name.
- Edit group clears override with empty qualifiers; delete group sends its teams to the unassigned column.
- Permissions: only `groups.view`; `groups.view` + `groups.update`; no `groups.create` (no Add button); no `groups.delete`.
- Admin with FINISHED league (set by SUPER_ADMIN): everything locked, deleted teams grayed.
- Touch device: scrolling does not start a drag; drag works after a short hold; buttons are reachable; organization name visible without hover.
- Keyboard: every action reachable with buttons and focus; icon buttons have labels.
- RTL: unassigned on the right, groups on the left, move arrow points left.
- Over 100 unassigned teams: "نمایش بیشتر" and the refresh limitation behave as documented.

---

## 19. Out of scope (future)

Games, standings, bracket tabs on this page; the `HAS_GAMES` lock (backend, Stage 3); automatic draw; reordering teams or groups; a public groups view in the app (the public endpoint already exists); moving the shared label helpers out of the leagues page.

---

## 20. Acceptance checklist

- [ ] `vuedraggable` installed after explicit approval.
- [ ] Page, route, menu item and `groups.view` filter work; no API calls without permission.
- [ ] League selector with debounced server search, URL sync, merged selected item, no collapse bug.
- [ ] League card with all fields and null handling; format link works.
- [ ] All states in section 13 are implemented and reachable.
- [ ] Buttons and drag use the single `moveTeam` path; optimistic update, rollback, refetch rules as specified.
- [ ] Moved teams appear at the end of the target group; unassigned column is sorted by `leagueTeamId`.
- [ ] Lock, format and permissions control the UI; no logic uses `league.status`.
- [ ] Create / edit / delete group dialogs with all validations and error handling.
- [ ] Mobile and touch behavior verified; organization name visible without hover.
- [ ] Error toast timeout reduced (D2).
- [ ] Files created / modified are listed in the final report.