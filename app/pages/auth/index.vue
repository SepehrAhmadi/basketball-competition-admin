<template>
  <v-container
    class="d-flex justify-center align-center"
    style="min-height: 100vh"
    dir="rtl"
  >
    <v-card rounded="lg" class="shadow-xs!" max-width="420" width="100%">
      <v-card-item class="text-center mb-3 pt-4">
        <v-card-title class="text-h6 font-weight-bold">خوش آمدید</v-card-title>
        <v-card-subtitle>به پنل مدیریت وارد شوید</v-card-subtitle>
      </v-card-item>

      <v-card-text class="tw:pb-0!">
        <v-form ref="formRef" @submit.prevent="submit">
          <v-text-field
            v-model="identifier"
            variant="outlined"
            density="compact"
            :rules="[(v: string) => !!v || '']"
            class="tw:rounded-lg!"
            rounded="lg"
          >
            <template #label>
              <span class="tw:text-[12px]"> شماره موبایل یا ایمیل </span>
              <span class="tw:text-red-900 tw:dark:text-red-400 tw:text-[10px]"> (الزامی) </span>
            </template>
          </v-text-field>
          <v-text-field
            v-model="password"
            variant="outlined"
            density="compact"
            :type="showPassword ? 'text' : 'password'"
            :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
            @click:append-inner="showPassword = !showPassword"
            :rules="[(v: string) => !!v || '']"
            class="tw:rounded-lg!"
            rounded="lg"
          >
            <template #label>
              <span class="tw:text-[12px]"> رمز عبور </span>
              <span class="tw:text-red-900 tw:dark:text-red-400 tw:text-[10px]"> (الزامی) </span>
            </template>
          </v-text-field>
        </v-form>
      </v-card-text>

      <v-card-actions class="flex-column px-4 pb-4">
        <v-btn
          block
          :loading="authStore.loading"
          :disabled="authStore.loading"
          class="tw:bg-primary-dark! tw:dark:bg-secondary-dark! tw:text-white! tw:rounded-md!"
          @click="submit"
        >
          <icon-login class="tw:text-[20px]" />
          <span class="tw:mr-1!">ورود</span>
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { useAuthStore } from "~/store/auth";
const authStore = useAuthStore();

definePageMeta({
  layout: "auth",
});

const { setPageTitle } = usePageTitle();
watchEffect(() => {
  setPageTitle("ورود");
});

const formRef = ref<any>(null);
const identifier = ref<string>("");
const password = ref<string>("");
const showPassword = ref<boolean>(false);

const submit = async () => {
  const { valid } = await formRef.value!.validate();
  if (!valid) return;

  authStore.adminLogin({
    identifier: identifier.value,
    password: password.value,
  });
};
</script>
