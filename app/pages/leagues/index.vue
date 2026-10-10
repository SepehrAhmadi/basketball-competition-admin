<template>
  <div>
    <v-row>
      <!-- ── Cards side (8 cols) ── -->
      <v-col
        cols="12"
        :md="
          !hasPermission('leagues.create') && !hasPermission('leagues.update')
            ? 12
            : 8
        "
      >
        <!-- ── Toolbar card ── -->
        <v-card class="tw:rounded-xl! tw:mb-4!">
          <v-card-text>
            <v-row align="center">
              <v-col cols="12" sm="4" md="4">
                <v-text-field
                  v-model="query"
                  variant="outlined"
                  density="compact"
                  hide-details
                  dir="rtl"
                  @update:model-value="onSearchChange"
                >
                  <template #label>
                    <span class="tw:text-[12px]">جستجوی نام لیگ</span>
                  </template>
                  <template #prepend-inner>
                    <icon-magnify
                      class="tw:text-[18px] tw:text-color-lighter"
                    />
                  </template>
                </v-text-field>
              </v-col>

              <v-col cols="6" sm="2">
                <v-select
                  v-model="selectedStatus"
                  :items="statusOptions"
                  item-title="label"
                  item-value="value"
                  variant="outlined"
                  density="compact"
                  hide-details
                  dir="rtl"
                  clearable
                  no-data-text="موردی یافت نشد"
                  @update:model-value="onFilterChange"
                >
                  <template #label>
                    <span class="tw:text-[12px]">وضعیت</span>
                  </template>
                </v-select>
              </v-col>

              <v-col cols="6" sm="2">
                <v-select
                  v-model="selectedSeasonId"
                  :items="dropdownStore.seasonsResult"
                  item-title="label"
                  item-value="value"
                  variant="outlined"
                  density="compact"
                  hide-details
                  dir="rtl"
                  clearable
                  no-data-text="موردی یافت نشد"
                  @update:model-value="onFilterChange"
                >
                  <template #label>
                    <span class="tw:text-[12px]">فصل</span>
                  </template>
                </v-select>
              </v-col>

              <v-col cols="12" sm="3" md="2">
                <v-select
                  v-model="selectedAgeCategoryId"
                  :items="ageCategoryStore.ageCategoryList"
                  item-title="name"
                  item-value="id"
                  variant="outlined"
                  density="compact"
                  hide-details
                  dir="rtl"
                  clearable
                  no-data-text="موردی یافت نشد"
                  @update:model-value="onFilterChange"
                >
                  <template #label>
                    <span class="tw:text-[12px]">رده سنی</span>
                  </template>
                </v-select>
              </v-col>

              <v-col cols="12" sm="2">
                <v-btn
                  v-if="hasPermission('leagues.create')"
                  class="tw:bg-secondary-dark! tw:text-white! tw:rounded-md!"
                  @click="openCreateMode"
                  block
                >
                  <icon-plus class="tw:text-[20px]" />
                  <span class="tw:mr-1!">افزودن</span>
                </v-btn>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
        <!-- ── Card grid ── -->
        <div
          v-if="leagueStore.loading && leagueStore.leagueList.length === 0"
          class="tw:flex tw:justify-center tw:py-16"
        >
          <v-progress-circular indeterminate color="primary" />
        </div>

        <div
          v-else-if="leagueStore.leagueList.length === 0"
          class="tw:h-full! tw:flex tw:justify-center tw:items-center tw:gap-2 tw:py-16"
        >
          <icon-row-chart class="tw:text-color-lighter tw:text-[35px]" />
          <div class="tw:text-color-lighter tw:text-[14px]">
            اطلاعاتی یافت نشد
          </div>
        </div>

        <v-row v-else dense>
          <v-col
            v-for="item in leagueStore.leagueList"
            :key="item.id"
            cols="12"
            md="6"
          >
            <v-card rounded="lg" class="tw:relative! tw:px-4! tw:py-5!">
              <div class="tw:flex tw:items-center tw:justify-between tw:gap-2">
                <div class="tw:text-[15px]! tw:font-bold! tw:truncate">
                  {{ item.name }}
                </div>
                <v-chip
                  size="x-small"
                  variant="tonal"
                  :color="statusColor(item.status)"
                >
                  {{ statusLabel(item.status) }}
                </v-chip>
              </div>

              <div
                class="tw:flex tw:flex-wrap tw:items-center tw:gap-2 tw:mt-2!"
              >
                <div
                  class="tw:text-gray-600 tw:dark:text-gray-300 tw:text-[13px]!"
                >
                 {{ item.season?.name ?? "—" }}
                </div>
                <div>|</div>
                <div
                  class="tw:text-gray-600 tw:dark:text-gray-300 tw:text-[13px]!"
                >
                 {{ item.ageCategory?.name ?? "—" }}
                </div>
                <div>|</div>
                <div
                  class="tw:text-gray-600 tw:dark:text-gray-300 tw:text-[13px]!"
                >
                 {{ item.teamsCount ?? 0 }} تیم
                </div>
              </div>

              <div class="tw:flex tw:justify-start tw:items-center tw:gap-2 tw:mt-2!">
                <div
                  class="tw:text-gray-600 tw:dark:text-gray-300 tw:text-[13px]!"
                >
                  تاریخ شروع: {{ item.startDate ?? "—" }}
                </div>
                <div>|</div>
                <div
                  class="tw:text-gray-600 tw:dark:text-gray-300 tw:text-[13px]!"
                >
                  تاریخ پایان: {{ item.endDate ?? "—" }}
                </div>
              </div>
              <div
                class="tw:text-gray-600 tw:dark:text-gray-300 tw:text-[13px]! tw:mt-2!"
              >
                مهلت ثبت ترکیب: {{ item.rosterDeadline ?? "—" }}
              </div>

              <div
                class="tw:flex tw:justify-end tw:items-center tw:gap-2 tw:mt-4!"
              >
                <div class="tw:flex tw:items-center tw:gap-1.5 tw:shrink-0">
                  <v-btn
                    v-if="hasPermission('league-teams.view')"
                    size="x-small"
                    variant="outlined"
                    @click="navigateTo(`/leagues/${item.id}/teams`)"
                  >
                    <icon-users class="tw:text-[16px]" />
                    <span class="tw:mr-1!">مدیریت تیم‌ها</span>
                  </v-btn>
                  <v-btn
                    v-if="hasPermission('leagues.update')"
                    size="x-small"
                    variant="outlined"
                    @click="openStatusDialog(item)"
                  >
                    <icon-refresh class="tw:text-[14px]" />
                    <span class="tw:mr-1!">تغییر وضعیت</span>
                  </v-btn>
                  <v-btn
                    v-if="hasPermission('leagues.update')"
                    size="x-small"
                    variant="outlined"
                    @click="openEdit(item.id)"
                  >
                    <icon-edit-box class="tw:text-[16px]" />
                    <span class="tw:mr-1!">ویرایش</span>
                  </v-btn>
                  <v-btn
                    v-if="hasPermission('leagues.delete')"
                    size="x-small"
                    variant="outlined"
                    @click="confirmDelete(item)"
                  >
                    <icon-trash class="tw:text-[16px]" />
                    <span class="tw:mr-1!">حذف</span>
                  </v-btn>
                </div>
              </div>
            </v-card>
          </v-col>
        </v-row>

        <!-- ── Pagination ── -->
        <v-card rounded="lg" class="tw:mt-4!" v-if="totalItems > pageSize">
          <Pagination
            v-model:page="page"
            v-model:items-per-page="pageSize"
            :items-length="totalItems"
            @update-options="loadLeagues"
          />
        </v-card>
      </v-col>
      <!-- ── Form side (4 cols) ── -->
      <v-col
        cols="12"
        md="4"
        v-if="
          hasPermission('leagues.create') || hasPermission('leagues.update')
        "
      >
        <v-card class="tw:rounded-xl!">
          <v-card-title
            class="tw:flex! tw:items-center! tw:gap-1! tw:text-[14px]! tw:font-bold! tw:mb-2!"
          >
            <div>
              <icon-plus v-if="!editingId" class="tw:text-[20px]" />
              <icon-edit-box v-else class="tw:text-[20px]" />
            </div>
            <div>
              {{ editingId ? "ویرایش لیگ" : "افزودن لیگ" }}
            </div>
          </v-card-title>

          <v-card-text>
            <!-- Loading spinner while fetching for edit -->
            <div
              v-if="editingId && leagueStore.loading"
              class="tw:flex tw:justify-center tw:py-8"
            >
              <v-progress-circular indeterminate color="primary" />
            </div>

            <v-form v-else ref="formRef">
              <v-text-field
                v-model="form.name"
                variant="outlined"
                density="compact"
                hide-details
                :rules="[(v: string) => !!v || '']"
              >
                <template #label>
                  <span class="tw:text-[12px]">نام لیگ</span>
                  <span
                    class="tw:text-red-900 tw:dark:text-red-400 tw:text-[10px]"
                  >
                    (الزامی)
                  </span>
                </template>
              </v-text-field>

              <v-select
                v-model="form.ageCategoryId"
                :items="ageCategoryStore.ageCategoryList"
                item-title="name"
                item-value="id"
                variant="outlined"
                density="compact"
                hide-details
                dir="rtl"
                class="tw:mt-4!"
                no-data-text="موردی یافت نشد"
                @update:model-value="onCategoryChange"
              >
                <template #label>
                  <span class="tw:text-[12px]">رده سنی</span>
                  <span
                    class="tw:text-red-900 tw:dark:text-red-400 tw:text-[10px]"
                  >
                    (الزامی)
                  </span>
                </template>
              </v-select>

              <v-select
                v-model="form.ageCategoryCutoffId"
                :items="cutoffOptions"
                item-title="label"
                item-value="value"
                variant="outlined"
                density="compact"
                hide-details
                dir="rtl"
                class="tw:mt-4!"
                :loading="cutoffLoading"
                no-data-text="محدوده سنی ثبت نشده است"
              >
                <template #label>
                  <span class="tw:text-[12px]">محدوده سنی (فصل)</span>
                  <span
                    class="tw:text-red-900 tw:dark:text-red-400 tw:text-[10px]"
                  >
                    (الزامی)
                  </span>
                </template>
              </v-select>

              <div class="tw:relative! tw:mt-4!">
                <label
                  v-if="form.startDate"
                  for="startDate"
                  class="tw:text-[11px] tw:absolute! tw:bg-white! tw:dark:bg-primary-dark! tw:start-3 tw:-top-1.75 tw:z-10! tw:text-color-reverse"
                >
                  <span class="tw:text-[12px]">تاریخ شروع</span>
                </label>
                <date-picker
                  v-model="form.startDate"
                  id="startDate"
                  simple
                  placeholder="تاریخ شروع"
                  format="jYYYY/jMM/jDD"
                  display-format="jYYYY/jMM/jDD"
                  class="default-scroll tw:text-gray-300! tw:text-[14px]! tw:text-center!"
                  color="#1d202e"
                  clearable
                />
              </div>

              <div class="tw:relative! tw:mt-4!">
                <label
                  v-if="form.endDate"
                  for="endDate"
                  class="tw:text-[11px] tw:absolute! tw:bg-white! tw:dark:bg-primary-dark! tw:start-3 tw:-top-1.75 tw:z-10! tw:text-color-reverse"
                >
                  <span class="tw:text-[12px]">تاریخ پایان</span>
                </label>
                <date-picker
                  v-model="form.endDate"
                  id="endDate"
                  simple
                  placeholder="تاریخ پایان"
                  format="jYYYY/jMM/jDD"
                  display-format="jYYYY/jMM/jDD"
                  class="default-scroll tw:text-gray-300! tw:text-[14px]! tw:text-center!"
                  color="#1d202e"
                  clearable
                />
              </div>

              <div class="tw:relative! tw:mt-4!">
                <label
                  v-if="form.rosterDeadline"
                  for="rosterDeadline"
                  class="tw:text-[11px] tw:absolute! tw:bg-white! tw:dark:bg-primary-dark! tw:start-3 tw:-top-1.75 tw:z-10! tw:text-color-reverse"
                >
                  <span class="tw:text-[12px]">مهلت ثبت ترکیب</span>
                </label>
                <date-picker
                  v-model="form.rosterDeadline"
                  id="rosterDeadline"
                  simple
                  placeholder="مهلت ثبت ترکیب"
                  format="jYYYY/jMM/jDD"
                  display-format="jYYYY/jMM/jDD"
                  class="default-scroll tw:text-gray-300! tw:text-[14px]! tw:text-center!"
                  color="#1d202e"
                  clearable
                />
              </div>

              <v-textarea
                v-model="form.description"
                variant="outlined"
                density="compact"
                hide-details
                rows="3"
                class="tw:mt-4!"
              >
                <template #label>
                  <span class="tw:text-[12px]">توضیحات</span>
                </template>
              </v-textarea>

              <v-btn
                block
                :loading="handlerStore.loadingBtn"
                :disabled="handlerStore.loadingBtn"
                class="tw:bg-secondary-dark! tw:dark:bg-secondary-dark! tw:text-white! tw:rounded-md! tw:mt-4!"
                @click="onFormSubmit"
              >
                <icon-check class="tw:text-[18px]" />
                <span class="tw:mr-1!">{{
                  editingId ? "ذخیره" : "افزودن"
                }}</span>
              </v-btn>
            </v-form>
          </v-card-text>
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
            <div class="tw:text-[14px]! tw:text-white">حذف لیگ</div>
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
            @click="deleteDialogOpen = false"
            class="tw:text-[12px]!"
          >
            انصراف
          </v-btn>
          <v-btn
            class="tw:bg-secondary-dark! tw:dark:bg-secondary-dark! tw:text-white! tw:rounded-md!"
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

    <!-- ─── Status Change Confirm Dialog ── -->
    <v-dialog
      v-model="statusDialogOpen"
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
                @click="statusDialogOpen = false"
              >
                <icon-close class="tw:text-[18px] tw:text-white!" />
              </v-btn>
            </div>
            <div class="tw:text-[14px]! tw:text-white">تغییر وضعیت لیگ</div>
            <div>
              <v-btn
                icon
                variant="plain"
                size="x-small"
                @click="statusDialogOpen = false"
              >
                <icon-close class="tw:text-[18px] tw:text-white!" />
              </v-btn>
            </div>
          </div>
        </v-card-title>
        <v-card-text>
          <div class="tw:text-center tw:text-[14px]! tw:mb-3!">
            آیا از تغییر وضعیت «{{ statusTarget?.name }}» به
            <span class="tw:font-bold!">
              {{
                statusFormValue
                  ? statusOptions.find((o) => o.value === statusFormValue)
                      ?.label
                  : "—"
              }}
            </span>
            مطمئن هستید؟
          </div>

          <v-select
            v-model="statusFormValue"
            :items="statusOptions"
            item-title="label"
            item-value="value"
            variant="outlined"
            density="compact"
            hide-details
            dir="rtl"
            no-data-text="موردی یافت نشد"
          >
            <template #label>
              <span class="tw:text-[12px]">وضعیت جدید</span>
            </template>
          </v-select>
        </v-card-text>
        <v-card-actions class="tw:justify-end!">
          <v-btn
            variant="text"
            @click="statusDialogOpen = false"
            class="tw:text-[12px]!"
          >
            انصراف
          </v-btn>
          <v-btn
            class="tw:bg-secondary-dark! tw:dark:bg-secondary-dark! tw:text-white! tw:rounded-md!"
            :loading="handlerStore.loadingBtn"
            :disabled="
              handlerStore.loadingBtn ||
              !statusFormValue ||
              statusFormValue === statusTarget?.status
            "
            @click="onStatusConfirm"
          >
            <icon-check class="tw:text-[18px]" />
            <span class="tw:mr-1! tw:text-[12px]! tw:px-2!">تایید</span>
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { useLeagueStore } from "~/store/league";
import { useHandlerStore } from "~/store/handler";
import { useDeopdownStore } from "~/store/dropdown";
import { useAgeCategoryStore } from "~/store/ageCategory";

const leagueStore = useLeagueStore();
const handlerStore = useHandlerStore();
const dropdownStore = useDeopdownStore();
const ageCategoryStore = useAgeCategoryStore();

// ─── Permissions (in-memory session, SUPER_ADMIN bypasses via adminLevel) ──
const { hasPermission } = usePermission();

const { setPageTitle } = usePageTitle();
watchEffect(() => {
  setPageTitle("مدیریت لیگ‌ها");
});

// ─── Pagination ──
const page = ref<number>(1);
const pageSize = ref<number>(8);
const totalItems = computed(() => leagueStore.leagueListMeta?.total ?? 0);

// ─── Status vocabulary (mirrors backend LEAGUE_STATUS_VALUES) ──
const statusOptions = [
  { value: "INACTIVE", label: "غیرفعال" },
  { value: "REGISTRATION", label: "ثبت‌نام" },
  { value: "ACTIVE", label: "فعال" },
  { value: "FINISHED", label: "پایان‌یافته" },
];

const statusLabel = (status: string) =>
  statusOptions.find((o) => o.value === status)?.label ?? status ?? "—";

const statusColor = (status: string) => {
  switch (status) {
    case "ACTIVE":
      return "success";
    case "REGISTRATION":
      return "info";
    case "INACTIVE":
      return "default";
    default:
      return "default";
  }
};

// ─── Filters ──
const query = ref<string>("");
const selectedStatus = ref<string | null>(null);
const selectedSeasonId = ref<number | string | null>(null);
const selectedAgeCategoryId = ref<number | null>(null);
let searchTimeout: ReturnType<typeof setTimeout> | null = null;

const onSearchChange = () => {
  if (searchTimeout) clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    page.value = 1;
    loadLeagues();
  }, 300);
};

const onFilterChange = () => {
  page.value = 1;
  loadLeagues();
};

// ─── Data Loading ──
const loadLeagues = () => {
  const params: any = {
    page: page.value,
    pageSize: pageSize.value,
  };
  if (query.value) params.search = query.value;
  if (selectedStatus.value) params.status = selectedStatus.value;
  if (selectedSeasonId.value) params.seasonId = selectedSeasonId.value;
  if (selectedAgeCategoryId.value)
    params.ageCategoryId = selectedAgeCategoryId.value;

  leagueStore.getLeagues(params);
};

// ─── Status change dialog (PATCH /admin/leagues/:id/status) ──
const statusDialogOpen = ref<boolean>(false);
const statusTarget = ref<any>(null);
const statusFormValue = ref<string | null>(null);

const openStatusDialog = (item: any) => {
  statusTarget.value = item;
  statusFormValue.value = item.status;
  statusDialogOpen.value = true;
};

const onStatusConfirm = () => {
  if (!statusTarget.value || !statusFormValue.value) return;
  if (statusFormValue.value === statusTarget.value.status) return;

  leagueStore
    .updateLeagueStatus(statusTarget.value.id, statusFormValue.value)
    .then(() => {
      statusDialogOpen.value = false;
      statusTarget.value = null;
      statusFormValue.value = null;
      loadLeagues();
    });
};

// ─── Delete ──
const deleteDialogOpen = ref<boolean>(false);
const deleteTarget = ref<any>(null);

const confirmDelete = (item: any) => {
  deleteTarget.value = item;
  deleteDialogOpen.value = true;
};

const onDeleteConfirm = () => {
  leagueStore.deleteLeague(deleteTarget.value.id).then(() => {
    deleteDialogOpen.value = false;
    deleteTarget.value = null;
    loadLeagues();
  });
};

// ─── Create / Edit ──
const editingId = ref<number | null>(null);
const formRef = ref<any>(null);

const defaultForm = () => ({
  name: "",
  ageCategoryId: null as number | null,
  ageCategoryCutoffId: null as number | null,
  startDate: "",
  endDate: "",
  rosterDeadline: "",
  description: "",
});

const form = reactive(defaultForm());

// ─── Cutoff picker (two-step: category → cutoff list) ──
const cutoffLoading = ref<boolean>(false);
const cutoffOptions = ref<{ value: number; label: string }[]>([]);

const loadCutoffOptions = async (categoryId: number | null) => {
  cutoffOptions.value = [];
  form.ageCategoryCutoffId = null;
  if (!categoryId) return;

  cutoffLoading.value = true;
  try {
    const items = await ageCategoryStore.getCutoffs({
      ageCategoryId: categoryId,
      page: 1,
      pageSize: 100,
    });
    cutoffOptions.value = (items ?? []).map((c: any) => ({
      value: c.id,
      label: `${c.season?.name ?? "—"} — حداقل تاریخ تولد ${
        c.minBirthDate ?? "—"
      }`,
    }));
  } finally {
    cutoffLoading.value = false;
  }
};

const onCategoryChange = (value: any) => {
  loadCutoffOptions(value ?? null);
};

const openCreateMode = () => {
  editingId.value = null;
  cutoffOptions.value = [];
  Object.assign(form, defaultForm());
};

const openEdit = (id: number) => {
  editingId.value = id;
  leagueStore.getLeagueById(id).then(() => {
    const detail = leagueStore.leagueDetail;
    if (!detail) return;
    form.name = detail.name || "";
    form.ageCategoryId = detail.ageCategory?.id ?? null;
    form.startDate = detail.startDate || "";
    form.endDate = detail.endDate || "";
    form.rosterDeadline = detail.rosterDeadline || "";
    form.description = detail.description || "";
    // Load cutoffs for the detail's category, then restore its selection.
    loadCutoffOptions(form.ageCategoryId).then(() => {
      form.ageCategoryCutoffId = detail.ageCategoryCutoffId ?? null;
    });
  });
};

const onFormSubmit = () => {
  if (!form.name || !form.ageCategoryId || !form.ageCategoryCutoffId) {
    handlerStore.setError("لطفا تمام فیلدهای الزامی را پر کنید.");
    return;
  }

  formRef.value!.validate().then(({ valid }: { valid: boolean }) => {
    if (!valid) return;

    const payload: any = {
      name: form.name,
      ageCategoryCutoffId: form.ageCategoryCutoffId,
      startDate: form.startDate || null,
      endDate: form.endDate || null,
      rosterDeadline: form.rosterDeadline || null,
      description: form.description || null,
    };

    if (editingId.value) {
      leagueStore.updateLeague(editingId.value, payload).then(() => {
        editingId.value = null;
        cutoffOptions.value = [];
        Object.assign(form, defaultForm());
        loadLeagues();
      });
    } else {
      leagueStore.createLeague(payload).then(() => {
        cutoffOptions.value = [];
        Object.assign(form, defaultForm());
        loadLeagues();
      });
    }
  });
};

// ─── Init ──
onMounted(() => {
  loadLeagues();
  if (dropdownStore.seasonsResult.length === 0) {
    dropdownStore.getSeasons();
  }
  if (ageCategoryStore.ageCategoryList.length === 0) {
    ageCategoryStore.getAgeCategories({ page: 1, pageSize: 100 });
  }
});
</script>
