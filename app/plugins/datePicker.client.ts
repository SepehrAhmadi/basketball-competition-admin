import VuePersianDatetimePicker from "vue3-persian-datetime-picker";
export default defineNuxtPlugin((nuxtApp) => {
  // Teleport the picker overlay to <body> so it escapes Vuetify stacking
  // contexts (v-card has z-index: 0, v-main/v-layout, dialogs, etc.).
  // Otherwise even z-index: 9999 stays trapped under v-app-bar / v-navigation-drawer.
  const props: any = (VuePersianDatetimePicker as any).props;
  if (props?.appendTo) {
    props.appendTo.default = "body";
  }
  nuxtApp.vueApp.component("date-picker", VuePersianDatetimePicker);
});
