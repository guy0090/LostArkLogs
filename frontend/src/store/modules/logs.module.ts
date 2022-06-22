import { Session } from "@/interfaces/session.interface";
import axios from "axios";
import { Module } from "vuex";

/**
 * Module containing log related functions and variables.
 */
export const logs: Module<any, any> = {
  state: () => ({
    tab: null,
    cached: [] as Session[],
  }),
  mutations: {
    setTab(state, value: any) {
      state.tab = value;
    },
    addCached(state, value: any) {
      const find = state.cached.findIndex(
        (cached: Session) => cached.id === value.id
      );
      if (find !== -1) state.cached[find] = value;
      else state.cached.push(value);
    },
  },
  getters: {
    tab(state) {
      return state.tab;
    },
    getCached: (state) => (id: string) => {
      return state.cached.find((cached: Session) => cached.id === id);
    },
  },
  actions: {
    setTab(context, value: any) {
      context.commit("setTab", value);
    },
    getUserRecentSessions({ getters, dispatch }) {
      dispatch("info", "[HTTP] Getting user recent sessions");
      return new Promise((resolve, reject) => {
        const key = getters.uploadToken;
        const request = {
          method: "POST",
          url: `${getters.apiUrl}/logs/filter`,
          withCredentials: true,
          data: {
            classes: [],
            bosses: [],
            gearLevel: [0, 1625],
            level: [0, 60],
            range: [],
            key: key,
          },
          headers: {
            "Content-Type": "application/json",
          },
        };

        axios(request)
          .then((res) => {
            resolve(res.data);
          })
          .catch((err) => {
            dispatch("error", err.message);
            reject(new Error(`Failed getting sessions`));
          });
      });
    },
    getRecentSessions({ getters, dispatch }) {
      dispatch("info", "[HTTP] Getting public recent sessions");
      return new Promise((resolve, reject) => {
        const request = {
          method: "POST",
          url: `${getters.apiUrl}/logs/filter`,
          data: {
            classes: [],
            bosses: [],
            gearLevel: [0, 1625],
            level: [0, 60],
            range: [],
          },
          headers: {
            "Content-Type": "application/json",
          },
        };

        axios(request)
          .then((res) => {
            resolve(res.data);
          })
          .catch((err) => {
            dispatch("error", err.message);
            reject(new Error(`Failed getting sessions`));
          });
      });
    },
  },
};
