import { createStore } from "vuex";
import { App } from "vue";
import { auth } from "@/store/modules/auth.module";
import { env } from "@/store/modules/env.module";
import { user } from "@/store/modules/user.module";
import { socket } from "@/store/modules/socket.module";
import { logs } from "@/store/modules/logs.module";
import { resources } from "@/store/modules/resources.module";
import { admin } from "@/store/modules/admin.module";
import { stats } from "@/store/modules/stats.module";

export const createVuexStore = (app: App<Element>) => {
  return createStore({
    modules: {
      auth: auth,
      env: env,
      user: user,
      socket: socket,
      logs: logs,
      resources: resources,
      admin: admin,
      stats: stats,
    },
    state: {
      app: app,
      authenticated: false,
      pageLoading: false,
      currentRoute: "home",
    },
    mutations: {
      setAuthenticated(state, value: boolean) {
        state.authenticated = value;
      },
      setPageLoading(state, value: boolean) {
        state.pageLoading = value;
      },
      setCurrentRoute(state, value: string) {
        state.currentRoute = value;
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
      currentRoute(state) {
        return state.currentRoute;
      },
      abbrNum: (state) => (number: number, decPlaces: number) => {
        // 2 decimal places => 100, 3 => 1000, etc
        decPlaces = Math.pow(10, decPlaces);

        let abbreviated = "0";
        // Enumerate number abbreviations
        const abbrev = ["k", "m", "b", "t"];

        // Go through the array backwards, so we do the largest first
        for (let i = abbrev.length - 1; i >= 0; i--) {
          // Convert array index to "1000", "1000000", etc
          const size = Math.pow(10, (i + 1) * 3);

          // If the number is bigger or equal do the abbreviation
          if (size <= number) {
            // Here, we multiply by decPlaces, round, and then divide by decPlaces.
            // This gives us nice rounding to a particular decimal place.
            number = Math.round((number * decPlaces) / size) / decPlaces;

            // Handle special case where we round up to the next abbreviation
            if (number == 1000 && i < abbrev.length - 1) {
              number = 1;
              i++;
            }

            // Add the letter for the abbreviation
            abbreviated = number + abbrev[i];

            // We are done... stop
            break;
          }
        }

        return abbreviated;
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
