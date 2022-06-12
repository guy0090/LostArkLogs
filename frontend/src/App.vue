<template>
  <v-app overflow-y-auto :theme="theme">
    <v-app-bar app :image="`/img/app-bar-loaders/0.jpg`">
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
        <v-menu>
          <template v-slot:activator="{ props }">
            <v-btn v-bind="props" icon="mdi-cog"></v-btn>
          </template>
          <v-list density="comfortable">
            <v-list-subheader>SETTINGS</v-list-subheader>
            <v-list-item key="0" value="0">
              <v-list-item-title
                >{{ store.getters.user.username }}#{{
                  store.getters.user.discriminator
                }}</v-list-item-title
              >
            </v-list-item>
            <v-list-item key="1" value="1" v-on:click="logout">
              <v-list-item-title id="logout-btn">Logout</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
        <v-btn
          v-if="store.getters.permissions.includes('admin')"
          color="red-darken-1"
          variant="contained-text"
          v-on:click="$router.push({ name: 'admin' })"
          >ADMIN
        </v-btn>
        <v-btn
          v-else-if="store.getters.permissions.includes('verified')"
          prepend-icon="mdi-check"
          class="bg-indigo-darken-1"
          variant="contained-text"
          :disabled="true"
          >VERIFIED
        </v-btn>
        &nbsp;&nbsp;
        <v-avatar :image="store.getters.avatar"></v-avatar>
        &nbsp;
      </div>
    </v-app-bar>
    <v-main>
      <v-progress-linear
        :active="store.getters.pageLoading"
        :indeterminate="store.getters.pageLoading"
        absolute
        bottom
        color="indigo  accent-4"
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
      <router-view :key="$route.fullPath" />
    </v-main>
  </v-app>
</template>

<script lang="ts">
import { defineComponent } from "vue";
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

    return {
      store,
      cookies,
      theme,
      toggleTheme() {
        theme.value = theme.value === "dark" ? "light" : "dark";
      },
    };
  },
  data() {
    return {
      mode: localStorage.getItem("mode"),
    };
  },
  methods: {
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
          console.error(err);
        });
    },
    revoke: function () {
      this.store
        .dispatch("revokeTokens")
        .then(() => {
          this.$router.push({ name: "home" });
        })
        .catch((err) => {
          console.error(err);
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
