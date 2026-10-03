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
            ageCategoryStore.loading && ageCategoryStore.ageCategoryList.length === 0
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
        <v-card
          rounded="lg"
          class="tw:mt-4!"
          v-if="totalItems > pageSize / page"
        >
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
  </div>
</template>

<script setup lang="ts">
import { useAgeCategoryStore } from "~/store/ageCategory";
import { useHandlerStore } from "~/store/handler";

const ageCategoryStore = useAgeCategoryStore();
const handlerStore = useHandlerStore();

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

const openCreateMode = () => {
  editingId.value = null;
  Object.assign(form, defaultForm());
};

const openEdit = (id: number) => {
  editingId.value = id;
  ageCategoryStore.getAgeCategoryById(id).then(() => {
    if (ageCategoryStore.ageCategoryDetail) {
      form.name = ageCategoryStore.ageCategoryDetail.name || "";
    }
  });
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
        Object.assign(form, defaultForm());
        loadAgeCategories();
      });
    } else {
      ageCategoryStore.createAgeCategory(payload).then(() => {
        Object.assign(form, defaultForm());
        loadAgeCategories();
      });
    }
  });
};

// ─── Init ──
onMounted(() => {
  loadAgeCategories();
});
</script>
