<template>
  <div dir="rtl">
    <!-- ── organizations.view guard ── -->
    <v-row v-if="!hasPermission('organizations.view')">
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
        <v-row class="tw:mb-2!">
          <v-col cols="12" lg="11">
            <v-row>
              <v-col cols="12" md="4" xl="1">
                <TablePageSize v-model="pageSize" />
              </v-col>

              <v-col cols="12" md="4" xl="3">
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

              <v-col cols="6" md="3" xl="2">
                <v-select
                  v-model="selectedStatus"
                  :items="dropdownStore.organizationStatuses"
                  item-title="label"
                  item-value="value"
                  variant="outlined"
                  density="compact"
                  hide-details
                  clearable
                  dir="rtl"
                  @update:model-value="onFilterChange"
                >
                  <template #label>
                    <span class="tw:text-[12px]">وضعیت</span>
                  </template>
                </v-select>
              </v-col>

              <v-col cols="6" md="2">
                <v-btn
                  v-if="hasPermission('organizations.create')"
                  class="tw:bg-secondary-dark! tw:text-white! tw:rounded-md!"
                  @click="openCreateDialog"
                >
                  <icon-plus class="tw:text-[20px]" />
                  <span class="tw:mr-1!">افزودن باشگاه</span>
                </v-btn>
              </v-col>
            </v-row>
          </v-col>

          <v-col cols="12" lg="1" class="tw:justify-end! tw:hidden tw:md:flex">
            <BackBtn />
          </v-col>
        </v-row>

        <!-- ── Table ── -->
        <v-row>
          <v-col cols="12">
            <GeneralDataTable
              v-model:page="page"
              v-model:items-per-page="pageSize"
              :items="organizationStore.organizationList"
              :headers="tableHeaders"
              :items-length="totalItems"
              :loading="organizationStore.loading"
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
                        class="tw:bg-gray-100! tw:dark:bg-primary-light!"
                      >
                        <v-img
                          v-if="item.logoUrl"
                          :src="item.logoUrl"
                          alt="لوگوی باشگاه"
                          cover
                        />
                        <icon-building
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

                  <!-- شهر -->
                  <td>
                    <div class="tw:flex tw:justify-center tw:text-nowrap!">
                      {{ item.city }}
                    </div>
                  </td>

                  <!-- تلفن -->
                  <td>
                    <div class="tw:flex tw:justify-center tw:text-nowrap!">
                      {{ item.phone }}
                    </div>
                  </td>

                  <!-- ایمیل -->
                  <td>
                    <div class="tw:flex tw:justify-center tw:text-nowrap!">
                      {{ item.email }}
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

                  <!-- نام مدیر -->
                  <td>
                    <div class="tw:flex tw:justify-center tw:text-nowrap!">
                      {{ item.manager?.fullName || "—" }}
                    </div>
                  </td>

                  <!-- تعداد تیم‌ها -->
                  <td>
                    <div class="tw:flex tw:justify-center tw:text-nowrap!">
                      {{ item.teamsCount ?? 0 }}
                    </div>
                  </td>

                  <!-- عملیات -->
                  <td>
                    <div class="tw:flex tw:justify-center tw:items-center">
                      <v-tooltip
                        v-if="hasPermission('organizations.update')"
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
                          hasPermission('organizations.restore')
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
                        v-if="hasPermission('organizations.delete')"
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
          </v-col>
        </v-row>
      </v-col>
    </v-row>

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
            <div class="tw:text-[14px]! tw:text-white">حذف باشگاه</div>
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
            <div class="tw:text-[14px]! tw:text-white">بازیابی باشگاه</div>
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
    <v-dialog
      v-model="dialogOpen"
      max-width="1200"
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
              {{ dialogMode === "create" ? "افزودن باشگاه" : "ویرایش باشگاه" }}
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
              <v-col cols="12" md="6" lg="4" xl="3">
                <v-text-field
                  v-model="form.name"
                  variant="outlined"
                  density="compact"
                  hide-details
                  :rules="[(v: string) => !!v || '']"
                >
                  <template #label>
                    <span class="tw:text-[12px]">نام باشگاه</span>
                    <span
                      class="tw:text-red-900 tw:dark:text-red-400 tw:text-[10px]"
                    >
                      (الزامی)
                    </span>
                  </template>
                </v-text-field>
              </v-col>

              <v-col cols="12" md="6" lg="4" xl="3">
                <v-text-field
                  v-model="form.city"
                  variant="outlined"
                  density="compact"
                  hide-details
                  :rules="[(v: string) => !!v || '']"
                >
                  <template #label>
                    <span class="tw:text-[12px]">شهر</span>
                    <span
                      class="tw:text-red-900 tw:dark:text-red-400 tw:text-[10px]"
                    >
                      (الزامی)
                    </span>
                  </template>
                </v-text-field>
              </v-col>

              <v-col cols="12" md="6" lg="4" xl="3">
                <v-text-field
                  v-model="form.phone"
                  variant="outlined"
                  density="compact"
                  hide-details
                  :rules="[(v: string) => !!v || '']"
                >
                  <template #label>
                    <span class="tw:text-[12px]">تلفن</span>
                    <span
                      class="tw:text-red-900 tw:dark:text-red-400 tw:text-[10px]"
                    >
                      (الزامی)
                    </span>
                  </template>
                </v-text-field>
              </v-col>

              <v-col cols="12" md="6" lg="4" xl="3">
                <v-text-field
                  v-model="form.email"
                  variant="outlined"
                  density="compact"
                  hide-details
                  :rules="[(v: string) => !!v || '']"
                >
                  <template #label>
                    <span class="tw:text-[12px]">ایمیل</span>
                    <span
                      class="tw:text-red-900 tw:dark:text-red-400 tw:text-[10px]"
                    >
                      (الزامی)
                    </span>
                  </template>
                </v-text-field>
              </v-col>

              <v-col cols="12" md="6" lg="4" xl="3">
                <v-autocomplete
                  v-model="form.managerId"
                  :items="dropdownStore.usersOptions"
                  item-title="label"
                  item-value="value"
                  variant="outlined"
                  density="compact"
                  hide-details
                  clearable
                  no-data-text="موردی یافت نشد"
                  :rules="[(v: number | null) => !!v || '']"
                >
                  <template #label>
                    <span class="tw:text-[12px]">مدیر باشگاه</span>
                    <span
                      class="tw:text-red-900 tw:dark:text-red-400 tw:text-[10px]"
                    >
                      (الزامی)
                    </span>
                  </template>
                </v-autocomplete>
              </v-col>

              <v-col cols="12" md="6" lg="9" xl="8">
                <v-textarea
                  v-model="form.description"
                  variant="outlined"
                  density="compact"
                  hide-details
                  rows="1"
                >
                  <template #label>
                    <span class="tw:text-[12px]">توضیحات</span>
                  </template>
                </v-textarea>
              </v-col>

              <v-col cols="12" md="6" lg="3" xl="1">
                <v-switch
                  v-model="form.isActive"
                  color="secondary"
                  hide-details
                  class="tw:mt-1!"
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
import { useOrganizationStore } from "~/store/organization";
import { useDeopdownStore } from "~/store/dropdown";
import { useHandlerStore } from "~/store/handler";

const organizationStore = useOrganizationStore();
const dropdownStore = useDeopdownStore();
const handlerStore = useHandlerStore();

// ─── Permissions ──
const { hasPermission } = usePermission();

const { setPageTitle } = usePageTitle();
watchEffect(() => {
  setPageTitle("مدیریت باشگاه‌ها");
});

// ─── Pagination ──
const page = ref<number>(1);
const pageSize = ref<number>(10);
const totalItems = computed(
  () => organizationStore.organizationListMeta?.total ?? 0,
);

// ─── Search & Filters ──
const query = ref<string>("");
const selectedStatus = ref<string | null>(null);
let searchTimeout: ReturnType<typeof setTimeout> | null = null;

const onSearchChange = () => {
  if (searchTimeout) clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    page.value = 1;
    loadOrganizations();
  }, 300);
};

const onFilterChange = () => {
  page.value = 1;
  loadOrganizations();
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
  { title: "شهر", key: "city", sortable: false, align: "center" as const },
  { title: "تلفن", key: "phone", sortable: false, align: "center" as const },
  { title: "ایمیل", key: "email", sortable: false, align: "center" as const },
  {
    title: "وضعیت",
    key: "status",
    sortable: false,
    align: "center" as const,
  },
  {
    title: "نام مدیر",
    key: "manager",
    sortable: false,
    align: "center" as const,
  },
  {
    title: "تعداد تیم‌ها",
    key: "teamsCount",
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
// Key of the options used for the most recent fetch — used to drop the
// duplicate "update:options" echoes coming from the table and Pagination.
// Seeded with the initial model so the mount-time echo is ignored and the
// first fetch happens exactly once (in onMounted).
let lastLoadedKey = `${page.value}:${pageSize.value}`;

const loadOrganizations = () => {
  lastLoadedKey = `${page.value}:${pageSize.value}`;

  const params: Record<string, any> = {
    page: page.value,
    pageSize: pageSize.value,
  };
  if (query.value) params.search = query.value;
  if (selectedStatus.value) params.status = selectedStatus.value;

  organizationStore.getOrganizations(params);
};

// The table and the Pagination child both notify on every option change
// (and the model is updated before the event reaches us), so compare
// against the last fetched options instead of the current model.
const onOptionsChange = (options: { page: number; itemsPerPage: number }) => {
  const key = `${options.page}:${options.itemsPerPage}`;
  if (key === lastLoadedKey) return;

  page.value = options.page;
  pageSize.value = options.itemsPerPage;
  loadOrganizations();
};

// ─── Delete ──
const deleteDialogOpen = ref<boolean>(false);
const deleteTarget = ref<any>(null);

const confirmDelete = (item: any) => {
  deleteTarget.value = item;
  deleteDialogOpen.value = true;
};

const onDeleteConfirm = () => {
  organizationStore.deleteOrganization(deleteTarget.value.id).then(() => {
    deleteDialogOpen.value = false;
    deleteTarget.value = null;
    loadOrganizations();
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
  organizationStore.restoreOrganization(restoreTarget.value.id).then(() => {
    restoreDialogOpen.value = false;
    restoreTarget.value = null;
    loadOrganizations();
  });
};

// ─── Add / Edit Dialog ──
const dialogOpen = ref<boolean>(false);
const dialogMode = ref<"create" | "edit">("create");
const editingId = ref<number | null>(null);
const formRef = ref<any>(null);
// Local flag — the store keeps `loading` on for an extra 2s after a fetch.
const detailLoading = ref<boolean>(false);

const defaultForm = () => ({
  name: "",
  description: "",
  city: "",
  phone: "",
  email: "",
  managerId: null as number | null,
  isActive: true,
});

const form = reactive(defaultForm());

const resetForm = () => {
  Object.assign(form, defaultForm());
};

const openCreateDialog = () => {
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

  organizationStore
    .getOrganizationById(id)
    .then(() => {
      const detail = organizationStore.organizationDetail;
      if (detail) {
        form.name = detail.name || "";
        form.description = detail.description || "";
        form.city = detail.city || "";
        form.phone = detail.phone || "";
        form.email = detail.email || "";
        form.managerId = detail.manager?.id ?? detail.managerId ?? null;
        form.isActive = detail.status === "ACTIVE";
      }
    })
    .finally(() => {
      detailLoading.value = false;
    });
};

const onDialogSubmit = () => {
  if (
    !form.name ||
    !form.city ||
    !form.phone ||
    !form.email ||
    !form.managerId
  ) {
    handlerStore.setError("لطفا تمام فیلدهای الزامی را پر کنید.");
    return;
  }

  formRef.value!.validate().then(({ valid }: { valid: boolean }) => {
    if (!valid) return;

    const payload = {
      name: form.name,
      description: form.description,
      city: form.city,
      phone: form.phone,
      email: form.email,
      managerId: form.managerId,
      status: form.isActive ? "ACTIVE" : "INACTIVE",
    };

    if (dialogMode.value === "create") {
      organizationStore.createOrganization(payload).then(() => {
        loadOrganizations();
        dialogOpen.value = false;
        resetForm();
      });
    } else {
      organizationStore
        .updateOrganization(editingId.value!, payload)
        .then(() => {
          loadOrganizations();
          dialogOpen.value = false;
          resetForm();
        });
    }
  });
};

// ─── Init ──
onMounted(() => {
  loadOrganizations();

  if (dropdownStore.usersResult.length === 0) {
    dropdownStore.getDropdownUsers("ORG_MANAGER");
  }

  if (dropdownStore.organizationStatuses.length === 0) {
    dropdownStore.getOrganizationStatuses();
  }
});
</script>

<style scoped></style>
