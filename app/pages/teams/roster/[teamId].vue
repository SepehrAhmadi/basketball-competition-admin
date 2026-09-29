<template>
  <div dir="rtl">
    <!-- ── roster.view guard ── -->
    <v-row v-if="!hasPermission('roster.view')">
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
      <v-col>
        <!-- ── header ── -->
        <v-row class="tw:mb-2! tw:items-center">
          <v-col cols="12" md="8">
            <div class="tw:flex tw:items-center tw:gap-2">
              <icon-layer class="tw:text-[20px] tw:text-color-lighter" />
              <div>
                <div class="tw:text-[15px] tw:font-medium">
                  لیست اعضای تیم
                  {{
                    teamStore.teamDetail?.name
                      ? ` «${teamStore.teamDetail.name}»`
                      : ""
                  }}
                </div>
                <div class="tw:text-[11px] tw:text-color-lighter">
                  فصل انتخاب‌شده: {{ seasonLabel || "—" }}
                </div>
              </div>
            </div>
          </v-col>

          <v-col cols="12" md="4" class="tw:justify-end! tw:flex">
            <BackBtn />
          </v-col>
        </v-row>

        <!-- ── toolbar ── -->
        <v-row>
          <v-col cols="12">
            <v-row>
              <v-col cols="12" md="1" xl="1">
                <TablePageSize v-model="pageSize" />
              </v-col>

              <v-col cols="12" md="3" xl="3">
                <v-text-field
                  v-model="query"
                  variant="outlined"
                  density="compact"
                  hide-details
                  dir="rtl"
                  @update:model-value="onSearchChange"
                >
                  <template #label>
                    <span class="tw:text-[12px]">جستجو</span>
                  </template>
                  <template #prepend-inner>
                    <icon-magnify
                      class="tw:text-[18px] tw:text-color-lighter"
                    />
                  </template>
                </v-text-field>
              </v-col>

              <!-- season filter — visible only after a season is chosen -->
              <v-col v-if="selectedSeasonId !== null" cols="6" md="3" xl="2">
                <v-select
                  v-model="selectedSeasonId"
                  :items="dropdownStore.seasonsResult"
                  item-title="label"
                  item-value="value"
                  variant="outlined"
                  density="compact"
                  hide-details
                  clearable
                  dir="rtl"
                  @update:model-value="onSeasonFilterChange"
                >
                  <template #label>
                    <span class="tw:text-[12px]">فصل</span>
                  </template>
                </v-select>
              </v-col>

              <!-- role filter — same options as the create/edit form -->
              <v-col cols="6" md="3" xl="2">
                <v-select
                  v-model="selectedRole"
                  :items="roleOptions"
                  item-title="title"
                  item-value="value"
                  variant="outlined"
                  density="compact"
                  hide-details
                  clearable
                  dir="rtl"
                  @update:model-value="onRoleFilterChange"
                >
                  <template #label>
                    <span class="tw:text-[12px]">نقش</span>
                  </template>
                </v-select>
              </v-col>

              <v-col cols="6" md="2">
                <v-btn
                  v-if="hasPermission('roster.create')"
                  class="tw:bg-secondary-dark! tw:text-white! tw:rounded-md!"
                  @click="openCreateDialog"
                >
                  <icon-plus class="tw:text-[20px]" />
                  <span class="tw:mr-1!">افزودن عضو</span>
                </v-btn>
              </v-col>
            </v-row>
          </v-col>
        </v-row>

        <!-- ── Table ── -->
        <v-row>
          <v-col cols="12">
            <GeneralDataTable
              v-if="selectedSeasonId !== null"
              v-model:page="page"
              v-model:items-per-page="pageSize"
              :items="teamStore.rosterList"
              :headers="tableHeaders"
              :items-length="totalItems"
              :loading="listLoading"
              @update-options="onOptionsChange"
            >
              <template #item="{ item, index }">
                <tr>
                  <!-- ردیف -->
                  <td>
                    <div class="tw:flex tw:justify-center tw:text-nowrap!">
                      {{ (page - 1) * pageSize + index + 1 }}
                    </div>
                  </td>

                  <!-- نام کاربر -->
                  <td>
                    <div class="tw:flex tw:justify-center tw:text-nowrap!">
                      {{ memberName(item) }}
                    </div>
                  </td>

                  <!-- نقش -->
                  <td>
                    <div class="tw:flex tw:justify-center tw:text-nowrap!">
                      <v-chip size="x-small" variant="tonal">
                        {{ getRoleLabel(item.role) }}
                      </v-chip>
                    </div>
                  </td>

                  <!-- شماره پیراهن -->
                  <td>
                    <div class="tw:flex tw:justify-center tw:text-nowrap!">
                      {{ item.jerseyNumber ?? "—" }}
                    </div>
                  </td>

                  <!-- سرمربی -->
                  <td>
                    <div class="tw:flex tw:justify-center tw:text-nowrap!">
                      <v-chip
                        v-if="item.isHeadCoach"
                        size="x-small"
                        variant="tonal"
                        color="success"
                      >
                        سرمربی
                      </v-chip>
                      <span v-else>—</span>
                    </div>
                  </td>

                  <!-- عملیات -->
                  <td>
                    <div class="tw:flex tw:justify-center tw:items-center">
                      <v-tooltip
                        v-if="hasPermission('roster.update')"
                        location="top"
                      >
                        <template #activator="{ props }">
                          <v-btn
                            v-bind="props"
                            size="x-small"
                            variant="plain"
                            rounded="pill"
                            @click="openEditDialog(item)"
                          >
                            <icon-edit-box
                              class="tw:text-color-lighter tw:text-[21px]"
                            />
                          </v-btn>
                        </template>
                        <span class="tw:text-xs tw:p-2">ویرایش</span>
                      </v-tooltip>

                      <v-tooltip
                        v-if="hasPermission('roster.delete')"
                        location="top"
                      >
                        <template #activator="{ props }">
                          <v-btn
                            v-bind="props"
                            size="x-small"
                            variant="plain"
                            rounded="pill"
                            @click="confirmDelete(item)"
                          >
                            <icon-trash
                              class="tw:text-color-lighter tw:text-[21px]"
                            />
                          </v-btn>
                        </template>
                        <span class="tw:text-xs tw:p-2">حذف</span>
                      </v-tooltip>
                    </div>
                  </td>
                </tr>
              </template>
            </GeneralDataTable>

            <!-- no season chosen yet -->
            <v-card v-else class="tw:rounded-xl!">
              <v-card-text
                class="tw:text-center tw:text-color-lighter tw:text-[14px]! tw:py-16!"
              >
                برای مشاهده لیست، ابتدا فصل را انتخاب کنید.
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-col>
    </v-row>

    <!-- ─── Season Picker Dialog ─── -->
    <v-dialog
      v-model="seasonDialogOpen"
      persistent
      max-width="430"
      dir="rtl"
      class="blur-dialog"
    >
      <v-card rounded="lg">
        <v-card-title
          class="tw:bg-secondary-dark tw:dark:bg-primary-dark! tw:mb-3!"
        >
          <div class="tw:flex tw:justify-center tw:items-center tw:pt-1!">
            <div class="tw:text-[14px]! tw:text-white">انتخاب فصل</div>
          </div>
        </v-card-title>

        <v-card-text>
          <div class="tw:text-[13px] tw:text-color-lighter tw:mb-5! text-center">
            برای مشاهده لیست اعضای تیم، ابتدا فصل مورد نظر را انتخاب کنید.
          </div>
          <v-select
            v-model="seasonChoice"
            :items="dropdownStore.seasonsResult"
            item-title="label"
            item-value="value"
            variant="outlined"
            density="compact"
            hide-details
            dir="rtl"
            no-data-text="موردی یافت نشد"
          >
            <template #label>
              <span class="tw:text-[12px]">فصل</span>
              <span class="tw:text-red-900 tw:dark:text-red-400 tw:text-[10px]">
                (الزامی)
              </span>
            </template>
          </v-select>
        </v-card-text>

        <v-card-actions class="tw:justify-end! tw:px-4! tw:pb-4!">
          <v-btn
            class="tw:bg-secondary-dark! tw:text-white! tw:rounded-md! tw:px-4!"
            :disabled="!seasonChoice"
            @click="confirmSeason"
          >
            <icon-check class="tw:text-[18px]" />
            <span class="tw:mr-1! tw:text-[12px]! tw:px-2!">تایید</span>
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- ─── Delete Confirm Dialog ─── -->
    <v-dialog
      v-model="deleteDialogOpen"
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
              <v-btn
                icon
                variant="plain"
                size="x-small"
                @click="deleteDialogOpen = false"
              >
                <icon-close class="tw:text-[18px] tw:text-white!" />
              </v-btn>
            </div>
            <div class="tw:text-[14px]! tw:text-white">حذف عضو تیم</div>
            <div>
              <v-btn
                icon
                variant="plain"
                size="x-small"
                @click="deleteDialogOpen = false"
              >
                <icon-close class="tw:text-[18px] tw:text-white!" />
              </v-btn>
            </div>
          </div>
        </v-card-title>
        <v-card-text class="tw:text-[16px]! tw:text-center!">
          آیا از حذف «{{ memberName(deleteTarget) }}» مطمئن هستید؟
        </v-card-text>
        <v-card-actions class="tw:justify-end!">
          <v-btn
            variant="text"
            class="tw:text-[12px]!"
            @click="deleteDialogOpen = false"
          >
            انصراف
          </v-btn>
          <v-btn
            class="tw:bg-secondary-dark! tw:text-white! tw:rounded-md!"
            :loading="handlerStore.loadingBtn"
            :disabled="handlerStore.loadingBtn"
            @click="onDeleteConfirm"
          >
            <icon-trash class="tw:text-[18px]" />
            <span class="tw:mr-1! tw:text-[12px]! tw:px-2!">حذف</span>
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- ─── Add / Edit Dialog ─── -->
    <v-dialog
      v-model="dialogOpen"
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
              <v-btn
                icon
                variant="plain"
                size="x-small"
                @click="dialogOpen = false"
              >
                <icon-close class="tw:text-[18px] tw:text-white!" />
              </v-btn>
            </div>
            <div class="tw:text-[14px]! tw:text-white">
              {{
                dialogMode === "create" ? "افزودن عضو تیم" : "ویرایش عضو تیم"
              }}
            </div>
            <div>
              <v-btn
                icon
                variant="plain"
                size="x-small"
                @click="dialogOpen = false"
              >
                <icon-close class="tw:text-[18px] tw:text-white!" />
              </v-btn>
            </div>
          </div>
        </v-card-title>

        <v-card-text>
          <v-form ref="formRef">
            <v-row>
              <v-col cols="12">
                <v-autocomplete
                  v-model="form.userId"
                  :items="dropdownStore.usersResult"
                  item-title="label"
                  item-value="value"
                  variant="outlined"
                  density="compact"
                  hide-details
                  clearable
                  no-data-text="موردی یافت نشد"
                  :rules="[(v: any) => !!v || '']"
                >
                  <template #label>
                    <span class="tw:text-[12px]">کاربر</span>
                    <span
                      class="tw:text-red-900 tw:dark:text-red-400 tw:text-[10px]"
                    >
                      (الزامی)
                    </span>
                  </template>
                </v-autocomplete>
              </v-col>

              <v-col cols="12">
                <v-select
                  v-model="form.role"
                  :items="roleOptions"
                  item-title="title"
                  item-value="value"
                  variant="outlined"
                  density="compact"
                  hide-details
                  dir="rtl"
                  :rules="[(v: any) => !!v || '']"
                >
                  <template #label>
                    <span class="tw:text-[12px]">نقش</span>
                    <span
                      class="tw:text-red-900 tw:dark:text-red-400 tw:text-[10px]"
                    >
                      (الزامی)
                    </span>
                  </template>
                </v-select>
              </v-col>

              <v-col
                v-if="form.role === 'PLAYER'"
                cols="12"
              >
                <v-text-field
                  v-model="form.jerseyNumber"
                  type="number"
                  variant="outlined"
                  density="compact"
                  hide-details
                  :rules="[
                    (v: any) =>
                      (v !== null && v !== '' && !Number.isNaN(Number(v))) ||
                      '',
                  ]"
                >
                  <template #label>
                    <span class="tw:text-[12px]">شماره پیراهن</span>
                    <span
                      class="tw:text-red-900 tw:dark:text-red-400 tw:text-[10px]"
                    >
                      (الزامی)
                    </span>
                  </template>
                </v-text-field>
              </v-col>

              <v-col
                v-if="form.role === 'COACH'"
                cols="12"
              >
                <v-switch
                  v-model="form.isHeadCoach"
                  color="secondary"
                  hide-details
                  class="tw:mt-1!"
                  density="compact"
                >
                  <template #label>
                    <span class="tw:text-[12px]">سرمربی تیم</span>
                  </template>
                </v-switch>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>

        <v-card-actions class="tw:justify-end! tw:px-4! tw:pb-4!">
          <v-btn
            variant="text"
            class="tw:text-[12px]!"
            @click="dialogOpen = false"
          >
            انصراف
          </v-btn>
          <v-btn
            class="tw:bg-secondary-dark! tw:text-white! tw:rounded-md! tw:px-4!"
            :loading="handlerStore.loadingBtn"
            :disabled="handlerStore.loadingBtn"
            @click="onDialogSubmit"
          >
            <icon-check class="tw:text-[18px]" />
            <span class="tw:mr-1! tw:text-[12px]! tw:px-2!">
              {{ dialogMode === "create" ? "افزودن" : "ذخیره" }}
            </span>
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { useTeamStore } from "~/store/team";
import { useDeopdownStore } from "~/store/dropdown";
import { useHandlerStore } from "~/store/handler";

const teamStore = useTeamStore();
const dropdownStore = useDeopdownStore();
const handlerStore = useHandlerStore();

const route = useRoute();
const teamId = computed(() => String(route.params.teamId));

// ─── Permissions ──
const { hasPermission } = usePermission();

const { setPageTitle } = usePageTitle();
watchEffect(() => {
  setPageTitle("لیست اعضای تیم");
});

// ─── Season selection ──
// The dialog opens on every mount — the chosen season is never persisted.
const seasonDialogOpen = ref<boolean>(false);
const seasonChoice = ref<string | number | null>(null);
const selectedSeasonId = ref<string | number | null>(null);

const seasonLabel = computed(
  () =>
    dropdownStore.seasonsResult.find((s) => s.value === selectedSeasonId.value)
      ?.label ?? "",
);

const confirmSeason = () => {
  if (!seasonChoice.value) {
    handlerStore.setError("لطفا فصل مورد نظر را انتخاب کنید.");
    return;
  }

  selectedSeasonId.value = seasonChoice.value;
  seasonDialogOpen.value = false;
  page.value = 1;
  loadRoster();
};

// Clearing the toolbar filter re-opens the dialog.
const onSeasonFilterChange = (value: string | number | null) => {
  if (value === null || value === undefined) {
    seasonChoice.value = null;
    seasonDialogOpen.value = true;
    return;
  }

  page.value = 1;
  loadRoster();
};

// ─── Role filter (toolbar) ──
const selectedRole = ref<string | null>(null);

const onRoleFilterChange = () => {
  page.value = 1;
  loadRoster();
};

// ─── Pagination ──
const page = ref<number>(1);
const pageSize = ref<number>(10);
const totalItems = computed(() => teamStore.rosterMeta?.total ?? 0);

// ─── Search ──
const query = ref<string>("");
let searchTimeout: ReturnType<typeof setTimeout> | null = null;

const onSearchChange = () => {
  if (searchTimeout) clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    page.value = 1;
    loadRoster();
  }, 300);
};

// ─── Table Headers ──
const tableHeaders = [
  {
    title: "ردیف",
    key: "index",
    sortable: false,
    width: "60px",
    align: "center" as const,
  },
  {
    title: "نام کاربر",
    key: "user",
    sortable: false,
    align: "center" as const,
  },
  {
    title: "نقش",
    key: "role",
    sortable: false,
    align: "center" as const,
  },
  {
    title: "شماره پیراهن",
    key: "jerseyNumber",
    sortable: false,
    align: "center" as const,
  },
  {
    title: "سرمربی",
    key: "isHeadCoach",
    sortable: false,
    align: "center" as const,
  },
  {
    title: "عملیات",
    key: "actions",
    sortable: false,
    align: "center" as const,
  },
];

// ─── Helpers ──
const memberName = (item: any): string =>
  item?.user?.fullName ?? item?.fullName ?? item?.name ?? item?.username ?? "—";

const getRoleLabel = (role: string): string => {
  const map: Record<string, string> = {
    COACH: "مربی",
    PLAYER: "بازیکن",
  };
  return map[role] ?? role ?? "—";
};

const roleOptions = [
  { title: "مربی", value: "COACH" },
  { title: "بازیکن", value: "PLAYER" },
];

// ─── Data Loading ──
// Key of the options used for the most recent fetch — used to drop the
// duplicate "update:options" echoes coming from the table and Pagination.
let lastLoadedKey = `${page.value}:${pageSize.value}`;
// Local flag — the store keeps `loading` on for an extra 2s after a fetch.
const listLoading = ref<boolean>(false);

const loadRoster = () => {
  if (selectedSeasonId.value === null) return;

  lastLoadedKey = `${page.value}:${pageSize.value}`;
  listLoading.value = true;

  const params: Record<string, any> = {
    seasonId: selectedSeasonId.value,
    page: page.value,
    pageSize: pageSize.value,
  };
  if (query.value) params.search = query.value;
  if (selectedRole.value) params.role = selectedRole.value;

  teamStore
    .getRoster(teamId.value, params)
    .finally(() => {
      listLoading.value = false;
    });
};

// The table and the Pagination child both notify on every option change
// (and the model is updated before the event reaches us), so compare
// against the last fetched options instead of the current model.
const onOptionsChange = (options: { page: number; itemsPerPage: number }) => {
  const key = `${options.page}:${options.itemsPerPage}`;
  if (key === lastLoadedKey) return;

  page.value = options.page;
  pageSize.value = options.itemsPerPage;
  loadRoster();
};

// ─── Delete ──
const deleteDialogOpen = ref<boolean>(false);
const deleteTarget = ref<any>(null);

const confirmDelete = (item: any) => {
  deleteTarget.value = item;
  deleteDialogOpen.value = true;
};

const onDeleteConfirm = () => {
  teamStore
    .removeRosterMember(teamId.value, deleteTarget.value.id)
    .then(() => {
      deleteDialogOpen.value = false;
      deleteTarget.value = null;
      loadRoster();
    });
};

// ─── Add / Edit Dialog ──
const dialogOpen = ref<boolean>(false);
const dialogMode = ref<"create" | "edit">("create");
const editingId = ref<number | string | null>(null);
const formRef = ref<any>(null);

const defaultForm = () => ({
  userId: null as number | string | null,
  role: "",
  jerseyNumber: "" as string | number,
  isHeadCoach: false,
});

const form = reactive(defaultForm());

const resetForm = () => {
  Object.assign(form, defaultForm());
};

const openCreateDialog = () => {
  if (selectedSeasonId.value === null) {
    handlerStore.setError("ابتدا فصل مورد نظر را انتخاب کنید.");
    return;
  }

  dialogMode.value = "create";
  editingId.value = null;
  resetForm();
  dialogOpen.value = true;
};

const openEditDialog = (item: any) => {
  dialogMode.value = "edit";
  editingId.value = item.id ?? item.memberId ?? item.rosterId ?? null;
  resetForm();

  form.userId = item.userId ?? item.user?.id ?? null;
  form.role = item.role ?? "";
  form.jerseyNumber = item.jerseyNumber ?? "";
  form.isHeadCoach = Boolean(item.isHeadCoach);
  dialogOpen.value = true;
};

const onDialogSubmit = () => {
  const jerseyRequired = form.role === "PLAYER";
  if (
    !form.userId ||
    !form.role ||
    (jerseyRequired && form.jerseyNumber === "")
  ) {
    handlerStore.setError("لطفا تمام فیلدهای الزامی را پر کنید.");
    return;
  }

  formRef.value!.validate().then(({ valid }: { valid: boolean }) => {
    if (!valid) return;

    // seasonId = the season chosen in the toolbar / dialog.
    const payload = {
      userId: form.userId,
      seasonId: selectedSeasonId.value,
      role: form.role,
      // coach → no jersey; player → never head coach
      jerseyNumber: form.role === "PLAYER" ? Number(form.jerseyNumber) : null,
      isHeadCoach: form.role === "COACH" ? form.isHeadCoach : false,
    };

    if (dialogMode.value === "create") {
      teamStore.addRosterMember(teamId.value, payload).then(() => {
        loadRoster();
        dialogOpen.value = false;
        resetForm();
      });
    } else {
      teamStore
        .updateRosterMember(teamId.value, editingId.value!, payload)
        .then(() => {
          loadRoster();
          dialogOpen.value = false;
          resetForm();
        });
    }
  });
};

// ─── Init ──
onMounted(() => {
  teamStore.getTeamById(teamId.value);

  if (dropdownStore.seasonsResult.length === 0) {
    dropdownStore.getSeasons();
  }

  if (dropdownStore.usersResult.length === 0) {
    dropdownStore.getDropdownUsers();
  }

  // Always ask for the season — nothing is persisted across visits.
  seasonChoice.value = null;
  selectedSeasonId.value = null;
  seasonDialogOpen.value = true;
});
</script>

<style scoped></style>