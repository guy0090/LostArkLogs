import "./registerServiceWorker";
import { createApp } from "vue";
import { createI18n } from "vue-i18n";
import App from "./App.vue";
import { createVueRouter } from "./router";
import { createVuexStore } from "./store";
import vuetify from "./plugins/vuetify";
import { loadFonts } from "./plugins/webfontloader";
import io from "socket.io-client";
import { NODE_ENV, API_HOST } from "@/config";

loadFonts();

const app = createApp(App);

import en from "@/i18n/en";
const i18n = createI18n({
  locale: "en",
  fallbackLocale: "en",
  messages: {
    en,
  },
});

console.log(NODE_ENV);

const socket = io(API_HOST, {
  path: "/ws",
  withCredentials: true,
});

app.config.globalProperties.$io = socket;

const store = createVuexStore(app);
const router = createVueRouter(app);

store.dispatch("info", "[APP] Render Start");

socket.on("connect", () => {
  store.dispatch("info", "[WS] Connected");
  store.commit("setWSConnected", true);
});

socket.on("connect_error", () => {
  store.dispatch("info", "[WS] Failed to connect");
  store.commit("setWSConnected", false);
});

socket.on("disconnect", (reason) => {
  store.dispatch("info", `[WS] Disconnected: ${reason}`);
  store.commit("setWSConnected", false);
});

socket.on("error", (err) => {
  store.dispatch("error", err.message);
});

socket.on("cmd", (cmd) => {
  store.dispatch("info", `Got socket command: ${cmd}`);
});

app.use(i18n).use(router).use(store).use(vuetify).mount("#app");
