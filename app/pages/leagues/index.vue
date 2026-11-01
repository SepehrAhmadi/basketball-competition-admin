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
              <v-col cols="12" sm="4" md="4" lg="12" xl="4">
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

              <v-col cols="6" sm="2" lg="3" xl="2">
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

              <v-col cols="6" sm="2" lg="3" xl="2">
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

              <v-col cols="12" sm="3" md="2" lg="3" xl="2">
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

              <v-col cols="12" sm="2" lg="" xl="2">
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
            xl="6"
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

              <div class="tw:flex tw:justify-end tw:mt-4!">
                <div
                  class="tw:inline-flex tw:items-stretch tw:overflow-hidden tw:rounded-lg tw:border tw:border-gray-300 tw:dark:border-gray-600"
                >
                  <v-tooltip
                    v-if="hasPermission('league-teams.view')"
                    location="top"
                  >
                    <template #activator="{ props }">
                      <v-btn
                        v-bind="props"
                        size="small"
                        variant="text"
                        rounded="0"
                        class="tw:min-w-2!
"
                        @click="navigateTo(`/leagues/${item.id}/teams`)"
                      >
                        <icon-users class="tw:text-[16px]" />
                      </v-btn>
                    </template>
                    <span class="tw:text-xs tw:p-2">مدیریت تیم‌ها</span>
                  </v-tooltip>

                  <v-tooltip
                    v-if="hasPermission('groups.view')"
                    location="top"
                  >
                    <template #activator="{ props }">
                      <v-btn
                        v-bind="props"
                        size="small"
                        variant="text"
                        rounded="0"
                        class="tw:min-w-2!"
                        aria-label="مدیریت مسابقات"
                        @click="navigateTo(`/competition?leagueId=${item.id}`)"
                      >
                        <icon-pie-chart class="tw:text-[16px]" />
                      </v-btn>
                    </template>
                    <span class="tw:text-xs tw:p-2">مدیریت مسابقات</span>
                  </v-tooltip>

                  <v-tooltip
                    v-if="hasPermission('leagues.update')"
                    location="top"
                  >
                    <template #activator="{ props }">
                      <v-btn
                        v-bind="props"
                        size="small"
                        variant="text"
                        rounded="0"
                        class="tw:min-w-2!
"
                        @click="openStatusDialog(item)"
                      >
                        <icon-refresh class="tw:text-[16px]" />
                      </v-btn>
                    </template>
                    <span class="tw:text-xs tw:p-2">تغییر وضعیت</span>
                  </v-tooltip>

                  <v-tooltip
                    v-if="hasPermission('leagues.update')"
                    location="top"
                  >
                    <template #activator="{ props }">
                      <v-btn
                        v-bind="props"
                        size="small"
                        variant="text"
                        rounded="0"
                        class="tw:min-w-2!
"
                        @click="openEdit(item.id)"
                      >
                        <icon-edit-box class="tw:text-[16px]" />
                      </v-btn>
                    </template>
                    <span class="tw:text-xs tw:p-2">ویرایش</span>
                  </v-tooltip>

                  <v-tooltip
                    v-if="hasPermission('leagues.delete')"
                    location="top"
                  >
                    <template #activator="{ props }">
                      <v-btn
                        v-bind="props"
                        size="small"
                        variant="text"
                        rounded="0"
                        class="tw:min-w-2!
"
                        @click="confirmDelete(item)"
                      >
                        <icon-trash class="tw:text-[16px]" />
                      </v-btn>
                    </template>
                    <span class="tw:text-xs tw:p-2">حذف</span>
                  </v-tooltip>
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
            dir="rtl"
            class="tw:flex! tw:items-center! tw:gap-3! tw:flex-wrap! tw:text-[14px]! tw:font-bold! tw:mb-2!"
          >
            <div class="tw:flex tw:items-center tw:gap-1">
              <icon-plus v-if="!editingId" class="tw:text-[20px]" />
              <icon-edit-box v-else class="tw:text-[20px]" />
              <span>{{ editingId ? "ویرایش لیگ" : "افزودن لیگ" }}</span>
            </div>

            <v-btn-toggle
              v-model="activeSideTab"
              mandatory
              divided
              density="compact"
              variant="outlined"
              class="tw:mr-auto!"
              @update:model-value="onSideTabChange"
            >
              <v-btn value="league" size="small" class="tw:text-[12px]!">
                اطلاعات لیگ
              </v-btn>
              <v-btn value="format" size="small" class="tw:text-[12px]!">
                ساختار مسابقات
              </v-btn>
            </v-btn-toggle>
          </v-card-title>

          <v-card-text>
            <template v-if="activeSideTab === 'league'">
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
            </template>

            <template v-else>
              <v-alert
                v-if="!editingId"
                type="info"
                variant="tonal"
                density="compact"
                class="tw:text-[12px]!"
              >
                برای تنظیم ساختار مسابقات، ابتدا اطلاعات لیگ را ذخیره کنید.
              </v-alert>

              <div
                v-else-if="leagueStore.formatLoading"
                class="tw:flex tw:justify-center tw:py-8"
              >
                <v-progress-circular indeterminate color="primary" />
              </div>

              <v-form v-else>
                <v-alert
                  v-if="isFormatLocked"
                  type="warning"
                  variant="tonal"
                  density="compact"
                  class="tw:text-[12px]! tw:mb-4!"
                >
                  {{ formatLockMessage }}
                </v-alert>

                <v-select
                  v-model="formatForm.format"
                  :items="dropdownStore.leagueFormats"
                  item-title="label"
                  item-value="value"
                  variant="outlined"
                  density="compact"
                  hide-details
                  dir="rtl"
                  :disabled="isFormatLocked"
                  no-data-text="موردی یافت نشد"
                >
                  <template #label>
                    <span class="tw:text-[12px]">ساختار مسابقات</span>
                    <span
                      class="tw:text-red-900 tw:dark:text-red-400 tw:text-[10px]"
                    >
                      (الزامی)
                    </span>
                  </template>
                </v-select>

                <v-row dense class="tw:mt-3!">
                  <v-col cols="6">
                    <v-text-field
                      v-model="formatForm.winPoints"
                      type="number"
                      min="0"
                      max="10"
                      step="1"
                      variant="outlined"
                      density="compact"
                      hide-details
                      :disabled="isFormatLocked"
                    >
                      <template #label>
                        <span class="tw:text-[12px]">امتیاز برد</span>
                        <span
                          class="tw:text-red-900 tw:dark:text-red-400 tw:text-[10px]"
                        >
                          (الزامی)
                        </span>
                      </template>
                    </v-text-field>
                  </v-col>
                  <v-col cols="6">
                    <v-text-field
                      v-model="formatForm.lossPoints"
                      type="number"
                      min="0"
                      max="10"
                      step="1"
                      variant="outlined"
                      density="compact"
                      hide-details
                      :disabled="isFormatLocked"
                    >
                      <template #label>
                        <span class="tw:text-[12px]">امتیاز باخت</span>
                        <span
                          class="tw:text-red-900 tw:dark:text-red-400 tw:text-[10px]"
                        >
                          (الزامی)
                        </span>
                      </template>
                    </v-text-field>
                  </v-col>
                </v-row>

                <template v-if="isGroupFormat">
                  <v-select
                    v-model="formatForm.groupRoundType"
                    :items="dropdownStore.groupRoundTypes"
                    item-title="label"
                    item-value="value"
                    variant="outlined"
                    density="compact"
                    hide-details
                    dir="rtl"
                    :disabled="isFormatLocked"
                    no-data-text="موردی یافت نشد"
                    class="tw:mt-4!"
                  >
                    <template #label>
                      <span class="tw:text-[12px]">نوع دور مسابقات گروهی</span>
                      <span
                        class="tw:text-red-900 tw:dark:text-red-400 tw:text-[10px]"
                      >
                        (الزامی)
                      </span>
                    </template>
                  </v-select>

                  <v-text-field
                    v-model="formatForm.defaultQualifiersPerGroup"
                    type="number"
                    min="1"
                    max="64"
                    step="1"
                    variant="outlined"
                    density="compact"
                    hide-details
                    :disabled="isFormatLocked"
                    class="tw:mt-4!"
                  >
                    <template #label>
                      <span class="tw:text-[12px]">
                        تعداد صعود‌کننده‌ی هر گروه
                      </span>
                      <span
                        class="tw:text-red-900 tw:dark:text-red-400 tw:text-[10px]"
                      >
                        (الزامی)
                      </span>
                    </template>
                  </v-text-field>
                </template>

                <v-btn
                  block
                  :loading="handlerStore.loadingBtn"
                  :disabled="handlerStore.loadingBtn || isFormatLocked"
                  class="tw:bg-secondary-dark! tw:dark:bg-secondary-dark! tw:text-white! tw:rounded-md! tw:mt-4!"
                  @click="onFormatSubmit"
                >
                  <icon-check class="tw:text-[18px]" />
                  <span class="tw:mr-1!">ذخیره ساختار</span>
                </v-btn>
              </v-form>
            </template>
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

// ─── Side form tabs + league format ──
const activeSideTab = ref<"league" | "format">("league");
const formatLoadedId = ref<number | null>(null);

const defaultFormatForm = () => ({
  format: null as string | null,
  winPoints: 2 as number | string,
  lossPoints: 1 as number | string,
  groupRoundType: null as string | null,
  defaultQualifiersPerGroup: null as number | string | null,
});

const formatForm = reactive(defaultFormatForm());

const isGroupFormat = computed(
  () =>
    formatForm.format === "GROUPS_KNOCKOUT" ||
    formatForm.format === "SINGLE_GROUP_KNOCKOUT",
);

const isFormatLocked = computed(
  () =>
    !!editingId.value &&
    leagueStore.formatDetail?.lock != null,
);

const formatLockMessage = computed(
  () => leagueStore.formatDetail?.lock?.message ?? "",
);

const fillFormatForm = (detail: any) => {
  formatForm.format = detail?.format ?? null;
  formatForm.winPoints = detail?.winPoints ?? 2;
  formatForm.lossPoints = detail?.lossPoints ?? 1;
  formatForm.groupRoundType = detail?.groupRoundType ?? null;
  formatForm.defaultQualifiersPerGroup =
    detail?.defaultQualifiersPerGroup ?? null;
};

const resetFormatForm = () => {
  Object.assign(formatForm, defaultFormatForm());
  formatLoadedId.value = null;
  leagueStore.formatDetail = null;
};

const loadFormat = async (id: number) => {
  const detail = await leagueStore.getLeagueFormat(id);
  if (!detail) return;
  fillFormatForm(detail);
  formatLoadedId.value = id;
};

const onSideTabChange = (value: "league" | "format") => {
  if (value === "format" && editingId.value && formatLoadedId.value !== editingId.value) {
    loadFormat(editingId.value);
  }
};

const onFormatSubmit = () => {
  if (!editingId.value) return;

  if (!formatForm.format) {
    handlerStore.setError("ساختار مسابقات را انتخاب کنید.");
    return;
  }

  if (
    formatForm.winPoints === "" ||
    formatForm.winPoints === null ||
    formatForm.lossPoints === "" ||
    formatForm.lossPoints === null
  ) {
    handlerStore.setError("امتیاز برد و باخت الزامی است.");
    return;
  }

  const winPoints = Number(formatForm.winPoints);
  const lossPoints = Number(formatForm.lossPoints);

  if (
    !Number.isInteger(winPoints) ||
    !Number.isInteger(lossPoints) ||
    winPoints < 0 ||
    lossPoints < 0 ||
    winPoints > 10 ||
    lossPoints > 10
  ) {
    handlerStore.setError("امتیازها باید عددی بین ۰ تا ۱۰ باشند.");
    return;
  }

  if (winPoints <= lossPoints) {
    handlerStore.setError("امتیاز برد باید بیشتر از امتیاز باخت باشد.");
    return;
  }

  const payload: any = {
    format: formatForm.format,
    winPoints,
    lossPoints,
  };

  if (isGroupFormat.value) {
    if (!formatForm.groupRoundType) {
      handlerStore.setError("نوع دور مسابقات گروهی را انتخاب کنید.");
      return;
    }

    const qualifiers = Number(formatForm.defaultQualifiersPerGroup);
    if (
      formatForm.defaultQualifiersPerGroup === "" ||
      formatForm.defaultQualifiersPerGroup === null ||
      !Number.isInteger(qualifiers) ||
      qualifiers < 1 ||
      qualifiers > 64
    ) {
      handlerStore.setError(
        "تعداد صعود‌کننده‌ی هر گروه باید بین ۱ تا ۶۴ باشد.",
      );
      return;
    }

    payload.groupRoundType = formatForm.groupRoundType;
    payload.defaultQualifiersPerGroup = qualifiers;
  }

  leagueStore.updateLeagueFormat(editingId.value, payload).then((ok) => {
    if (!ok) return;
    if (leagueStore.formatDetail) fillFormatForm(leagueStore.formatDetail);
    formatLoadedId.value = editingId.value;
    loadLeagues();
  });
};

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
  activeSideTab.value = "league";
  resetFormatForm();
  cutoffOptions.value = [];
  Object.assign(form, defaultForm());
};

const openEdit = (id: number) => {
  editingId.value = id;
  activeSideTab.value = "league";
  resetFormatForm();
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
        activeSideTab.value = "league";
        resetFormatForm();
        cutoffOptions.value = [];
        Object.assign(form, defaultForm());
        loadLeagues();
      });
    } else {
      leagueStore.createLeague(payload).then(() => {
        activeSideTab.value = "league";
        resetFormatForm();
        cutoffOptions.value = [];
        Object.assign(form, defaultForm());
        loadLeagues();
      });
    }
  });
};

// ─── Init ──
const route = useRoute();

onMounted(() => {
  if (!hasPermission("leagues.view")) return;
  loadLeagues();

  // Deep link from the competition page: /leagues?editLeagueId=:id&tab=format
  const editLeagueId = Number(route.query.editLeagueId);
  if (Number.isInteger(editLeagueId) && editLeagueId > 0) {
    if (hasPermission("leagues.update")) {
      openEdit(editLeagueId);
      if (route.query.tab === "format") {
        activeSideTab.value = "format";
        loadFormat(editLeagueId);
      }
    }
    navigateTo({ path: "/leagues" }, { replace: true });
  }
  if (dropdownStore.seasonsResult.length === 0) {
    dropdownStore.getSeasons();
  }
  // Only the league form needs categories — don't request them (and trigger
  // a 403) for read-only users.
  if (
    (hasPermission("leagues.create") || hasPermission("leagues.update")) &&
    ageCategoryStore.ageCategoryList.length === 0
  ) {
    ageCategoryStore.getAgeCategories({ page: 1, pageSize: 100 });
  }

  // Format options are only needed by the side form.
  if (hasPermission("leagues.create") || hasPermission("leagues.update")) {
    if (dropdownStore.leagueFormats.length === 0) {
      dropdownStore.getLeagueFormats();
    }
    if (dropdownStore.groupRoundTypes.length === 0) {
      dropdownStore.getGroupRoundTypes();
    }
  }
});
</script>
