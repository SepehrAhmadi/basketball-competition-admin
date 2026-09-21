<template>
  <v-btn
    @click="handleClick"
    variant="outlined"
    rounded="lg"
    class="tw:px-4! tw:group"
  >
    <div class="tw:text-[12px]!">بارگشت</div>
    <icon-arrow-left
      class="tw:text-[18px]! tw:ms-1! tw:group-hover:-translate-x-1.5 tw:transition tw:duration-200"
      :class="''"
    />
  </v-btn>
</template>

<script setup lang="ts">
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
