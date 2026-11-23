<template>
  <v-dialog
    :model-value="modelValue"
    max-width="460"
    dir="rtl"
    class="blur-dialog"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <v-card v-if="target" rounded="lg">
      <v-card-title
        class="tw:bg-secondary-dark tw:dark:bg-primary-dark! tw:mb-3!"
      >
        <div class="tw:flex tw:justify-between tw:items-center">
          <div class="tw:invisible">
            <v-btn
              icon
              variant="plain"
              size="x-small"
              @click="emit('update:modelValue', false)"
            >
              <icon-close class="tw:text-[18px] tw:text-white!" />
            </v-btn>
          </div>
          <div class="tw:text-[14px]! tw:text-white">
            {{ target.status === "FINISHED" ? "ویرایش نتیجه" : "ثبت نتیجه" }}
          </div>
          <div>
            <v-btn
              icon
              variant="plain"
              size="x-small"
              aria-label="بستن"
              @click="emit('update:modelValue', false)"
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
          <span>{{ target.homeTeam.team.name }}</span>
          <span class="tw:text-color-lighter">VS</span>
          <span>{{ target.awayTeam.team.name }}</span>
        </div>

        <div class="tw:grid tw:grid-cols-2 tw:items-center tw:gap-2 tw:mb-4!">
          <v-btn
            rounded="lg"
            size="small"
            :variant="form.type === 'NORMAL' ? 'flat' : 'outlined'"
            :class="
              form.type === 'NORMAL'
                ? 'tw:bg-secondary-dark! tw:text-white! tw:border! tw:border-secondary-dark!'
                : ''
            "
            @click="form.type = 'NORMAL'"
          >
            <span class="tw:text-[12px]">عادی</span>
          </v-btn>
          <v-btn
            rounded="lg"
            size="small"
            :variant="form.type === 'FORFEIT' ? 'flat' : 'outlined'"
            :class="
              form.type === 'FORFEIT'
                ? 'tw:bg-secondary-dark! tw:text-white! tw:border! tw:border-secondary-dark!'
                : ''
            "
            @click="form.type = 'FORFEIT'"
          >
            <span class="tw:text-[12px]">فورفیت</span>
          </v-btn>
        </div>

        <template v-if="form.type === 'NORMAL'">
          <v-row>
            <v-col cols="6">
              <v-text-field
                v-model="form.homeScore"
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
                    target.homeTeam.team.name
                  }}</span>
                </template>
              </v-text-field>
            </v-col>
            <v-col cols="6">
              <v-text-field
                v-model="form.awayScore"
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
                    target.awayTeam.team.name
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
          <v-radio-group v-model="form.forfeitId" hide-details>
            <v-radio :value="target.homeTeam.leagueTeamId">
              <template #label>
                <span class="tw:text-[13px]">{{
                  target.homeTeam.team.name
                }}</span>
              </template>
            </v-radio>
            <v-radio :value="target.awayTeam.leagueTeamId">
              <template #label>
                <span class="tw:text-[13px]">{{
                  target.awayTeam.team.name
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
          v-model="form.note"
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
          @click="emit('update:modelValue', false)"
        >
          انصراف
        </v-btn>
        <v-btn
          class="tw:bg-secondary-dark! tw:dark:bg-secondary-dark! tw:text-white! tw:rounded-md!"
          :loading="loading"
          :disabled="resultIsTie || loading"
          @click="emit('submit', { ...form })"
        >
          <icon-check class="tw:text-[18px]" />
          <span class="tw:mr-1! tw:text-[12px]! tw:px-2!">ثبت</span>
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import type { ResultFormState } from "~/composables/competition/types";

const props = defineProps<{
  modelValue: boolean;
  target: any;
  loading: boolean;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
  (e: "submit", form: ResultFormState): void;
}>();

const form = reactive<ResultFormState>({
  type: "NORMAL",
  homeScore: "",
  awayScore: "",
  forfeitId: null,
  note: "",
});

// Prefill from the game each time the dialog opens.
watch(
  () => props.modelValue,
  (open) => {
    const game = props.target;
    if (!open || !game) return;
    const finished = game.status === "FINISHED";
    form.type = finished && game.resultType === "FORFEIT" ? "FORFEIT" : "NORMAL";
    form.homeScore =
      finished && game.resultType === "NORMAL" ? game.homeScore : "";
    form.awayScore =
      finished && game.resultType === "NORMAL" ? game.awayScore : "";
    form.forfeitId = game.forfeitLeagueTeamId ?? null;
    form.note = game.resultNote ?? "";
  },
  { immediate: true },
);

const resultIsTie = computed(
  () =>
    form.type === "NORMAL" &&
    form.homeScore !== "" &&
    form.awayScore !== "" &&
    Number(form.homeScore) === Number(form.awayScore),
);

// Display only; mirrors the backend rule (forfeitScores in games.rules.ts).
// The server writes the 0/20 scores itself.
const FORFEIT_DISPLAY_SCORE = 20;

const forfeitPreview = computed(() => {
  const g = props.target;
  if (!g || form.type !== "FORFEIT" || !form.forfeitId) return "";
  const forfeit =
    g.homeTeam.leagueTeamId === form.forfeitId ? g.homeTeam : g.awayTeam;
  const other = forfeit === g.homeTeam ? g.awayTeam : g.homeTeam;
  return `${forfeit.team.name} ۰ و ${other.team.name} ${FORFEIT_DISPLAY_SCORE.toLocaleString("fa-IR")}`;
});
</script>
