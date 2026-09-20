<template>
  <v-btn
    @click="handleClick"
    rounded="lg"
    class="tw:px-4! tw:bg-secondary-dark! tw:dark:bg-primary-dark!  tw:text-white! tw:group"
  >
    <div class="tw:text-[14px]!">بارگشت</div>
    <icon-arrow-left
      class="tw:text-[20px]! tw:ms-1! tw:group-hover:-translate-x-1.5 tw:transition tw:duration-200"
      :class="''"
    />
  </v-btn>
</template>

<script setup lang="ts">
import CircleOutline from "./icon/circleOutline.vue";

const props = defineProps({
  color: {
    type: String,
    default: "white",
  },
});

const router = useRouter();
const handleClick = () => {
  router.go(-1);
};
</script>
