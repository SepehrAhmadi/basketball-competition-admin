<template>
  <v-navigation-drawer
    v-model="editProfileDrawer"
    width="390"
    :temporary="true"
    location="left"
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
          class="tw:w-25 tw:h-25 tw:flex tw:justify-center tw:items-center tw:rounded-full tw:bg-white tw:-full"
        >
          <img
            :src="avatarPreview"
            alt="avatar"
            class="tw:w-22 tw:h-22 tw:-full tw:object-cover tw:rounded-full"
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
              size="35"
              class="tw:shadow-none! tw:flex-1 tw:bg-secondary-dark! tw:text-white!"
              @click="triggerFileInput"
              ;
            >
              <div class="tw:text-[12px]">انتخاب تصویر</div>
            </v-btn>
            <v-btn
              size="35"
              class="tw:shadow-none! tw:bg-secondary-dark! tw:text-white!"
              @click="onRemoveAvatar"
            >
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
      <!-- profile fields -->
      <v-form ref="profileFormRef" class="tw:flex tw:flex-col tw:gap-3 tw:mt-4!">
        <v-text-field
          v-model="form.fullName"
          type="text"
          variant="outlined"
          density="compact"
          hide-details
          class="tw:text-[14px]! tw:w-full!"
          :rules="[(v: string) => !!v || 'نام کامل الزامی است']"
        >
          <template #label>
            <span class="tw:text-[12px]">نام کامل</span>
            <span class="tw:text-red-900 tw:dark:text-red-400 tw:text-[10px]">
              (الزامی)
            </span>
          </template>
        </v-text-field>
        <v-text-field
          v-model="form.phone"
          type="text"
          variant="outlined"
          density="compact"
          hide-details
          class="tw:text-[14px]! tw:w-full!"
          :rules="[(v: string) => !!v || 'موبایل الزامی است']"
        >
          <template #label>
            <span class="tw:text-[12px]">موبایل</span>
            <span class="tw:text-red-900 tw:dark:text-red-400 tw:text-[10px]">
              (الزامی)
            </span>
          </template>
        </v-text-field>
        <v-text-field
          v-model="form.email"
          type="email"
          variant="outlined"
          density="compact"
          hide-details
          class="tw:text-[14px]! tw:w-full!"
          :rules="[(v: string) => !!v || 'ایمیل الزامی است']"
        >
          <template #label>
            <span class="tw:text-[12px]">ایمیل</span>
            <span class="tw:text-red-900 tw:dark:text-red-400 tw:text-[10px]">
              (الزامی)
            </span>
          </template>
        </v-text-field>
        <v-text-field
          v-model="form.nationalId"
          type="text"
          variant="outlined"
          density="compact"
          hide-details
          class="tw:text-[14px]! tw:w-full!"
        >
          <template #label>
            <span class="tw:text-[12px]">کد ملی</span>
          </template>
        </v-text-field>
        <div class="tw:relative!">
          <label
            v-if="form.birthDate"
            for="profile-birthDate"
            class="tw:text-[11px] tw:absolute! tw:bg-white! tw:dark:bg-primary-dark! tw:start-3 tw:-top-1.75 tw:z-10! tw-text-color-reverse"
            >تاریخ تولد</label
          >
          <date-picker
            v-model="form.birthDate"
            id="profile-birthDate"
            simple
            placeholder="تاریخ تولد"
            format="jYYYY/jMM/jDD"
            display-format="jYYYY/jMM/jDD"
            class="default-scroll tw:text-gray-300! tw:text-[14px]! tw:text-center!"
            color="#1d202e"
          />
        </div>
        <v-autocomplete
          v-model="form.roles"
          :items="dropdownStore.roles"
          item-title="label"
          item-value="value"
          multiple
          chips
          closable-chips
          variant="outlined"
          density="compact"
          hide-details
          class="tw:text-[14px]! tw:w-full!"
        >
          <template #label>
            <span class="tw:text-[12px]">نقش‌ها</span>
          </template>
        </v-autocomplete>
        <div class="tw:flex tw:justify-end">
          <v-btn
            class="tw:shadow-none! tw:flex-1 tw:bg-secondary-dark! tw:text-white!"
            @click="onSaveProfile"
          >
            <icon-button-loader v-if="loading" class="tw:text-[26px]!" />
            <div v-else class="tw:text-[12px]">ذخیره پروفایل</div>
          </v-btn>
        </div>
      </v-form>
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
          v-model="passwordForm.currentPassword"
          variant="outlined"
          density="compact"
          hide-details
          :type="showOldPass ? 'text' : 'password'"
          class="tw:text-[14px]!"
        >
          <template #label>
            <span class="tw:text-[14px]">رمز عبور فعلی</span>
          </template>

          <template #append-inner>
            <div @click="showOldPass = !showOldPass" class="tw:cursor-pointer">
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
          v-model="passwordForm.newPassword"
          variant="outlined"
          density="compact"
          hide-details
          :type="showNewPass ? 'text' : 'password'"
          class="tw:text-[14px]!"
        >
          <template #label>
            <span class="tw:text-[14px]">رمز عبور جدید</span>
          </template>

          <template #append-inner>
            <div @click="showNewPass = !showNewPass" class="tw:cursor-pointer">
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
          v-model="passwordForm.confirmPassword"
          variant="outlined"
          density="compact"
          hide-details
          :type="showConfirmPass ? 'text' : 'password'"
          class="tw:text-[14px]!"
        >
          <template #label>
            <span class="tw:text-[14px]">تکرار رمز عبور</span>
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
          <v-btn
            class="tw:shadow-none! tw:flex-1 tw:bg-secondary-dark! tw:text-white!"
            @click="onChangePassword"
          >
            <icon-button-loader v-if="loading" class="tw:text-[26px]!" />
            <div v-else class="tw:text-[12px]">تایید</div>
          </v-btn>
        </div>
      </div>
    </div>
  </v-navigation-drawer>
</template>

<script setup lang="ts">
import defaultAvatar from "~/assets/image/default-avatar.png";

// ======= store =======
import { useHandlerStore } from "~/store/handler";
import { useUserStore } from "~/store/user";
import { useDeopdownStore } from "~/store/dropdown";
const handlerStore = useHandlerStore();
const userStore = useUserStore();
const dropdownStore = useDeopdownStore();
const { loadingBtn: loading } = storeToRefs(handlerStore);
const { currentUser } = storeToRefs(userStore);

// ======= composables =======
const { editProfileDrawer } = useEditProfile();

// ======= Data =======
const showOldPass = ref(false);
const showNewPass = ref(false);
const showConfirmPass = ref(false);
// ref
const fileInput = ref<HTMLInputElement | null>(null);
const profileFormRef = ref<any>(null);
const avatarFile = ref<File | null>(null);
const avatarPreview = ref<string>(defaultAvatar);
const hasAvatar = ref(false);

const form = reactive({
  fullName: "",
  phone: "",
  email: "",
  birthDate: "",
  nationalId: "",
  roles: [] as string[],
});

const passwordForm = reactive({
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
});

const updateAvatarPreview = (profile: any) => {
  const url =
    profile?.avatarUrl ||
    profile?.avatar ||
    profile?.profileImage ||
    profile?.image;
  if (url) {
    avatarPreview.value = url;
    hasAvatar.value = true;
  } else {
    avatarPreview.value = defaultAvatar;
    hasAvatar.value = false;
  }
};

const buildAvatarFormData = () => {
  const formData = new FormData();
  if (avatarFile.value) {
    formData.append("file", avatarFile.value);
  }
  return formData;
};

const clearFileInput = () => {
  avatarFile.value = null;
  if (fileInput.value) {
    fileInput.value.value = "";
  }
};

const fillForm = (user: any) => {
  form.fullName = user?.fullName ?? "";
  form.phone = user?.phone ?? "";
  form.email = user?.email ?? "";
  form.birthDate = user?.birthDate ?? "";
  form.nationalId = user?.nationalId ?? "";
  form.roles = Array.isArray(user?.roles) ? [...user.roles] : [];
  updateAvatarPreview(user);
};

const clearPasswordForm = () => {
  passwordForm.currentPassword = "";
  passwordForm.newPassword = "";
  passwordForm.confirmPassword = "";
};

// Prefill on open
watch(editProfileDrawer, (open) => {
  if (!open) return;
  if (dropdownStore.roles.length === 0) dropdownStore.getRoles();
  if (currentUser.value) fillForm(currentUser.value);
  userStore.getMe().then((user: any) => {
    if (user) fillForm(user);
  });
});

// Keep avatar preview in sync with profile changes (upload/remove/refetch)
watch(currentUser, (profile) => {
  if (!profile) {
    avatarPreview.value = defaultAvatar;
    hasAvatar.value = false;
    return;
  }
  // Don't override a just-selected local preview before upload finishes
  if (avatarFile.value) return;
  updateAvatarPreview(profile);
});

// ======= functions =======
const triggerFileInput = () => {
  if (fileInput.value) {
    fileInput.value.click();
  }
};

const handleFileSelect = (event: any) => {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;
  if (file.type && !file.type.startsWith("image/")) {
    handlerStore.setError("لطفا یک فایل تصویری انتخاب کنید.");
    return;
  }
  if (file.size > 2 * 1024 * 1024) {
    handlerStore.setError("اندازه فایل نمی‌تواند بیشتر از 2 مگابایت باشد.");
    return;
  }
  avatarFile.value = file;
  avatarPreview.value = URL.createObjectURL(file);
  hasAvatar.value = true;
  userStore.uploadAvatar(buildAvatarFormData()).then(() => {
    clearFileInput();
    userStore.getMe();
  });
};

const onRemoveAvatar = () => {
  userStore.removeAvatar().then(() => {
    clearFileInput();
    avatarPreview.value = defaultAvatar;
    hasAvatar.value = false;
  });
};

const onSaveProfile = async () => {
  if (profileFormRef.value) {
    const { valid } = await profileFormRef.value.validate();
    if (!valid) {
      handlerStore.setError("لطفا موارد الزامی را وارد کنید.");
      return;
    }
  } else if (!form.fullName || !form.phone || !form.email) {
    handlerStore.setError("لطفا موارد الزامی را وارد کنید.");
    return;
  }
  userStore.updateMe({
    fullName: form.fullName,
    phone: form.phone,
    email: form.email,
    birthDate: form.birthDate || undefined,
    nationalId: form.nationalId || undefined,
    roles: form.roles,
  });
};

const onChangePassword = () => {
  if (
    !passwordForm.currentPassword ||
    !passwordForm.newPassword ||
    !passwordForm.confirmPassword
  ) {
    handlerStore.setError("لطفا هر سه فیلد رمز عبور را وارد کنید.");
    return;
  }
  if (passwordForm.newPassword !== passwordForm.confirmPassword) {
    handlerStore.setError("رمز عبور جدید و تکرار آن مطابقت ندارند.");
    return;
  }
  userStore
    .changePassword({
      currentPassword: passwordForm.currentPassword,
      newPassword: passwordForm.newPassword,
    })
    .then(() => {
      clearPasswordForm();
    });
};
</script>
