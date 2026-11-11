<template>
  <div dir="rtl">
    <!-- ── competition.view guard ── -->
    <v-row v-if="!hasPermission('competition.view')">
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
                        {{ defaultQualifiers ?? "—" }}
                      </div>
                    </div>
                  </v-col>
                </v-row>
              </div>

              <!-- league action -->
              <div class="tw:flex tw:flex-wrap tw:items-center tw:justify-between tw:gap-2 tw:mt-4!">
                <div
                  v-if="hasBothViews"
                  class="tw:inline-flex tw:items-stretch tw:overflow-hidden tw:rounded-lg tw:border tw:border-gray-300 tw:dark:border-gray-600 tw:me-auto"
                >
                  <v-btn
                    size="small"
                    variant="text"
                    rounded="0"
                    class="tw:px-8! tw:w-8!"
                    :class="
                      activeView === 'groups'
                        ? 'tw:bg-secondary-dark! tw:text-white!'
                        : ''
                    "
                    @click="activeView = 'groups'"
                  >
                    <icon-layer class="tw:text-[16px]" />
                    <span class="tw:text-[12px] tw:ms-1!">گروه‌ها</span>
                  </v-btn>
                  <v-btn
                    size="small"
                    variant="text"
                    rounded="0"
                    class="tw:px-8! tw:w-8! tw:border-s! tw:border-gray-300! tw:dark:border-gray-600!"
                    :class="
                      activeView === 'games'
                        ? 'tw:bg-secondary-dark! tw:text-white!'
                        : ''
                    "
                    @click="activeView = 'games'"
                  >
                    <icon-cup class="tw:text-[16px]" />
                    <span class="tw:text-[12px] tw:ms-1!">بازی‌ها</span>
                  </v-btn>
                </div>

                <div class="tw:flex tw:justify-end tw:items-center tw:gap-2">
                <v-btn
                  v-if="hasPermission('leagues.update')"
                  variant="text"
                  rounded="lg"
                  size="small"
                  @click="goEditStructure"
                  class="tw:border! tw:border-gray-300! tw:dark:border-gray-600!"
                >
                  <icon-edit-box class="tw:text-[16px]" />
                  <span class="tw:text-[12px] tw:ms-1!">ویرایش ساختار</span>
                </v-btn>

                <v-btn
                  v-if="hasPermission('league-teams.view')"
                  variant="text"
                  rounded="lg"
                  size="small"
                  @click="navigateTo(`/leagues/${league.id}/teams`)"
                  class="tw:border! tw:border-gray-300! tw:dark:border-gray-600!"
                >
                  <icon-users class="tw:text-[16px]" />
                  <span class="tw:text-[12px] tw:ms-1!"
                    >مدیریت تیم‌های لیگ</span
                  >
                </v-btn>
                </div>
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
                  v-if="canGroups && groupStore.groupLock"
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
                  <template v-if="isGroupedFormat && canGroups">
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
                  v-if="canGroups && groupStore.groupIssues.length"
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
                  activeView === 'groups' &&
                  (hasPermission('groups.create') ||
                    hasPermission('groups.update'))
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

              <template
                v-else-if="
                  activeView === 'games' &&
                  (hasPermission('games.create') ||
                    hasPermission('games.update'))
                "
              >
                <v-divider />

                <v-card-title
                  dir="rtl"
                  class="tw:flex! tw:items-center! tw:gap-1! tw:text-[14px]! tw:font-bold! tw:mb-2! tw:mt-2!"
                >
                  <icon-plus
                    v-if="gameFormMode === 'create'"
                    class="tw:text-[20px]"
                  />
                  <icon-edit-box v-else class="tw:text-[20px]" />
                  <span>{{ gameFormTitle }}</span>
                </v-card-title>

                <v-card-text>
                  <!-- قفل «ساخت بازی» (فقط حالت ثبت/برگزاری مجدد) -->
                  <v-alert
                    v-if="gameFormMode !== 'edit' && gameStore.gameLock"
                    type="warning"
                    variant="tonal"
                    density="compact"
                    class="tw:text-[12px]!"
                  >
                    {{ gameStore.gameLock.message }}
                  </v-alert>

                  <v-form v-else ref="gameFormRef">
                    <!-- حالت ویرایش: فقط خواندنی -->
                    <div
                      v-if="gameFormMode === 'edit' && editingGame"
                      class="tw:text-[13px] tw:mb-3!"
                    >
                      {{ editingGame.homeTeam.team.name }} -
                      {{ editingGame.awayTeam.team.name }}
                      <v-chip
                        v-if="editingGame.group"
                        size="x-small"
                        variant="tonal"
                        class="tw:ms-1!"
                      >
                        {{ editingGame.group.name }}
                      </v-chip>
                    </div>

                    <v-alert
                      v-if="gameFormMode === 'reschedule' && rescheduleSource"
                      type="info"
                      variant="tonal"
                      density="compact"
                      class="tw:text-[12px]! tw:mb-3!"
                    >
                      برگزاری مجدد بازی کنسل‌شده‌ی شماره
                      {{ rescheduleSource.id }}
                    </v-alert>

                    <template v-if="gameFormMode !== 'edit'">
                      <v-row>
                        <v-col cols="12" lg="4" class="tw-pt-2! lg:tw:pt-2!">
                          <v-select
                            v-model="gameForm.groupId"
                            :items="formGroupOptions"
                            item-title="title"
                            item-value="value"
                            variant="outlined"
                            density="compact"
                            hide-details
                            dir="rtl"
                            :disabled="gameFormMode === 'reschedule'"
                            :rules="[(v: any) => !!v || '']"
                            @update:model-value="onFormGroupChange"
                          >
                            <template #label>
                              <span class="tw:text-[12px]">گروه</span>
                              <span
                                class="tw:text-red-900 tw:dark:text-red-400 tw:text-[10px]"
                              >
                                (الزامی)
                              </span>
                            </template>
                          </v-select>
                        </v-col>

                        <v-col cols="12" lg="4" class="tw-pt-0! lg:tw:pt-2!">
                          <v-select
                            v-model="gameForm.homeId"
                            :items="homeOptions"
                            item-title="title"
                            item-value="value"
                            variant="outlined"
                            density="compact"
                            hide-details
                            dir="rtl"
                            :disabled="
                              !gameForm.groupId || gameFormMode === 'reschedule'
                            "
                            :rules="[(v: any) => !!v || '']"
                          >
                            <template #label>
                              <span class="tw:text-[12px]">تیم میزبان</span>
                              <span
                                class="tw:text-red-900 tw:dark:text-red-400 tw:text-[10px]"
                              >
                                (الزامی)
                              </span>
                            </template>
                          </v-select>
                        </v-col>

                        <v-col cols="12" lg="4" class="tw-pt-0! lg:tw:pt-2!">
                          <v-select
                            v-model="gameForm.awayId"
                            :items="awayOptions"
                            item-title="title"
                            item-value="value"
                            variant="outlined"
                            density="compact"
                            hide-details
                            dir="rtl"
                            :disabled="
                              !gameForm.groupId || gameFormMode === 'reschedule'
                            "
                            :rules="[(v: any) => !!v || '']"
                          >
                            <template #label>
                              <span class="tw:text-[12px]">تیم میهمان</span>
                              <span
                                class="tw:text-red-900 tw:dark:text-red-400 tw:text-[10px]"
                              >
                                (الزامی)
                              </span>
                            </template>
                          </v-select>
                        </v-col>

                        <!-- راهنمای سهمیه (فقط راهنما؛ بک‌اند مرجع نهایی است) -->
                        <v-col v-if="pairCount !== null" cols="12" class="tw:pt-0!">
                          <v-chip
                            size="small"
                            variant="tonal"
                            :color="pairBlocked ? 'error' : 'default'"
                            class="tw:text-[12px]!"
                          >
                            <span class="tw:flex tw:items-center tw:gap-1.5">
                              <icon-circle class="tw:text-[8px] tw:text-red-500" />
                              <span>
                                {{ pairCount }} از {{ pairMax }} بازی بین این دو
                                تیم ثبت شده است
                              </span>
                            </span>
                          </v-chip>
                        </v-col>
                      </v-row>
                    </template>

                    <!-- تاریخ و ساعت: در هر سه حالت -->
                    <v-row>
                      <v-col cols="12" lg="6" class="tw:pt-0!">
                        <div class="tw:relative!">
                          <label
                            v-if="gameForm.date"
                            for="gameDate"
                            class="tw:text-[11px] tw:absolute! tw:bg-white! tw:dark:bg-primary-dark! tw:start-3 tw:-top-1.75 tw:z-10! tw:text-color-reverse"
                          >
                            <span class="tw:text-[12px]">تاریخ بازی</span>
                          </label>
                          <date-picker
                            v-model="gameForm.date"
                            id="gameDate"
                            simple
                            clearable
                            placeholder="تاریخ بازی"
                            format="jYYYY/jMM/jDD"
                            display-format="jYYYY/jMM/jDD"
                            class="default-scroll tw:text-gray-300! tw:text-[14px]! tw:text-center!"
                            color="#1d202e"
                          />
                        </div>
                      </v-col>

                      <v-col cols="12" lg="6" class="tw:pt-0!">
                        <div class="tw:relative! " >
                          <label
                            v-if="gameForm.time"
                            for="gameTime"
                            class="tw:text-[11px] tw:absolute! tw:bg-white! tw:dark:bg-primary-dark! tw:start-3 tw:-top-1.75 tw:z-10! tw:text-color-reverse"
                          >
                            <span class="tw:text-[12px]">ساعت بازی</span>
                          </label>
                          <date-picker
                            v-model="gameForm.time"
                            id="gameTime"
                            type="time"
                            clearable
                            placeholder="ساعت بازی"
                            format="HH:mm"
                            display-format="HH:mm"
                            class="default-scroll tw:text-gray-300! tw:text-[14px]! tw:text-center!"
                            color="#1d202e"
                          />
                        </div>
                      </v-col>
                    </v-row>

                    <v-row class="tw:mt-1!">
                      <v-col :cols="gameFormMode === 'create' ? '12' : '6'">
                        <v-btn
                          block
                          :loading="handlerStore.loadingBtn"
                          :disabled="
                            handlerStore.loadingBtn ||
                            (gameFormMode !== 'edit' && pairBlocked)
                          "
                          class="tw:bg-secondary-dark! tw:dark:bg-secondary-dark! tw:text-white! tw:rounded-md!"
                          @click="onGameFormSubmit"
                        >
                          <icon-check class="tw:text-[18px]" />
                          <span class="tw:mr-1!">{{
                            gameFormMode === "edit" ? "ذخیره" : "افزودن"
                          }}</span>
                        </v-btn>
                      </v-col>
                      <v-col v-if="gameFormMode !== 'create'" cols="6">
                        <v-btn
                          block
                          variant="outlined"
                          class="tw:text-[12px]!"
                          @click="resetGameForm"
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

        <!-- ── No accessible view ── -->
        <div
          v-if="!canGroups && !canGames"
          class="tw:flex tw:justify-center tw:items-center tw:gap-2 tw:py-16!"
        >
          <icon-lock class="tw:text-color-lighter tw:text-[35px]" />
          <div class="tw:text-color-lighter tw:text-[14px]">
            برای مشاهده‌ی بخش‌های این صفحه دسترسی لازم را ندارید.
          </div>
        </div>

        <!-- ── Groups view ── -->
        <template v-else-if="activeView === 'groups'">

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
                                :disabled="!!g.lock"
                                :subtitle="g.lock?.message"
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
                      <div class="tw:min-w-0">
                        <div class="tw:text-[15px]! tw:font-bold! tw:truncate">
                          {{ group.name }}
                        </div>
                        <div
                          v-if="group.gamesCount > 0"
                          class="tw:text-[11px] tw:text-color-lighter tw:truncate"
                        >
                          {{ group.finishedGamesCount }} از {{ group.gamesCount }} بازی
                          دارای نتیجه
                        </div>
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
                            <v-list-item v-if="group.lock" class="tw:m-h-10!">
                              <div
                                class="tw:flex tw:items-center tw:gap-2 tw:text-[12px]"
                              >
                                <icon-circle
                                  class="tw:text-[10px] tw:text-red-500"
                                />
                                <span>{{ group.lock.message }}</span>
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

                        <v-tooltip v-if="canGames" location="top">
                          <template #activator="{ props }">
                            <v-btn
                              v-bind="props"
                              size="small"
                              variant="text"
                              rounded="0"
                              class="tw:min-w-2! tw:border-s! tw:border-gray-300! tw:dark:border-gray-600!"
                              aria-label="بازی‌های این گروه"
                              @click="openGroupGames(group.id)"
                            >
                              <icon-list class="tw:text-[16px]" />
                            </v-btn>
                          </template>
                          <span class="tw:text-xs tw:p-2">بازی‌های این گروه</span>
                        </v-tooltip>

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
                              :disabled="
                                !!group.lock || !!groupStore.groupLock || mutating
                              "
                              aria-label="حذف گروه"
                              @click="confirmDelete(group)"
                            >
                              <icon-trash class="tw:text-[16px]" />
                            </v-btn>
                          </template>
                          <span class="tw:text-xs tw:p-2">{{
                            group.lock?.message ?? "حذف"
                          }}</span>
                        </v-tooltip>
                      </div>
                    </div>

                    <draggable
                      :model-value="group.teams"
                      item-key="leagueTeamId"
                      :group="{
                        name: 'teams',
                        pull: !group.lock,
                        put: !group.lock,
                      }"
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
                                  :disabled="!canEdit || !!group.lock"
                                  aria-label="انتقال به گروه دیگر"
                                  :title="group.lock?.message ?? 'انتقال به گروه دیگر'"
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
                                  :disabled="!!g.lock"
                                  :subtitle="g.lock?.message"
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
                              :disabled="!canEdit || !!group.lock"
                              aria-label="حذف از گروه"
                              :title="group.lock?.message ?? 'حذف از گروه'"
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

        <!-- ── Games view ── -->
        <template v-else-if="activeView === 'games' && canGames">
          <v-row class="tw:my-2!">
            <!-- Filters card -->
            <v-col cols="12" xl="7">
              <v-card class="tw:rounded-xl! tw:h-full!">
            <v-card-text>
              <div
                class="tw:flex tw:justify-start tw:items-center tw:gap-1 tw:text-secondary-dark tw:dark:text-white tw:mb-4!"
              >
                <icon-filter class="tw:text-[20px]" />
                <div class="tw:text-[14px]! tw:font-bold!">فیلترها</div>
              </div>
              <v-row align="center">
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="gameFilters.search"
                    variant="outlined"
                    density="compact"
                    hide-details
                    dir="rtl"
                    @update:model-value="onGameSearchChange"
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
                </v-col>

                <v-col cols="6" md="3">
                  <v-select
                    v-model="gameFilters.groupId"
                    :items="dropdownStore.leagueGroupsResult"
                    item-title="label"
                    item-value="value"
                    variant="outlined"
                    density="compact"
                    hide-details
                    dir="rtl"
                    clearable
                    no-data-text="موردی یافت نشد"
                    @update:model-value="onGameGroupFilterChange"
                  >
                    <template #label>
                      <span class="tw:text-[12px]">گروه</span>
                    </template>
                  </v-select>
                </v-col>

                <v-col cols="6" sm="3">
                  <v-select
                    v-model="gameFilters.status"
                    :items="dropdownStore.gameStatuses"
                    item-title="label"
                    item-value="value"
                    variant="outlined"
                    density="compact"
                    hide-details
                    dir="rtl"
                    clearable
                    no-data-text="موردی یافت نشد"
                    @update:model-value="onGameFilterChange"
                  >
                    <template #label>
                      <span class="tw:text-[12px]">وضعیت</span>
                    </template>
                  </v-select>
                </v-col>

                <v-col cols="12" md="3">
                  <v-autocomplete
                    v-model="gameFilters.leagueTeamId"
                    :items="dropdownStore.leagueTeamsResult"
                    item-title="label"
                    item-value="value"
                    :item-props="teamItemProps"
                    variant="outlined"
                    density="compact"
                    hide-details
                    dir="rtl"
                    clearable
                    no-data-text="موردی یافت نشد"
                    @update:model-value="onGameFilterChange"
                  >
                    <template #label>
                      <span class="tw:text-[12px]">تیم</span>
                    </template>
                  </v-autocomplete>
                </v-col>

                <v-col cols="6" md="3">
                  <div class="tw:relative!">
                    <label
                      v-if="gameFilters.dateFrom"
                      for="gameFilterFrom"
                      class="tw:text-[11px] tw:absolute! tw:bg-white! tw:dark:bg-primary-dark! tw:start-3 tw:-top-1.75 tw:z-10! tw:text-color-reverse"
                      >از تاریخ</label
                    >
                    <date-picker
                      v-model="gameFilters.dateFrom"
                      id="gameFilterFrom"
                      simple
                      clearable
                      placeholder="از تاریخ"
                      format="jYYYY/jMM/jDD"
                      display-format="jYYYY/jMM/jDD"
                      class="default-scroll tw:text-gray-300! tw:text-[14px]! tw:text-center!"
                      color="#1d202e"
                      @change="onGameDateChange"
                    />
                  </div>
                </v-col>

                <v-col cols="6" md="3">
                  <div class="tw:relative!">
                    <label
                      v-if="gameFilters.dateTo"
                      for="gameFilterTo"
                      class="tw:text-[11px] tw:absolute! tw:bg-white! tw:dark:bg-primary-dark! tw:start-3 tw:-top-1.75 tw:z-10! tw:text-color-reverse"
                      >تا تاریخ</label
                    >
                    <date-picker
                      v-model="gameFilters.dateTo"
                      id="gameFilterTo"
                      simple
                      clearable
                      placeholder="تا تاریخ"
                      format="jYYYY/jMM/jDD"
                      display-format="jYYYY/jMM/jDD"
                      class="default-scroll tw:text-gray-300! tw:text-[14px]! tw:text-center!"
                      color="#1d202e"
                      @change="onGameDateChange"
                    />
                  </div>
                </v-col>

                <v-col cols="12" md="3" class="tw:flex! tw:items-center! tw:justify-center!">
                  <v-switch
                    v-model="gameFilters.resultPending"
                    color="secondary"
                    density="compact"
                    hide-details
                    @update:model-value="onGameFilterChange"
                  >
                    <template #label>
                      <span class="tw:text-[12px]">فقط نتیجه‌ی ثبت‌نشده</span>
                    </template>
                  </v-switch>
                </v-col>
              </v-row>
            </v-card-text>
              </v-card>
            </v-col>

            <!-- Summary card -->
            <v-col v-if="gameStore.gameSummary" cols="12" xl="5">
              <v-card class="tw:rounded-xl! tw:h-full!">
                <v-card-text>
                  <div
                    class="tw:flex tw:justify-start tw:items-center tw:gap-1 tw:text-secondary-dark tw:dark:text-white tw:mb-4!"
                  >
                    <icon-chart class="tw:text-[20px]" />
                    <div class="tw:text-[14px]! tw:font-bold!">خلاصه بازی‌ها</div>
                  </div>
                  <v-row>
                    <v-col
                      v-for="s in dropdownStore.gameStatuses"
                      :key="s.value"
                      cols="6"
                    >
                      <div
                        class="tw:p-4! tw:rounded-md tw:flex tw:justify-center tw:items-center! tw:gap-2 tw:border tw:h-full"
                        :class="summaryBoxClass(s.value)"
                      >
                        <icon-date
                          v-if="s.value === 'SCHEDULED'"
                          class="tw:text-[20px]"
                        />
                        <icon-hourglass
                          v-else-if="s.value === 'LIVE'"
                          class="tw:text-[20px]"
                        />
                        <icon-check-circle
                          v-else-if="s.value === 'FINISHED'"
                          class="tw:text-[20px]"
                        />
                        <icon-close-circle v-else class="tw:text-[20px]" />
                        <div class="tw:text-[13px]!">
                          {{ s.label }}:
                          <span class="tw:font-bold!">
                            {{ gameStore.gameSummary.byStatus?.[s.value] ?? 0 }}
                          </span>
                        </div>
                      </div>
                    </v-col>
                  </v-row>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>

          <!-- Create lock -->
          <v-alert
            v-if="gameStore.gameLock"
            type="warning"
            variant="tonal"
            density="compact"
            class="tw:text-[12px]! tw:mb-4!"
          >
            {{ gameStore.gameLock.message }}
          </v-alert>

          <!-- Loading / empty -->
          <div
            v-if="gameStore.loading && gameStore.gameList.length === 0"
            class="tw:flex tw:justify-center tw:py-16"
          >
            <v-progress-circular indeterminate color="primary" />
          </div>

          <div
            v-else-if="gameStore.gameList.length === 0"
            class="tw:flex tw:justify-center tw:items-center tw:gap-2 tw:py-16"
          >
            <icon-row-chart class="tw:text-color-lighter tw:text-[35px]" />
            <div class="tw:text-color-lighter tw:text-[14px]">
              اطلاعاتی یافت نشد
            </div>
          </div>

          <!-- Game cards -->
          <v-row v-else dense>
            <v-col
              v-for="game in gameStore.gameList"
              :key="game.id"
              cols="12"
              md="6"
              lg="4"
            >
              <v-card
                rounded="lg"
                class="tw:p-4! tw:h-full!"
                :class="[
                  hasIssue(game, 'RESULT_PENDING')
                    ? 'tw:border-2! tw:border-orange-400!'
                    : '',
                  game.status === 'CANCELED' ? 'tw:opacity-70' : '',
                ]"
              >
                <div
                  class="tw:flex tw:items-center tw:justify-between tw:gap-2"
                >
                  <div
                    class="tw:flex tw:items-center tw:gap-1 tw:text-[12px] tw:text-gray-600 tw:dark:text-gray-300 tw:min-w-0"
                  >
                    <icon-date class="tw:text-[16px] tw:shrink-0" />
                    <span class="tw:truncate">
                      {{ game.scheduledDate ?? "تاریخ نامشخص" }}
                      <template v-if="game.scheduledTime">
                        - {{ game.scheduledTime }}
                      </template>
                    </span>
                  </div>
                  <div class="tw:flex tw:items-center tw:gap-1 tw:shrink-0">
                    <v-chip v-if="game.group" size="x-small" variant="tonal">
                      {{ game.group.name }}
                    </v-chip>
                    <v-tooltip location="top" :disabled="!game.cancelReason">
                      <template #activator="{ props }">
                        <v-chip
                          v-bind="props"
                          size="x-small"
                          variant="tonal"
                          :color="gameStatusColor(game.status)"
                        >
                          {{ gameStatusLabel(game.status) }}
                        </v-chip>
                      </template>
                      <span class="tw:text-xs tw:p-2">{{ game.cancelReason }}</span>
                    </v-tooltip>
                  </div>
                </div>

                <!-- Teams row -->
                <div
                  class="tw:flex tw:items-center tw:justify-between tw:gap-2 tw:mt-4!"
                >
                  <!-- Home (right) -->
                  <div
                    class="tw:flex tw:flex-col tw:items-center tw:gap-1 tw:flex-1 tw:min-w-0 tw:text-center"
                  >
                    <v-avatar size="44" class="tw:bg-secondary-dark! tw:p-1!">
                      <v-img
                        :src="game.homeTeam.team.logoUrl || defaultTeamLogo"
                        cover
                      />
                    </v-avatar>
                    <div
                      class="tw:text-[13px] tw:truncate tw:w-full"
                      :class="[
                        isWinner(game, game.homeTeam) ? 'tw:font-bold!' : '',
                        game.status === 'CANCELED' ? 'tw:line-through' : '',
                        game.homeTeam.teamStatus === 'DELETED'
                          ? 'tw:opacity-60'
                          : '',
                      ]"
                    >
                      {{ game.homeTeam.team.name }}
                    </div>
                    <div
                      class="tw:text-[11px] tw:text-color-lighter tw:truncate tw:w-full"
                    >
                      {{ game.homeTeam.organization?.name ?? "—" }}
                    </div>
                  </div>

                  <!-- Center: score or VS -->
                  <div class="tw:flex tw:flex-col tw:items-center tw:gap-1">
                    <div
                      v-if="game.homeScore !== null"
                      class="tw:flex tw:items-center tw:gap-1"
                    >
                      <div
                        class="tw:px-4! tw:py-2! tw:rounded-md tw:text-[16px]"
                        :class="
                          isWinner(game, game.homeTeam)
                            ? 'tw:bg-green-100 tw:dark:bg-green-900/30 tw:font-bold'
                            : 'tw:bg-gray-100 tw:dark:bg-gray-700'
                        "
                      >
                        {{ game.homeScore }}
                      </div>
                      <span>:</span>
                      <div
                        class="tw:px-4! tw:py-2! tw:rounded-md tw:text-[16px]"
                        :class="
                          isWinner(game, game.awayTeam)
                            ? 'tw:bg-green-100 tw:dark:bg-green-900/30 tw:font-bold'
                            : 'tw:bg-gray-100 tw:dark:bg-gray-700'
                        "
                      >
                        {{ game.awayScore }}
                      </div>
                    </div>
                    <div v-else class="tw:text-[14px] tw:text-color-lighter">VS</div>
                    <div
                      v-if="game.scheduledTime"
                      class="tw:text-[11px] tw:text-color-lighter"
                    >
                      {{ game.scheduledTime }}
                    </div>
                  </div>

                  <!-- Away (left) -->
                  <div
                    class="tw:flex tw:flex-col tw:items-center tw:gap-1 tw:flex-1 tw:min-w-0 tw:text-center"
                  >
                    <v-avatar size="44" class="tw:bg-secondary-dark! tw:p-1!">
                      <v-img
                        :src="game.awayTeam.team.logoUrl || defaultTeamLogo"
                        cover
                      />
                    </v-avatar>
                    <div
                      class="tw:text-[13px] tw:truncate tw:w-full"
                      :class="[
                        isWinner(game, game.awayTeam) ? 'tw:font-bold!' : '',
                        game.status === 'CANCELED' ? 'tw:line-through' : '',
                        game.awayTeam.teamStatus === 'DELETED'
                          ? 'tw:opacity-60'
                          : '',
                      ]"
                    >
                      {{ game.awayTeam.team.name }}
                    </div>
                    <div
                      class="tw:text-[11px] tw:text-color-lighter tw:truncate tw:w-full"
                    >
                      {{ game.awayTeam.organization?.name ?? "—" }}
                    </div>
                  </div>
                </div>
                <div class="tw:flex tw:justify-end tw:mt-6!">
                  <div
                    class="tw:inline-flex tw:items-stretch tw:overflow-hidden tw:rounded-lg tw:border tw:border-gray-300 tw:dark:border-gray-600"
                  >
                    <v-tooltip location="top">
                      <template #activator="{ props: tooltipProps }">
                        <span v-bind="tooltipProps">
                          <v-menu :open-on-hover="!mobile" location="bottom end">
                          <template #activator="{ props: menuProps }">
                            <v-btn
                              v-bind="menuProps"
                              size="small"
                              variant="text"
                              rounded="0"
                              class="tw:min-w-2!"
                              aria-label="اطلاعات بازی"
                            >
                              <icon-info-circle class="tw:text-[16px]" />
                            </v-btn>
                          </template>
                          <v-list density="compact" class="tw:min-w-55!">
                            <v-list-item class="tw:m-h-10!">
                              <div class="tw:flex tw:items-center tw:gap-2 tw:text-[12px]">
                                <icon-circle class="tw:text-[10px] tw:text-gray-400" />
                                <span>{{ game.homeTeam.team.name }} - {{ game.awayTeam.team.name }}</span>
                              </div>
                            </v-list-item>
                            <v-list-item class="tw:m-h-10!">
                              <div class="tw:flex tw:items-center tw:gap-2 tw:text-[12px]">
                                <icon-circle class="tw:text-[10px] tw:text-gray-400" />
                                <span>
                                  {{ game.scheduledDate ?? "تاریخ نامشخص" }}
                                  <template v-if="game.scheduledTime">
                                    - {{ game.scheduledTime }}
                                  </template>
                                </span>
                              </div>
                            </v-list-item>
                            <v-list-item v-if="game.group" class="tw:m-h-10!">
                              <div class="tw:flex tw:items-center tw:gap-2 tw:text-[12px]">
                                <icon-circle class="tw:text-[10px] tw:text-gray-400" />
                                <span>گروه: {{ game.group.name }}</span>
                              </div>
                            </v-list-item>
                            <v-list-item class="tw:m-h-10!">
                              <div class="tw:flex tw:items-center tw:gap-2 tw:text-[12px]">
                                <icon-circle class="tw:text-[10px] tw:text-gray-400" />
                                <span>
                                  وضعیت: {{ gameStatusLabel(game.status) }}
                                  <template v-if="game.cancelReason">
                                    - {{ game.cancelReason }}
                                  </template>
                                </span>
                              </div>
                            </v-list-item>
                            <v-list-item v-if="game.resultType === 'FORFEIT'" class="tw:m-h-10!">
                              <div class="tw:flex tw:items-center tw:gap-2 tw:text-[12px]">
                                <icon-circle class="tw:text-[10px] tw:text-gray-400" />
                                <span>فورفیت: تیم {{ forfeitTeamName(game) }} حاضر نشد؛ نتیجه {{ Math.max(game.homeScore, game.awayScore) }} بر {{ Math.min(game.homeScore, game.awayScore) }} ثبت شده است.</span>
                              </div>
                            </v-list-item>
                            <v-list-item v-if="game.rescheduledTo" class="tw:m-h-10!">
                              <div class="tw:flex tw:items-center tw:gap-2 tw:text-[12px]">
                                <icon-circle class="tw:text-[10px] tw:text-gray-400" />
                                <span>این بازی کنسل شده است؛ بازی جایگزین: شماره {{ game.rescheduledTo.id }}.</span>
                              </div>
                            </v-list-item>
                            <v-list-item v-if="game.rescheduledFrom" class="tw:m-h-10!">
                              <div class="tw:flex tw:items-center tw:gap-2 tw:text-[12px]">
                                <icon-circle class="tw:text-[10px] tw:text-gray-400" />
                                <span>این بازی جایگزین بازی کنسل‌شده‌ی شماره {{ game.rescheduledFrom.id }} است.</span>
                              </div>
                            </v-list-item>
                            <v-list-item v-if="hasIssue(game, 'RESULT_PENDING')" class="tw:m-h-10!">
                              <div class="tw:flex tw:items-center tw:gap-2 tw:text-[12px] tw:text-orange-600">
                                <icon-circle class="tw:text-[10px] tw:text-orange-500" />
                                <span>تاریخ بازی گذشته و نتیجه ثبت نشده است.</span>
                              </div>
                            </v-list-item>
                            <v-list-item v-for="(issue, i) in otherIssues(game)" :key="`${issue.code}-${i}`" class="tw:m-h-10!">
                              <div class="tw:flex tw:items-center tw:gap-2 tw:text-[12px]">
                                <icon-circle
                                  class="tw:text-[10px]"
                                  :class="{
                                    'tw:text-red-500': issue.severity === 'BLOCKER',
                                    'tw:text-amber-500': issue.severity === 'WARNING',
                                    'tw:text-sky-500': issue.severity !== 'BLOCKER' && issue.severity !== 'WARNING',
                                  }"
                                />
                                <span>{{ issue.message }}</span>
                              </div>
                            </v-list-item>
                          </v-list>
                          </v-menu>
                        </span>
                      </template>
                      <span class="tw:text-xs tw:p-2">اطلاعات بازی</span>
                    </v-tooltip>

                    <template v-for="a in gameCardActions(game)" :key="a.key">
                      <v-tooltip location="top">
                        <template #activator="{ props }">
                          <span v-bind="props">
                            <v-btn
                              size="small"
                              variant="text"
                              rounded="0"
                              class="tw:min-w-2! tw:border-s! tw:border-gray-300! tw:dark:border-gray-600!"
                              :disabled="!!a.lock"
                              :aria-label="a.title"
                              @click="a.run()"
                            >
                              <icon-refresh v-if="a.key === 'reschedule'" class="tw:text-[16px]" />
                              <icon-document-edit v-else-if="a.key === 'result'" class="tw:text-[16px]" />
                              <icon-date v-else-if="a.key === 'schedule'" class="tw:text-[16px]" />
                              <icon-check-circle v-else-if="a.key === 'start'" class="tw:text-[16px]" />
                              <icon-close-circle v-else-if="a.key === 'cancel'" class="tw:text-[16px]" />
                              <icon-close v-else-if="a.key === 'clear'" class="tw:text-[16px]" />
                              <icon-trash v-else-if="a.key === 'delete'" class="tw:text-[16px]" />
                            </v-btn>
                          </span>
                        </template>
                        <span class="tw:text-xs tw:p-2">{{ a.lock?.message ?? a.title }}</span>
                      </v-tooltip>
                    </template>
                  </div>
                </div>
              </v-card>
            </v-col>
          </v-row>

          <v-card
            v-if="gameTotal > gamePageSize"
            rounded="lg"
            class="tw:mt-4!"
          >
            <Pagination
              v-model:page="gamePage"
              v-model:items-per-page="gamePageSize"
              :items-length="gameTotal"
              @update-options="onGamesOptionsChange"
            />
          </v-card>
        </template>
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

    <!-- ─── Game Result Dialog ── -->
    <v-dialog
      v-model="resultDialogOpen"
      max-width="460"
      dir="rtl"
      class="blur-dialog"
    >
      <v-card v-if="resultTarget" rounded="lg">
        <v-card-title
          class="tw:bg-secondary-dark tw:dark:bg-primary-dark! tw:mb-3!"
        >
          <div class="tw:flex tw:justify-between tw:items-center">
            <div class="tw:invisible">
              <v-btn
                icon
                variant="plain"
                size="x-small"
                @click="resultDialogOpen = false"
              >
                <icon-close class="tw:text-[18px] tw:text-white!" />
              </v-btn>
            </div>
            <div class="tw:text-[14px]! tw:text-white">
              {{
                resultTarget.status === "FINISHED" ? "ویرایش نتیجه" : "ثبت نتیجه"
              }}
            </div>
            <div>
              <v-btn
                icon
                variant="plain"
                size="x-small"
                aria-label="بستن"
                @click="resultDialogOpen = false"
              >
                <icon-close class="tw:text-[18px] tw:text-white!" />
              </v-btn>
            </div>
          </div>
        </v-card-title>

        <v-card-text>
          <div
            class="tw:flex tw:items-center tw:justify-center tw:gap-3 tw:text-[13px] tw:font-bold tw:mb-4!"
          >
            <span>{{ resultTarget.homeTeam.team.name }}</span>
            <span class="tw:text-color-lighter">VS</span>
            <span>{{ resultTarget.awayTeam.team.name }}</span>
          </div>

          <div class="tw:flex tw:items-center tw:gap-2 tw:mb-4!">
            <v-btn
              block
              class="tw:flex-1"
              rounded="lg"
              size="small"
              :variant="resultForm.type === 'NORMAL' ? 'flat' : 'outlined'"
              :class="
                resultForm.type === 'NORMAL'
                  ? 'tw:bg-secondary-dark! tw:text-white!'
                  : ''
              "
              @click="resultForm.type = 'NORMAL'"
            >
              <span class="tw:text-[12px]">عادی</span>
            </v-btn>
            <v-btn
              block
              class="tw:flex-1"
              rounded="lg"
              size="small"
              :variant="resultForm.type === 'FORFEIT' ? 'flat' : 'outlined'"
              :class="
                resultForm.type === 'FORFEIT'
                  ? 'tw:bg-secondary-dark! tw:text-white!'
                  : ''
              "
              @click="resultForm.type = 'FORFEIT'"
            >
              <span class="tw:text-[12px]">فورفیت</span>
            </v-btn>
          </div>

          <template v-if="resultForm.type === 'NORMAL'">
            <v-row>
              <v-col cols="6">
                <v-text-field
                  v-model="resultForm.homeScore"
                  type="number"
                  min="0"
                  step="1"
                  variant="outlined"
                  density="compact"
                  hide-details
                  dir="rtl"
                  :error="resultIsTie"
                >
                  <template #label>
                    <span class="tw:text-[12px]">{{
                      resultTarget.homeTeam.team.name
                    }}</span>
                  </template>
                </v-text-field>
              </v-col>
              <v-col cols="6">
                <v-text-field
                  v-model="resultForm.awayScore"
                  type="number"
                  min="0"
                  step="1"
                  variant="outlined"
                  density="compact"
                  hide-details
                  dir="rtl"
                  :error="resultIsTie"
                >
                  <template #label>
                    <span class="tw:text-[12px]">{{
                      resultTarget.awayTeam.team.name
                    }}</span>
                  </template>
                </v-text-field>
              </v-col>
            </v-row>
            <div
              v-if="resultIsTie"
              class="tw:text-[12px] tw:text-red-700 tw:dark:text-red-400 tw:mt-2!"
            >
              در بسکتبال نتیجه‌ی مساوی ثبت نمی‌شود.
            </div>
          </template>

          <template v-else>
            <div class="tw:text-[12px] tw:mb-1!">تیم فورفیت‌کننده</div>
            <v-radio-group v-model="resultForm.forfeitId" hide-details>
              <v-radio :value="resultTarget.homeTeam.leagueTeamId">
                <template #label>
                  <span class="tw:text-[13px]">{{
                    resultTarget.homeTeam.team.name
                  }}</span>
                </template>
              </v-radio>
              <v-radio :value="resultTarget.awayTeam.leagueTeamId">
                <template #label>
                  <span class="tw:text-[13px]">{{
                    resultTarget.awayTeam.team.name
                  }}</span>
                </template>
              </v-radio>
            </v-radio-group>
            <div
              v-if="forfeitPreview"
              class="tw:text-[12px] tw:text-color-lighter tw:mt-2!"
            >
              {{ forfeitPreview }}
            </div>
          </template>

          <v-textarea
            v-model="resultForm.note"
            rows="2"
            auto-grow
            variant="outlined"
            density="compact"
            hide-details
            dir="rtl"
            class="tw:mt-4!"
          >
            <template #label>
              <span class="tw:text-[12px]">یادداشت نتیجه (اختیاری)</span>
            </template>
          </v-textarea>
        </v-card-text>

        <v-card-actions class="tw:justify-end!">
          <v-btn
            variant="text"
            class="tw:text-[12px]!"
            @click="resultDialogOpen = false"
          >
            انصراف
          </v-btn>
          <v-btn
            class="tw:bg-secondary-dark! tw:dark:bg-secondary-dark! tw:text-white! tw:rounded-md!"
            :loading="handlerStore.loadingBtn"
            :disabled="resultIsTie || handlerStore.loadingBtn"
            @click="onResultSubmit"
          >
            <icon-check class="tw:text-[18px]" />
            <span class="tw:mr-1! tw:text-[12px]! tw:px-2!">ثبت</span>
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- ─── Game Cancel Dialog ── -->
    <v-dialog
      v-model="cancelDialogOpen"
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
                @click="cancelDialogOpen = false"
              >
                <icon-close class="tw:text-[18px] tw:text-white!" />
              </v-btn>
            </div>
            <div class="tw:text-[14px]! tw:text-white">لغو بازی</div>
            <div>
              <v-btn
                icon
                variant="plain"
                size="x-small"
                aria-label="بستن"
                @click="cancelDialogOpen = false"
              >
                <icon-close class="tw:text-[18px] tw:text-white!" />
              </v-btn>
            </div>
          </div>
        </v-card-title>
        <v-card-text>
          <div
            v-if="cancelTarget"
            class="tw:text-[13px] tw:text-center tw:mb-4!"
          >
            لغو بازی «{{ cancelTarget.homeTeam.team.name }} - {{
              cancelTarget.awayTeam.team.name
            }}»
          </div>
          <v-textarea
            v-model="cancelReason"
            rows="2"
            auto-grow
            variant="outlined"
            density="compact"
            hide-details
            dir="rtl"
          >
            <template #label>
              <span class="tw:text-[12px]">دلیل لغو (اختیاری)</span>
            </template>
          </v-textarea>
        </v-card-text>
        <v-card-actions class="tw:justify-end!">
          <v-btn
            variant="text"
            class="tw:text-[12px]!"
            @click="cancelDialogOpen = false"
          >
            انصراف
          </v-btn>
          <v-btn
            class="tw:bg-secondary-dark! tw:dark:bg-secondary-dark! tw:text-white! tw:rounded-md!"
            :loading="handlerStore.loadingBtn"
            :disabled="handlerStore.loadingBtn"
            @click="onCancelConfirm"
          >
            <icon-check class="tw:text-[18px]" />
            <span class="tw:mr-1! tw:text-[12px]! tw:px-2!">تأیید لغو</span>
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- ─── Game Confirm Dialog (start / clear result / delete) ── -->
    <v-dialog
      v-model="confirmOpen"
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
                @click="confirmOpen = false"
              >
                <icon-close class="tw:text-[18px] tw:text-white!" />
              </v-btn>
            </div>
            <div class="tw:text-[14px]! tw:text-white">
              {{ confirmTexts[confirmType].title }}
            </div>
            <div>
              <v-btn
                icon
                variant="plain"
                size="x-small"
                aria-label="بستن"
                @click="confirmOpen = false"
              >
                <icon-close class="tw:text-[18px] tw:text-white!" />
              </v-btn>
            </div>
          </div>
        </v-card-title>
        <v-card-text class="tw:text-[16px]! tw:text-center!">
          {{ confirmTexts[confirmType].text }}
          <div
            v-if="confirmTarget"
            class="tw:text-gray-600 tw:dark:text-gray-300 tw:text-[13px]! tw:mt-2!"
          >
            {{ confirmTarget.homeTeam.team.name }} -
            {{ confirmTarget.awayTeam.team.name }}
          </div>
        </v-card-text>
        <v-card-actions class="tw:justify-end!">
          <v-btn
            variant="text"
            class="tw:text-[12px]!"
            @click="confirmOpen = false"
          >
            انصراف
          </v-btn>
          <v-btn
            class="tw:bg-secondary-dark! tw:dark:bg-secondary-dark! tw:text-white! tw:rounded-md!"
            :loading="handlerStore.loadingBtn"
            :disabled="handlerStore.loadingBtn"
            @click="onConfirm"
          >
            <icon-trash v-if="confirmType === 'delete'" class="tw:text-[18px]" />
            <icon-check v-else class="tw:text-[18px]" />
            <span class="tw:mr-1! tw:text-[12px]! tw:px-2!">{{
              confirmTexts[confirmType].btn
            }}</span>
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
import { useGameStore } from "~/store/game";
import { useLeagueStore } from "~/store/league";
import { useHandlerStore } from "~/store/handler";
import { useDeopdownStore } from "~/store/dropdown";
import defaultTeamLogo from "~/assets/image/icon/team.png";

const groupStore = useGroupStore();
const gameStore = useGameStore();
const leagueStore = useLeagueStore();
const handlerStore = useHandlerStore();
const dropdownStore = useDeopdownStore();

const route = useRoute();
const router = useRouter();
const { mobile } = useDisplay();

// ─── Permissions ──
const { hasPermission } = usePermission();

const canGroups = computed(() => hasPermission("groups.view"));
const canGames = computed(() => hasPermission("games.view"));

// Main view switch: groups board or games list.
const activeView = ref<"groups" | "games">(
  canGroups.value ? "groups" : "games",
);

// When only one view is permitted the switch buttons are hidden.
const hasBothViews = computed(() => canGroups.value && canGames.value);

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
  if (!hasPermission("competition.view")) return;
  if (id === loadedLeagueId) return;
  loadLeague(id);
});

// ─── Derived data (lock and format come from the response only) ──
const format = computed<string | null>(
  () => league.value?.format ?? groupStore.groupLeague?.format ?? null,
);
const defaultQualifiers = computed(
  () =>
    league.value?.defaultQualifiersPerGroup ??
    groupStore.groupLeague?.defaultQualifiersPerGroup ??
    null,
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
  const d = defaultQualifiers.value;
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
  gameStore.resetGames();
  dropdownStore.clearLeagueDropdowns();
  resetGameFilters();
  resetGameForm();
  gamePage.value = 1;
  resultDialogOpen.value = false;
  cancelDialogOpen.value = false;
  confirmOpen.value = false;
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
  // Groups are only requested when the user may view them.
  Promise.all([
    leagueStore.getLeagueById(id),
    canGroups.value ? groupStore.getGroups(id) : Promise.resolve(true),
  ]).then(([lg, ok]) => {
    if (token !== loadToken) return;
    if (!lg || !ok) {
      pageState.value = "error";
      return;
    }
    league.value = lg;
    pageState.value = "ready";
    if (canGroups.value && isGroupedFormat.value) loadUnassigned();
    if (activeView.value === "games") loadGames();
    loadFilterOptions();
  });
};

// Silent refetch (no spinner, form kept) — also the recovery path after failures.
const refreshData = (withLeague = false) => {
  const id = selectedLeagueId.value;
  if (!id) return Promise.resolve();
  const token = loadToken;
  const groupsTask: Promise<boolean> = canGroups.value
    ? groupStore.getGroups(id)
    : Promise.resolve(false);
  const leagueTask: Promise<any> = withLeague
    ? leagueStore.getLeagueById(id).then((lg) => {
        if (token === loadToken && lg) league.value = lg;
      })
    : Promise.resolve();
  return Promise.all([groupsTask, leagueTask]).then(([ok]) => {
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
      loadFilterOptions();
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
    loadFilterOptions();
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

  // A group that already has games keeps its teams fixed.
  const srcGroup = groupStore.groupList.find((g: any) => g.id === fromGroupId);
  const dstGroup = groupStore.groupList.find((g: any) => g.id === toGroupId);
  const lock = srcGroup?.lock ?? dstGroup?.lock;
  if (lock) {
    handlerStore.setError(lock.message);
    return Promise.resolve();
  }

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

// ─── Games: filters & list ──
const gameFilters = reactive({
  search: "",
  groupId: null as number | null,
  status: null as string | null,
  leagueTeamId: null as number | null,
  dateFrom: "",
  dateTo: "",
  resultPending: false,
});
const gamePage = ref<number>(1);
const gamePageSize = ref<number>(12); // multiple of 2 and 3
const gameTotal = computed(() => gameStore.gameListMeta?.total ?? 0);

// Key of the last fetch; drops duplicate Pagination echoes (like organizations/teams).
let lastGamesKey = `${gamePage.value}:${gamePageSize.value}`;

const loadGames = () => {
  const id = selectedLeagueId.value;
  if (!id || !canGames.value) return;
  lastGamesKey = `${gamePage.value}:${gamePageSize.value}`;

  const params: Record<string, any> = {
    page: gamePage.value,
    pageSize: gamePageSize.value,
  };
  if (gameFilters.search) params.search = gameFilters.search;
  if (gameFilters.groupId) params.groupId = gameFilters.groupId;
  if (gameFilters.status) params.status = gameFilters.status;
  if (gameFilters.leagueTeamId) params.leagueTeamId = gameFilters.leagueTeamId;
  if (gameFilters.dateFrom) params.dateFrom = gameFilters.dateFrom;
  if (gameFilters.dateTo) params.dateTo = gameFilters.dateTo;
  if (gameFilters.resultPending) params.resultPending = "true";

  return gameStore.getGames(id, params);
};

const onGamesOptionsChange = (options: {
  page: number;
  itemsPerPage: number;
}) => {
  const key = `${options.page}:${options.itemsPerPage}`;
  if (key === lastGamesKey) return;
  gamePage.value = options.page;
  gamePageSize.value = options.itemsPerPage;
  loadGames();
};

const onGameFilterChange = () => {
  gamePage.value = 1;
  loadGames();
};

let gameSearchTimeout: ReturnType<typeof setTimeout> | null = null;
const onGameSearchChange = () => {
  if (gameSearchTimeout) clearTimeout(gameSearchTimeout);
  gameSearchTimeout = setTimeout(onGameFilterChange, 300);
};

const onGameGroupFilterChange = () => {
  const id = selectedLeagueId.value;
  if (id) {
    dropdownStore.getLeagueTeamDropdown(id, gameFilters.groupId).then(() => {
      const ok = dropdownStore.leagueTeamsResult.some(
        (t) => t.value === gameFilters.leagueTeamId,
      );
      if (!ok && gameFilters.leagueTeamId !== null) {
        gameFilters.leagueTeamId = null;
        onGameFilterChange();
      }
    });
  }
  onGameFilterChange();
};

const onGameDateChange = () => {
  if (
    gameFilters.dateFrom &&
    gameFilters.dateTo &&
    gameFilters.dateFrom > gameFilters.dateTo // zero-padded Jalali strings compare correctly
  ) {
    handlerStore.setError("تاریخ شروع نمی‌تواند بعد از تاریخ پایان باشد.");
    return;
  }
  onGameFilterChange();
};

const resetGameFilters = () =>
  Object.assign(gameFilters, {
    search: "",
    groupId: null,
    status: null,
    leagueTeamId: null,
    dateFrom: "",
    dateTo: "",
    resultPending: false,
  });

const teamItemProps = (t: any) => ({
  title: t.label,
  subtitle: t.organizationName ?? undefined,
});

const loadFilterOptions = () => {
  const id = selectedLeagueId.value;
  if (!id || !canGames.value) return;
  dropdownStore.getLeagueGroupDropdown(id);
  dropdownStore.getLeagueTeamDropdown(id, gameFilters.groupId);
};

// After every successful game change: list, group counters/locks and dropdowns.
const onGamesChanged = () => {
  loadGames();
  refreshData(true);
  loadFilterOptions();
};

// ─── Games: card helpers ──
const gameStatusLabel = (v: string) =>
  dropdownStore.gameStatuses.find((s) => s.value === v)?.label ?? v;

const gameStatusColor = (v: string) =>
  (
    ({
      SCHEDULED: "info",
      LIVE: "warning",
      FINISHED: "success",
    }) as Record<string, string>
  )[v] ?? "default";

// Summary box colors mirror the status chip colors (icon + text).
const summaryBoxClass = (v: string) =>
  (
    {
      SCHEDULED:
        "tw:bg-sky-50 tw:dark:bg-sky-900/20 tw:border-sky-200 tw:dark:border-sky-800 tw:text-sky-700 tw:dark:text-sky-300",
      LIVE: "tw:bg-amber-50 tw:dark:bg-amber-900/20 tw:border-amber-200 tw:dark:border-amber-800 tw:text-amber-700 tw:dark:text-amber-300",
      FINISHED:
        "tw:bg-green-50 tw:dark:bg-green-900/20 tw:border-green-200 tw:dark:border-green-800 tw:text-green-700 tw:dark:text-green-300",
      CANCELED:
        "tw:bg-gray-50 tw:dark:bg-gray-800 tw:border-gray-200 tw:dark:border-gray-600 tw:text-gray-600 tw:dark:text-gray-300",
    } as Record<string, string>
  )[v] ??
  "tw:bg-gray-50 tw:dark:bg-gray-800 tw:border-gray-200 tw:dark:border-gray-600 tw:text-gray-600 tw:dark:text-gray-300";

// The winner always comes from winnerLeagueTeamId, never from the scores.
const isWinner = (game: any, team: any) =>
  game.winnerLeagueTeamId !== null &&
  game.winnerLeagueTeamId === team.leagueTeamId;

const forfeitTeamName = (game: any) =>
  [game.homeTeam, game.awayTeam].find(
    (t) => t.leagueTeamId === game.forfeitLeagueTeamId,
  )?.team.name ?? "—";

const hasIssue = (game: any, code: string) =>
  (game.issues ?? []).some((i: any) => i.code === code);
const otherIssues = (game: any) =>
  (game.issues ?? []).filter((i: any) => i.code !== "RESULT_PENDING");

const gameCardActions = (game: any) => {
  const list: {
    key: string;
    title: string;
    lock: any;
    run: () => void;
  }[] = [];

  const reschedule =
    game.status === "CANCELED" &&
    !game.rescheduledTo &&
    hasPermission("games.create")
      ? {
          key: "reschedule",
          title: "برگزاری مجدد",
          lock: gameStore.gameLock,
          run: () => openReschedule(game),
        }
      : null;
  if (reschedule) list.push(reschedule);

  const result =
    game.status !== "CANCELED" && hasPermission("games.result")
      ? {
          key: "result",
          title:
            game.status === "FINISHED" ? "ویرایش نتیجه" : "ثبت نتیجه",
          lock: game.resultLock,
          run: () => openResultDialog(game),
        }
      : null;
  if (result) list.push(result);

  if (hasPermission("games.update")) {
    list.push({
      key: "schedule",
      title: "ویرایش زمان‌بندی",
      lock: game.scheduleLock,
      run: () => openEditSchedule(game),
    });
    if (game.status === "SCHEDULED")
      list.push({
        key: "start",
        title: "شروع بازی",
        lock: game.startLock,
        run: () => openConfirm("start", game),
      });
    if (game.status === "SCHEDULED" || game.status === "LIVE")
      list.push({
        key: "cancel",
        title: "لغو بازی",
        lock: game.cancelLock,
        run: () => openCancelDialog(game),
      });
  }
  if (hasPermission("games.result") && game.status === "FINISHED")
    list.push({
      key: "clear",
      title: "پاک کردن نتیجه",
      lock: game.resultLock,
      run: () => openConfirm("clear", game),
    });
  if (hasPermission("games.delete"))
    list.push({
      key: "delete",
      title: "حذف بازی",
      lock: game.deleteLock,
      run: () => openConfirm("delete", game),
    });
  return list;
};

// ─── Games: form (create / edit schedule / reschedule) ──
const gameFormRef = ref<any>(null);
const editingGame = ref<any>(null);
const rescheduleSource = ref<any>(null);

const gameFormMode = computed<"create" | "edit" | "reschedule">(() =>
  rescheduleSource.value ? "reschedule" : editingGame.value ? "edit" : "create",
);
const gameFormTitle = computed(
  () =>
    ({
      create: "ثبت بازی",
      edit: "ویرایش زمان‌بندی بازی",
      reschedule: "برگزاری مجدد بازی",
    })[gameFormMode.value],
);

const defaultGameForm = () => ({
  groupId: null as number | null,
  homeId: null as number | null,
  awayId: null as number | null,
  date: "",
  time: "",
});
const gameForm = reactive(defaultGameForm());

const pairCount = ref<number | null>(null);

const resetGameForm = () => {
  editingGame.value = null;
  rescheduleSource.value = null;
  Object.assign(gameForm, defaultGameForm());
  pairCount.value = null;
};

// Options come from groupStore (teams are loaded with the groups already).
const activeTeams = (g: any) =>
  g.teams.filter((t: any) => t.teamStatus !== "DELETED");

const formGroupOptions = computed(() =>
  groupStore.groupList.map((g: any) => ({
    value: g.id,
    title: activeTeams(g).length < 2 ? `${g.name} (کمتر از دو تیم)` : g.name,
    props: { disabled: activeTeams(g).length < 2 },
  })),
);

const formTeamOptions = computed(() => {
  const g = groupStore.groupList.find((x: any) => x.id === gameForm.groupId);
  return g
    ? activeTeams(g).map((t: any) => ({
        value: t.leagueTeamId,
        title: t.team.name,
      }))
    : [];
});
const homeOptions = computed(() =>
  formTeamOptions.value.filter((o: any) => o.value !== gameForm.awayId),
);
const awayOptions = computed(() =>
  formTeamOptions.value.filter((o: any) => o.value !== gameForm.homeId),
);

const onFormGroupChange = () => {
  gameForm.homeId = null;
  gameForm.awayId = null;
  pairCount.value = null;
};

// Pair quota hint (a hint only; the backend is the final authority).
const pairMax = computed(() =>
  league.value?.groupRoundType === "DOUBLE_ROUND" ? 2 : 1,
);
const pairBlocked = computed(
  () => pairCount.value !== null && pairCount.value >= pairMax.value,
);

watch(
  () => [gameForm.homeId, gameForm.awayId],
  async ([home, away]) => {
    pairCount.value = null;
    const id = selectedLeagueId.value;
    if (!id || !home || !away || gameFormMode.value === "edit") return;
    const games = await gameStore.fetchPairGames(id, {
      leagueTeamId: home,
      page: 1,
      pageSize: 100,
    });
    // Selection changed in the meantime: drop this result.
    if (gameForm.homeId !== home || gameForm.awayId !== away) return;
    pairCount.value = games.filter(
      (g: any) =>
        g.status !== "CANCELED" &&
        (g.homeTeam.leagueTeamId === away || g.awayTeam.leagueTeamId === away),
    ).length;
  },
);

const scrollFormIntoView = () => {
  if (!mobile.value) return;
  nextTick(() => {
    formCardRef.value?.$el?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  });
};

const openEditSchedule = (game: any) => {
  resetGameForm();
  editingGame.value = game;
  gameForm.date = game.scheduledDate ?? "";
  gameForm.time = game.scheduledTime ?? "";
  scrollFormIntoView();
};

const openReschedule = (game: any) => {
  resetGameForm();
  rescheduleSource.value = game;
  gameForm.groupId = game.group?.id ?? null;
  gameForm.homeId = game.homeTeam.leagueTeamId;
  gameForm.awayId = game.awayTeam.leagueTeamId;
  scrollFormIntoView();
};

const onGameFormSubmit = () => {
  const leagueId = selectedLeagueId.value;
  if (!leagueId) return;

  const date = gameForm.date || null;
  const time = gameForm.time || null;
  if ((date === null) !== (time === null)) {
    handlerStore.setError("تاریخ و ساعت باید همزمان وارد شوند.");
    return;
  }

  // Edit: schedule only
  if (gameFormMode.value === "edit") {
    if (editingGame.value.scheduleLock) {
      handlerStore.setError(editingGame.value.scheduleLock.message);
      resetGameForm();
      return;
    }
    gameStore
      .updateGameSchedule(leagueId, editingGame.value.id, {
        scheduledDate: date,
        scheduledTime: time,
      })
      .then((ok) => {
        if (!ok) return;
        resetGameForm();
        onGamesChanged();
      });
    return;
  }

  // Create and reschedule
  if (!gameForm.groupId || !gameForm.homeId || !gameForm.awayId) {
    handlerStore.setError("لطفا تمام فیلدهای الزامی را پر کنید.");
    return;
  }
  gameStore
    .createGame(leagueId, {
      homeLeagueTeamId: gameForm.homeId,
      awayLeagueTeamId: gameForm.awayId,
      ...(date ? { scheduledDate: date, scheduledTime: time } : {}),
      ...(rescheduleSource.value
        ? { rescheduledFromGameId: rescheduleSource.value.id }
        : {}),
    })
    .then((created) => {
      if (!created) return;
      resetGameForm();
      onGamesChanged();
    });
};

// ─── Games: result dialog ──
const resultDialogOpen = ref(false);
const resultTarget = ref<any>(null);
const resultForm = reactive({
  type: "NORMAL" as "NORMAL" | "FORFEIT",
  homeScore: "" as string | number,
  awayScore: "" as string | number,
  forfeitId: null as number | null,
  note: "",
});

const openResultDialog = (game: any) => {
  resultTarget.value = game;
  const finished = game.status === "FINISHED";
  resultForm.type =
    finished && game.resultType === "FORFEIT" ? "FORFEIT" : "NORMAL";
  resultForm.homeScore =
    finished && game.resultType === "NORMAL" ? game.homeScore : "";
  resultForm.awayScore =
    finished && game.resultType === "NORMAL" ? game.awayScore : "";
  resultForm.forfeitId = game.forfeitLeagueTeamId ?? null;
  resultForm.note = game.resultNote ?? "";
  resultDialogOpen.value = true;
};

const resultIsTie = computed(
  () =>
    resultForm.type === "NORMAL" &&
    resultForm.homeScore !== "" &&
    resultForm.awayScore !== "" &&
    Number(resultForm.homeScore) === Number(resultForm.awayScore),
);

// Display only; mirrors the backend rule (forfeitScores in games.rules.ts).
// The server writes the 0/20 scores itself.
const FORFEIT_DISPLAY_SCORE = 20;

const forfeitPreview = computed(() => {
  const g = resultTarget.value;
  if (!g || !resultForm.forfeitId) return "";
  const forfeit =
    g.homeTeam.leagueTeamId === resultForm.forfeitId ? g.homeTeam : g.awayTeam;
  const other = forfeit === g.homeTeam ? g.awayTeam : g.homeTeam;
  return `${forfeit.team.name} ۰ و ${other.team.name} ${FORFEIT_DISPLAY_SCORE.toLocaleString("fa-IR")}`;
});

const onResultSubmit = () => {
  const leagueId = selectedLeagueId.value;
  const game = resultTarget.value;
  if (!leagueId || !game) return;

  let body: any;
  if (resultForm.type === "NORMAL") {
    const h = Number(resultForm.homeScore);
    const a = Number(resultForm.awayScore);
    if (
      resultForm.homeScore === "" ||
      resultForm.awayScore === "" ||
      !Number.isInteger(h) ||
      !Number.isInteger(a) ||
      h < 0 ||
      a < 0
    ) {
      handlerStore.setError("امتیازها باید عدد صحیح و غیرمنفی باشند.");
      return;
    }
    if (h === a) {
      handlerStore.setError("در بسکتبال نتیجه‌ی مساوی ثبت نمی‌شود.");
      return;
    }
    body = {
      resultType: "NORMAL",
      homeScore: h,
      awayScore: a,
      resultNote: resultForm.note.trim() || null,
    };
  } else {
    if (!resultForm.forfeitId) {
      handlerStore.setError("تیم فورفیت‌کننده را انتخاب کنید.");
      return;
    }
    body = {
      resultType: "FORFEIT",
      forfeitLeagueTeamId: resultForm.forfeitId,
      resultNote: resultForm.note.trim() || null,
    };
  }

  gameStore.enterGameResult(leagueId, game.id, body).then((ok) => {
    if (!ok) return;
    resultDialogOpen.value = false;
    onGamesChanged();
  });
};

// ─── Games: cancel dialog ──
const cancelDialogOpen = ref(false);
const cancelTarget = ref<any>(null);
const cancelReason = ref("");

const openCancelDialog = (game: any) => {
  cancelTarget.value = game;
  cancelReason.value = "";
  cancelDialogOpen.value = true;
};

const onCancelConfirm = () => {
  const leagueId = selectedLeagueId.value;
  if (!leagueId || !cancelTarget.value) return;
  gameStore
    .updateGameStatus(leagueId, cancelTarget.value.id, {
      status: "CANCELED",
      cancelReason: cancelReason.value.trim() || null,
    })
    .then((ok) => {
      if (!ok) return;
      cancelDialogOpen.value = false;
      onGamesChanged();
    });
};

// ─── Games: shared confirm (start / clear result / delete) ──
const confirmOpen = ref(false);
const confirmType = ref<"start" | "clear" | "delete">("delete");
const confirmTarget = ref<any>(null);

const confirmTexts = {
  start: {
    title: "شروع بازی",
    text: "بازی در وضعیت «در حال برگزاری» قرار می‌گیرد.",
    btn: "شروع",
  },
  clear: {
    title: "پاک کردن نتیجه",
    text: "نتیجه‌ی بازی پاک می‌شود و بازی به حالت برنامه‌ریزی‌شده برمی‌گردد.",
    btn: "پاک کردن",
  },
  delete: {
    title: "حذف بازی",
    text: "آیا از حذف این بازی مطمئن هستید؟",
    btn: "حذف",
  },
} as const;

const openConfirm = (type: "start" | "clear" | "delete", game: any) => {
  confirmType.value = type;
  confirmTarget.value = game;
  confirmOpen.value = true;
};

const onConfirm = () => {
  const leagueId = selectedLeagueId.value;
  const game = confirmTarget.value;
  if (!leagueId || !game) return;
  const request =
    confirmType.value === "start"
      ? gameStore.updateGameStatus(leagueId, game.id, { status: "LIVE" })
      : confirmType.value === "clear"
        ? gameStore.clearGameResult(leagueId, game.id)
        : gameStore.deleteGame(leagueId, game.id);
  request.then((ok) => {
    if (!ok) return;
    confirmOpen.value = false;
    confirmTarget.value = null;
    onGamesChanged();
  });
};

// ─── View switching ──
watch(activeView, (view) => {
  // The hidden form must never keep stale edit data.
  resetGameForm();
  openCreateMode();
  if (view === "games" && selectedLeagueId.value) {
    loadGames();
    loadFilterOptions();
  }
});

// "Games of this group" button on a group card.
const openGroupGames = (groupId: number) => {
  resetGameFilters();
  gameFilters.groupId = groupId;
  gamePage.value = 1;
  activeView.value = "games"; // the view watcher loads the list
  const id = selectedLeagueId.value;
  if (id) dropdownStore.getLeagueTeamDropdown(id, groupId);
};

// ─── Edit structure (deep link into the leagues page) ──
const goEditStructure = () => {
  if (!league.value) return;
  navigateTo(`/leagues?editLeagueId=${league.value.id}&tab=format`);
};

// ─── Init ──
onMounted(() => {
  if (!hasPermission("competition.view")) return;

  if (canGames.value && dropdownStore.gameStatuses.length === 0) {
    dropdownStore.getGameStatuses();
  }
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
