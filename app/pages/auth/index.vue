<template>
  <div>auth page</div>
</template>

<script setup lang="ts">
import { useConfigStore } from "~/store/config";
const configStore = useConfigStore();

import { useHandlerStore } from "~/store/handler";
const handlerStore = useHandlerStore();

definePageMeta({
  layout: "auth",
});

const { setPageTitle } = usePageTitle();
watchEffect(() => {
  setPageTitle("ورود");
});

const showPassword = ref<Boolean>(false);

const loginForm = ref({
  username: null,
  password: null,
});

const login = () => {
  if (loginForm.value.username && loginForm.value.password) {
    configStore.login(loginForm.value);
  } else {
    handlerStore.setError("لطفا موارد الزامی را وارد کنید");
  }
};
</script>
