import * as directives from "vuetify/directives";
import "@mdi/font/css/materialdesignicons.css";
import "vuetify/styles";
import { createVuetify } from "vuetify";

export default defineNuxtPlugin((app) => {
  const vuetify = createVuetify({
    directives,
    theme: {
      defaultTheme: "light",

      themes: {
        light: {
          dark: false,
          colors: {
            background: "#F1F1F1",
            surface: "#FFFFFF",
            primary: "#1d202e",
            secondary: "#39426e",
            gray: "#F1F5F9",
          },
        },
        dark: {
          dark: true,
          colors: {
            background: "#000000",
            surface: "#1d202e",
            primary: "#f1f1f1",
            secondary: "#39426e",
            gray: "#F1F5F9",
          },
        },
      },
    },

    locale: {
      locale: "fa",
      rtl: { fa: true, en: false },
    },
  });
  app.vueApp.use(vuetify);
});
