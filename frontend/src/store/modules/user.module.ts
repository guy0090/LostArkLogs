import { User } from "@/interfaces/user.interface";
import { Module } from "vuex";

const tryParse = (val: string | null): unknown | undefined => {
  if (!val) return undefined;
  try {
    return JSON.parse(val);
  } catch (e) {
    return undefined;
  }
};

/**
 * Module containing user state functions and variables.
 */
export const user: Module<any, any> = {
  state: () => ({
    avatar: localStorage.getItem("avatar") || "",
    user: tryParse(localStorage.getItem("user")) as User | undefined,
    verifiedAlertAccepted: localStorage.getItem("verifiedAlertAccepted") || "0",
  }),
  mutations: {
    setUser(state, user: User) {
      state.user = user;
      localStorage.setItem("user", JSON.stringify(user));
    },
    removeUser(state) {
      state.user = null;
      localStorage.removeItem("user");
    },
    setAvatar(state, avatar: string) {
      state.avatar = avatar;
      localStorage.setItem("avatar", avatar);
    },
    removeAvatar(state) {
      state.avatar = "";
      localStorage.removeItem("avatar");
    },
    setVerifiedAlertAccepted(state, accepted: number) {
      state.verifiedAlertAccepted = `${accepted}`;
      localStorage.setItem("verifiedAlertAccepted", `${accepted}`);
    },
  },
  getters: {
    user(state) {
      return state.user;
    },
    avatar(state) {
      return state.avatar;
    },
    verifiedAlertAccepted(state) {
      return state.verifiedAlertAccepted;
    },
  },
  actions: {
    parseDiscordAvatarHash(
      { dispatch },
      user: {
        id: string;
        discordId: string;
        username: string;
        discriminator: number;
        avatar: string;
        registered: string;
      }
    ): string {
      const baseURL = "https://cdn.discordapp.com/";

      let avatar = "";
      if (user.avatar === null) {
        avatar = `${baseURL}/embed/avatars/${user.discriminator % 5}.png`;
      } else {
        const isGIF = user.avatar.startsWith("a_");
        avatar = `${baseURL}avatars/${user.discordId}/${user.avatar}${
          isGIF ? ".gif" : ".png"
        }`;
      }

      return avatar;
    },
  },
};
