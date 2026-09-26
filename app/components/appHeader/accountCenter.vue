<template>
  <v-menu class="tw:relative tw:z-9999!">
    <template v-slot:activator="{ props }">
      <div
        class="tw:overflow-y-hidden tw:w-10 tw:h-10 tw:flex tw:justify-center tw:items-center tw:bg-gray-200! tw:dark:bg-secondary-dark! tw:rounded-full tw:overflow-hidden tw:hover:bg-secondary-dark/80 tw:transition tw:duration-200 tw:cursor-pointer"
        v-bind="props"
      >
        <img
          :src="avatar"
          class="tw:w-full tw:h-full tw:object-cover tw:block tw:translate-y-0.75!"
          alt="avatar"
        />
      </div>
    </template>
    <div
      class="tw:bg-white tw:dark:bg-secondary-dark! tw:rounded-lg tw:min-w-37 tw:overflow-hidden tw:mt-3! tw:border tw:border-gray-200 tw:dark:border-gray-700"
    >
      <div
        class="tw:flex tw:justify-start tw:items-center tw:p-2! tw:border-b tw:border-gray-200 tw:dark:border-gray-700"
      >
        <icon-user
          class="tw:w-4.5 tw:h-4.5 tw:text-gray-700 tw:dark:text-gray-300 tw:me-1!"
        />
        <div
          class="tw:text-[12px] tw:text-gray-700 tw:dark:text-gray-300 tw:me-1!"
        >
          نام کاربری :
        </div>
        <div class="tw:text-[12px] tw:text-gray-700 tw:dark:text-gray-300">
          <span>{{ authStore.adminUser?.fullName ?? "نام کاربری" }}</span>
        </div>
      </div>
      <div
        @click="editProfileDrawer = true"
        class="tw:flex tw:justify-start tw:items-center tw:p-2! tw:group"
      >
        <icon-edit-box
          class="tw:w-4.5 tw:h-4.5 tw:text-gray-700 tw:dark:text-gray-300 tw:group-hover:text-black tw:dark:group-hover:text-gray-200 tw:transition tw:duration-100 tw:cursor-pointer tw:me-1!"
        />
        <div
          class="tw:text-[12px] tw:text-gray-700 tw:dark:text-gray-300 tw:group-hover:text-black tw:dark:group-hover:text-gray-200 tw:transition tw:duration-100 tw:cursor-pointer tw:me-1!"
        >
          ویرایش پروفایل
        </div>
      </div>
      <div
        @click="logout"
        class="tw:flex tw:justify-start tw:items-center tw:p-2! tw:group tw:cursor-pointer"
      >
        <icon-logout
          class="tw:w-4.5 tw:h-4.5 tw:text-red-700 tw:group-hover:text-red-900 tw:dark:text-red-600 tw:dark:group-hover:text-red-500 tw:transition tw:duration-100 tw:cursor-pointer tw:me-1!"
        />
        <div
          class="tw:text-[12px] tw:text-red-700 tw:group-hover:text-red-900 tw:dark:text-red-600 tw:dark:group-hover:text-red-500 tw:transition tw:duration-100 tw:cursor-pointer tw:me-1!"
        >
          خروج
        </div>
      </div>
    </div>
  </v-menu>
</template>

<script setup lang="ts">
// pictures
import avatar from "~/assets/image/default-avatar.png";

import { useAuthStore } from "~/store/auth";
const authStore = useAuthStore()

// composables
const { editProfileDrawer } = useEditProfile();

const username = ref<any>("");

const logout = () => {
  authStore.logout();
};
</script>
