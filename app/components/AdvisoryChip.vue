<template>
  <v-chip
    v-if="advisory"
    size="x-small"
    :color="color"
    variant="tonal"
    :title="advisory.message"
  >
    {{ advisory.message }}
  </v-chip>
</template>

<script setup lang="ts">
type AdvisorySeverity = "INFO" | "WARNING" | "BLOCKER";

interface Advisory {
  code: string;
  severity: AdvisorySeverity;
  message: string;
  params: Record<string, string | number | boolean | null>;
}

const props = defineProps<{
  advisory: Advisory | null | undefined;
}>();

const color = computed(() => {
  switch (props.advisory?.severity) {
    case "BLOCKER":
      return "error";
    case "WARNING":
      return "warning";
    default:
      return "default";
  }
});
</script>
