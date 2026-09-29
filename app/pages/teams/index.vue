<template>
  <div dir="rtl">
    <!-- ── teams.view guard ── -->
    <v-row v-if="!hasPermission('teams.view')">
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
        <!-- ── toolbar ── -->
        <v-row>
          <v-col cols="12" lg="10" xl="11">
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
                  :disabled="selectedOrgId === null"
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

              <v-col cols="12" md="3" xl="2">
                <v-select
                  v-model="selectedOrgId"
                  :items="dropdownStore.organizationsResult"
                  item-title="label"
                  item-value="value"
                  variant="outlined"
                  density="compact"
                  hide-details
                  clearable
                  dir="rtl"
                  @update:model-value="onOrgChange"
                >
                  <template #label>
                    <span class="tw:text-[12px]">باشگاه / سازمان</span>
                  </template>
                </v-select>
              </v-col>

              <v-col cols="6" md="3" xl="2">
                <v-select
                  v-model="selectedStatus"
                  :items="dropdownStore.teamStatuses"
                  item-title="label"
                  item-value="value"
                  variant="outlined"
                  density="compact"
                  hide-details
                  clearable
                  dir="rtl"
                  :disabled="selectedOrgId === null"
                  @update:model-value="onFilterChange"
                >
                  <template #label>
                    <span class="tw:text-[12px]">وضعیت</span>
                  </template>
                </v-select>
              </v-col>

              <v-col cols="6" md="2">
                <v-btn
                  v-if="hasPermission('teams.create')"
                  class="tw:bg-secondary-dark! tw:text-white! tw:rounded-md!"
                  @click="openCreateDialog"
                >
                  <icon-plus class="tw:text-[20px]" />
                  <span class="tw:mr-1!">افزودن تیم</span>
                </v-btn>
              </v-col>
            </v-row>
          </v-col>

          <v-col cols="12" lg="2" xl="1" class="tw:justify-end! tw:hidden tw:md:flex">
            <BackBtn />
          </v-col>
        </v-row>

        <!-- ── Table / placeholder ── -->
        <v-row>
          <v-col cols="12">
            <GeneralDataTable
              v-if="selectedOrgId !== null"
              v-model:page="page"
              v-model:items-per-page="pageSize"
              :items="teamStore.teamList"
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

                  <!-- لوگو -->
                  <td>
                    <div class="tw:flex tw:justify-center">
                      <v-avatar
                        size="34"
                        rounded="sm"
                        class="tw:bg-gray-100! tw:dark:bg-gray-700!"
                      >
                        <v-img
                          v-if="item.logoUrl"
                          :src="item.logoUrl"
                          alt="لوگوی تیم"
                          cover
                        />
                        <icon-box
                          v-else
                          class="tw:text-[18px] tw:text-color-lighter"
                        />
                      </v-avatar>
                    </div>
                  </td>

                  <!-- نام -->
                  <td>
                    <div class="tw:flex tw:justify-center tw:text-nowrap!">
                      {{ item.name }}
                    </div>
                  </td>

                  <!-- تاریخ تاسیس -->
                  <td>
                    <div class="tw:flex tw:justify-center tw:text-nowrap!">
                      {{ item.foundedDate || "—" }}
                    </div>
                  </td>

                  <!-- وضعیت -->
                  <td>
                    <div class="tw:flex tw:justify-center tw:text-nowrap!">
                      <v-chip
                        size="x-small"
                        variant="tonal"
                        :color="getStatusLabel(item.status).color"
                      >
                        {{ getStatusLabel(item.status).label }}
                      </v-chip>
                    </div>
                  </td>

                  <!-- عملیات -->
                  <td>
                    <div class="tw:flex tw:justify-center tw:items-center">
                      <v-tooltip
                        v-if="hasPermission('roster.view')"
                        location="top"
                      >
                        <template #activator="{ props }">
                          <v-btn
                            v-bind="props"
                            size="x-small"
                            variant="plain"
                            rounded="pill"
                            @click="goToRoster(item)"
                          >
                            <icon-list
                              class="tw:text-color-lighter tw:text-[21px]"
                            />
                          </v-btn>
                        </template>
                        <span class="tw:text-xs tw:p-2">مشاهده ترکیب</span>
                      </v-tooltip>

                      <v-tooltip
                        v-if="hasPermission('teams.update')"
                        location="top"
                      >
                        <template #activator="{ props }">
                          <v-btn
                            v-bind="props"
                            size="x-small"
                            variant="plain"
                            rounded="pill"
                            @click="openEditDialog(item.id)"
                          >
                            <icon-edit-box
                              class="tw:text-color-lighter tw:text-[21px]"
                            />
                          </v-btn>
                        </template>
                        <span class="tw:text-xs tw:p-2">ویرایش</span>
                      </v-tooltip>

                      <v-tooltip
                        v-if="
                          canRestore(item.status) &&
                          hasPermission('teams.restore')
                        "
                        location="top"
                      >
                        <template #activator="{ props }">
                          <v-btn
                            v-bind="props"
                            size="x-small"
                            variant="plain"
                            rounded="pill"
                            @click="confirmRestore(item)"
                          >
                            <icon-refresh
                              class="tw:text-color-lighter tw:text-[21px]"
                            />
                          </v-btn>
                        </template>
                        <span class="tw:text-xs tw:p-2">بازیابی</span>
                      </v-tooltip>

                      <v-tooltip
                        v-if="hasPermission('teams.delete')"
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

            <v-card v-else class="tw:rounded-xl!">
              <v-card-text
                class="tw:flex tw:justify-center tw:py-16! tw:text-color-lighter tw:text-[14px]"
              >
                برای مشاهده لیست، ابتدا باشگاه را انتخاب کنید.
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-col>
    </v-row>

    <!-- ─── Organization Picker Dialog ─── -->
    <v-dialog
      v-model="orgDialogOpen"
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
            <div class="tw:text-[14px]! tw:text-white">انتخاب سازمان</div>
          </div>
        </v-card-title>

        <v-card-text>
          <div class="tw:text-[13px] tw:text-color-lighter tw:mb-5! text-center">
            برای مشاهده لیست تیم‌ها، ابتدا باشگاه مورد نظر را انتخاب کنید.
          </div>
          <v-select
            v-model="orgChoice"
            :items="dropdownStore.organizationsResult"
            item-title="label"
            item-value="value"
            variant="outlined"
            density="compact"
            hide-details
            dir="rtl"
            no-data-text="موردی یافت نشد"
          >
            <template #label>
              <span class="tw:text-[12px]">باشگاه / سازمان</span>
              <span class="tw:text-red-900 tw:dark:text-red-400 tw:text-[10px]">
                (الزامی)
              </span>
            </template>
          </v-select>
        </v-card-text>

        <v-card-actions class="tw:justify-end! tw:px-4! tw:pb-4!">
          <v-btn
            class="tw:bg-secondary-dark! tw:text-white! tw:rounded-md! tw:px-4!"
            :disabled="!orgChoice"
            @click="confirmOrg"
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
            <div class="tw:text-[14px]! tw:text-white">حذف تیم</div>
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
          آیا از حذف «{{ deleteTarget?.name }}» مطمئن هستید؟
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

    <!-- ─── Restore Confirm Dialog ─── -->
    <v-dialog
      v-model="restoreDialogOpen"
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
                @click="restoreDialogOpen = false"
              >
                <icon-close class="tw:text-[18px] tw:text-white!" />
              </v-btn>
            </div>
            <div class="tw:text-[14px]! tw:text-white">بازیابی تیم</div>
            <div>
              <v-btn
                icon
                variant="plain"
                size="x-small"
                @click="restoreDialogOpen = false"
              >
                <icon-close class="tw:text-[18px] tw:text-white!" />
              </v-btn>
            </div>
          </div>
        </v-card-title>
        <v-card-text class="tw:text-[16px]! tw:text-center!">
          آیا از بازیابی «{{ restoreTarget?.name }}» مطمئن هستید؟
        </v-card-text>
        <v-card-actions class="tw:justify-end!">
          <v-btn
            variant="text"
            class="tw:text-[12px]!"
            @click="restoreDialogOpen = false"
          >
            انصراف
          </v-btn>
          <v-btn
            class="tw:bg-secondary-dark! tw:text-white! tw:rounded-md!"
            :loading="handlerStore.loadingBtn"
            :disabled="handlerStore.loadingBtn"
            @click="onRestoreConfirm"
          >
            <icon-refresh class="tw:text-[18px]" />
            <span class="tw:mr-1! tw:text-[12px]! tw:px-2!">بازیابی</span>
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- ─── Add / Edit Dialog ─── -->
    <v-dialog v-model="dialogOpen" max-width="400" dir="rtl" class="blur-dialog">
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
              {{ dialogMode === "create" ? "افزودن تیم" : "ویرایش تیم" }}
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
          <div
            v-if="dialogMode === 'edit' && detailLoading"
            class="tw:flex tw:justify-center tw:py-8"
          >
            <v-progress-circular indeterminate color="primary" />
          </div>

          <v-form v-else ref="formRef">
            <v-row>
              <v-col cols="12">
                <v-text-field
                  v-model="form.name"
                  variant="outlined"
                  density="compact"
                  hide-details
                  :rules="[(v: string) => !!v || '']"
                >
                  <template #label>
                    <span class="tw:text-[12px]">نام تیم</span>
                    <span
                      class="tw:text-red-900 tw:dark:text-red-400 tw:text-[10px]"
                    >
                      (الزامی)
                    </span>
                  </template>
                </v-text-field>
              </v-col>

              <v-col cols="12">
                <div class="tw:relative!">
                  <label
                    v-if="form.foundedDate"
                    for="foundedDate"
                    class="tw:text-[11px] tw:absolute! tw:bg-white! tw:dark:bg-primary-dark! tw:start-10 tw:-top-1.75 tw:z-10! tw:text-color-reverse"
                  >
                    <span class="tw:text-[12px]">تاریخ تاسیس</span>
                  </label>
                  <date-picker
                    v-model="form.foundedDate"
                    id="foundedDate"
                    simple
                    placeholder="تاریخ تاسیس"
                    format="jYYYY/jMM/jDD"
                    display-format="jYYYY/jMM/jDD"
                    class="default-scroll tw:text-gray-300! tw:text-[14px]! tw:text-center!"
                    color="#1d202e"
                  />
                </div>
              </v-col>

              <v-col cols="12">
                <v-switch
                  v-model="form.isActive"
                  color="secondary"
                  hide-details
                  density="compact"
                >
                  <template #label>
                    <span class="tw:text-[12px]">فعال</span>
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

// ─── Permissions ──
const { hasPermission } = usePermission();

const { setPageTitle } = usePageTitle();
watchEffect(() => {
  setPageTitle("مدیریت تیم‌ها");
});

// ─── Organization selection ──
// The dialog opens on every mount — the chosen org is never persisted.
const orgDialogOpen = ref<boolean>(false);
const orgChoice = ref<number | null>(null);
const selectedOrgId = ref<number | null>(null);

const confirmOrg = () => {
  if (!orgChoice.value) {
    handlerStore.setError("لطفا باشگاه مورد نظر را انتخاب کنید.");
    return;
  }

  selectedOrgId.value = orgChoice.value;
  orgDialogOpen.value = false;
  page.value = 1;
  query.value = "";
  selectedStatus.value = null;
  loadTeams();
};

// Clearing the toolbar select re-opens the dialog.
const onOrgChange = (value: number | null) => {
  if (value === null || value === undefined) {
    selectedOrgId.value = null;
    orgChoice.value = null;
    orgDialogOpen.value = true;
    return;
  }

  page.value = 1;
  query.value = "";
  selectedStatus.value = null;
  loadTeams();
};

// ─── Pagination ──
const page = ref<number>(1);
const pageSize = ref<number>(10);
const totalItems = computed(() => teamStore.teamListMeta?.total ?? 0);

// ─── Search & Filters ──
const query = ref<string>("");
const selectedStatus = ref<string | null>(null);
let searchTimeout: ReturnType<typeof setTimeout> | null = null;

const onSearchChange = () => {
  if (searchTimeout) clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    page.value = 1;
    loadTeams();
  }, 300);
};

const onFilterChange = () => {
  page.value = 1;
  loadTeams();
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
  { title: "لوگو", key: "logoUrl", sortable: false, align: "center" as const },
  { title: "نام", key: "name", sortable: false, align: "center" as const },
  {
    title: "تاریخ تاسیس",
    key: "foundedDate",
    sortable: false,
    align: "center" as const,
  },
  {
    title: "وضعیت",
    key: "status",
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
const getStatusLabel = (status: string): { label: string; color: string } => {
  const map: Record<string, { label: string; color: string }> = {
    ACTIVE: { label: "فعال", color: "success" },
    INACTIVE: { label: "غیر فعال", color: "warning" },
    DELETED: { label: "حذف شده", color: "error" },
  };
  return map[status] ?? { label: status, color: "default" };
};

const canRestore = (status: string) =>
  status === "DELETED" || status === "INACTIVE";

// ─── Data Loading ──
// Local flag — the store keeps `loading` on for an extra 2s after a fetch.
const listLoading = ref<boolean>(false);

// Key of the options used for the most recent fetch — used to drop the
// duplicate "update:options" echoes coming from the table and Pagination.
let lastLoadedKey = `${page.value}:${pageSize.value}`;

const loadTeams = () => {
  if (selectedOrgId.value === null) return;

  lastLoadedKey = `${page.value}:${pageSize.value}`;

  const params: Record<string, any> = {
    organizationId: selectedOrgId.value,
    page: page.value,
    pageSize: pageSize.value,
  };
  if (query.value) params.search = query.value;
  if (selectedStatus.value) params.status = selectedStatus.value;

  listLoading.value = true;
  teamStore.getTeams(params).finally(() => {
    listLoading.value = false;
  });
};

const onOptionsChange = (options: { page: number; itemsPerPage: number }) => {
  const key = `${options.page}:${options.itemsPerPage}`;
  if (key === lastLoadedKey) return;

  page.value = options.page;
  pageSize.value = options.itemsPerPage;
  loadTeams();
};

// ─── Roster navigation ──
const goToRoster = (team: any) => {
  navigateTo(`/teams/roster/${team.id}`);
};

// ─── Delete ──
const deleteDialogOpen = ref<boolean>(false);
const deleteTarget = ref<any>(null);

const confirmDelete = (item: any) => {
  deleteTarget.value = item;
  deleteDialogOpen.value = true;
};

const onDeleteConfirm = () => {
  teamStore.deleteTeam(deleteTarget.value.id).then(() => {
    deleteDialogOpen.value = false;
    deleteTarget.value = null;
    loadTeams();
  });
};

// ─── Restore ──
const restoreDialogOpen = ref<boolean>(false);
const restoreTarget = ref<any>(null);

const confirmRestore = (item: any) => {
  restoreTarget.value = item;
  restoreDialogOpen.value = true;
};

const onRestoreConfirm = () => {
  teamStore.restoreTeam(restoreTarget.value.id).then(() => {
    restoreDialogOpen.value = false;
    restoreTarget.value = null;
    loadTeams();
  });
};

// ─── Add / Edit ──
const dialogOpen = ref<boolean>(false);
const dialogMode = ref<"create" | "edit">("create");
const editingId = ref<number | null>(null);
const formRef = ref<any>(null);
const detailLoading = ref<boolean>(false);

const defaultForm = () => ({
  name: "",
  foundedDate: "",
  isActive: true,
});
const form = reactive(defaultForm());
const resetForm = () => {
  Object.assign(form, defaultForm());
};

const openCreateDialog = () => {
  if (selectedOrgId.value === null) {
    handlerStore.setError("ابتدا باشگاه مورد نظر را انتخاب کنید.");
    return;
  }
  dialogMode.value = "create";
  editingId.value = null;
  resetForm();
  dialogOpen.value = true;
};

const openEditDialog = (id: number) => {
  dialogMode.value = "edit";
  editingId.value = id;
  resetForm();
  detailLoading.value = true;
  dialogOpen.value = true;

  teamStore
    .getTeamById(id)
    .then(() => {
      const detail = teamStore.teamDetail;
      if (detail) {
        form.name = detail.name || "";
        form.foundedDate = detail.foundedDate || "";
        form.isActive = detail.status === "ACTIVE";
      }
    })
    .finally(() => {
      detailLoading.value = false;
    });
};

const onDialogSubmit = () => {
  if (!form.name) {
    handlerStore.setError("لطفا تمام فیلدهای الزامی را پر کنید.");
    return;
  }

  formRef.value!.validate().then(({ valid }: { valid: boolean }) => {
    if (!valid) return;

    const payload: Record<string, any> = {
      organizationId: selectedOrgId.value,
      name: form.name,
      status: form.isActive ? "ACTIVE" : "INACTIVE",
    };
    if (form.foundedDate) payload.foundedDate = form.foundedDate;

    if (dialogMode.value === "create") {
      teamStore.createTeam(payload).then(() => {
        loadTeams();
        dialogOpen.value = false;
        resetForm();
      });
    } else {
      teamStore.updateTeam(editingId.value!, payload).then(() => {
        loadTeams();
        dialogOpen.value = false;
        resetForm();
      });
    }
  });
};

// ─── Init ──
onMounted(() => {
  if (dropdownStore.organizationsResult.length === 0)
    dropdownStore.getOrganizationDropdown();
  if (dropdownStore.teamStatuses.length === 0)
    dropdownStore.getTeamStatuses();

  // Always ask for the organization — nothing is persisted across visits.
  orgChoice.value = null;
  selectedOrgId.value = null;
  orgDialogOpen.value = true;
});
</script>
