import { Module } from "vuex";

/**
 * Module containing socket.io related functions and variables.
 */
export const socket: Module<any, any> = {
  state: () => ({
    connected: false,
  }),
  mutations: {
    setWSConnected(state, value: boolean) {
      state.connected = value;
    },
  },
  getters: {
    connected(state) {
      return state.connected;
    },
  },
  actions: {
    sendSocketCommand({ dispatch, rootGetters }, command): Promise<void> {
      const app = rootGetters.app;

      return new Promise((resolve, reject) => {
        dispatch("info", `[WS] Sending command ${JSON.stringify(command)}`);
        const io = app.config.globalProperties.$io;
        io.timeout(5000).emit("send_command", command, (err: any, res: any) => {
          if (err || res.err) reject(new Error("Failed to send command"));
          else resolve(res);
        });
      });
    },
  },
};
