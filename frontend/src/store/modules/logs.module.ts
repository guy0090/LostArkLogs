import { Session } from "@/interfaces/session.interface";
import axios from "axios";
import { Module } from "vuex";
import ms from "ms";
import { LogFilter, TrackedBosses } from "@/interfaces/util.interface";

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
    addCachedLog(state, value: any) {
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
    getCachedLog: (state) => (id: string) => {
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
            range: [+new Date() - ms("23h"), +new Date()],
            partyDps: 0,
            key: key,
            page: 1,
            pageSize: 20,
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
            range: [+new Date() - ms("23h"), +new Date()],
            partyDps: 0,
            page: 1,
            pageSize: 20,
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
    getUniqueBosses(context) {
      const { dispatch, rootGetters } = context;
      const app = rootGetters.app;

      dispatch("info", "[WS] Getting tracked bosses");
      return new Promise((resolve, reject) => {
        const io = app.config.globalProperties.$io;
        io.timeout(5000).emit(
          "unique_bosses",
          {},
          (
            err: Error,
            res: {
              bosses: TrackedBosses[];
            }
          ) => {
            if (err) {
              dispatch("error", err.message);
              reject(err);
            } else {
              resolve(res.bosses);
            }
          }
        );
      });
    },
    uploadLog(context, log: Session) {
      const { getters, dispatch, rootGetters } = context;
      const app = rootGetters.app;

      dispatch("info", "[WS] Uploading log");
      return new Promise((resolve, reject) => {
        const io = app.config.globalProperties.$io;
        const atCookie = getters.accessToken;

        io.timeout(5000).emit(
          "upload_log",
          { at: atCookie, data: log },
          (
            err: Error,
            res: {
              created: boolean;
              id: string;
            }
          ) => {
            if (err) {
              dispatch("error", err.message);
              reject(err);
            } else {
              if (res.created) resolve(res.id);
              else reject(new Error(`Failed to upload log`));
            }
          }
        );
      });
    },
    getLogWS(context, id: string) {
      const { dispatch, rootGetters } = context;
      const app = rootGetters.app;

      dispatch("info", "[WS] Getting log");
      return new Promise((resolve, reject) => {
        const io = app.config.globalProperties.$io;
        io.timeout(5000).emit(
          "get_log",
          { logId: id },
          (
            err: Error,
            res: {
              log: Session;
            }
          ) => {
            if (err) {
              dispatch("error", err.message);
              reject(err);
            } else {
              resolve(res.log);
            }
          }
        );
      });
    },
    async deleteOwnLog({ dispatch, getters }, id: string) {
      try {
        const key = getters.uploadToken;
        if (!key) return false;

        const res = await dispatch("request", {
          endpoint: "logs/delete",
          body: { key, logId: id },
        });
        dispatch("info", res);
        return true;
      } catch (err) {
        dispatch("error", err);
        return false;
      }
    },
    async filterLogs(context, filter: LogFilter) {
      const { dispatch, getters, rootGetters } = context;
      const app = rootGetters.app;
      const atCookie = getters.accessToken;

      dispatch("info", "[WS] Filtering for logs");
      return new Promise((resolve, reject) => {
        const io = app.config.globalProperties.$io;

        io.timeout(5000).emit(
          "filter_logs",
          { at: atCookie, filter },
          (
            err: Error,
            res: {
              found: number;
              page: number;
              pages: number;
              logs: Session[];
            }
          ) => {
            if (err) {
              dispatch("error", err.message);
              reject(err);
            } else {
              if (res) resolve(res);
              else reject(new Error(`Failed to filter logs`));
            }
          }
        );
      });
    },
  },
};
