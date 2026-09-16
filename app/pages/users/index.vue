<template>
  <div>
    <v-row>
      <v-col cols="12" class="tw:mb-2">
        <BackBtn />
      </v-col>

      <v-col cols="12">
        <!-- ─── Toolbar ── -->
        <div class="tw:flex tw:justify-between tw:items-center tw:mb-4 tw:flex-wrap tw:gap-3">
          <div class="tw:flex tw:items-center tw:gap-3 tw:flex-wrap">
            <v-text-field
              v-model="query"
              variant="outlined"
              density="compact"
              class="tw:w-62.5!"
              dir="rtl"
              @update:model-value="onSearchChange"
            >
              <template #label>
                <span class="tw:text-[12px]">جستجو</span>
              </template>
              <template #prepend-inner>
                <icon-magnify class="tw:text-[18px] tw:text-color-lighter" />
              </template>
            </v-text-field>

            <v-select
              v-model="selectedRole"
              :items="dropdownStore.roles"
              item-title="label"
              item-value="value"
              variant="outlined"
              density="compact"
              clearable
              class="tw:w-45!"
              dir="rtl"
              @update:model-value="onFilterChange"
            >
              <template #label>
                <span class="tw:text-[12px]">نقش</span>
              </template>
            </v-select>

            <v-select
              v-model="selectedStatus"
              variant="outlined"
              density="compact"
              clearable
              class="tw:w-45!"
              dir="rtl"
              @update:model-value="onFilterChange"
            >
              <template #label>
                <span class="tw:text-[12px]">وضعیت</span>
              </template>
            </v-select>
          </div>

          <v-btn
            class="tw:bg-primary-dark! tw:text-white! tw:rounded-md!"
            @click="openCreateDialog"
          >
            <icon-plus class="tw:text-[20px]" />
            <span class="tw:mr-1!">افزودن کاربر</span>
          </v-btn>
        </div>

        <!-- ─── Table ── -->
        <v-data-table
          :headers="tableHeaders"
          :items="userStore.userList"
          :items-length="totalItems"
          :loading="userStore.loading"
          :page="page"
          :items-per-page="pageSize"
          @update:page="onPageChange"
          class="tw:bg-white! tw:dark:bg-primary-dark!"
        >
          <template #item="{ item, index }">
            <tr>
              <td>{{ (page - 1) * pageSize + index + 1 }}</td>
              <td>{{ item.fullName }}</td>
              <td>{{ item.phone }}</td>
              <td>{{ item.email }}</td>
              <td>
                <div class="tw:flex tw:flex-wrap tw:gap-1">
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
              <td>{{ item.status }}</td>
              <td>
                <div class="tw:flex tw:justify-center tw:items-center tw:gap-1">
                  <v-tooltip location="top">
                    <template #activator="{ props }">
                      <v-btn
                        v-bind="props"
                        size="x-small"
                        variant="text"
                        rounded="pill"
                        @click="openEditDialog(item.id)"
                      >
                        <icon-edit-box class="tw:text-color-lighter tw:text-[23px]" />
                      </v-btn>
                    </template>
                    <span class="tw:text-xs tw:p-2">ویرایش</span>
                  </v-tooltip>

                  <v-tooltip location="top">
                    <template #activator="{ props }">
                      <v-btn
                        v-bind="props"
                        size="x-small"
                        variant="text"
                        rounded="pill"
                        @click="confirmDelete(item)"
                      >
                        <icon-trash class="tw:text-color-lighter tw:text-[23px]" />
                      </v-btn>
                    </template>
                    <span class="tw:text-xs tw:p-2">حذف</span>
                  </v-tooltip>
                </div>
              </td>
            </tr>
          </template>

          <template #no-data>
            <div class="tw:h-full! tw:flex tw:justify-center tw:items-center tw:gap-2">
              <icon-row-chart class="tw:text-color-lighter tw:text-[35px]" />
              <div class="tw:text-color-lighter tw:text-[14px]">اطلاعاتی یافت نشد</div>
            </div>
          </template>
        </v-data-table>
      </v-col>
    </v-row>

    <!-- ─── Delete Confirm Dialog ── -->
    <v-dialog v-model="deleteDialogOpen" max-width="400" dir="rtl">
      <v-card rounded="lg">
        <v-card-title class="tw:text-[16px]! tw:font-bold!">
          حذف کاربر
        </v-card-title>
        <v-card-text>
          آیا از حذف «{{ deleteTarget?.fullName }}» مطمئن هستید؟
        </v-card-text>
        <v-card-actions class="tw:justify-end!">
          <v-btn
            variant="text"
            @click="deleteDialogOpen = false"
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
            <span class="tw:mr-1!">حذف</span>
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- ─── Add / Edit Dialog ── -->
    <v-dialog v-model="dialogOpen" max-width="600" dir="rtl">
      <v-card rounded="lg">
        <v-card-title class="tw:text-[16px]! tw:font-bold! tw:flex tw:justify-between tw:items-center">
          <span>{{ dialogMode === "create" ? "افزودن کاربر" : "ویرایش کاربر" }}</span>
          <v-btn icon variant="text" size="small" @click="dialogOpen = false">
            <icon-close class="tw:text-[20px]" />
          </v-btn>
        </v-card-title>

        <v-card-text>
          <div v-if="dialogMode === 'edit' && userStore.loading" class="tw:flex tw:justify-center tw:py-8">
            <v-progress-circular indeterminate color="primary" />
          </div>

          <v-form v-else ref="formRef">
            <v-text-field
              v-model="form.fullName"
              variant="outlined"
              density="compact"
              :rules="[(v: string) => !!v || '']"
            >
              <template #label>
                <span class="tw:text-[12px]">نام کامل</span>
                <span class="tw:text-red-900 tw:dark:text-red-400 tw:text-[10px]"> (الزامی) </span>
              </template>
            </v-text-field>

            <v-text-field
              v-model="form.phone"
              variant="outlined"
              density="compact"
              :rules="[(v: string) => !!v || '']"
            >
              <template #label>
                <span class="tw:text-[12px]">موبایل</span>
                <span class="tw:text-red-900 tw:dark:text-red-400 tw:text-[10px]"> (الزامی) </span>
              </template>
            </v-text-field>

            <v-text-field
              v-model="form.email"
              variant="outlined"
              density="compact"
              :rules="[(v: string) => !!v || '']"
            >
              <template #label>
                <span class="tw:text-[12px]">ایمیل</span>
                <span class="tw:text-red-900 tw:dark:text-red-400 tw:text-[10px]"> (الزامی) </span>
              </template>
            </v-text-field>

            <v-text-field
              v-model="form.birthDate"
              variant="outlined"
              density="compact"
            >
              <template #label>
                <span class="tw:text-[12px]">تاریخ تولد</span>
              </template>
            </v-text-field>

            <v-text-field
              v-model="form.nationalId"
              variant="outlined"
              density="compact"
            >
              <template #label>
                <span class="tw:text-[12px]">کد ملی</span>
              </template>
            </v-text-field>

            <v-text-field
              v-if="dialogMode === 'create'"
              v-model="form.password"
              variant="outlined"
              density="compact"
              type="password"
              :rules="[(v: string) => !!v || '']"
            >
              <template #label>
                <span class="tw:text-[12px]">رمز عبور</span>
                <span class="tw:text-red-900 tw:dark:text-red-400 tw:text-[10px]"> (الزامی) </span>
              </template>
            </v-text-field>

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
              :rules="[(v: string[]) => (v && v.length > 0) || '']"
            >
              <template #label>
                <span class="tw:text-[12px]">نقش‌ها</span>
                <span class="tw:text-red-900 tw:dark:text-red-400 tw:text-[10px]"> (الزامی) </span>
              </template>
            </v-autocomplete>
          </v-form>
        </v-card-text>

        <v-card-actions class="tw:justify-end! tw:px-4! tw:pb-4!">
          <v-btn
            variant="text"
            @click="dialogOpen = false"
          >
            انصراف
          </v-btn>
          <v-btn
            class="tw:bg-primary-dark! tw:text-white! tw:rounded-md!"
            :loading="handlerStore.loadingBtn"
            :disabled="handlerStore.loadingBtn"
            @click="onDialogSubmit"
          >
            <icon-check class="tw:text-[18px]" />
            <span class="tw:mr-1!">{{ dialogMode === 'create' ? 'افزودن' : 'ذخیره' }}</span>
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

const onFilterChange = () => {
  page.value = 1;
  loadUsers();
};

// ─── Table Headers ──
const tableHeaders = [
  { title: "#", key: "index", sortable: false, width: "60px" },
  { title: "نام کامل", key: "fullName", sortable: false },
  { title: "موبایل", key: "phone", sortable: false },
  { title: "ایمیل", key: "email", sortable: false },
  { title: "نقش‌ها", key: "roles", sortable: false },
  { title: "وضعیت", key: "status", sortable: false },
  { title: "عملیات", key: "actions", sortable: false, align: "center" as const },
];

// ─── Helpers ──
const getRoleLabels = (roleValues: string[]): string[] => {
  if (!roleValues || !Array.isArray(roleValues)) return [];
  return roleValues
    .map((val) => {
      const found = dropdownStore.roles.find((r) => r.value === val);
      return found ? found.label : val;
    });
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

const onPageChange = (newPage: number) => {
  page.value = newPage;
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

const openCreateDialog = () => {
  dialogMode.value = "create";
  editingId.value = null;
  Object.assign(form, defaultForm());
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
