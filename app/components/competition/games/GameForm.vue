<template>
  <div>
    <v-card-title
      dir="rtl"
      class="tw:flex! tw:items-center! tw:gap-1! tw:text-[14px]! tw:font-bold! tw:mb-2! tw:mt-2!"
    >
      <icon-plus v-if="gameFormMode === 'create'" class="tw:text-[20px]" />
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

      <v-form v-else>
        <!-- حالت ویرایش: فقط خواندنی -->
        <div
          v-if="gameFormMode === 'edit' && editingGame"
          class="tw:text-[13px] tw:mb-6!"
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
                :disabled="!gameForm.groupId || gameFormMode === 'reschedule'"
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
                :disabled="!gameForm.groupId || gameFormMode === 'reschedule'"
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
                    {{ pairCount }} از {{ pairMax }} بازی بین این دو تیم ثبت شده
                    است
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
            <div class="tw:relative!">
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
              @click="submitGameForm()"
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
              @click="resetGameForm()"
            >
              انصراف
            </v-btn>
          </v-col>
        </v-row>
      </v-form>
    </v-card-text>
  </div>
</template>

<script setup lang="ts">
import { useCompetition } from "~/composables/competition/useCompetitionContext";

const competition = useCompetition();
const { gameStore, handlerStore } = competition;
const {
  gameForm,
  editingGame,
  rescheduleSource,
  gameFormMode,
  gameFormTitle,
  pairCount,
  pairMax,
  pairBlocked,
  formGroupOptions,
  homeOptions,
  awayOptions,
  onFormGroupChange,
  resetGameForm,
  submitGameForm,
} = competition.gameForm;
</script>
