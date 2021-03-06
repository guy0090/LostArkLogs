import { TokenData } from "@/interfaces/auth.interface";
import { User } from "@/interfaces/user.interface";
import axios from "axios";
import Cookies from "js-cookie";
import { Module } from "vuex";

const isProduction = process.env.NODE_ENV === "production";
const host = process.env.VUE_APP_HOST;

/**
 * Module containing authentication related functions and variables.
 */
export const auth: Module<any, any> = {
  state: () => ({
    accessToken: Cookies.get("at") || null,
    expiresAt: null,
    uploadToken: null,
    refreshingAccessToken: false,
    permissions: [],
  }),
  mutations: {
    setAccessToken(state, cookie: TokenData | string) {
      if (typeof cookie !== "string") {
        const timeout = Date.now() + cookie.expiresIn * 1000;
        state.accessToken = cookie.token;
        state.expiresAt = timeout;

        Cookies.set("at", cookie.token, {
          expires: new Date(timeout),
          path: "/",
          domain: isProduction ? host : undefined,
        });
      } else {
        state.accessToken = cookie;
      }
    },
    removeUploadToken(state) {
      state.uploadToken = null;
    },
    removeAccessToken(state) {
      state.accessToken = null;
      state.expiresAt = null;
      Cookies.remove("at");
      Cookies.remove("Authorization");
    },
    setExpiresAt(state, timeout: number) {
      state.expiresAt = timeout;
    },
    setUploadToken(state, token: string) {
      state.uploadToken = token;
    },
    setRefreshingAccessToken(state, refreshing: boolean) {
      state.refreshingAccessToken = refreshing;
    },
    setPermissions(state, permissions: string[]) {
      state.permissions = permissions;
    },
    addPermission(state, permission: string) {
      if (!state.permissions.includes(permission))
        state.permissions.push(permission);
    },
    removePermission(state, permission: string) {
      const index = state.permissions.indexOf(permission);
      if (index > -1) state.permissions.splice(index, 1);
    },
  },
  getters: {
    accessToken: (state) => state.accessToken,
    expiresAt: (state) => state.expiresAt,
    uploadToken: (state) => state.uploadToken,
    refreshingAccessToken: (state) => state.refreshingAccessToken,
    isAdmin: (state) => state.isAdmin,
    permissions: (state) => state.permissions,
  },
  actions: {
    getTokensWS(context): Promise<User> {
      const { getters, commit, dispatch, rootGetters } = context;
      const app = rootGetters.app;

      dispatch("info", "[WS] Getting user auth tokens");
      return new Promise((resolve, reject) => {
        const io = app.config.globalProperties.$io;
        const atCookie = getters.accessToken;

        io.timeout(5000).emit(
          "login",
          { at: atCookie },
          (
            err: Error,
            res: {
              at: TokenData;
              u: User;
              p?: string[];
              ut?: string;
              failed?: boolean;
            }
          ) => {
            if (!err) {
              if (res.failed === undefined || !res.failed) {
                const newToken = res.at;
                const user = res.u;
                const perms = res.p;
                const uploadToken = res.ut;

                commit("setAccessToken", newToken);
                commit("setUser", user);
                commit("setPermissions", perms);
                dispatch("parseDiscordAvatarHash", user).then((avatar) => {
                  commit("setAvatar", avatar);
                });

                if (uploadToken) commit("setUploadToken", uploadToken);

                resolve(user);
              } else {
                commit("removeAccessToken");
                reject(new Error("Failed to refresh access token"));
              }
            } else {
              commit("removeAccessToken");
              reject(err);
            }
          }
        );
      });
    },
    getTokensHTTP(context, code = "0"): Promise<User> {
      const { commit, getters, dispatch } = context;

      dispatch("info", "[HTTP] Getting user auth tokens");
      return new Promise((resolve, reject) => {
        axios({
          method: "POST",
          url: `${getters.apiUrl}/auth/login`,
          withCredentials: true,
          data: {
            code: code,
          },
          headers: {
            "Content-Type": "application/json",
          },
        })
          .then((res) => {
            const user = res.data.user;
            const tokenData: TokenData = {
              token: Cookies.get("at") as string,
              expiresIn: 3600,
            };

            commit("setUser", user);
            dispatch("parseDiscordAvatarHash", user).then((avatar) => {
              commit("setAvatar", avatar);
            });

            commit("setAccessToken", tokenData);
            resolve(user as User);
          })
          .catch((err) => {
            reject(err);
          });
      });
    },
    getPageAuthorization(context, page): Promise<boolean> {
      const { getters, rootGetters } = context;
      const app = rootGetters.app;
      const io = app.config.globalProperties.$io;

      return new Promise((resolve, reject) => {
        if (getters.accessToken) {
          io.timeout(5000).emit(
            "page_access",
            { page: page, at: getters.accessToken },
            (err: Error, res: { access: boolean }) => {
              if (!err) {
                resolve(res.access);
              } else {
                reject(new Error("failed authorizing page access"));
              }
            }
          );
        } else {
          reject(new Error("no access token"));
        }
      });
    },
    revokeTokens(context): Promise<void> {
      const { getters, commit, dispatch, rootGetters } = context;
      const app = rootGetters.app;

      dispatch("info", "[HTTP] Revoking user tokens");
      return new Promise((resolve, reject) => {
        const io = app.config.globalProperties.$io;
        axios({
          method: "post",
          url: `${getters.apiUrl}/auth/revoke`,
          withCredentials: true,
        })
          .then(() => {
            commit("removeUser");
            commit("removeAvatar");
            commit("removeAccessToken");
            commit("setPermissions", []);
            commit("removeUploadToken");
            // Reopen WS to reset headers
            io.disconnect().connect();
            resolve();
          })
          .catch(reject);
      });
    },
    hasPermissions({ rootGetters }, permissions: string[]): Promise<boolean> {
      const app = rootGetters.app;
      const io = app.config.globalProperties.$io;

      return new Promise((resolve, reject) => {
        // Will timeout on unauthorized
        io.timeout(5000).emit(
          "has_permissions",
          { p: permissions },
          (err: Error, res: { p: boolean }) => {
            if (!err) {
              resolve(res.p);
            } else {
              reject(new Error("failed getting permission status"));
            }
          }
        );
      });
    },
  },
};
