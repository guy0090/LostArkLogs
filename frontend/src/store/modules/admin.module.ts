import { Module } from "vuex";
import { BannedUser, UnverifiedUser, User } from "@/interfaces/user.interface";
import axios from "axios";

/**
 * Module containing admin state functions and variables.
 */
export const admin: Module<any, any> = {
  state: () => ({
    unverifiedUsers: [] as UnverifiedUser[],
    bannedUsers: [] as BannedUser[],
    userSearchResults: [] as User[],
    cachedKeys: [] as string[],
    adminTab: "users",
  }),
  getters: {
    unverifiedUsers(state) {
      return state.unverifiedUsers;
    },
    bannedUsers(state) {
      return state.bannedUsers;
    },
    userSearchResults(state) {
      return state.userSearchResults;
    },
    cachedKeys(state) {
      return state.cachedKeys;
    },
    adminTab(state) {
      return state.adminTab;
    },
  },
  mutations: {
    setUnverifiedUsers(state, users: UnverifiedUser[]) {
      state.unverifiedUsers = users;
    },
    removeUnverifiedUser(state, user: UnverifiedUser) {
      state.unverifiedUsers = state.unverifiedUsers.filter(
        (u: UnverifiedUser) => u.id !== user.id
      );
    },
    setBannedUsers(state, users: BannedUser[]) {
      state.bannedUsers = users;
    },
    removeBannedUser(state, user: BannedUser) {
      state.bannedUsers = state.bannedUsers.filter(
        (u: BannedUser) => u.id !== user.id
      );
    },
    setUserSearchResults(state, users: User[]) {
      state.userSearchResults = users;
    },
    setUserSearchResultBanned(state, payload: { id: string; banned: boolean }) {
      const { id, banned } = payload;
      const res = state.userSearchResults.find((u: User) => u.id === id);
      if (res) res.banned = banned;
    },
    setCachedKeys(state, keys: string[]) {
      state.cachedKeys = keys;
    },
    deleteCachedKeys(state, keys: string[]) {
      state.cachedKeys = state.cachedKeys.filter(
        (k: { key: string; ttl: number }) => !keys.includes(k.key)
      );
    },
    setAdminTab(state, tab: string) {
      state.adminTab = tab;
    },
  },
  actions: {
    async request(
      { getters, dispatch },
      data: { endpoint: string; body: any }
    ) {
      try {
        const res = await axios({
          method: "POST",
          url: `${getters.apiUrl}/${data.endpoint}`,
          withCredentials: true,
          data: data.body,
          headers: {
            "Content-Type": "application/json",
          },
        });
        return res.data;
      } catch (err) {
        dispatch("error", err);
        return err;
      }
    },
    async getUnverifiedUsers({ dispatch, commit }) {
      try {
        const res = await dispatch("request", {
          endpoint: "admin/users/unverified",
          body: {},
        });
        commit("setUnverifiedUsers", res);
        return res;
      } catch (err) {
        dispatch("error", err);
        commit("setUnverifiedUsers", []);
        return [];
      }
    },
    async getBannedUsers({ dispatch, commit }) {
      try {
        const res = await dispatch("request", {
          endpoint: "admin/users/banned",
          body: {},
        });
        commit("setBannedUsers", res);
        return res;
      } catch (err) {
        dispatch("error", err);
        commit("setBannedUsers", []);
        return [];
      }
    },
    async getCachedKeys({ dispatch, commit }) {
      commit("setCachedKeys", []);
      try {
        const res = await dispatch("request", {
          endpoint: "admin/service/cache/keys",
          body: {},
        });
        res.sort((a: any, b: any) => a.ttl - b.ttl);
        commit("setCachedKeys", res);
        return res;
      } catch (err) {
        dispatch("error", err);
        return [];
      }
    },
    async flushCachedKeys({ dispatch, commit, getters }) {
      if (getters.cachedKeys.length === 0) return;

      try {
        const res = await dispatch("request", {
          endpoint: "admin/service/cache/clear",
          body: {},
        });
        dispatch("info", res);
        commit("setCachedKeys", []);

        return true;
      } catch (err) {
        dispatch("error", err);
        return false;
      }
    },
  },
};
