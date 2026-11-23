<template>
  <div>
    <v-card-title
      dir="rtl"
      class="tw:flex! tw:items-center! tw:gap-1! tw:text-[14px]! tw:font-bold! tw:mb-2! tw:mt-2!"
    >
      <icon-plus v-if="!editingGroup" class="tw:text-[20px]" />
      <icon-edit-box v-else class="tw:text-[20px]" />
      <span>{{ editingGroup ? "ویرایش گروه" : "افزودن گروه" }}</span>
    </v-card-title>

    <v-card-text>
      <v-alert
        v-if="formBlockState"
        :type="formBlockState.type"
        variant="tonal"
        density="compact"
        class="tw:text-[12px]!"
      >
        {{ formBlockState.text }}
      </v-alert>

      <v-form v-else ref="formRef">
        <v-text-field
          v-model="name"
          variant="outlined"
          density="compact"
          hide-details
          :rules="[(v: string) => !!v || '']"
        >
          <template #label>
            <span class="tw:text-[12px]">نام گروه</span>
            <span class="tw:text-red-900 tw:dark:text-red-400 tw:text-[10px]">
              (الزامی)
            </span>
          </template>
        </v-text-field>

        <v-text-field
          v-model="qualifiersOverride"
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
            <span class="tw:text-[12px]">{{ qualifiersLabel }}</span>
          </template>
        </v-text-field>

        <v-row class="tw:mt-1!">
          <v-col :cols="editingGroup ? '6' : '12'">
            <v-btn
              block
              :loading="loading"
              :disabled="loading"
              class="tw:bg-secondary-dark! tw:dark:bg-secondary-dark! tw:text-white! tw:rounded-md!"
              @click="onSubmit"
            >
              <icon-check class="tw:text-[18px]" />
              <span class="tw:mr-1!">{{
                editingGroup ? "ذخیره" : "افزودن"
              }}</span>
            </v-btn>
          </v-col>
          <v-col v-if="editingGroup" cols="6">
            <v-btn
              block
              variant="outlined"
              class="tw:text-[12px]!"
              @click="emit('cancel')"
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
import type { GroupFormPayload } from "~/composables/competition/types";

const props = defineProps<{
  editingGroup: any | null;
  formBlockState: { type: "info" | "warning"; text: string } | null;
  qualifiersLabel: string;
  qualifiersPlaceholder: string;
  loading: boolean;
}>();

const emit = defineEmits<{
  (e: "submit", payload: GroupFormPayload): void;
  (e: "cancel"): void;
  (e: "invalid", message: string): void;
}>();

const name = ref<string>("");
const qualifiersOverride = ref<string | number>("");
const formRef = ref<any>(null);

// Only the id is watched: a data refresh must not overwrite what the user typed.
watch(
  () => props.editingGroup?.id,
  () => {
    if (props.editingGroup) {
      name.value = props.editingGroup.name ?? "";
      qualifiersOverride.value = props.editingGroup.qualifiersOverride ?? "";
    } else {
      name.value = "";
      qualifiersOverride.value = "";
    }
  },
  { immediate: true },
);

const onSubmit = () => {
  const trimmed = String(name.value ?? "").trim();
  if (!trimmed) {
    emit("invalid", "لطفا تمام فیلدهای الزامی را پر کنید.");
    return;
  }
  if (trimmed.length < 2 || trimmed.length > 100) {
    emit("invalid", "نام گروه باید بین ۲ تا ۱۰۰ کاراکتر باشد.");
    return;
  }

  const raw = qualifiersOverride.value;
  const empty = raw === "" || raw === null || raw === undefined;
  const qualifiers = Number(raw);
  if (
    !empty &&
    (!Number.isInteger(qualifiers) || qualifiers < 1 || qualifiers > 64)
  ) {
    emit("invalid", "تعداد صعودکننده باید بین ۱ تا ۶۴ باشد.");
    return;
  }

  formRef.value!.validate().then(({ valid }: { valid: boolean }) => {
    if (!valid) return;
    emit("submit", {
      name: trimmed,
      qualifiersOverride: empty ? null : qualifiers,
    });
  });
};
</script>
