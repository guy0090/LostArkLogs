<template>
  <v-app overflow-y-auto :theme="theme">
    <v-app-bar app :image="`/img/app-bar-loaders/0.webp`">
      <v-img
        class="mx-1"
        src="/img/icons/mokoko.png"
        max-height="40"
        max-width="40"
        contain
      ></v-img>

      <v-toolbar-title class="title">
        <span
          id="brand"
          class="subheading"
          v-on:click="$router.push({ name: 'home' })"
        >
          <!-- <v-icon large>mdi-chart-box</v-icon> -->
          <span>&nbsp;Lost Ark Logs</span>
        </span>
      </v-toolbar-title>

      <v-spacer class="title-spacer"></v-spacer>
      <v-btn
        v-if="mode !== null"
        variant="contained-text"
        :color="
          store.getters.logLevel === 'debug' ? 'secondary' : 'red-lighten-1'
        "
        v-on:click="
          store.commit(
            'setLogLevel',
            store.getters.logLevel === 'debug' ? 'none' : 'debug'
          )
        "
      >
        LOGGING: {{ store.getters.logLevel }} </v-btn
      >&nbsp;
      <v-btn
        v-if="currentRouteName !== 'login' && !store.getters.user"
        v-on:click="login"
        class="bg-indigo-accent-3"
        variant="contained-text"
      >
        <!-- <v-icon>mdi-login-variant</v-icon> -->
        <v-icon>mdi-discord</v-icon>
        &nbsp;login
      </v-btn>
      <div v-else>
        <v-btn
          v-if="store.getters.permissions.includes('admin')"
          class="bg-red-darken-3 me-3"
          variant="contained-text"
          v-on:click="$router.push({ name: 'admin' })"
          >ADMIN
        </v-btn>
        <v-btn
          v-else-if="store.getters.permissions.includes('verified')"
          prepend-icon="mdi-check"
          class="bg-indigo-darken-1 me-3"
          variant="contained-text"
          :disabled="true"
          >VERIFIED
        </v-btn>
        <v-avatar :image="store.getters.avatar"></v-avatar>
        &nbsp;
      </div>
    </v-app-bar>

    <v-navigation-drawer
      v-model="navSettings.drawer"
      rail
      bottom
      permanent
      :expand-on-hover="navSettings.expand"
      v-on:mouseenter="navEnter"
      v-on:mouseleave="navLeave"
    >
      <v-list-item>
        <v-list-item-avatar>
          <v-fade-transition mode="out-in" v-if="navSettings.expand">
            <v-icon
              v-if="navSettings.hovering"
              color="white"
              v-on:click="navSettings.expand = !navSettings.expand"
            >
              mdi-menu
            </v-icon>
            <v-icon
              v-else
              color="white"
              v-on:click="navSettings.expand = !navSettings.expand"
            >
              mdi-forwardburger
            </v-icon>
          </v-fade-transition>
          <v-icon
            v-else
            color="white"
            v-on:click="navSettings.expand = !navSettings.expand"
          >
            mdi-menu
          </v-icon>
        </v-list-item-avatar>
        <v-list-item-title></v-list-item-title>
      </v-list-item>
      <v-divider></v-divider>

      <v-list
        density="compact"
        nav
        :selected="[store.getters.currentRoute]"
        v-on:click:select="navSelect"
      >
        <v-list-item value="home" v-on:click="$router.push({ name: 'home' })">
          <v-list-item-avatar>
            <v-icon color="white"> mdi-home </v-icon>
          </v-list-item-avatar>
          <v-list-item-title>Home</v-list-item-title>
        </v-list-item>
        <v-list-item disabled value="settings">
          <v-list-item-avatar>
            <v-icon color="white"> mdi-cog </v-icon>
          </v-list-item-avatar>
          <v-list-item-title>Settings</v-list-item-title>
        </v-list-item>
        <v-list-item
          value="logs"
          v-on:click="$router.push({ name: 'logsBase' })"
        >
          <v-list-item-avatar>
            <v-icon color="white"> mdi-sword </v-icon>
          </v-list-item-avatar>
          <v-list-item-title>Encounters</v-list-item-title>
        </v-list-item>
        <v-list-item value="ulog" v-on:click="$router.push({ name: 'ulog' })">
          <v-list-item-avatar>
            <v-icon color="white"> mdi-upload </v-icon>
          </v-list-item-avatar>
          <v-list-item-title>View File</v-list-item-title>
        </v-list-item>
        <v-list-item disabled value="stats">
          <v-list-item-avatar>
            <v-icon color="white"> mdi-poll </v-icon>
          </v-list-item-avatar>
          <v-list-item-title>Stats</v-list-item-title>
        </v-list-item>
      </v-list>

      <template v-slot:append>
        <div class="pa-2">
          <v-btn block rounded="sm" color="blue-darken-3" v-on:click="openGh">
            <v-icon icon="mdi-github"></v-icon>
            <span v-if="navSettings.hovering && navSettings.expand"
              >&nbsp;Contribute</span
            >
          </v-btn>
        </div>
        <div v-if="store.getters.user">
          <v-divider></v-divider>
          <div class="pa-2">
            <v-btn block rounded="sm" color="red-darken-3" v-on:click="logout">
              <v-icon icon="mdi-logout-variant"></v-icon>
              <span v-if="navSettings.hovering && navSettings.expand"
                >&nbsp;Logout</span
              >
            </v-btn>
          </div>
        </div>
      </template>
    </v-navigation-drawer>

    <v-main>
      <v-progress-linear
        :active="store.getters.pageLoading"
        :indeterminate="store.getters.pageLoading"
        absolute
        bottom
        color="indigo-accent-4"
      ></v-progress-linear>
      <v-row
        v-if="
          store.getters.user &&
          store.getters.permissions.includes('verified') &&
          store.getters.verifiedAlertAccepted === '0'
        "
        justify="center"
      >
        <v-col cols="3">
          <v-alert
            :v-model="true"
            class="mb-2"
            color="success"
            icon="mdi-check"
            border="start"
            variant="contained-text"
            closable
            close-label="Close Alert"
            title="Verified"
            :absolute="true"
            bottom
          >
            You are verified! You can now use all features of the site.
            <template v-slot:close="toggle">
              <v-icon
                size="md"
                icon="mdi-close"
                variant="plain"
                @click="toggle"
                v-on:click="store.commit('setVerifiedAlertAccepted', '1')"
              >
              </v-icon>
            </template>
          </v-alert>
        </v-col>
      </v-row>
      <router-view />
    </v-main>
  </v-app>
</template>

<script lang="ts">
import { defineComponent, reactive } from "vue";
import { ref } from "vue";
import { useCookies } from "vue3-cookies";
import { useStore } from "vuex";
import { NODE_ENV } from "./config/index";

export default defineComponent({
  name: "App",
  mounted() {
    if (!localStorage.getItem("loglevel")) {
      if (NODE_ENV === "development") {
        localStorage.setItem("loglevel", "debug");
      } else {
        localStorage.setItem("loglevel", "none");
      }
    }
  },

  setup() {
    const theme = ref("dark");
    const store = useStore();
    const { cookies } = useCookies();

    const navSettings = reactive({
      drawer: true,
      hovering: false,
      expand: true,
      selected: "home",
    });

    return {
      store,
      cookies,
      theme,
      toggleTheme() {
        theme.value = theme.value === "dark" ? "light" : "dark";
      },
      navSettings,
    };
  },
  data() {
    return {
      mode: localStorage.getItem("mode"),
    };
  },
  methods: {
    navEnter: function () {
      if (this.navSettings.expand) this.navSettings.hovering = true;
    },
    navLeave: function () {
      if (this.navSettings.expand) this.navSettings.hovering = false;
    },
    navSelect: function (e: any) {
      this.store.commit("setCurrentRoute", e.id);
    },
    login: function () {
      const oAuthURL = this.store.getters.authUrl;
      window.location.href = oAuthURL;
    },
    logout: function () {
      this.store
        .dispatch("revokeTokens")
        .then(() => {
          this.$router.push({ name: "home" });
        })
        .catch((err) => {
          this.$router.push({ name: "home" });
          this.store.dispatch("error", err);
        });
    },
    revoke: function () {
      this.store
        .dispatch("revokeTokens")
        .then(() => {
          this.$router.push({ name: "home" });
        })
        .catch((err) => {
          this.store.dispatch("error", err);
        });
    },
    getUser: function () {
      return this.store.getters.user;
    },
    getAvatar: function () {
      return this.store.getters.avatar;
    },
    setVerifiedClicked: function () {
      this.store.commit("setVerifiedAlertAccepted", 1);
    },
    openGh() {
      window.open(process.env.VUE_APP_GITHUB);
    },
  },
  computed: {
    currentRouteName() {
      return this.$route.name;
    },
  },
});
</script>

<style>
html {
  overflow-y: auto !important;
}

#brand {
  cursor: pointer;
}

.avatar {
  width: 45px;
  height: auto;
  border: 1px black;
  border-radius: 50%;
}

#logout-btn {
  color: firebrick !important;
}

/* width */
::-webkit-scrollbar {
  width: 10px;
}

/* Track */
::-webkit-scrollbar-track {
  background: #121212;
}

/* Handle */
::-webkit-scrollbar-thumb {
  background: #263238;
}

/* Handle on hover */
::-webkit-scrollbar-thumb:hover {
  background: #555;
}
</style>
