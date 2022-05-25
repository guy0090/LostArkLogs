import axios from "axios";
import { Module } from "vuex";

/**
 * Module containing socket.io related functions and variables.
 */
export const logs: Module<any, any> = {
  state: () => ({
    tab: null,
  }),
  mutations: {
    setTab(state, value: any) {
      state.tab = value;
    },
  },
  getters: {
    tab(state) {
      return state.tab;
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
          url: `${getters.apiUrl}/logs/recent`,
          data: {
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
          url: `${getters.apiUrl}/logs/publicRecent`,
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
