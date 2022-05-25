import { createStore } from "vuex";
import { App } from "vue";
import { auth } from "@/store/modules/auth.module";
import { env } from "@/store/modules/env.module";
import { user } from "./modules/user.module";
import { socket } from "./modules/socket.module";
import { logs } from "./modules/logs.module";

export const createVuexStore = (app: App<Element>) => {
  return createStore({
    modules: {
      auth: auth,
      env: env,
      user: user,
      socket: socket,
      logs: logs,
    },
    state: {
      app: app,
      authenticated: false,
      pageLoading: false,
    },
    mutations: {
      setAuthenticated(state, value: boolean) {
        state.authenticated = value;
      },
      setPageLoading(state, value: boolean) {
        state.pageLoading = value;
      },
    },
    getters: {
      app(state) {
        return state.app;
      },
      authenticated(state) {
        return state.authenticated;
      },
      pageLoading(state) {
        return state.pageLoading;
      },
    },
    actions: {
      info(context, message: any): void {
        if (context.getters.logLevel === "debug") {
          console.log(message);
        }
      },
      error(context, message: any): void {
        if (context.getters.logLevel === "debug") {
          console.error(message);
        }
      },
    },
  });
};
