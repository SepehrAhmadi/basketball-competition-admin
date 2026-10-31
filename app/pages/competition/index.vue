<template>
  <div dir="rtl">
    <!-- ── groups.view guard ── -->
    <v-row v-if="!hasPermission('groups.view')">
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

    <template v-else>
      <!-- ── Toolbar card ── -->
      <v-card class="tw:rounded-xl! tw:mb-4!">
        <v-card-text>
          <v-row align="center">
            <v-col cols="12" sm="2">
              <BackBtn class="tw:w-full!" />
            </v-col>

            <v-col cols="12" sm="8">
              <v-autocomplete
                v-model="selectedLeagueId"
                :items="leagueOptions"
                item-title="label"
                item-value="value"
                variant="outlined"
                density="compact"
                hide-details
                dir="rtl"
                clearable
                no-filter
                :disabled="mutating"
                no-data-text="موردی یافت نشد"
                @update:search="onLeagueSearch"
                @update:model-value="onLeagueSelect"
              >
                <template #label>
                  <span class="tw:text-[12px]">انتخاب لیگ</span>
                </template>
                <template #item="{ props: itemProps, item }">
                  <v-list-item v-bind="itemProps">
                    <template #append>
                      <v-chip
                        v-if="item.raw.status"
                        size="x-small"
                        variant="tonal"
                        :color="statusColor(item.raw.status)"
                      >
                        {{ statusLabel(item.raw.status) }}
                      </v-chip>
                    </template>
                  </v-list-item>
                </template>
              </v-autocomplete>
            </v-col>

            <v-col cols="12" sm="2">
              <v-btn
                block
                class="tw:bg-secondary-dark! tw:text-white! tw:rounded-md!"
                :disabled="!selectedLeagueId || mutating"
                @click="onRefresh"
              >
                <icon-refresh class="tw:text-[18px]" />
                <span class="tw:mr-1!">بروزرسانی</span>
              </v-btn>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>

      <!-- ── No league selected ── -->
      <div
        v-if="pageState === 'idle'"
        class="tw:flex tw:justify-center tw:items-center tw:gap-2 tw:py-16!"
      >
        <icon-row-chart class="tw:text-color-lighter tw:text-[35px]" />
        <div class="tw:text-color-lighter tw:text-[14px]">
          برای شروع، یک لیگ را انتخاب کنید.
        </div>
      </div>

      <!-- ── Loading ── -->
      <div
        v-else-if="pageState === 'loading'"
        class="tw:flex tw:justify-center tw:py-16"
      >
        <v-progress-circular indeterminate color="primary" />
      </div>

      <!-- ── Load failed / not found ── -->
      <div
        v-else-if="pageState === 'error'"
        class="tw:flex tw:flex-col tw:justify-center tw:items-center tw:gap-3 tw:py-16!"
      >
        <div class="tw:flex tw:items-center tw:gap-2">
          <icon-row-chart class="tw:text-color-lighter tw:text-[35px]" />
          <div class="tw:text-color-lighter tw:text-[14px]">
            دریافت اطلاعات لیگ ناموفق بود یا لیگ مورد نظر یافت نشد.
          </div>
        </div>
        <v-btn
          class="tw:bg-secondary-dark! tw:text-white! tw:rounded-md!"
          @click="loadLeague(selectedLeagueId)"
        >
          <icon-refresh class="tw:text-[18px]" />
          <span class="tw:mr-1!">تلاش دوباره</span>
        </v-btn>
      </div>

      <template v-else-if="pageState === 'ready' && league">
        <!-- ── Info + stats/form cards ── -->
        <v-row>
          <!-- League info card -->
          <v-col cols="12" md="6" xl="7">
            <v-card
              rounded="lg"
              class="tw:flex! tw:flex-col! tw:justify-between! tw:relative! tw:px-4! tw:py-5! tw:h-full!"
            >
              <div>
                <div
                  class="tw:flex tw:items-center tw:justify-between tw:gap-2 tw:mb-4!"
                >
                  <div
                    class="tw:flex tw:justify-start tw:items-center tw:gap-1 tw:text-secondary-dark tw:dark:text-white"
                  >
                    <icon-cup class="tw:text-[25px]" />
                    <div class="tw:text-[15px]! tw:font-bold!">
                      {{ league.name }}
                    </div>
                  </div>
                  <div class="tw:flex tw:items-center tw:gap-1">
                    <v-chip
                      v-if="!format"
                      size="x-small"
                      variant="tonal"
                      color="warning"
                    >
                      ساختار تعیین نشده
                    </v-chip>
                    <v-chip
                      size="x-small"
                      variant="tonal"
                      :color="statusColor(league.status)"
                    >
                      {{ statusLabel(league.status) }}
                    </v-chip>
                  </div>
                </div>

                <!-- grid info -->
                <v-row>
                  <v-col cols="6" md="4">
                    <div
                      class="tw:p-4! tw:bg-gray-50 tw:dark:bg-gray-800 tw:border tw:border-gray-200 tw:dark:border-gray-600 tw:rounded-md tw:flex tw:justify-center tw:items-center! tw:gap-2"
                    >
                      <icon-layer
                        class="tw:text-[20px] tw:text-gray-500 tw:dark:text-gray-300"
                      />
                      <div
                        class="tw:text-gray-600 tw:dark:text-gray-300 tw:text-[13px]!"
                      >
                        {{ league.season?.name ?? "—" }} -
                        {{ league.ageCategory?.name ?? "—" }}
                      </div>
                    </div>
                  </v-col>
                  <v-col cols="6" md="4">
                    <div
                      class="tw:p-4! tw:bg-gray-50 tw:dark:bg-gray-800 tw:border tw:border-gray-200 tw:dark:border-gray-600 tw:rounded-md tw:flex tw:justify-center tw:items-center! tw:gap-2"
                    >
                      <icon-date
                        class="tw:text-[20px] tw:text-gray-500 tw:dark:text-gray-300"
                      />
                      <div
                        class="tw:text-gray-600 tw:dark:text-gray-300 tw:text-[13px]!"
                      >
                        تاریخ شروع: {{ league.startDate ?? "—" }}
                      </div>
                    </div>
                  </v-col>
                  <v-col cols="6" md="4">
                    <div
                      class="tw:p-4! tw:bg-gray-50 tw:dark:bg-gray-800 tw:border tw:border-gray-200 tw:dark:border-gray-600 tw:rounded-md tw:flex tw:justify-center tw:items-center! tw:gap-2"
                    >
                      <icon-date
                        class="tw:text-[20px] tw:text-gray-500 tw:dark:text-gray-300"
                      />
                      <div
                        class="tw:text-gray-600 tw:dark:text-gray-300 tw:text-[13px]!"
                      >
                        تاریخ پایان: {{ league.endDate ?? "—" }}
                      </div>
                    </div>
                  </v-col>
                  <v-col cols="6" md="4">
                    <div
                      class="tw:p-4! tw:bg-gray-50 tw:dark:bg-gray-800 tw:border tw:border-gray-200 tw:dark:border-gray-600 tw:rounded-md tw:flex tw:justify-center tw:items-center! tw:gap-2"
                    >
                      <icon-hourglass
                        class="tw:text-[20px] tw:text-gray-500 tw:dark:text-gray-300"
                      />
                      <div
                        class="tw:text-gray-600 tw:dark:text-gray-300 tw:text-[13px]!"
                      >
                        مهلت ثبت ترکیب: {{ league.rosterDeadline ?? "—" }}
                      </div>
                    </div>
                  </v-col>
                  <v-col cols="6" md="4">
                    <div
                      class="tw:p-4! tw:bg-gray-50 tw:dark:bg-gray-800 tw:border tw:border-gray-200 tw:dark:border-gray-600 tw:rounded-md tw:flex tw:justify-center tw:items-center! tw:gap-2"
                    >
                      <icon-date
                        class="tw:text-[20px] tw:text-gray-500 tw:dark:text-gray-300"
                      />
                      <div
                        class="tw:text-gray-600 tw:dark:text-gray-300 tw:text-[13px]!"
                      >
                        حداقل تاریخ تولد: {{ minBirthDate }}
                      </div>
                    </div>
                  </v-col>
                  <v-col v-if="format" cols="6" md="4">
                    <div
                      class="tw:p-4! tw:bg-gray-50 tw:dark:bg-gray-800 tw:border tw:border-gray-200 tw:dark:border-gray-600 tw:rounded-md tw:flex tw:justify-center tw:items-center! tw:gap-2"
                    >
                      <icon-pie-chart
                        class="tw:text-[20px] tw:text-gray-500 tw:dark:text-gray-300"
                      />
                      <div
                        class="tw:text-gray-600 tw:dark:text-gray-300 tw:text-[13px]!"
                      >
                        ساختار: {{ formatLabel }}
                      </div>
                    </div>
                  </v-col>
                  <v-col v-if="format" cols="6" md="4">
                    <div
                      class="tw:p-4! tw:bg-gray-50 tw:dark:bg-gray-800 tw:border tw:border-gray-200 tw:dark:border-gray-600 tw:rounded-md tw:flex tw:justify-center tw:items-center! tw:gap-2"
                    >
                      <icon-check-circle
                        class="tw:text-[20px] tw:text-gray-500 tw:dark:text-gray-300"
                      />
                      <div
                        class="tw:text-gray-600 tw:dark:text-gray-300 tw:text-[13px]!"
                      >
                        امتیاز برد: {{ league.winPoints ?? "—" }}
                      </div>
                    </div>
                  </v-col>
                  <v-col v-if="format" cols="6" md="4">
                    <div
                      class="tw:p-4! tw:bg-gray-50 tw:dark:bg-gray-800 tw:border tw:border-gray-200 tw:dark:border-gray-600 tw:rounded-md tw:flex tw:justify-center tw:items-center! tw:gap-2"
                    >
                      <icon-close-circle
                        class="tw:text-[20px] tw:text-gray-500 tw:dark:text-gray-300"
                      />
                      <div
                        class="tw:text-gray-600 tw:dark:text-gray-300 tw:text-[13px]!"
                      >
                        امتیاز باخت: {{ league.lossPoints ?? "—" }}
                      </div>
                    </div>
                  </v-col>
                  <v-col v-if="format && isGroupedFormat" cols="6" md="4">
                    <div
                      class="tw:p-4! tw:bg-gray-50 tw:dark:bg-gray-800 tw:border tw:border-gray-200 tw:dark:border-gray-600 tw:rounded-md tw:flex tw:justify-center tw:items-center! tw:gap-2"
                    >
                      <icon-sync
                        class="tw:text-[20px] tw:text-gray-500 tw:dark:text-gray-300"
                      />
                      <div
                        class="tw:text-gray-600 tw:dark:text-gray-300 tw:text-[13px]!"
                      >
                        نوع دور: {{ roundTypeLabel }}
                      </div>
                    </div>
                  </v-col>
                  <v-col v-if="format && isGroupedFormat" cols="6" md="4">
                    <div
                      class="tw:p-4! tw:bg-gray-50 tw:dark:bg-gray-800 tw:border tw:border-gray-200 tw:dark:border-gray-600 tw:rounded-md tw:flex tw:justify-center tw:items-center! tw:gap-2"
                    >
                      <icon-check-shield
                        class="tw:text-[20px] tw:text-gray-500 tw:dark:text-gray-300"
                      />
                      <div
                        class="tw:text-gray-600 tw:dark:text-gray-300 tw:text-[13px]!"
                      >
                        {{ qualifiersLabel }}:
                        {{
                          groupStore.groupLeague?.defaultQualifiersPerGroup ??
                          "—"
                        }}
                      </div>
                    </div>
                  </v-col>
                </v-row>
              </div>

              <!-- league action -->
              <div class="tw:flex tw:justify-end tw:gap-2 tw:mt-4!">
                <v-btn
                  v-if="hasPermission('leagues.update')"
                  variant="outlined"
                  rounded="lg"
                  @click="goEditStructure"
                >
                  <icon-edit-box class="tw:text-[17px]" />
                  <span class="tw:text-[12px] tw:ms-2!">ویرایش ساختار</span>
                </v-btn>

                <v-btn
                  v-if="hasPermission('league-teams.view')"
                  variant="outlined"
                  rounded="lg"
                  @click="navigateTo(`/leagues/${league.id}/teams`)"
                >
                  <icon-users class="tw:text-[17px]" />
                  <span class="tw:text-[12px] tw:ms-2!"
                    >مدیریت تیم‌های لیگ</span
                  >
                </v-btn>
              </div>
            </v-card>
          </v-col>

          <!-- Stats + form card -->
          <v-col cols="12" md="6" xl="5">
            <v-card ref="formCardRef" class="tw:rounded-xl! tw:h-full!">
              <!-- Statistics -->
              <v-card-text>
                <div
                  class="tw:flex tw:justify-start tw:items-center tw:gap-1 tw:text-secondary-dark tw:dark:text-white tw:mb-4!"
                >
                  <icon-chart class="tw:text-[25px]" />
                  <div class="tw:text-[15px]! tw:font-bold!">وضعیت لیگ</div>
                </div>

                <v-alert
                  v-if="groupStore.groupLock"
                  type="warning"
                  variant="tonal"
                  density="compact"
                  class="tw:text-[12px]! tw:mb-4!"
                >
                  {{ groupStore.groupLock.message }}
                </v-alert>

                <!-- stats -->
                <v-row>
                  <v-col cols="6" md="4">
                    <div
                      class="tw:p-4! tw:bg-gray-50 tw:dark:bg-gray-800 tw:border tw:border-gray-200 tw:dark:border-gray-600 tw:rounded-md tw:flex tw:justify-center tw:items-center! tw:gap-2"
                    >
                      <icon-users
                        class="tw:text-[20px] tw:text-gray-500 tw:dark:text-gray-300"
                      />
                      <div class="tw:flex tw:items-center tw:gap-2">
                        <div
                          class="tw:text-gray-600 tw:dark:text-gray-300 tw:text-[11px]!"
                        >
                          تیم‌های ثبت نام شده:
                        </div>
                        <div
                          class="tw:text-gray-800 tw:dark:text-gray-100 tw:text-[15px]! tw:font-bold!"
                        >
                          {{ league.teamsCount ?? 0 }}
                        </div>
                      </div>
                    </div>
                  </v-col>
                  <template v-if="isGroupedFormat">
                    <v-col cols="6" md="4">
                      <div
                        class="tw:p-4! tw:bg-gray-50 tw:dark:bg-gray-800 tw:border tw:border-gray-200 tw:dark:border-gray-600 tw:rounded-md tw:flex tw:justify-center tw:items-center! tw:gap-2"
                      >
                        <icon-layer
                          class="tw:text-[20px] tw:text-gray-500 tw:dark:text-gray-300"
                        />
                        <div class="tw:flex tw:items-center tw:gap-2">
                          <div
                            class="tw:text-gray-600 tw:dark:text-gray-300 tw:text-[11px]!"
                          >
                            تعداد گروه ها:
                          </div>
                          <div
                            class="tw:text-gray-800 tw:dark:text-gray-100 tw:text-[15px]! tw:font-bold!"
                          >
                            {{ groupStore.groupList.length }}
                          </div>
                        </div>
                      </div>
                    </v-col>
                    <v-col cols="6" md="4">
                      <div
                        class="tw:p-4! tw:bg-gray-50 tw:dark:bg-gray-800 tw:border tw:border-gray-200 tw:dark:border-gray-600 tw:rounded-md tw:flex tw:justify-center tw:items-center! tw:gap-2"
                      >
                        <icon-check-circle
                          class="tw:text-[20px] tw:text-gray-500 tw:dark:text-gray-300"
                        />
                        <div class="tw:flex tw:items-center tw:gap-2">
                          <div
                            class="tw:text-gray-600 tw:dark:text-gray-300 tw:text-[11px]!"
                          >
                            تیم‌های دارای گروه:
                          </div>
                          <div
                            class="tw:text-gray-800 tw:dark:text-gray-100 tw:text-[15px]! tw:font-bold!"
                          >
                            {{ assignedCount }}
                          </div>
                        </div>
                      </div>
                    </v-col>
                    <v-col cols="6" md="4">
                      <div
                        class="tw:p-4! tw:bg-gray-50 tw:dark:bg-gray-800 tw:border tw:border-gray-200 tw:dark:border-gray-600 tw:rounded-md tw:flex tw:justify-center tw:items-center! tw:gap-2"
                      >
                        <icon-box
                          class="tw:text-[20px] tw:text-gray-500 tw:dark:text-gray-300"
                        />
                        <div class="tw:flex tw:items-center tw:gap-2">
                          <div
                            class="tw:text-gray-600 tw:dark:text-gray-300 tw:text-[11px]!"
                          >
                            تیم‌های بدون گروه:
                          </div>
                          <div
                            class="tw:text-gray-800 tw:dark:text-gray-100 tw:text-[15px]! tw:font-bold!"
                          >
                            {{ groupStore.unassignedCount }}
                          </div>
                        </div>
                      </div>
                    </v-col>
                    <v-col cols="6" md="4">
                      <div
                        class="tw:p-4! tw:bg-gray-50 tw:dark:bg-gray-800 tw:border tw:border-gray-200 tw:dark:border-gray-600 tw:rounded-md tw:flex tw:justify-center tw:items-center! tw:gap-2"
                      >
                        <icon-cup
                          class="tw:text-[20px] tw:text-gray-500 tw:dark:text-gray-300"
                        />
                        <div class="tw:flex tw:items-center tw:gap-2">
                          <div
                            class="tw:text-gray-600 tw:dark:text-gray-300 tw:text-[11px]!"
                          >
                            مجموع صعودکننده ها:
                          </div>
                          <div
                            class="tw:text-gray-800 tw:dark:text-gray-100 tw:text-[15px]! tw:font-bold!"
                          >
                            {{ totalQualifiers }}
                          </div>
                        </div>
                      </div>
                    </v-col>
                  </template>
                </v-row>

                <div
                  v-if="groupStore.groupIssues.length"
                  class="tw:flex tw:flex-wrap tw:gap-2 tw:mt-3!"
                >
                  <AdvisoryChip
                    v-for="(issue, i) in groupStore.groupIssues"
                    :key="`${issue.code}-${i}`"
                    :advisory="issue"
                  />
                </div>
              </v-card-text>

              <template
                v-if="
                  hasPermission('groups.create') ||
                  hasPermission('groups.update')
                "
              >
                <v-divider />

                <!-- Create / edit form -->
                <v-card-title
                  dir="rtl"
                  class="tw:flex! tw:items-center! tw:gap-1! tw:text-[14px]! tw:font-bold! tw:mb-2! tw:mt-2!"
                >
                  <icon-plus v-if="!editingId" class="tw:text-[20px]" />
                  <icon-edit-box v-else class="tw:text-[20px]" />
                  <span>{{ editingId ? "ویرایش گروه" : "افزودن گروه" }}</span>
                </v-card-title>

                <v-card-text>
                  <v-alert
                    v-if="formBlock"
                    :type="formBlock.type"
                    variant="tonal"
                    density="compact"
                    class="tw:text-[12px]!"
                  >
                    {{ formBlock.text }}
                  </v-alert>

                  <v-form v-else ref="formRef">
                    <v-text-field
                      v-model="form.name"
                      variant="outlined"
                      density="compact"
                      hide-details
                      :rules="[(v: string) => !!v || '']"
                    >
                      <template #label>
                        <span class="tw:text-[12px]">نام گروه</span>
                        <span
                          class="tw:text-red-900 tw:dark:text-red-400 tw:text-[10px]"
                        >
                          (الزامی)
                        </span>
                      </template>
                    </v-text-field>

                    <v-text-field
                      v-model="form.qualifiersOverride"
                      type="number"
                      min="1"
                      max="64"
                      step="1"
                      variant="outlined"
                      density="compact"
                      hide-details
                      class="tw:mt-4!"
                      :placeholder="qualifiersPlaceholder"
                    >
                      <template #label>
                        <span class="tw:text-[12px]">{{
                          qualifiersLabel
                        }}</span>
                      </template>
                    </v-text-field>

                    <v-row class="tw:mt-1!">
                      <v-col :cols="editingId ? '6' : '12'">
                        <v-btn
                          block
                          :loading="handlerStore.loadingBtn"
                          :disabled="handlerStore.loadingBtn"
                          class="tw:bg-secondary-dark! tw:dark:bg-secondary-dark! tw:text-white! tw:rounded-md!"
                          @click="onFormSubmit"
                        >
                          <icon-check class="tw:text-[18px]" />
                          <span class="tw:mr-1!">{{
                            editingId ? "ذخیره" : "افزودن"
                          }}</span>
                        </v-btn>
                      </v-col>
                      <v-col cols="6" v-if="editingId">
                        <v-btn
                          block
                          variant="outlined"
                          class="tw:text-[12px]!"
                          @click="openCreateMode"
                        >
                          انصراف
                        </v-btn>
                      </v-col>
                    </v-row>
                  </v-form>
                </v-card-text>
              </template>
            </v-card>
          </v-col>
        </v-row>

        <!-- ── Format not grouped ── -->
        <div
          v-if="!isGroupedFormat"
          class="tw:flex tw:flex-col tw:justify-center tw:items-center tw:gap-3 tw:py-16!"
        >
          <div class="tw:flex tw:items-center tw:gap-2">
            <icon-row-chart class="tw:text-color-lighter tw:text-[35px]" />
            <div class="tw:text-color-lighter tw:text-[14px]">
              {{
                format === "KNOCKOUT_ONLY"
                  ? "این لیگ مرحله گروهی ندارد."
                  : "ساختار مسابقات این لیگ هنوز تعیین نشده است."
              }}
            </div>
          </div>
          <v-btn
            v-if="!format && hasPermission('leagues.update')"
            class="tw:bg-secondary-dark! tw:text-white! tw:rounded-md!"
            @click="goEditStructure"
          >
            <icon-edit-box class="tw:text-[18px]" />
            <span class="tw:mr-1!">ویرایش ساختار</span>
          </v-btn>
        </div>

        <!-- ── Board ── -->
        <ClientOnly v-else>
          <v-row>
            <!-- Unassigned column (right) -->
            <v-col cols="12" md="4" lg="3">
              <v-card rounded="lg" class="tw:p-4! tw:md:sticky">
                <div
                  class="tw:flex tw:items-center tw:justify-between tw:gap-2 tw:mb-3!"
                >
                  <div class="tw:text-[14px] tw:font-bold">
                    تیم‌های بدون گروه
                  </div>
                  <v-chip size="x-small" variant="tonal">
                    {{ groupStore.unassignedCount }} تیم
                  </v-chip>
                </div>

                <v-text-field
                  v-model="unassignedQuery"
                  variant="outlined"
                  density="compact"
                  hide-details
                  dir="rtl"
                  class="tw:mb-3!"
                  @update:model-value="onUnassignedSearch"
                >
                  <template #label>
                    <span class="tw:text-[12px]">جستجوی نام تیم</span>
                  </template>
                  <template #prepend-inner>
                    <icon-magnify
                      class="tw:text-[18px] tw:text-color-lighter"
                    />
                  </template>
                </v-text-field>

                <div
                  v-if="
                    groupStore.unassignedLoading &&
                    groupStore.unassignedList.length === 0
                  "
                  class="tw:flex tw:justify-center tw:py-8"
                >
                  <v-progress-circular indeterminate color="primary" />
                </div>

                <div
                  v-else-if="unassignedFailed"
                  class="tw:flex tw:flex-col tw:items-center tw:gap-3 tw:py-8"
                >
                  <div class="tw:text-color-lighter tw:text-[14px]">
                    دریافت تیم‌ها ناموفق بود.
                  </div>
                  <v-btn
                    class="tw:bg-secondary-dark! tw:text-white! tw:rounded-md!"
                    @click="loadUnassigned"
                  >
                    <icon-refresh class="tw:text-[18px]" />
                    <span class="tw:mr-1!">تلاش دوباره</span>
                  </v-btn>
                </div>

                <div
                  v-else
                  class="tw:max-h-[50vh] tw:md:max-h-[70vh] tw:overflow-y-auto"
                >
                  <draggable
                    :model-value="groupStore.unassignedList"
                    item-key="leagueTeamId"
                    group="teams"
                    :sort="false"
                    :disabled="!canEdit"
                    filter=".no-drag"
                    :animation="150"
                    :delay="150"
                    :delay-on-touch-only="true"
                    ghost-class="team-ghost"
                    class="tw:flex tw:flex-col tw:gap-2 tw:min-h-20"
                    @change="onDragChange(null, $event)"
                    @start="isDragging = true"
                    @end="isDragging = false"
                  >
                    <template #item="{ element }">
                      <div
                        :class="[
                          teamRowClass,
                          isDraggable(element) ? 'tw:cursor-grab' : 'no-drag',
                          busyTeamId === element.leagueTeamId ? 'no-drag' : '',
                        ]"
                      >
                        <div
                          class="tw:flex tw:justify-start tw:items-center tw:gap-2 tw:min-w-0"
                        >
                          <v-avatar
                            size="50"
                            class="tw:bg-secondary-dark! tw:p-1!"
                          >
                            <v-img
                              v-if="element.team?.logoUrl"
                              :src="element.team.logoUrl"
                              cover
                            />
                            <v-img v-else :src="defaultTeamLogo" cover />
                          </v-avatar>
                          <div class="tw:min-w-0">
                            <div
                              class="tw:text-[13px] tw:font-medium tw:truncate"
                            >
                              {{ element.team?.name ?? "—" }}
                            </div>
                            <div
                              class="tw:text-[11px] tw:text-color-lighter tw:truncate"
                            >
                              {{ element.organization?.name ?? "—" }}
                            </div>
                          </div>
                        </div>

                        <v-progress-circular
                          v-if="busyTeamId === element.leagueTeamId"
                          indeterminate
                          size="18"
                          width="2"
                          color="primary"
                        />
                        <template v-else-if="canManage">
                          <v-tooltip
                            v-if="groupStore.groupList.length === 0"
                            location="top"
                          >
                            <template #activator="{ props }">
                              <span v-bind="props">
                                <v-btn
                                  size="x-small"
                                  variant="plain"
                                  rounded="pill"
                                  icon
                                  disabled
                                  aria-label="انتقال به گروه"
                                >
                                  <icon-arrow-left
                                    class="tw:text-color-lighter tw:text-[20px]"
                                  />
                                </v-btn>
                              </span>
                            </template>
                            <span class="tw:text-xs tw:p-2"
                              >ابتدا یک گروه بسازید.</span
                            >
                          </v-tooltip>
                          <v-menu v-else>
                            <template #activator="{ props }">
                              <v-btn
                                v-bind="props"
                                size="x-small"
                                variant="plain"
                                rounded="pill"
                                icon
                                :disabled="!canEdit"
                                aria-label="انتقال به گروه"
                                title="انتقال به گروه"
                              >
                                <icon-arrow-left
                                  class="tw:text-color-lighter tw:text-[20px]"
                                />
                              </v-btn>
                            </template>
                            <v-list density="compact" class="tw:py-0!">
                              <v-list-item
                                v-for="g in groupStore.groupList"
                                :key="g.id"
                                @click="moveTeam(element.leagueTeamId, g.id)"
                                class="tw:py-2!"
                              >
                                <v-list-item-title>
                                  <div class="tw:flex tw:items-center tw:gap-2">
                                    <icon-arrow-left class="tw:text-[17px]" />
                                    <div class="tw:text-[12px]!">
                                      {{ g.name }} - {{ g.teamsCount }} تیم
                                    </div>
                                  </div>
                                </v-list-item-title>
                              </v-list-item>
                            </v-list>
                          </v-menu>
                        </template>
                      </div>
                    </template>
                    <template #footer class="">
                      <div
                        v-if="groupStore.unassignedList.length === 0"
                        class="tw:text-center tw:text-color-lighter tw:text-[13px] tw:py-7!"
                      >
                        <template v-if="unassignedQuery"
                          >موردی یافت نشد</template
                        >
                        <template v-else-if="noRegisteredTeams">
                          <div>هنوز تیمی در این لیگ ثبت‌نام نشده است.</div>
                          <v-btn
                            v-if="hasPermission('league-teams.view')"
                            size="small"
                            variant="outlined"
                            class="tw:mt-3!"
                            @click="navigateTo(`/leagues/${league.id}/teams`)"
                          >
                            <icon-users class="tw:text-[16px]" />
                            <span class="tw:mr-1!">مدیریت تیم‌های لیگ</span>
                          </v-btn>
                        </template>
                        <template v-else>
                          همه تیم‌ها در گروه قرار گرفته‌اند.
                        </template>
                      </div>
                    </template>
                  </draggable>

                  <div
                    v-if="hasMoreUnassigned"
                    class="tw:flex tw:justify-center tw:mt-3!"
                  >
                    <v-btn
                      size="small"
                      variant="text"
                      class="tw:text-[12px]!"
                      :loading="groupStore.unassignedLoading"
                      @click="loadMoreUnassigned"
                    >
                      نمایش بیشتر
                    </v-btn>
                  </div>
                </div>
              </v-card>
            </v-col>

            <!-- Groups column (left) -->
            <v-col cols="12" md="8" lg="9">
              <div
                v-if="groupStore.groupList.length === 0"
                class="tw:flex tw:justify-center tw:items-center tw:gap-2 tw:py-16"
              >
                <icon-row-chart class="tw:text-color-lighter tw:text-[35px]" />
                <div class="tw:text-color-lighter tw:text-[14px]">
                  هنوز گروهی ساخته نشده است.
                </div>
              </div>

              <v-row v-else dense>
                <!-- group card -->
                <v-col
                  v-for="group in groupStore.groupList"
                  :key="group.id"
                  cols="12"
                  md="6"
                >
                  <v-card
                    rounded="lg"
                    class="tw:relative! tw:p-4! tw:h-full! tw:flex tw:flex-col"
                    :class="
                      editingId === group.id
                        ? 'tw:border! tw:border-gray-400! tw:dark:border-gray-300!'
                        : ''
                    "
                  >
                    <div
                      class="tw:flex tw:items-center tw:justify-between tw:gap-2"
                    >
                      <div class="tw:text-[15px]! tw:font-bold! tw:truncate">
                        {{ group.name }}
                      </div>
                      <div
                        class="tw:inline-flex tw:items-stretch tw:overflow-hidden tw:rounded-lg tw:border tw:border-gray-300 tw:dark:border-gray-600"
                      >
                        <v-menu :open-on-hover="!mobile" location="bottom end">
                          <template #activator="{ props }">
                            <v-btn
                              v-bind="props"
                              size="small"
                              variant="text"
                              rounded="0"
                              class="tw:min-w-2!"
                              aria-label="اطلاعات گروه"
                              title="اطلاعات گروه"
                            >
                              <icon-info-circle class="tw:text-[16px]" />
                            </v-btn>
                          </template>
                          <v-list density="compact" class="tw:min-w-55!">
                            <v-list-item class="tw:m-h-10!">
                              <div
                                class="tw:flex tw:items-center tw:gap-2 tw:text-[12px]"
                              >
                                <icon-circle
                                  class="tw:text-[10px] tw:text-gray-400"
                                />
                                <span
                                  >{{
                                    group.teamsCount ?? group.teams.length
                                  }}
                                  تیم</span
                                >
                              </div>
                            </v-list-item>
                            <v-list-item class="tw:m-h-10!">
                              <div
                                class="tw:flex tw:items-center tw:gap-2 tw:text-[12px]"
                              >
                                <icon-circle
                                  class="tw:text-[10px]"
                                  :class="
                                    group.qualifiersOverride !== null
                                      ? 'tw:text-sky-500'
                                      : 'tw:text-gray-400'
                                  "
                                />
                                <span>
                                  صعود: {{ group.qualifiers ?? "—" }}
                                  {{
                                    group.qualifiersOverride !== null
                                      ? "(سفارشی)"
                                      : ""
                                  }}
                                </span>
                              </div>
                            </v-list-item>
                            <v-list-item
                              v-for="(issue, i) in group.issues ?? []"
                              :key="`${issue.code}-${i}`"
                              class="tw:m-h-10!"
                            >
                              <div
                                class="tw:flex tw:items-center tw:gap-2 tw:text-[12px]"
                              >
                                <icon-circle
                                  class="tw:text-[10px]"
                                  :class="{
                                    'tw:text-red-500':
                                      issue.severity === 'BLOCKER',
                                    'tw:text-amber-500':
                                      issue.severity === 'WARNING',
                                    'tw:text-sky-500':
                                      issue.severity !== 'BLOCKER' &&
                                      issue.severity !== 'WARNING',
                                  }"
                                />
                                <span>{{ issue.message }}</span>
                              </div>
                            </v-list-item>
                          </v-list>
                        </v-menu>

                        <v-tooltip
                          v-if="hasPermission('groups.update')"
                          location="top"
                        >
                          <template #activator="{ props }">
                            <v-btn
                              v-bind="props"
                              size="small"
                              variant="text"
                              rounded="0"
                              class="tw:min-w-2! tw:border-s! tw:border-gray-300! tw:dark:border-gray-600!"
                              :disabled="!!groupStore.groupLock || mutating"
                              aria-label="ویرایش گروه"
                              @click="openEdit(group)"
                            >
                              <icon-edit-box class="tw:text-[16px]" />
                            </v-btn>
                          </template>
                          <span class="tw:text-xs tw:p-2">ویرایش</span>
                        </v-tooltip>

                        <v-tooltip
                          v-if="hasPermission('groups.delete')"
                          location="top"
                        >
                          <template #activator="{ props }">
                            <v-btn
                              v-bind="props"
                              size="small"
                              variant="text"
                              rounded="0"
                              class="tw:min-w-2! tw:border-s! tw:border-gray-300! tw:dark:border-gray-600!"
                              :disabled="!!groupStore.groupLock || mutating"
                              aria-label="حذف گروه"
                              @click="confirmDelete(group)"
                            >
                              <icon-trash class="tw:text-[16px]" />
                            </v-btn>
                          </template>
                          <span class="tw:text-xs tw:p-2">حذف</span>
                        </v-tooltip>
                      </div>
                    </div>

                    <draggable
                      :model-value="group.teams"
                      item-key="leagueTeamId"
                      group="teams"
                      :sort="false"
                      :disabled="!canEdit"
                      filter=".no-drag"
                      :animation="150"
                      :delay="150"
                      :delay-on-touch-only="true"
                      ghost-class="team-ghost"
                      class="tw:flex tw:flex-col tw:gap-2 tw:mt-3! tw:min-h-20 tw:flex-1"
                      @change="onDragChange(group.id, $event)"
                      @start="isDragging = true"
                      @end="isDragging = false"
                    >
                      <template #item="{ element }">
                        <div
                          :class="[
                            teamRowClass,
                            element.teamStatus === 'DELETED'
                              ? 'tw:opacity-60'
                              : '',
                            isDraggable(element) ? 'tw:cursor-grab' : 'no-drag',
                            busyTeamId === element.leagueTeamId
                              ? 'no-drag'
                              : '',
                          ]"
                        >
                          <div
                            class="tw:flex tw:justify-start tw:items-center tw:gap-2 tw:min-w-0"
                          >
                            <v-avatar
                              size="40"
                              class="tw:bg-secondary-dark! tw:p-1!"
                            >
                              <v-img
                                v-if="element.team?.logoUrl"
                                :src="element.team.logoUrl"
                                cover
                              />
                              <v-img v-else :src="defaultTeamLogo" cover />
                            </v-avatar>
                            <div class="tw:min-w-0">
                              <v-tooltip
                                location="top"
                                :disabled="mobile || isDragging"
                              >
                                <template #activator="{ props }">
                                  <div
                                    v-bind="props"
                                    class="tw:text-[13px] tw:font-medium tw:truncate"
                                  >
                                    {{ element.team?.name ?? "—" }}
                                  </div>
                                </template>
                                <span class="tw:text-xs tw:p-2">
                                  {{ element.organization?.name ?? "—" }}
                                </span>
                              </v-tooltip>
                              <div
                                v-if="mobile"
                                class="tw:text-[11px] tw:text-color-lighter tw:truncate"
                              >
                                {{ element.organization?.name ?? "—" }}
                              </div>
                            </div>
                            <v-chip
                              v-if="element.teamStatus === 'DELETED'"
                              size="x-small"
                              variant="tonal"
                            >
                              حذف‌شده
                            </v-chip>
                          </div>

                          <v-progress-circular
                            v-if="busyTeamId === element.leagueTeamId"
                            indeterminate
                            size="18"
                            width="2"
                            color="primary"
                          />
                          <div
                            v-else-if="canManage && !isDragging"
                            class="tw:flex tw:items-center tw:shrink-0"
                            :class="actionsClass"
                          >
                            <v-menu v-if="groupStore.groupList.length > 1">
                              <template #activator="{ props }">
                                <v-btn
                                  v-bind="props"
                                  size="x-small"
                                  variant="plain"
                                  rounded="pill"
                                  icon
                                  :disabled="!canEdit"
                                  aria-label="انتقال به گروه دیگر"
                                  title="انتقال به گروه دیگر"
                                >
                                  <icon-sync
                                    class="tw:text-color-lighter tw:text-[20px]"
                                  />
                                </v-btn>
                              </template>
                              <v-list density="compact" class="tw:py-0!">
                                <v-list-item
                                  v-for="g in groupStore.groupList.filter(
                                    (x: any) => x.id !== group.id,
                                  )"
                                  :key="g.id"
                                  @click="moveTeam(element.leagueTeamId, g.id)"
                                  class="tw:py-2!"
                                >
                                  <v-list-item-title class="tw:text-[12px]!">
                                    {{ g.name }} - {{ g.teamsCount }} تیم
                                  </v-list-item-title>
                                </v-list-item>
                              </v-list>
                            </v-menu>
                            <v-btn
                              v-else
                              size="x-small"
                              variant="plain"
                              rounded="pill"
                              icon
                              disabled
                              aria-label="انتقال به گروه دیگر"
                            >
                              <icon-sync
                                class="tw:text-color-lighter tw:text-[20px]"
                              />
                            </v-btn>

                            <v-btn
                              size="x-small"
                              variant="plain"
                              rounded="pill"
                              icon
                              :disabled="!canEdit"
                              aria-label="حذف از گروه"
                              title="حذف از گروه"
                              @click="moveTeam(element.leagueTeamId, null)"
                            >
                              <icon-close
                                class="tw:text-color-lighter tw:text-[20px]"
                              />
                            </v-btn>
                          </div>
                        </div>
                      </template>
                      <template #footer>
                        <div
                          v-if="group.teams.length === 0"
                          class="tw:flex tw:flex-1! tw:min-h-35! tw:justify-center tw:items-center tw:text-center tw:text-color-lighter tw:text-[12px] tw:py-6 tw:border tw:border-dashed tw:border-gray-300 tw:dark:border-gray-600 tw:rounded-lg"
                        >
                          <div
                            class="tw:flex tw:flex-col tw:justify-center tw:items-center tw:gap-1 tw:text-gray-500 tw:dark:text-gray-400"
                          >
                            <icon-exchange class="tw:text-[25px]!" />
                            <div>
                              {{
                                canManage
                                  ? "تیمی را به اینجا بکشید یا از دکمه انتقال استفاده کنید."
                                  : "این گروه تیمی ندارد."
                              }}
                            </div>
                          </div>
                        </div>
                      </template>
                    </draggable>
                  </v-card>
                </v-col>
              </v-row>
            </v-col>
          </v-row>

          <template #fallback>
            <div class="tw:flex tw:justify-center tw:py-16">
              <v-progress-circular indeterminate color="primary" />
            </div>
          </template>
        </ClientOnly>
      </template>
    </template>

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
            <div class="tw:text-[14px]! tw:text-white">حذف گروه</div>
            <div>
              <v-btn
                icon
                variant="plain"
                size="x-small"
                aria-label="بستن"
                @click="deleteDialogOpen = false"
              >
                <icon-close class="tw:text-[18px] tw:text-white!" />
              </v-btn>
            </div>
          </div>
        </v-card-title>
        <v-card-text class="tw:text-[16px]! tw:text-center!">
          آیا از حذف «{{ deleteTarget?.name }}» مطمئن هستید؟
          <div
            v-if="deleteTarget?.teams?.length"
            class="tw:text-gray-600 tw:dark:text-gray-300 tw:text-[13px]! tw:mt-2!"
          >
            {{ deleteTarget.teams.length }} تیم این گروه بدون گروه می‌شوند.
          </div>
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
import draggable from "vuedraggable";
import { useDisplay } from "vuetify";
import { useGroupStore } from "~/store/group";
import { useLeagueStore } from "~/store/league";
import { useHandlerStore } from "~/store/handler";
import { useDeopdownStore } from "~/store/dropdown";
import defaultTeamLogo from "~/assets/image/icon/team.png";

const groupStore = useGroupStore();
const leagueStore = useLeagueStore();
const handlerStore = useHandlerStore();
const dropdownStore = useDeopdownStore();

const route = useRoute();
const router = useRouter();
const { mobile } = useDisplay();

// ─── Permissions ──
const { hasPermission } = usePermission();

const { setPageTitle } = usePageTitle();
watchEffect(() => {
  setPageTitle("مدیریت مسابقات");
});

// ─── Status vocabulary (mirrors the leagues page) ──
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
    default:
      return "default";
  }
};

// ─── League selector ──
const selectedLeagueId = ref<number | null>(null);
const league = ref<any>(null);
const pageState = ref<"idle" | "loading" | "ready" | "error">("idle");
let leagueSearchTimeout: ReturnType<typeof setTimeout> | null = null;
let loadToken = 0;
let loadedLeagueId: number | null = null;

const leagueLabel = (item: any) =>
  `${item.name} — ${item.season?.name ?? "—"} — ${item.ageCategory?.name ?? "—"}`;

const leagueOptions = computed(() => {
  const list = [...dropdownStore.leaguesResult];
  if (
    league.value &&
    selectedLeagueId.value === league.value.id &&
    !list.some((o) => o.value === league.value.id)
  ) {
    list.unshift({
      value: league.value.id,
      label: leagueLabel(league.value),
      status: league.value.status,
    });
  }
  return list;
});

const loadLeagueOptions = (search?: string) =>
  dropdownStore.getLeagueDropdown({
    page: 1,
    pageSize: 20,
    ...(search ? { search } : {}),
  });

const onLeagueSearch = (text: string) => {
  // Vuetify emits the chosen title right after a selection — ignore it.
  const selected = leagueOptions.value.find(
    (o) => o.value === selectedLeagueId.value,
  );
  if (selected && text === selected.label) return;

  if (leagueSearchTimeout) clearTimeout(leagueSearchTimeout);
  leagueSearchTimeout = setTimeout(() => {
    loadLeagueOptions(text);
  }, 300);
};

const onLeagueSelect = (id: number | null) => {
  router.replace({ query: id ? { leagueId: String(id) } : {} });
};

// ─── URL sync ──
const routeLeagueId = computed<number | null>(() => {
  const n = Number(route.query.leagueId);
  return Number.isInteger(n) && n > 0 ? n : null;
});

watch(routeLeagueId, (id) => {
  if (!hasPermission("groups.view")) return;
  if (id === loadedLeagueId) return;
  loadLeague(id);
});

// ─── Derived data (lock and format come from the response only) ──
const format = computed<string | null>(
  () => groupStore.groupLeague?.format ?? null,
);
const isGroupedFormat = computed(
  () =>
    format.value === "GROUPS_KNOCKOUT" ||
    format.value === "SINGLE_GROUP_KNOCKOUT",
);
const isSingleGroup = computed(() => format.value === "SINGLE_GROUP_KNOCKOUT");

const mutating = ref<boolean>(false);
const busyTeamId = ref<number | null>(null);
const isDragging = ref<boolean>(false);

const canManage = computed(
  () =>
    hasPermission("groups.update") &&
    groupStore.groupLock === null &&
    isGroupedFormat.value,
);
const canEdit = computed(() => canManage.value && !mutating.value);

const isDraggable = (team: any) =>
  canEdit.value && team.teamStatus !== "DELETED";

const formatLabel = computed(
  () =>
    dropdownStore.leagueFormats.find((f) => f.value === format.value)?.label ??
    format.value ??
    "—",
);
const roundTypeLabel = computed(
  () =>
    dropdownStore.groupRoundTypes.find(
      (r) => r.value === league.value?.groupRoundType,
    )?.label ??
    league.value?.groupRoundType ??
    "—",
);
const qualifiersLabel = computed(() =>
  isSingleGroup.value ? "تعداد کل صعودکننده‌ها" : "تعداد صعودکننده هر گروه",
);
const qualifiersPlaceholder = computed(() => {
  const d = groupStore.groupLeague?.defaultQualifiersPerGroup;
  return d != null ? `خالی = پیش‌فرض لیگ (${d})` : "";
});
const minBirthDate = computed(
  () =>
    league.value?.minBirthDate ??
    league.value?.ageCategoryCutoff?.minBirthDate ??
    "—",
);

const assignedCount = computed(() =>
  groupStore.groupList.reduce(
    (s: number, g: any) => s + (g.teamsCount ?? 0),
    0,
  ),
);
const totalQualifiers = computed(() => {
  if (groupStore.groupList.some((g: any) => g.qualifiers == null)) return "—";
  return groupStore.groupList.reduce(
    (s: number, g: any) => s + g.qualifiers,
    0,
  );
});
const noRegisteredTeams = computed(
  () => (league.value?.teamsCount ?? 0) === 0 && assignedCount.value === 0,
);

// ─── Data Loading ──
const unassignedQuery = ref<string>("");
const unassignedFailed = ref<boolean>(false);
let unassignedTimeout: ReturnType<typeof setTimeout> | null = null;
const UNASSIGNED_PAGE_SIZE = 100;

const resetLocal = () => {
  league.value = null;
  groupStore.groupList = [];
  groupStore.groupLeague = null;
  groupStore.groupLock = null;
  groupStore.groupIssues = [];
  groupStore.unassignedCount = 0;
  groupStore.unassignedList = [];
  groupStore.unassignedMeta = null;
  unassignedQuery.value = "";
  unassignedFailed.value = false;
  mutating.value = false;
  busyTeamId.value = null;
  deleteDialogOpen.value = false;
  deleteTarget.value = null;
  openCreateMode();
};

const unassignedParams = (pageNo: number) => ({
  page: pageNo,
  pageSize: UNASSIGNED_PAGE_SIZE,
  ...(unassignedQuery.value ? { search: unassignedQuery.value } : {}),
});

const loadUnassigned = () => {
  const id = selectedLeagueId.value;
  if (!id) return Promise.resolve();
  return groupStore.getUnassignedTeams(id, unassignedParams(1)).then((ok) => {
    unassignedFailed.value = !ok;
  });
};

const onUnassignedSearch = () => {
  if (unassignedTimeout) clearTimeout(unassignedTimeout);
  unassignedTimeout = setTimeout(() => {
    loadUnassigned();
  }, 300);
};

const hasMoreUnassigned = computed(
  () =>
    groupStore.unassignedList.length < (groupStore.unassignedMeta?.total ?? 0),
);

const loadMoreUnassigned = () => {
  const id = selectedLeagueId.value;
  if (!id) return;
  const previous = [...groupStore.unassignedList];
  const nextPage = (groupStore.unassignedMeta?.page ?? 1) + 1;
  groupStore.getUnassignedTeams(id, unassignedParams(nextPage)).then((ok) => {
    if (!ok) return;
    const seen = new Set(previous.map((t: any) => t.leagueTeamId));
    groupStore.unassignedList = [
      ...previous,
      ...groupStore.unassignedList.filter(
        (t: any) => !seen.has(t.leagueTeamId),
      ),
    ];
  });
};

const loadLeague = (id: number | null) => {
  const token = ++loadToken;
  loadedLeagueId = id;
  selectedLeagueId.value = id;
  resetLocal();

  if (!id) {
    pageState.value = "idle";
    return;
  }

  pageState.value = "loading";
  Promise.all([leagueStore.getLeagueById(id), groupStore.getGroups(id)]).then(
    ([lg, ok]) => {
      if (token !== loadToken) return;
      if (!lg || !ok) {
        pageState.value = "error";
        return;
      }
      league.value = lg;
      pageState.value = "ready";
      if (isGroupedFormat.value) loadUnassigned();
    },
  );
};

// Silent refetch (no spinner, form kept) — also the recovery path after failures.
const refreshData = (withLeague = false) => {
  const id = selectedLeagueId.value;
  if (!id) return Promise.resolve();
  const token = loadToken;
  const tasks: Promise<any>[] = [groupStore.getGroups(id)];
  if (withLeague) {
    tasks.push(
      leagueStore.getLeagueById(id).then((lg) => {
        if (token === loadToken && lg) league.value = lg;
      }),
    );
  }
  return Promise.all(tasks).then(([ok]) => {
    if (token !== loadToken) return;
    if (ok && isGroupedFormat.value) return loadUnassigned();
  });
};

const onRefresh = () => {
  refreshData(true);
};

// ─── Create / Edit ──
const editingId = ref<number | null>(null);
const formRef = ref<any>(null);
const formCardRef = ref<any>(null);

const defaultForm = () => ({
  name: "",
  qualifiersOverride: "" as string | number,
});

const form = reactive(defaultForm());

const formBlock = computed<{ type: "info" | "warning"; text: string } | null>(
  () => {
    if (editingId.value) return null;
    if (!hasPermission("groups.create"))
      return { type: "info", text: "برای ویرایش، دکمه ویرایش گروه را بزنید." };
    if (groupStore.groupLock)
      return { type: "warning", text: groupStore.groupLock.message };
    if (!isGroupedFormat.value)
      return { type: "info", text: "ابتدا ساختار مسابقات را تعیین کنید." };
    if (isSingleGroup.value && groupStore.groupList.length >= 1)
      return { type: "info", text: "در این ساختار فقط یک گروه مجاز است." };
    return null;
  },
);

const openCreateMode = () => {
  editingId.value = null;
  Object.assign(form, defaultForm());
};

const openEdit = (group: any) => {
  editingId.value = group.id;
  form.name = group.name ?? "";
  form.qualifiersOverride = group.qualifiersOverride ?? "";
  if (mobile.value) {
    nextTick(() => {
      formCardRef.value?.$el?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  }
};

// Leave edit mode when a lock appears or the edited group disappears.
watch(
  () => [groupStore.groupLock, groupStore.groupList],
  () => {
    if (!editingId.value) return;
    const exists = groupStore.groupList.some(
      (g: any) => g.id === editingId.value,
    );
    if (groupStore.groupLock || !exists) openCreateMode();
  },
);

const onFormSubmit = () => {
  const leagueId = selectedLeagueId.value;
  if (!leagueId) return;

  const name = String(form.name ?? "").trim();
  if (!name) {
    handlerStore.setError("لطفا تمام فیلدهای الزامی را پر کنید.");
    return;
  }
  if (name.length < 2 || name.length > 100) {
    handlerStore.setError("نام گروه باید بین ۲ تا ۱۰۰ کاراکتر باشد.");
    return;
  }

  const raw = form.qualifiersOverride;
  const empty = raw === "" || raw === null || raw === undefined;
  const qualifiers = Number(raw);
  if (
    !empty &&
    (!Number.isInteger(qualifiers) || qualifiers < 1 || qualifiers > 64)
  ) {
    handlerStore.setError("تعداد صعودکننده باید بین ۱ تا ۶۴ باشد.");
    return;
  }

  formRef.value!.validate().then(({ valid }: { valid: boolean }) => {
    if (!valid) return;

    const request = editingId.value
      ? // Edit always sends both fields; null clears the override.
        groupStore.updateGroup(leagueId, editingId.value, {
          name,
          qualifiersOverride: empty ? null : qualifiers,
        })
      : groupStore.createGroup(leagueId, {
          name,
          ...(empty ? {} : { qualifiersOverride: qualifiers }),
        });

    request.then((ok) => {
      if (ok) openCreateMode();
      // Also surfaces a lock that appeared in the meantime.
      refreshData();
    });
  });
};

// ─── Delete ──
const deleteDialogOpen = ref<boolean>(false);
const deleteTarget = ref<any>(null);

const confirmDelete = (group: any) => {
  deleteTarget.value = group;
  deleteDialogOpen.value = true;
};

const onDeleteConfirm = () => {
  const leagueId = selectedLeagueId.value;
  const target = deleteTarget.value;
  if (!leagueId || !target) return;

  groupStore.deleteGroup(leagueId, target.id).then((data) => {
    deleteDialogOpen.value = false;
    deleteTarget.value = null;
    if (data && editingId.value === target.id) openCreateMode();
    refreshData();
  });
};

// ─── Move team ──
const teamRowClass =
  "tw:group tw:flex tw:justify-between tw:items-center tw:gap-2 tw:rounded-lg! tw:p-3! tw:shadow-none! tw:border! tw:border-gray-300! tw:dark:border-gray-600!";

const actionsClass = computed(() =>
  mobile.value
    ? ""
    : "tw:opacity-0 tw:group-hover:opacity-100 tw:group-focus-within:opacity-100 tw:transition-opacity",
);

const sortUnassigned = (list: any[]) =>
  [...list].sort((a, b) => a.leagueTeamId - b.leagueTeamId);

const setGroupTeams = (groupId: number, teams: any[]) => {
  groupStore.groupList = groupStore.groupList.map((g: any) =>
    g.id === groupId ? { ...g, teams, teamsCount: teams.length } : g,
  );
};

const findTeam = (leagueTeamId: number) => {
  for (const g of groupStore.groupList) {
    const team = g.teams.find((t: any) => t.leagueTeamId === leagueTeamId);
    if (team) return { team, fromGroupId: g.id as number | null };
  }
  const team = groupStore.unassignedList.find(
    (t: any) => t.leagueTeamId === leagueTeamId,
  );
  return team ? { team, fromGroupId: null as number | null } : null;
};

// Buttons and drag & drop both end up here.
const moveTeam = (leagueTeamId: number, toGroupId: number | null) => {
  const leagueId = selectedLeagueId.value;
  if (!leagueId || !canEdit.value) return Promise.resolve();

  const found = findTeam(leagueTeamId);
  if (!found) return Promise.resolve();
  const { team, fromGroupId } = found;
  if (fromGroupId === toGroupId) return Promise.resolve();

  mutating.value = true;
  busyTeamId.value = leagueTeamId;

  const snapshot = {
    groups: groupStore.groupList.map((g: any) => ({
      ...g,
      teams: [...g.teams],
    })),
    unassigned: [...groupStore.unassignedList],
    unassignedCount: groupStore.unassignedCount,
  };

  // Optimistic local change; the team always lands at the end of a group.
  if (fromGroupId !== null) {
    const src = groupStore.groupList.find((g: any) => g.id === fromGroupId);
    setGroupTeams(
      fromGroupId,
      src.teams.filter((t: any) => t.leagueTeamId !== leagueTeamId),
    );
  } else {
    groupStore.unassignedList = groupStore.unassignedList.filter(
      (t: any) => t.leagueTeamId !== leagueTeamId,
    );
    groupStore.unassignedCount = Math.max(0, groupStore.unassignedCount - 1);
  }
  if (toGroupId !== null) {
    const dst = groupStore.groupList.find((g: any) => g.id === toGroupId);
    setGroupTeams(toGroupId, [...dst.teams, team]);
  } else {
    groupStore.unassignedList = sortUnassigned([
      ...groupStore.unassignedList,
      team,
    ]);
    groupStore.unassignedCount += 1;
  }

  const request =
    toGroupId !== null
      ? groupStore.assignTeam(leagueId, toGroupId, leagueTeamId)
      : groupStore.unassignTeam(leagueId, fromGroupId as number, leagueTeamId);

  return request.then((data: any) => {
    if (data) {
      (data.affectedGroups ?? []).forEach((a: any) => {
        const g = groupStore.groupList.find((x: any) => x.id === a.id);
        if (g) {
          g.teamsCount = a.teamsCount;
          g.qualifiers = a.qualifiers;
          g.issues = a.issues ?? [];
        }
      });
      if (data.unassignedCount !== undefined)
        groupStore.unassignedCount = data.unassignedCount;
      if (data.issues) groupStore.groupIssues = data.issues;
      mutating.value = false;
      busyTeamId.value = null;
      return;
    }

    // Failure: roll back, then always refetch (covers 404 / 409 / network).
    groupStore.groupList = snapshot.groups;
    groupStore.unassignedList = snapshot.unassigned;
    groupStore.unassignedCount = snapshot.unassignedCount;
    mutating.value = false;
    busyTeamId.value = null;
    return refreshData();
  });
};

const onDragChange = (groupId: number | null, evt: any) => {
  // Sorting is disabled (:sort="false"); ignore within-list reorder
  // events so a drop always appends the team at the end of the group.
  if (evt?.moved) return;
  if (evt?.added?.element) {
    moveTeam(evt.added.element.leagueTeamId, groupId);
  }
};

// ─── Edit structure (deep link into the leagues page) ──
const goEditStructure = () => {
  if (!league.value) return;
  navigateTo(`/leagues?editLeagueId=${league.value.id}&tab=format`);
};

// ─── Init ──
onMounted(() => {
  if (!hasPermission("groups.view")) return;

  if (dropdownStore.leagueFormats.length === 0) {
    dropdownStore.getLeagueFormats();
  }
  if (dropdownStore.groupRoundTypes.length === 0) {
    dropdownStore.getGroupRoundTypes();
  }

  loadLeagueOptions();
  if (routeLeagueId.value) loadLeague(routeLeagueId.value);
});
</script>

<style>
.team-ghost {
  opacity: 0.5;
}
</style>
