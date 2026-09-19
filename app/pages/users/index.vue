<template>
  <div>
    <v-row>
      <v-col cols="12">
        <!-- toolbar -->
        <v-row class="tw:mb-2!">
          <v-col cols="12" lg="11">
            <v-row>
              <v-col cols="12" md="4" xl="1">
                <v-select
                  v-model="pageSize"
                  :items="[
                    { value: 10, title: '10' },
                    { value: 25, title: '25' },
                    { value: 50, title: '50' },
                  ]"
                  @update:model-value="onPageSizeChange"
                  variant="outlined"
                  density="compact"
                  hide-details
                >
                  <template #label>
                    <span class="tw:text-[12px]">تعداد</span>
                  </template>
                </v-select>
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
                  v-model="selectedRole"
                  :items="dropdownStore.roles"
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
                    <span class="tw:text-[12px]">نقش</span>
                  </template>
                </v-select>
              </v-col>
              <v-col cols="6" md="3" xl="2">
                <v-select
                  v-model="selectedStatus"
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
              <v-col cols="12" md="2">
                <v-btn
                  class="tw:bg-primary-dark! tw:text-white! tw:rounded-md!"
                  @click="openCreateDialog"
                >
                  <icon-plus class="tw:text-[20px]" />
                  <span class="tw:mr-1!">افزودن کاربر</span>
                </v-btn>
              </v-col>
            </v-row>
          </v-col>
          <v-col cols="12" lg="1" class="tw:justify-end! tw:hidden tw:md:flex">
            <BackBtn />
          </v-col>
        </v-row>

        <!-- ─── Table ── -->
        <v-card class="tw:rounded-xl!">
          <v-data-table-server
            v-model:items-per-page="pageSize"
            v-model:page="page"
            :items-length="totalItems"
            :items="userStore.userList"
            :headers="tableHeaders"
            :loading="userStore.loading"
            @update:options="onOptionsChange"
            height="720"
            fixed-header
            fixed-footer
            class="tw:bg-white! tw:dark:bg-primary-dark!"
          >
            <template #item="{ item, index }">
              <tr>
                <td>
                  <div class="tw:flex tw:justify-center tw:text-nowrap!">
                    {{ (page - 1) * pageSize + index + 1 }}
                  </div>
                </td>
                <td>
                  <div class="tw:flex tw:justify-center tw:text-nowrap!">
                    {{ item.fullName }}
                  </div>
                </td>
                <td>
                  <div class="tw:flex tw:justify-center tw:text-nowrap!">
                    {{ item.phone }}
                  </div>
                </td>
                <td>
                  <div class="tw:flex tw:justify-center tw:text-nowrap!">
                    {{ item.nationalId }}
                  </div>
                </td>
                <td>
                  <div class="tw:flex tw:justify-center tw:text-nowrap!">
                    {{ item.birthDate }}
                  </div>
                </td>
                <td>
                  <div class="tw:flex tw:justify-center tw:text-nowrap!">
                    {{ item.email }}
                  </div>
                </td>
                <td>
                  <div
                    class="tw:flex tw:items-center tw:justify-center tw:text-nowrap! tw:flex-wrap tw:gap-1"
                  >
                    <v-chip
                      v-for="role in getRoleLabels(item.roles)"
                      :key="role"
                      size="x-small"
                      variant="tonal"
                      color="primary"
                    >
                      {{ role }}
                    </v-chip>
                  </div>
                </td>
                <td>
                  <div class="tw:flex tw:justify-center tw:text-nowrap!">
                    <v-chip
                      size="x-small"
                      variant="tonal"
                      :color="getUserStatusLabel(item.status).color"
                    >
                      {{ getUserStatusLabel(item.status).label }}
                    </v-chip>
                  </div>
                </td>
                <td>
                  <div class="tw:flex tw:justify-center tw:items-center">
                    <v-tooltip location="top">
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

                    <v-tooltip location="top">
                      <template #activator="{ props }">
                        <v-btn
                          v-bind="props"
                          size="x-small"
                          variant="plain"
                          rounded="pill"
                          @click="openResetPasswordDialog(item)"
                        >
                          <icon-lock
                            class="tw:text-color-lighter tw:text-[21px]"
                          />
                        </v-btn>
                      </template>
                      <span class="tw:text-xs tw:p-2">بازنشانی رمز عبور</span>
                    </v-tooltip>

                    <v-tooltip location="top">
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

            <template #bottom>
              <v-divider> </v-divider>
              <div
                class="tw:px-3! tw:my-3! tw:flex tw:justify-between tw:items-center"
              >
                <div class="tw:text-[12px]">
                  {{ paginationMeta(page, pageSize, totalItems) }}
                </div>
                <div class="tw:flex tw:items-center tw:gap-2">
                  <v-pagination
                    v-if="totalItems"
                    v-model="page"
                    :length="Math.ceil(totalItems / pageSize)"
                    density="compact"
                    total-visible="true"
                  >
                    <template #prev="slotProps">
                      <VBtn
                        variant="tonal"
                        color="default"
                        v-bind="slotProps"
                        size="small"
                        :icon="false"
                      >
                        قبلی
                      </VBtn>
                    </template>

                    <template #next="slotProps">
                      <VBtn
                        variant="tonal"
                        color="default"
                        v-bind="slotProps"
                        size="small"
                        :icon="false"
                      >
                        بعدی
                      </VBtn>
                    </template>
                  </v-pagination>
                </div>
              </div>
            </template>

            <template #no-data>
              <div
                class="tw:h-full! tw:flex tw:justify-center tw:items-center tw:gap-2"
              >
                <icon-row-chart class="tw:text-color-lighter tw:text-[35px]" />
                <div class="tw:text-color-lighter tw:text-[14px]">
                  اطلاعاتی یافت نشد
                </div>
              </div>
            </template>
          </v-data-table-server>
        </v-card>
      </v-col>
    </v-row>

    <!-- ─── Delete Confirm Dialog ── -->
    <v-dialog
      v-model="deleteDialogOpen"
      max-width="400"
      dir="rtl"
      class="blur-dialog"
    >
      <v-card rounded="lg">
        <v-card-title class="tw:bg-primary-dark! tw:mb-3!">
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
            <div class="tw:text-[14px]! tw:text-white">حذف کاربر</div>
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
        <v-card-text class="tw:text-[16px]! tw:text-center!">
          آیا از حذف «{{ deleteTarget?.fullName }}» مطمئن هستید؟
        </v-card-text>
        <v-card-actions class="tw:justify-end!">
          <v-btn
            variant="text"
            @click="deleteDialogOpen = false"
            class="tw:text-[12px]!"
          >
            انصراف
          </v-btn>
          <v-btn
            class="tw:bg-primary-dark! tw:text-white! tw:rounded-md!"
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

    <!-- ─── Reset Password Dialog ── -->
    <v-dialog
      v-model="resetPasswordDialogOpen"
      max-width="400"
      dir="rtl"
      class="blur-dialog"
    >
      <v-card rounded="lg">
        <v-card-title class="tw:bg-primary-dark! tw:mb-3!">
          <div class="tw:flex tw:justify-between tw:items-center">
            <div class="tw:invisible">
              <v-btn
                icon
                variant="plain"
                size="x-small"
                @click="resetPasswordDialogOpen = false"
              >
                <icon-close class="tw:text-[18px] tw:text-white!" />
              </v-btn>
            </div>
            <div class="tw:text-[14px]! tw:text-white">بازنشانی رمز عبور</div>
            <div>
              <v-btn
                icon
                variant="plain"
                size="x-small"
                @click="resetPasswordDialogOpen = false"
              >
                <icon-close class="tw:text-[18px] tw:text-white!" />
              </v-btn>
            </div>
          </div>
        </v-card-title>
        <v-card-text>
          <div class="tw:text-[14px]! tw:text-center! tw:mb-5!">
            بازنشانی رمز عبور برای «{{ resetPasswordTarget?.fullName }}»
          </div>
          <v-text-field
            v-model="newPassword"
            variant="outlined"
            density="compact"
            :type="showNewPassword ? 'text' : 'password'"
            :append-inner-icon="showNewPassword ? 'mdi-eye-off' : 'mdi-eye'"
            @click:append-inner="showNewPassword = !showNewPassword"
            hide-details
            dir="rtl"
          >
            <template #label>
              <span class="tw:text-[12px]">رمز عبور جدید</span>
              <span
                class="tw:text-red-900 tw:dark:text-red-400 tw:text-[10px]"
              >
                (الزامی)
              </span>
            </template>
          </v-text-field>
        </v-card-text>
        <v-card-actions class="tw:justify-end!">
          <v-btn
            variant="text"
            @click="resetPasswordDialogOpen = false"
            class="tw:text-[12px]!"
          >
            انصراف
          </v-btn>
          <v-btn
            class="tw:bg-primary-dark! tw:text-white! tw:rounded-md!"
            :loading="handlerStore.loadingBtn"
            :disabled="handlerStore.loadingBtn || !newPassword"
            @click="onResetPasswordConfirm"
          >
            <icon-lock class="tw:text-[18px]" />
            <span class="tw:mr-1! tw:text-[12px]! tw:px-2!">بازنشانی</span>
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- ─── Add / Edit Dialog ── -->
    <v-dialog
      v-model="dialogOpen"
      max-width="1200"
      dir="rtl"
      class="blur-dialog"
    >
      <v-card rounded="lg">
        <v-card-title class="tw:bg-primary-dark! tw:mb-3!">
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
              {{ dialogMode === "create" ? "افزودن کاربر" : "ویرایش کاربر" }}
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
            v-if="dialogMode === 'edit' && userStore.loading"
            class="tw:flex tw:justify-center tw:py-8"
          >
            <v-progress-circular indeterminate color="primary" />
          </div>

          <v-form v-else ref="formRef">
            <v-row>
              <v-col cols="12" md="6" lg="4" xl="3">
                <v-text-field
                  v-model="form.fullName"
                  variant="outlined"
                  density="compact"
                  hide-details
                  :rules="[(v: string) => !!v || '']"
                >
                  <template #label>
                    <span class="tw:text-[12px]">نام کامل</span>
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
                    <span class="tw:text-[12px]">موبایل</span>
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
                <!-- <v-text-field
                  v-model="form.birthDate"
                  variant="outlined"
                  density="compact"
                  hide-details
                >
                  <template #label>
                    <span class="tw:text-[12px]">تاریخ تولد</span>
                  </template>
                </v-text-field> -->
                <label
                  for="birthDate"
                  class="tw:text-[11px] tw:absolute! tw:bg-primary-dark! tw:start-10 tw:-top-1.75 tw:z-10! tw-text-color-reverse"
                  >تاریخ توبد</label
                >
                <date-picker
                  v-model="form.birthDate"
                  id="birthDate"
                  simple
                  placeholder="تاریخ تولد"
                  format="jYYYY/jMM/jDD"
                  display-format="jYYYY/jMM/jDD"
                  class="default-scroll tw:text-gray-300! tw:text-[14px]! tw:text-center!"
                  color="#1d202e"
                />
              </v-col>
              <v-col cols="12" md="6" lg="4" xl="3">
                <v-text-field
                  v-model="form.nationalId"
                  variant="outlined"
                  density="compact"
                  hide-details
                >
                  <template #label>
                    <span class="tw:text-[12px]">کد ملی</span>
                  </template>
                </v-text-field>
              </v-col>
              <v-col
                cols="12"
                md="6"
                lg="4"
                xl="3"
                v-if="dialogMode === 'create'"
              >
                <v-text-field
                  v-model="form.password"
                  variant="outlined"
                  density="compact"
                  :type="showCreatePassword ? 'text' : 'password'"
                  :append-inner-icon="showCreatePassword ? 'mdi-eye-off' : 'mdi-eye'"
                  @click:append-inner="showCreatePassword = !showCreatePassword"
                  hide-details
                  :rules="[(v: string) => !!v || '']"
                >
                  <template #label>
                    <span class="tw:text-[12px]">رمز عبور</span>
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
                  v-model="form.roles"
                  :items="dropdownStore.roles"
                  item-title="label"
                  item-value="value"
                  multiple
                  chips
                  closable-chips
                  variant="outlined"
                  density="compact"
                  hide-details
                  :rules="[(v: string[]) => (v && v.length > 0) || '']"
                >
                  <template #label>
                    <span class="tw:text-[12px]">نقش‌ها</span>
                    <span
                      class="tw:text-red-900 tw:dark:text-red-400 tw:text-[10px]"
                    >
                      (الزامی)
                    </span>
                  </template>
                </v-autocomplete>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>

        <v-card-actions class="tw:justify-end! tw:px-4! tw:pb-4!">
          <v-btn
            variant="text"
            @click="dialogOpen = false"
            class="tw:text-[12px]!"
          >
            انصراف
          </v-btn>
          <v-btn
            class="tw:bg-primary-dark! tw:text-white! tw:rounded-md! tw:px-4!"
            :loading="handlerStore.loadingBtn"
            :disabled="handlerStore.loadingBtn"
            @click="onDialogSubmit"
          >
            <icon-check class="tw:text-[18px]" />
            <span class="tw:mr-1! tw:text-[12px]! tw:px-2!">{{
              dialogMode === "create" ? "افزودن" : "ذخیره"
            }}</span>
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { useUserStore } from "~/store/user";
import { useDeopdownStore } from "~/store/dropdown";
import { useHandlerStore } from "~/store/handler";

const userStore = useUserStore();
const dropdownStore = useDeopdownStore();
const handlerStore = useHandlerStore();

const { setPageTitle } = usePageTitle();
watchEffect(() => {
  setPageTitle("مدیریت کاربران");
});

// ─── Pagination ──
const page = ref<number>(1);
const pageSize = ref<number>(10);
const totalItems = computed(() => userStore.userListMeta?.total ?? 0);

// ─── Search & Filters ──
const query = ref<string>("");
const selectedRole = ref<string | null>(null);
const selectedStatus = ref<null>(null);
let searchTimeout: ReturnType<typeof setTimeout> | null = null;

const onSearchChange = () => {
  if (searchTimeout) clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    page.value = 1;
    loadUsers();
  }, 300);
};

const onPageSizeChange = () => {
  page.value = 1;
  loadUsers();
};

const onFilterChange = () => {
  page.value = 1;
  loadUsers();
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
    title: "نام کامل",
    key: "fullName",
    sortable: false,
    align: "center" as const,
  },
  { title: "موبایل", key: "phone", sortable: false, align: "center" as const },
  { title: "ایمیل", key: "email", sortable: false, align: "center" as const },
  { title: "کد ملی", key: "email", sortable: false, align: "center" as const },
  { title: "تاریخ تولد", key: "email", sortable: false, align: "center" as const },
  { title: "نقش‌ها", key: "roles", sortable: false, align: "center" as const },
  { title: "وضعیت", key: "status", sortable: false, align: "center" as const },
  {
    title: "عملیات",
    key: "actions",
    sortable: false,
    align: "center" as const,
  },
];

// ─── Helpers ──
const getRoleLabels = (roleValues: string[]): string[] => {
  if (!roleValues || !Array.isArray(roleValues)) return [];
  return roleValues.map((val) => {
    const found = dropdownStore.roles.find((r) => r.value === val);
    return found ? found.label : val;
  });
};

const getUserStatusLabel = (
  status: string,
): { label: string; color: string } => {
  const map: Record<string, { label: string; color: string }> = {
    ACTIVE: { label: "فعال", color: "success" },
    INACTIVE: { label: "غیر فعال", color: "warning" },
    SUSPENDED: { label: "مسدود", color: "error" },
    DELETED: { label: "حذف شده", color: "error" },
  };
  return map[status] ?? { label: status, color: "default" };
};

const paginationMeta = (page: number, pageSize: number, totalItems: number) => {
  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, totalItems);

  return `نمایش ${start} تا ${end} از ${totalItems} مورد`;
};

// ─── Data Loading ──
const loadUsers = () => {
  const params: any = {
    page: page.value,
    pageSize: pageSize.value,
  };
  if (query.value) params.query = query.value;
  if (selectedRole.value) params.role = selectedRole.value;
  if (selectedStatus.value) params.status = selectedStatus.value;

  userStore.getUsers(params);
};

const onOptionsChange = (options: { page: number; itemsPerPage: number }) => {
  page.value = options.page;
  pageSize.value = options.itemsPerPage;
  loadUsers();
};

// ─── Delete ──
const deleteDialogOpen = ref<boolean>(false);
const deleteTarget = ref<any>(null);

const confirmDelete = (item: any) => {
  deleteTarget.value = item;
  deleteDialogOpen.value = true;
};

const onDeleteConfirm = () => {
  userStore.deleteUser(deleteTarget.value.id).then(() => {
    deleteDialogOpen.value = false;
    deleteTarget.value = null;
    loadUsers();
  });
};

// ─── Reset Password ──
const resetPasswordDialogOpen = ref<boolean>(false);
const resetPasswordTarget = ref<any>(null);
const newPassword = ref<string>("");
const showNewPassword = ref<boolean>(false);

const openResetPasswordDialog = (item: any) => {
  resetPasswordTarget.value = item;
  newPassword.value = "";
  showNewPassword.value = false;
  resetPasswordDialogOpen.value = true;
};

const onResetPasswordConfirm = () => {
  if (!newPassword.value) return;

  userStore
    .resetPassword(resetPasswordTarget.value.id, newPassword.value)
    .then(() => {
      resetPasswordDialogOpen.value = false;
      resetPasswordTarget.value = null;
      newPassword.value = "";
    });
};

// ─── Add / Edit Dialog ──
const dialogOpen = ref<boolean>(false);
const dialogMode = ref<"create" | "edit">("create");
const editingId = ref<number | null>(null);
const formRef = ref<any>(null);

const defaultForm = () => ({
  fullName: "",
  phone: "",
  email: "",
  birthDate: "",
  nationalId: "",
  password: "",
  roles: [] as string[],
});

const form = reactive(defaultForm());
const showCreatePassword = ref<boolean>(false);

const openCreateDialog = () => {
  dialogMode.value = "create";
  editingId.value = null;
  Object.assign(form, defaultForm());
  showCreatePassword.value = false;
  dialogOpen.value = true;
};

const openEditDialog = (id: number) => {
  dialogMode.value = "edit";
  editingId.value = id;
  userStore.getUserById(id).then(() => {
    if (userStore.userDetail) {
      form.fullName = userStore.userDetail.fullName || "";
      form.phone = userStore.userDetail.phone || "";
      form.email = userStore.userDetail.email || "";
      form.birthDate = userStore.userDetail.birthDate || "";
      form.nationalId = userStore.userDetail.nationalId || "";
      form.roles = userStore.userDetail.roles || [];
    }
    dialogOpen.value = true;
  });
};

const onDialogSubmit = () => {
  formRef.value!.validate().then(({ valid }: { valid: boolean }) => {
    if (!valid) return;

    const payload: any = {
      fullName: form.fullName,
      phone: form.phone,
      email: form.email,
      birthDate: form.birthDate,
      nationalId: form.nationalId,
      roles: form.roles,
    };

    if (dialogMode.value === "create") {
      payload.password = form.password;
      userStore.createUser(payload).then(() => {
        dialogOpen.value = false;
        loadUsers();
      });
    } else {
      userStore.updateUser(editingId.value!, payload).then(() => {
        dialogOpen.value = false;
        loadUsers();
      });
    }
  });
};

// ─── Init ──
onMounted(() => {
  loadUsers();
  if (dropdownStore.roles.length === 0) {
    dropdownStore.getRoles();
  }
});
</script>

<style scoped></style>
