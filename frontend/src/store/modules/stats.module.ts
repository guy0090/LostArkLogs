import { Module } from "vuex";

export const stats: Module<any, any> = {
  state: () => ({
    // dpsRankings: [],
    classDistribution: {},
  }),
  mutations: {
    setClassDistribution(state, distribution: any[]) {
      state.classDistribution = distribution;
    },
  },
  getters: {
    dpsRankings(state) {
      return state.dpsRankings;
    },
    classDistribution(state) {
      return state.classDistribution;
    },
  },
  actions: {
    async fetchLogCounts(context) {
      const { dispatch, rootGetters } = context;
      const app = rootGetters.app;

      dispatch("info", "[WS] Getting log count stats");
      return new Promise((resolve, reject) => {
        const io = app.config.globalProperties.$io;
        io.timeout(5000).emit("log_counts", {}, (err: Error, res: any) => {
          if (err) {
            dispatch("error", err.message);
            reject(err);
          } else {
            resolve(res);
          }
        });
      });
    },
    async fetchClassDistribution(context) {
      const { dispatch, getters, rootGetters, commit } = context;
      const app = rootGetters.app;

      if (Object.keys(getters.classDistribution).length > 0) {
        return JSON.parse(JSON.stringify(getters.classDistribution));
      }

      dispatch("info", "[WS] Getting class distribution");
      return new Promise((resolve, reject) => {
        const io = app.config.globalProperties.$io;
        io.timeout(5000).emit("class_dist", {}, (err: Error, res: any[]) => {
          if (err) {
            dispatch("error", err.message);
            reject(err);
          } else {
            commit("setClassDistribution", res);
            resolve(res);
          }
        });
      });
    },
    async fetchDpsRanking(context, { classId, zoneId }) {
      const { dispatch, rootGetters } = context;
      const app = rootGetters.app;

      dispatch(
        "info",
        `[WS] Getting dps rankings for class ${classId} in zone ${zoneId}`
      );
      return new Promise((resolve, reject) => {
        const io = app.config.globalProperties.$io;
        io.timeout(5000).emit(
          "dps_ranking",
          { classId, zoneId },
          (err: Error, res: any[]) => {
            if (err) {
              dispatch("error", err.message);
              reject(err);
            } else {
              resolve(res);
            }
          }
        );
      });
    },
  },
};
