import { App } from "vue";
import {
  createRouter,
  createWebHistory,
  RouteLocationNormalized,
  RouteRecordRaw,
} from "vue-router";
import { Store } from "vuex";
import HomeView from "@/views/home.view.vue";
import LoginView from "@/views/login.view.vue";
import UserView from "@/views/user.view.vue";
import LogsView from "@/views/logs.view.vue";
import AdminView from "@/views/admin.view.vue";

import UserProfile from "@/components/user.component.vue";
import UserLookup from "@/components/user/lookup.component.vue";

import LogsBase from "@/components/logs/base.component.vue";
import Log from "@/components/logs/log.component.vue";
import ULog from "@/components/logs/ulog.component.vue";

import UserAdmin from "@/components/admin/users.component.vue";
import ServiceAdmin from "@/components/admin/service.component.vue";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    name: "home",
    component: HomeView,
    props: true,
  },
  {
    path: "/login",
    name: "login",
    component: LoginView,
    props: true,
  },
  {
    path: "/profile",
    name: "user",
    component: UserView,
    props: true,
    children: [
      {
        path: "",
        name: "profile",
        component: UserProfile,
        props: true,
      },
      {
        path: ":id",
        name: "lookup",
        component: UserLookup,
        props: true,
      },
    ],
  },
  {
    path: "/logs",
    name: "logs",
    component: LogsView,
    props: true,
    children: [
      {
        path: "",
        name: "logsBase",
        component: LogsBase,
      },
      {
        path: ":id",
        name: "logs",
        component: Log,
      },
    ],
  },
  {
    path: "/ulog",
    name: "ulog",
    component: ULog,
    props: true,
  },
  {
    path: "/a",
    name: "admin",
    component: AdminView,
    props: true,
    meta: {
      authorization: true,
    },
    children: [
      {
        path: "users",
        name: "usersAdmin",
        component: UserAdmin,
      },
      {
        path: "service",
        name: "serviceAdmin",
        component: ServiceAdmin,
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

const handleAuthorizedRoute = async (
  app: App<Element>,
  to: RouteLocationNormalized,
  from: RouteLocationNormalized
): Promise<boolean | void> => {
  const store = app.config.globalProperties.$store as Store<any>;
  const atCookie = store.getters.accessToken;

  const comingFrom = from.name as string;
  let goingTo = to.name as string;

  store.dispatch(
    "info",
    `[RG] Authorized route accessed: ${comingFrom} -> ${goingTo}`
  );

  // Default to first authed route to check perms
  // TODO: Change this to allow permissions per child route
  if (to.matched.length > 1) {
    store.dispatch(
      "info",
      `[RG] Setting access to first match ${goingTo} -> ${to.matched[0].name?.toString()}`
    );
    goingTo = to.matched[0].name as string;
  }

  return new Promise((resolve, reject) => {
    if (!atCookie) {
      store.dispatch("error", "[RG] User is not logged in");
      reject(new Error("user is not logged in"));
    } else {
      store
        .dispatch("getPageAuthorization", goingTo)
        .then((access) => {
          if (access) {
            resolve(access);
          } else {
            store.dispatch(
              "error",
              "[RG] User is not authorized for this page"
            );
            reject(new Error("user is not authorized"));
          }
        })
        .catch((err) => {
          reject(err);
        });
    }
  });
};

const handleRouteChange = async (
  app: App<Element>,
  to: RouteLocationNormalized,
  from: RouteLocationNormalized
) => {
  const store = app.config.globalProperties.$store as Store<any>;
  const cookie = store.getters.accessToken;

  const comingFrom = from.name as string;
  const goingTo = to.name as string;

  store.commit("setCurrentRoute", to?.matched[0].name ?? "home");

  if (!goingTo && !comingFrom) {
    store.dispatch("info", "[RG] Going to non-existant route");
    return { name: "home" };
  }

  store.dispatch("info", `[RG] To ${goingTo} from ${comingFrom}`);
  if (!comingFrom) {
    store.dispatch(
      "info",
      "[RG] Coming from non-site page (or manually navigating?)"
    );

    if (goingTo !== "login") {
      store.dispatch("getTokensWS").catch((err) => {
        store.dispatch(
          "info",
          `[WS] Refreshing auth tokens failed: ${err.message}`
        );
        store.dispatch("revokeTokens");
      });
    }
  }

  if (cookie && goingTo === "login") {
    store.dispatch(
      "info",
      "[RG] User is already logged in, redirecting from login"
    );
    return { name: "home" };
  }

  // If the user is coming from login and going to home, dont refresh tokens
  if (goingTo && goingTo === "login" && !comingFrom) {
    store.dispatch("info", "[RG] User is going to login, not refreshing");
  }

  if (to.meta.authorization) {
    try {
      const handled = await handleAuthorizedRoute(app, to, from);
      if (handled) return true;
      else return false;
    } catch (authHanddleErr) {
      store.dispatch(
        "error",
        `Error handling auth on route ${goingTo}: ${
          (authHanddleErr as Error).message
        }`
      );
      return { name: "home" };
    }
  }
};

export const createVueRouter = (app: App<Element>) => {
  router.beforeResolve(
    async (to, from) => await handleRouteChange(app, to, from)
  );
  return router;
};
