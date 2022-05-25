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
import LogsView from "@/views/logs.view.vue";
import AdminView from "@/views/admin.view.vue";

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
    path: "/log/:id",
    name: "log",
    component: LogsView,
    props: true,
  },
  {
    path: "/logs/:id",
    name: "logs",
    component: LogsView,
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
  const goingTo = to.name as string;

  store.dispatch(
    "info",
    `[RG] Authorized route accessed: ${goingTo} <- ${comingFrom}`
  );

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
  const user = store.getters.user;

  const comingFrom = from.name as string;
  const goingTo = to.name as string;

  if (!goingTo && !comingFrom) {
    store.dispatch("info", "[RG] Going to non-existant route");
    return { name: "home" };
  }

  store.dispatch("info", `[RG] To ${goingTo} from ${comingFrom}`);
  if (!comingFrom)
    store.dispatch(
      "info",
      "[RG] Coming from non-site page (or manually navigating?)"
    );

  if (cookie && goingTo === "login") {
    console.log("[RG] User is already logged in, redirecting from login");
    return { name: "home" };
  }

  // If the user is coming from login and going to home, dont refresh tokens
  if (goingTo && goingTo === "login" && !comingFrom) {
    store.dispatch("info", "[RG] User is going to login, not refreshing");
  } else {
    store.dispatch("getTokensWS").catch((err) => {
      store.dispatch(
        "info",
        `[WS] Refreshing auth tokens failed: ${err.message}`
      );
      store.dispatch("revokeTokens");
    });
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
