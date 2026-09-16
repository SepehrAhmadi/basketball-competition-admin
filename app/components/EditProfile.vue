<template>
  <v-navigation-drawer
    v-model="editProfileDrawer"
    width="380"
    :temporary="true"
    location="right"
  >
    <div class="tw:px-5! tw:py-4!">
      <!-- edit profile title -->
      <div class="tw:flex tw:justify-between tw:items-start">
        <div class="tw:flex tw:justify-start tw:items-center tw:gap-1">
          <icon-edit-box
            class="tw:text-[30px] tw:text-gray-600! tw:dark:text-gray-300!"
          />
          <div class="tw:text-[17px] tw:text-gray-700! tw:dark:text-gray-300!">
            ویرایش پروفایل
          </div>
        </div>
        <button
          @click="editProfileDrawer = false"
          class="tw:text-[14px] tw:text-gray-600! tw:dark:text-gray-300! tw:hover:text-gray-200! tw:dark:hover:text-gray-100! tw:transition tw:duration-150!"
        >
          <icon-close
            class="tw:text-[25px] tw:text-gray-600! tw:dark:text-gray-300!"
          />
        </button>
      </div>
      <!-- avatar section -->
      <div class="tw:flex tw:justify-between tw:items-cneter tw:mt-4! tw:gap-2">
        <div
          class="tw:w-25 tw:h-25 tw:flex tw:justify-center tw:items-center tw:bg-white tw:rounded-full"
        >
          <img
            :src="avatar"
            alt="avatar"
            class="tw:w-22 tw:h-22 tw:rounded-full tw:object-cover"
          />
        </div>
        <div class="tw:mt-2! tw:flex tw:flex-col tw:gap-1">
          <div class="tw:flex tw:justify-start tw:items-start tw:gap-1">
            <icon-circle
              class="tw:text-[9px] tw:text-gray-600! tw:dark:text-gray-300! tw:mt-1!"
            />
            <div
              class="tw:text-[12px] tw:text-gray-600! tw:dark:text-gray-300!"
            >
              عکس را در ابعاد مربعی انتخاب کنید
            </div>
          </div>
          <div class="tw:flex tw:justify-start tw:items-start tw:gap-1">
            <icon-circle
              class="tw:text-[9px] tw:text-gray-600! tw:dark:text-gray-300! tw:mt-1!"
            />
            <div
              class="tw:text-[12px] tw:text-gray-600! tw:dark:text-gray-300!"
            >
              اندازه فایل نمی‌تواند بیشتر از 2 مگابایت باشد
            </div>
          </div>
          <div
            class="tw:flex tw:justify-between tw:items-center tw:gap-2 tw:mt-1!"
          >
            <v-btn
              rounded
              size="35"
              class="tw:shadow-none! tw:flex-1"
              color="primary"
              @click="triggerFileInput"
              ;
            >
              <div class="tw:text-[12px]">انتخاب تصویر</div>
            </v-btn>
            <v-btn rounded size="35" class="tw:shadow-none!" color="primary">
              <icon-button-loader v-if="loading" class="tw:text-[26px]!" />
              <icon-trash v-else class="tw:text-[26px]" />
            </v-btn>
          </div>
          <input
            type="file"
            ref="fileInput"
            accept="image/*"
            @change="handleFileSelect"
            class="tw:hidden"
          />
        </div>
      </div>
      <!-- username -->
      <div class="tw:flex tw:justify-start tw:items-cneter tw:mt-4! tw:gap-2">
        <v-text-field
          type="text"
          variant="outlined"
          density="compact"
          hide-details
          class="tw:text-[14px]! tw:w-full!"
          rounded="pill"
        >
          <template #label>
            <span class="tw:text-[12px]"> Username </span>
          </template>
        </v-text-field>
        <v-btn rounded size="35" class="tw:shadow-none!" color="primary">
          <icon-button-loader v-if="loading" class="tw:text-[26px]!" />
          <icon-check v-else class="tw:text-[26px]" />
        </v-btn>
      </div>
      <!-- change password title -->
      <div class="tw:flex tw:justify-start tw:items-center tw:mt-8! tw:gap-1">
        <icon-lock
          class="tw:text-[23px] tw:text-gray-600! tw:dark:text-gray-300!"
        />
        <div class="tw:text-[15px] tw:text-gray-700! tw:dark:text-gray-300!">
          تغییر رمز عبور
        </div>
      </div>
      <!-- chnage password form -->
      <div class="tw:flex tw:flex-col tw:gap-3 tw:mt-4!">
        <v-text-field
          variant="outlined"
          density="compact"
          hide-details
          rounded="pill"
          :type="showOldPass ? 'text' : 'password'"
        >
          <template #label>
            <span class="tw:text-[14px]">{{ "Current Password" }}</span>
          </template>

          <template #append-inner>
            <div class="tw:cursor-pointer">
              <icon-view
                v-if="!showOldPass"
                class="tw-text-button tw:text-[23px]"
              />
              <icon-view-off
                v-if="showOldPass"
                class="tw-text-button tw:text-[23px]"
              />
            </div>
          </template>
        </v-text-field>
        <v-text-field
          variant="outlined"
          density="compact"
          hide-details
          rounded="pill"
          :type="showNewPass ? 'text' : 'password'"
        >
          <template #label>
            <span class="tw:text-[14px]">{{ "New Password" }}</span>
          </template>

          <template #append-inner>
            <div class="tw:cursor-pointer">
              <icon-view
                v-if="!showNewPass"
                class="tw-text-button tw:text-[23px]"
              />
              <icon-view-off
                v-if="showNewPass"
                class="tw-text-button tw:text-[23px]"
              />
            </div>
          </template>
        </v-text-field>
        <v-text-field
          variant="outlined"
          density="compact"
          hide-details
          rounded="pill"
          :type="showConfirmPass ? 'text' : 'password'"
        >
          <template #label>
            <span class="tw:text-[14px]">{{ "Confirm Password" }}</span>
          </template>

          <template #append-inner>
            <div
              @click="showConfirmPass = !showConfirmPass"
              class="tw:cursor-pointer"
            >
              <icon-view
                v-if="!showConfirmPass"
                class="tw-text-button tw:text-[23px]"
              />
              <icon-view-off
                v-if="showConfirmPass"
                class="tw-text-button tw:text-[23px]"
              />
            </div>
          </template>
        </v-text-field>
        <div class="tw:flex tw:justify-end">
          <v-btn rounded class="tw:shadow-none! tw:flex-1" color="primary">
            <icon-button-loader v-if="loading" class="tw:text-[26px]!" />
            <div v-else class="tw:text-[12px]">تایید</div>
          </v-btn>
        </div>
      </div>
    </div>
  </v-navigation-drawer>
</template>

<script setup lang="ts">
import avatar from "~/assets/image/default-avatar.png";

// ======= store =======
import { useHandlerStore } from "~/store/handler";
const handlerStore = useHandlerStore();
const { loadingBtn: loading } = storeToRefs(handlerStore);

// ======= composables =======
const { editProfileDrawer } = useEditProfile();

// ======= Data =======
const showOldPass = ref(false);
const showNewPass = ref(false);
const showConfirmPass = ref(false);
// ref
const fileInput = ref<HTMLInputElement | null>(null);

// ======= functions =======
const triggerFileInput = () => {
  if (fileInput.value) {
    fileInput.value.click();
  }
};

const handleFileSelect = (event: any) => {
  const files = event.target.files;
  if (files.length > 0) {
    event.target.value = null;
  }
};
</script>
