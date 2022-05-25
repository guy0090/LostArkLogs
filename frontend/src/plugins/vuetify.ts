// Styles
import "@mdi/font/css/materialdesignicons.css";
import "vuetify/styles";

// import { fa } from "vuetify/iconsets/fa";
// import { md } from "vuetify/iconsets/md";
import { aliases, mdi } from "vuetify/iconsets/mdi";

// Vuetify
import { createVuetify } from "vuetify";

export default createVuetify({
  theme: {
    defaultTheme: "dark",
    options: {
      customProperties: true,
    },
  },
  icons: {
    defaultSet: "mdi",
    aliases,
    sets: {
      mdi,
      // md,
      // fa,
    },
  },
});
// https://vuetifyjs.com/en/introduction/why-vuetify/#feature-guides
