<template>
  <v-container>
    <v-row class="text-center">
      <v-col class="mb-4">
        <h1 id="logging-in" class="display-2 font-weight-bold mb-3">
          Logging in...
        </h1>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { useCookies } from "vue3-cookies";
import { useStore } from "vuex";

export default defineComponent({
  name: "LoginPage",
  setup() {
    const store = useStore();
    const { cookies } = useCookies();

    return {
      store,
      cookies,
    };
  },
  mounted() {
    const params = new URLSearchParams(window.location.search);
    if (params.has("code")) {
      const loggedInH = document.getElementById("logging-in");
      this.store.commit("setPageLoading", true);
      const code = params.get("code");

      this.store
        .dispatch("getTokensHTTP", code)
        .then(async (user) => {
          this.store.commit("setPageLoading", false);

          if (loggedInH)
            loggedInH.innerText = `Logged in as ${user.username}#${user.discriminator}`;

          // Reconnect socket to update new headers
          this.$io.disconnect().connect();
          setTimeout(() => {
            this.$router.push({ name: "home" });
          }, 1500);
        })
        .catch((err) => {
          this.store.dispatch("error", err);

          this.store.commit("setPageLoading", false);
          if (loggedInH) {
            loggedInH.innerHTML = "Login failed; Redirecting";
          }

          // Reconnect socket to update new headers
          this.$io.disconnect().connect();
          setTimeout(() => {
            this.$router.push({ name: "home" });
          }, 1500);
        });
    } else {
      this.$router.push({ name: "home" });
    }
  },
});
</script>
