<template>
  <div>
    <v-row>
      <!-- ── Cards side ── -->
      <v-col
        cols="12"
        :md="
          !hasPermission('age-categories.create') &&
          !hasPermission('age-categories.update')
            ? 12
            : 8
        "
      >
        <!-- ── Toolbar card ── -->
        <v-card class="tw:rounded-xl! tw:mb-4!">
          <v-card-text>
            <v-row align="center">
              <v-col cols="12" sm="2">
                <BackBtn class="tw:w-full!" />
              </v-col>

              <v-col cols="12" sm="8">
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
              <v-col cols="12" sm="2">
                <v-btn
                  v-if="hasPermission('age-categories.create')"
                  class="tw:bg-secondary-dark! tw:text-white! tw:rounded-md!"
                  @click="openCreateMode"
                >
                  <icon-plus class="tw:text-[20px]" />
                  <span class="tw:mr-1!">افزودن رده سنی</span>
                </v-btn>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>

        <!-- ── Card grid ── -->
        <div
          v-if="
            ageCategoryStore.loading &&
            ageCategoryStore.ageCategoryList.length === 0
          "
          class="tw:flex tw:justify-center tw:py-16"
        >
          <v-progress-circular indeterminate color="primary" />
        </div>

        <div
          v-else-if="ageCategoryStore.ageCategoryList.length === 0"
          class="tw:h-full! tw:flex tw:justify-center tw:items-center tw:gap-2 tw:py-16"
        >
          <icon-row-chart class="tw:text-color-lighter tw:text-[35px]" />
          <div class="tw:text-color-lighter tw:text-[14px]">
            اطلاعاتی یافت نشد
          </div>
        </div>

        <v-row v-else dense>
          <v-col
            v-for="item in ageCategoryStore.ageCategoryList"
            :key="item.id"
            cols="12"
            md="6"
          >
            <v-card rounded="lg" class="tw:relative! tw:p-4!">
              <div class="tw:flex tw:items-center tw:justify-between tw:gap-2">
                <div class="tw:flex tw:items-center tw:gap-2 tw:min-w-0">
                  <div class="tw:text-[15px]! tw:font-bold! tw:truncate">
                    {{ item.name }}
                  </div>
                  <v-chip size="x-small" variant="tonal" color="secondary">
                    {{ item.cutoffsCount ?? 0 }} محدوده سنی
                  </v-chip>
                </div>

                <div class="tw:flex tw:items-center tw:gap-1.5 tw:shrink-0">
                  <v-btn
                    v-if="hasPermission('age-categories.update')"
                    size="x-small"
                    variant="outlined"
                    @click="openEdit(item.id)"
                  >
                    <icon-edit-box class="tw:text-[16px]" />
                    <span class="tw:mr-1!">ویرایش</span>
                  </v-btn>
                  <v-btn
                    v-if="hasPermission('age-categories.delete')"
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
            @update-options="loadAgeCategories"
          />
        </v-card>
      </v-col>

      <!-- ── Form side ── -->
      <v-col
        cols="12"
        md="4"
        v-if="
          hasPermission('age-categories.create') ||
          hasPermission('age-categories.update')
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
              {{ editingId ? "ویرایش رده سنی" : "افزودن رده سنی" }}
            </div>
          </v-card-title>

          <v-card-text>
            <!-- Loading spinner while fetching for edit -->
            <div
              v-if="editingId && ageCategoryStore.loading"
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
                  <span class="tw:text-[12px]">نام رده سنی</span>
                  <span
                    class="tw:text-red-900 tw:dark:text-red-400 tw:text-[10px]"
                  >
                    (الزامی)
                  </span>
                </template>
              </v-text-field>

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

        <!-- ── Cutoffs card ── -->
        <v-card v-if="editingId" class="tw:rounded-xl! tw:mt-4!">
          <v-card-title
            class="tw:flex! tw:items-center! tw:justify-between! tw:gap-1! tw:text-[14px]! tw:font-bold! tw:mb-2!"
          >
            <div>محدوده‌های سنی</div>
            <v-btn
              v-if="hasPermission('age-categories.create')"
              size="small"
              variant="outlined"
              @click="addCutoffRow"
              class="tw:bg-secondary-dark! tw:dark:bg-secondary-dark! tw:text-white! tw:rounded-md!"
            >
              <icon-plus class="tw:text-[16px]" />
              <span class="tw:mr-1!">افزودن</span>
            </v-btn>
          </v-card-title>

          <v-card-text>
            <div
              v-if="ageCategoryStore.cutoffLoading"
              class="tw:flex tw:justify-center tw:py-8"
            >
              <v-progress-circular indeterminate color="primary" />
            </div>
            <div
              v-else-if="cutoffRows.length === 0"
              class="tw:text-center tw:text-color-lighter tw:text-[13px] tw:py-4"
            >
              محدوده سنی ثبت نشده
            </div>
            <div v-else class="tw:flex tw:flex-col tw:gap-3">
              <v-row
                v-for="row in cutoffRows"
                :key="row.key"
                dense
                class="tw:p-3 tw:mt-1!"
              >
                <v-col cols="6">
                  <v-select
                    v-model="row.seasonId"
                    :items="dropdownStore.seasonsResult"
                    item-title="label"
                    item-value="value"
                    variant="outlined"
                    density="compact"
                    hide-details
                    dir="rtl"
                    no-data-text="موردی یافت نشد"
                    :disabled="!canEditRow(row)"
                  >
                    <template #label>
                      <span class="tw:text-[12px]">فصل</span>
                      <span
                        class="tw:text-red-900 tw:dark:text-red-400 tw:text-[10px]"
                      >
                        (الزامی)
                      </span>
                    </template>
                  </v-select>
                </v-col>

                <v-col cols="6">
                  <div class="tw:relative!">
                    <label
                      v-if="row.minBirthDate"
                      :for="`minBirthDate-${row.key}`"
                      class="tw:text-[11px] tw:absolute! tw:bg-white! tw:dark:bg-primary-dark! tw:start-10 tw:-top-1.75 tw:z-10! tw:text-color-reverse"
                    >
                      <span class="tw:text-[12px]">حداقل تاریخ تولد</span>
                      <span
                        class="tw:text-red-900 tw:dark:text-red-400 tw:text-[10px]"
                      >
                        (الزامی)
                      </span>
                    </label>
                    <date-picker
                      v-model="row.minBirthDate"
                      :id="`minBirthDate-${row.key}`"
                      simple
                      placeholder="حداقل تاریخ تولد (الزامی)"
                      format="jYYYY/jMM/jDD"
                      display-format="jYYYY/jMM/jDD"
                      :disabled="!canEditRow(row)"
                      class="default-scroll tw:text-gray-300! tw:text-[14px]! tw:text-center!"
                      color="#1d202e"
                    />
                  </div>
                </v-col>

                <v-col
                  cols="12"
                  class="tw:flex tw:items-center tw:justify-end tw:gap-2"
                >
                  <v-btn
                    v-if="canEditRow(row)"
                    size="x-small"
                    variant="outlined"
                    :loading="row.saving"
                    :disabled="row.saving"
                    @click="onCutoffSubmit(row)"
                  >
                    <icon-check class="tw:text-[16px]" />
                    <span class="tw:mr-1!">{{
                      row.id === null ? "ثبت" : "ویرایش"
                    }}</span>
                  </v-btn>
                  <v-btn
                    v-if="
                      row.id === null || hasPermission('age-categories.delete')
                    "
                    size="x-small"
                    variant="outlined"
                    :disabled="row.saving"
                    @click="onCutoffDelete(row)"
                  >
                    <icon-trash class="tw:text-[16px]" />
                    <span class="tw:mr-1!">حذف</span>
                  </v-btn>
                </v-col>
              </v-row>
            </div>
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
            <div class="tw:text-[14px]! tw:text-white">حذف رده سنی</div>
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

    <!-- ─── Cutoff Delete Confirm Dialog ── -->
    <v-dialog
      v-model="cutoffDeleteDialogOpen"
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
              <v-btn icon variant="plain" size="x-small">
                <icon-close class="tw:text-[18px] tw:text-white!" />
              </v-btn>
            </div>
            <div class="tw:text-[14px]! tw:text-white">حذف محدوده سنی</div>
            <div>
              <v-btn
                icon
                variant="plain"
                size="x-small"
                @click="cutoffDeleteDialogOpen = false"
              >
                <icon-close class="tw:text-[18px] tw:text-white!" />
              </v-btn>
            </div>
          </div>
        </v-card-title>
        <v-card-text class="tw:text-[16px]! tw:text-center!">
          آیا از حذف این محدوده سنی مطمئن هستید؟
        </v-card-text>
        <v-card-actions class="tw:justify-end!">
          <v-btn
            variant="text"
            @click="cutoffDeleteDialogOpen = false"
            class="tw:text-[12px]!"
          >
            انصراف
          </v-btn>
          <v-btn
            class="tw:bg-secondary-dark! tw:dark:bg-secondary-dark! tw:text-white! tw:rounded-md!"
            :loading="handlerStore.loadingBtn"
            :disabled="handlerStore.loadingBtn"
            @click="onCutoffDeleteConfirm"
          >
            <icon-trash class="tw:text-[18px]" />
            <span class="tw:mr-1! tw:text-[12px]! tw:px-2!">حذف</span>
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { useAgeCategoryStore } from "~/store/ageCategory";
import { useHandlerStore } from "~/store/handler";
import { useDeopdownStore } from "~/store/dropdown";

interface CutoffRow {
  key: string;
  id: number | null;
  seasonId: number | string | null;
  minBirthDate: string;
  saving?: boolean;
}

const ageCategoryStore = useAgeCategoryStore();
const handlerStore = useHandlerStore();
const dropdownStore = useDeopdownStore();

// ─── Permissions ──
const { hasPermission } = usePermission();

const { setPageTitle } = usePageTitle();
watchEffect(() => {
  setPageTitle("مدیریت رده‌های سنی");
});

// ─── Pagination ──
const page = ref<number>(1);
const pageSize = ref<number>(10);
const totalItems = computed(
  () => ageCategoryStore.ageCategoryListMeta?.total ?? 0,
);

// ─── Search ──
const query = ref<string>("");
let searchTimeout: ReturnType<typeof setTimeout> | null = null;

const onSearchChange = () => {
  if (searchTimeout) clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    page.value = 1;
    loadAgeCategories();
  }, 300);
};

// ─── Data Loading ──
const loadAgeCategories = () => {
  const params: any = {
    page: page.value,
    pageSize: pageSize.value,
  };
  if (query.value) params.search = query.value;

  ageCategoryStore.getAgeCategories(params);
};

// ─── Delete ──
const deleteDialogOpen = ref<boolean>(false);
const deleteTarget = ref<any>(null);

const confirmDelete = (item: any) => {
  deleteTarget.value = item;
  deleteDialogOpen.value = true;
};

const onDeleteConfirm = () => {
  ageCategoryStore.deleteAgeCategory(deleteTarget.value.id).then(() => {
    deleteDialogOpen.value = false;
    deleteTarget.value = null;
    loadAgeCategories();
  });
};

// ─── Create / Edit ──
const editingId = ref<number | null>(null);
const formRef = ref<any>(null);

const defaultForm = () => ({
  name: "",
});

const form = reactive(defaultForm());

// ─── Cutoffs ──
const cutoffRows = ref<CutoffRow[]>([]);
const cutoffDeleteDialogOpen = ref<boolean>(false);
const cutoffDeleteTarget = ref<CutoffRow | null>(null);

const newRowKey = () =>
  globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;

const loadCutoffs = async (categoryId: number) => {
  const items = await ageCategoryStore.getCutoffs({
    ageCategoryId: categoryId,
    page: 1,
    pageSize: 100,
  });
  // Ignore stale responses if the user switched category meanwhile.
  if (editingId.value !== categoryId) return;
  cutoffRows.value = (items ?? []).map((c: any) => ({
    key: newRowKey(),
    id: c.id,
    seasonId: c.seasonId,
    minBirthDate: c.minBirthDate ?? "",
  }));
};

const canEditRow = (row: CutoffRow) =>
  hasPermission(
    row.id === null ? "age-categories.create" : "age-categories.update",
  );

const addCutoffRow = () => {
  cutoffRows.value.push({
    key: newRowKey(),
    id: null,
    seasonId: null,
    minBirthDate: "",
  });
};

const onCutoffSubmit = async (row: CutoffRow) => {
  if (!editingId.value) return;
  if (
    row.seasonId === null ||
    row.seasonId === "" ||
    !/^\d{4}\/\d{1,2}\/\d{1,2}$/.test(row.minBirthDate || "")
  ) {
    handlerStore.setError("لطفا فصل و تاریخ معتبر را وارد کنید.");
    return;
  }

  row.saving = true;
  try {
    if (row.id === null) {
      const created = await ageCategoryStore.createCutoff({
        ageCategoryId: editingId.value,
        seasonId: row.seasonId,
        minBirthDate: row.minBirthDate,
      });
      if (created) {
        row.id = created.id;
        loadAgeCategories();
      }
    } else {
      await ageCategoryStore.updateCutoff(row.id, {
        seasonId: row.seasonId,
        minBirthDate: row.minBirthDate,
      });
    }
  } finally {
    row.saving = false;
  }
};

const onCutoffDelete = (row: CutoffRow) => {
  if (row.id === null) {
    cutoffRows.value = cutoffRows.value.filter((r) => r.key !== row.key);
    return;
  }
  cutoffDeleteTarget.value = row;
  cutoffDeleteDialogOpen.value = true;
};

const onCutoffDeleteConfirm = async () => {
  const target = cutoffDeleteTarget.value;
  if (!target || target.id === null) return;
  await ageCategoryStore.deleteCutoff(target.id).then(() => {
    cutoffRows.value = cutoffRows.value.filter((r) => r.key !== target.key);
    cutoffDeleteDialogOpen.value = false;
    cutoffDeleteTarget.value = null;
    loadAgeCategories();
  });
};

const openCreateMode = () => {
  editingId.value = null;
  cutoffRows.value = [];
  Object.assign(form, defaultForm());
};

const openEdit = (id: number) => {
  editingId.value = id;
  cutoffRows.value = [];
  ageCategoryStore.getAgeCategoryById(id).then(() => {
    if (ageCategoryStore.ageCategoryDetail) {
      form.name = ageCategoryStore.ageCategoryDetail.name || "";
    }
  });
  loadCutoffs(id);
};

const onFormSubmit = () => {
  if (!form.name) {
    handlerStore.setError("لطفا تمام فیلدهای الزامی را پر کنید.");
    return;
  }

  formRef.value!.validate().then(({ valid }: { valid: boolean }) => {
    if (!valid) return;

    const payload: any = {
      name: form.name,
    };

    if (editingId.value) {
      ageCategoryStore.updateAgeCategory(editingId.value, payload).then(() => {
        editingId.value = null;
        cutoffRows.value = [];
        Object.assign(form, defaultForm());
        loadAgeCategories();
      });
    } else {
      ageCategoryStore.createAgeCategory(payload).then((created: any) => {
        if (!created) return;
        editingId.value = created.id;
        cutoffRows.value = [];
        loadAgeCategories();
      });
    }
  });
};

// ─── Init ──
onMounted(() => {
  loadAgeCategories();
  if (dropdownStore.seasonsResult.length === 0) {
    dropdownStore.getSeasons();
  }
});
</script>
