<template>
  <div>
    <v-row>
      <!-- ── Cards side (8 cols) ── -->
      <v-col cols="12" md="8">
        <!-- ── Toolbar card ── -->
        <v-card class="tw:rounded-xl! tw:mb-4!">
          <v-card-text>
            <v-row align="center">
              <v-col cols="12" sm="2">
                <BackBtn class="tw:w-full!" />
              </v-col>

              <v-col cols="6" sm="4">
                <div class="tw:relative!">
                  <label
                    v-if="filterFromDate"
                    for="filterFromDate"
                    class="tw:text-[11px] tw:absolute! tw:bg-white! tw:dark:bg-primary-dark! tw:start-10 tw:-top-1.75 tw:z-10! tw:text-color-reverse"
                    >از تاریخ</label
                  >
                  <date-picker
                    v-model="filterFromDate"
                    id="filterFromDate"
                    simple
                    placeholder="از تاریخ"
                    format="jYYYY/jMM/jDD"
                    display-format="jYYYY/jMM/jDD"
                    class="default-scroll tw:text-gray-300! tw:text-[14px]! tw:text-center!"
                    color="#1d202e"
                    @change="onFilterChange"
                  />
                </div>
              </v-col>
              <v-col cols="6" sm="4">
                <div class="tw:relative!">
                  <label
                    v-if="filterToDate"
                    for="filterToDate"
                    class="tw:text-[11px] tw:absolute! tw:bg-white! tw:dark:bg-primary-dark! tw:start-10 tw:-top-1.75 tw:z-10! tw:text-color-reverse"
                    >تا تاریخ</label
                  >
                  <date-picker
                    v-model="filterToDate"
                    id="filterToDate"
                    simple
                    placeholder="تا تاریخ"
                    format="jYYYY/jMM/jDD"
                    display-format="jYYYY/jMM/jDD"
                    class="default-scroll tw:text-gray-300! tw:text-[14px]! tw:text-center!"
                    color="#1d202e"
                    @change="onFilterChange"
                  />
                </div>
              </v-col>
              <v-col cols="12" sm="2">
                <v-btn
                  class="tw:bg-secondary-dark! tw:text-white! tw:rounded-md!"
                  @click="openCreateMode"
                >
                  <icon-plus class="tw:text-[20px]" />
                  <span class="tw:mr-1!">افزودن فصل جدید</span>
                </v-btn>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>

        <!-- ── Card grid ── -->
        <div
          v-if="seasonStore.loading && seasonStore.seasonList.length === 0"
          class="tw:flex tw:justify-center tw:py-16"
        >
          <v-progress-circular indeterminate color="primary" />
        </div>

        <div
          v-else-if="seasonStore.seasonList.length === 0"
          class="tw:h-full! tw:flex tw:justify-center tw:items-center tw:gap-2 tw:py-16"
        >
          <icon-row-chart class="tw:text-color-lighter tw:text-[35px]" />
          <div class="tw:text-color-lighter tw:text-[14px]">
            اطلاعاتی یافت نشد
          </div>
        </div>

        <v-row v-else>
          <v-col
            v-for="item in seasonStore.seasonList"
            :key="item.id"
            cols="12"
            md="6"
          >
            <v-card rounded="lg" class="tw:relative! tw:p-4!">
              <div class="tw:flex tw:justify-between tw:items-center">
                <div class="tw:text-[16px]! tw:font-bold!">
                  {{ item.name }}
                </div>
                <div>
                  <v-chip
                    size="x-small"
                    variant="tonal"
                    :color="item.isActive ? 'success' : 'default'"
                  >
                    {{ item.isActive ? "فعال" : "غیرفعال" }}
                  </v-chip>
                </div>
              </div>
              <div
                class="tw:w-full! tw:flex! tw:justify-between! tw:items-start!"
              >
                <div></div>
              </div>

              <div
                class="tw:text-gray-600 tw:dark:text-gray-300 tw:text-[13px]! tw:mt-2!"
              >
                تاریخ شروع: {{ item.startDate }}
              </div>
              <div
                class="tw:text-gray-600 tw:dark:text-gray-300 tw:text-[13px]! tw:mt-1!"
              >
                تاریخ پایان: {{ item.endDate }}
              </div>

              <div class="tw:flex tw:justify-end tw:gap-2 tw:mt-4!">
                <v-btn
                  size="x-small"
                  variant="outlined"
                  @click="openEdit(item.id)"
                >
                  <icon-edit-box class="tw:text-[16px]" />
                  <span class="tw:mr-1!">ویرایش</span>
                </v-btn>
                <v-btn
                  size="x-small"
                  variant="outlined"
                  @click="confirmDelete(item)"
                >
                  <icon-trash class="tw:text-[16px]" />
                  <span class="tw:mr-1!">حذف</span>
                </v-btn>
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
            @update-options="loadSeasons"
          />
        </v-card>
      </v-col>

      <!-- ── Form side (3 cols) ── -->
      <v-col cols="12" md="4">
        <v-card class="tw:rounded-xl!">
          <v-card-title
            class="tw:flex! tw:items-center! tw:gap-1! tw:text-[14px]! tw:font-bold! tw:mb-2!"
          >
            <div>
              <icon-plus v-if="!editingId" class="tw:text-[20px]" />
              <icon-edit-box v-else class="tw:text-[20px]" />
            </div>
            <div>
              {{ editingId ? "ویرایش فصل" : "افزودن فصل" }}
            </div>
          </v-card-title>

          <v-card-text>
            <!-- Loading spinner while fetching for edit -->
            <div
              v-if="editingId && seasonStore.loading"
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
                  <span class="tw:text-[12px]">نام فصل</span>
                  <span
                    class="tw:text-red-900 tw:dark:text-red-400 tw:text-[10px]"
                  >
                    (الزامی)
                  </span>
                </template>
              </v-text-field>

              <div class="tw:relative! tw:mt-4!">
                <label
                  v-if="form.startDate"
                  for="startDate"
                  class="tw:text-[11px] tw:absolute! tw:bg-white! tw:dark:bg-primary-dark! tw:start-10 tw:-top-1.75 tw:z-10! tw:text-color-reverse"
                  >تاریخ شروع</label
                >
                <date-picker
                  v-model="form.startDate"
                  id="startDate"
                  simple
                  placeholder="تاریخ شروع"
                  format="jYYYY/jMM/jDD"
                  display-format="jYYYY/jMM/jDD"
                  class="default-scroll tw:text-gray-300! tw:text-[14px]! tw:text-center!"
                  color="#1d202e"
                />
              </div>

              <div class="tw:relative! tw:mt-4!">
                <label
                  v-if="form.endDate"
                  for="endDate"
                  class="tw:text-[11px] tw:absolute! tw:bg-white! tw:dark:bg-primary-dark! tw:start-10 tw:-top-1.75 tw:z-10! tw:text-color-reverse"
                  >تاریخ پایان</label
                >
                <date-picker
                  v-model="form.endDate"
                  id="endDate"
                  simple
                  placeholder="تاریخ پایان"
                  format="jYYYY/jMM/jDD"
                  display-format="jYYYY/jMM/jDD"
                  class="default-scroll tw:text-gray-300! tw:text-[14px]! tw:text-center!"
                  color="#1d202e"
                />
              </div>

              <div class="tw:mt-1! tw:mr-1.5!">
                <v-switch
                  v-model="form.isActive"
                  color="secondary"
                  hide-details
                  density="compact"
                  size="x-small"
                >
                  <template #label>
                    <span class="tw:text-[14px]">فعال</span>
                  </template>
                </v-switch>
              </div>

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
            <div class="tw:text-[14px]! tw:text-white">حذف فصل</div>
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
import { useSeasonStore } from "~/store/season";
import { useHandlerStore } from "~/store/handler";

const seasonStore = useSeasonStore();
const handlerStore = useHandlerStore();

const { setPageTitle } = usePageTitle();
watchEffect(() => {
  setPageTitle("مدیریت فصل‌ها");
});

// ─── Pagination ──
const page = ref<number>(1);
const pageSize = ref<number>(8);
const totalItems = computed(() => seasonStore.seasonListMeta?.total ?? 0);

// ─── Date Range Filter ──
const filterFromDate = ref<string>("");
const filterToDate = ref<string>("");

const onFilterChange = () => {
  page.value = 1;
  loadSeasons();
};

// ─── Data Loading ──
const loadSeasons = () => {
  const params: any = {
    page: page.value,
    pageSize: pageSize.value,
  };
  if (filterFromDate.value) params.fromDate = filterFromDate.value;
  if (filterToDate.value) params.toDate = filterToDate.value;

  seasonStore.getSeasons(params);
};

// ─── Delete ──
const deleteDialogOpen = ref<boolean>(false);
const deleteTarget = ref<any>(null);

const confirmDelete = (item: any) => {
  deleteTarget.value = item;
  deleteDialogOpen.value = true;
};

const onDeleteConfirm = () => {
  seasonStore.deleteSeason(deleteTarget.value.id).then(() => {
    deleteDialogOpen.value = false;
    deleteTarget.value = null;
    loadSeasons();
  });
};

// ─── Create / Edit ──
const editingId = ref<number | null>(null);
const formRef = ref<any>(null);

const defaultForm = () => ({
  name: "",
  startDate: "",
  endDate: "",
  isActive: true,
});

const form = reactive(defaultForm());

const openCreateMode = () => {
  editingId.value = null;
  Object.assign(form, defaultForm());
};

const openEdit = (id: number) => {
  editingId.value = id;
  seasonStore.getSeasonById(id).then(() => {
    if (seasonStore.seasonDetail) {
      form.name = seasonStore.seasonDetail.name || "";
      form.startDate = seasonStore.seasonDetail.startDate || "";
      form.endDate = seasonStore.seasonDetail.endDate || "";
      form.isActive = seasonStore.seasonDetail.isActive ?? true;
    }
  });
};

const onFormSubmit = () => {
  formRef.value!.validate().then(({ valid }: { valid: boolean }) => {
    if (!valid) return;

    const payload: any = {
      name: form.name,
      startDate: form.startDate,
      endDate: form.endDate,
      isActive: form.isActive,
    };

    if (editingId.value) {
      seasonStore.updateSeason(editingId.value, payload).then(() => {
        editingId.value = null;
        Object.assign(form, defaultForm());
        loadSeasons();
      });
    } else {
      seasonStore.createSeason(payload).then(() => {
        Object.assign(form, defaultForm());
        loadSeasons();
      });
    }
  });
};

// ─── Init ──
onMounted(() => {
  loadSeasons();
});
</script>
