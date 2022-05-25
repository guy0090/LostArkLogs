<template>
  <v-container>
    <v-row class="text-center">
      <v-col class="mb-0">
        <h1 class="display-2 font-weight-bold mb-3">WIP</h1>
      </v-col>
    </v-row>
    <v-row justify="center">
      <v-col v-if="store.getters.user" lg="5" md="12" sm="12">
        <InfoPanel></InfoPanel>
      </v-col>
      <v-col v-if="store.getters.user" lg="7" md="12" sm="12" align="center">
        <v-row justify="center" class="mb-5">
          <v-col align="left">
            <h2>
              Your Recent Uploads <small style="font-size: 10pt">(24hrs)</small>
            </h2>
          </v-col>
          <v-spacer></v-spacer>
          <v-col align="right">
            <v-btn
              color="success"
              :disabled="loadingSessions"
              @click="getUserRecentSessions(true)"
            >
              <span v-if="loadingSessions">Loading</span>
              <span v-else>Refresh</span>
            </v-btn>
          </v-col>
        </v-row>
        <v-row
          v-if="!loadingSessions && recentSessions.length > 0"
          justify="center"
          class="align-baseline"
        >
          <EncounterCard
            class="mb-2"
            v-for="session in recentSessions"
            :key="session.id"
            :session="session"
          ></EncounterCard>
        </v-row>
        <v-row v-else-if="!loadingSessions && recentSessions.length === 0">
          <v-col>NO RECENT ENCOUNTERS</v-col>
        </v-row>
        <v-row justify="center" v-else-if="loadingSessions">
          <v-col cols="5">
            <v-progress-linear
              indeterminate
              color="indigo darken-2"
            ></v-progress-linear
            >LOADING ENCOUNTERS</v-col
          >
        </v-row>
      </v-col>
      <v-col v-else lg="7" md="12" sm="12" align="center">
        <v-row justify="center" class="mb-5">
          <v-col align="left">
            <h2>
              Recent Uploads <small style="font-size: 10pt">(24hrs)</small>
            </h2>
          </v-col>
          <v-spacer></v-spacer>
          <v-col align="right">
            <v-btn
              color="success"
              :disabled="publicLoadingSessions"
              @click="getRecentSessions(true)"
            >
              <span v-if="publicLoadingSessions">Loading</span>
              <span v-else>Refresh</span>
            </v-btn>
          </v-col>
        </v-row>
        <v-row
          v-if="!publicLoadingSessions && publicRecentSessions.length > 0"
          justify="center"
          class="align-baseline"
        >
          <EncounterCard
            class="mb-2"
            v-for="session in publicRecentSessions"
            :key="session.id"
            :session="session"
          ></EncounterCard>
        </v-row>
        <v-row
          v-else-if="
            !publicLoadingSessions && publicRecentSessions.length === 0
          "
        >
          <v-col>NO RECENT ENCOUNTERS</v-col>
        </v-row>
        <v-row justify="center" v-else-if="publicLoadingSessions">
          <v-col cols="5">
            <v-progress-linear
              indeterminate
              color="indigo darken-2"
            ></v-progress-linear
            >LOADING ENCOUNTERS</v-col
          >
        </v-row>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { useCookies } from "vue3-cookies";
import { useStore } from "vuex";

import InfoPanel from "@/components/home/info.component.vue";
import EncounterCard from "@/components/home/encounter.component.vue";
import { Session } from "@/interfaces/session.interface";

export default defineComponent({
  // eslint-disable-next-line vue/multi-word-component-names
  name: "HomePage",
  components: {
    InfoPanel,
    EncounterCard,
  },
  mounted() {
    setTimeout(() => {
      if (this.store.getters.user) this.getUserRecentSessions();
      this.getRecentSessions();
    }, 1000);
  },
  setup() {
    const store = useStore();
    const { cookies } = useCookies();
    return { store, cookies };
  },
  data() {
    return {
      revealToken: false,
      loadingSessions: true,
      refreshTimeout: false,
      recentSessions: [] as Session[],
      publicLoadingSessions: true,
      publicRecentSessions: [] as Session[],
    };
  },
  methods: {
    emit: function (event: string) {
      this.$io.emit(event, {}, (res: unknown) => {
        if (res) console.log(res);
      });
    },
    getTokensWS: function () {
      this.store.commit("setPageLoading", true);
      this.store
        .dispatch("getTokensWS")
        .then(async () => {
          this.store.commit("setPageLoading", false);
        })
        .catch(() => {
          this.store.commit("setPageLoading", false);
        });
    },
    getTokensHTTP: function () {
      this.store.commit("setPageLoading", true);
      this.store
        .dispatch("getTokensHTTP")
        .then(() => {
          this.store.commit("setPageLoading", false);
        })
        .catch(() => {
          this.store.commit("setPageLoading", false);
        });
    },
    getUserRecentSessions: function (timeout = false) {
      if (!this.loadingSessions) this.loadingSessions = true;
      this.store
        .dispatch("getUserRecentSessions")
        .then((logs) => {
          this.store.dispatch("info", `Got ${logs.length} recent logs`);
          setTimeout(
            // Make it seems like something is happening - requests can be very fast otherwise
            () => {
              this.recentSessions = logs;
              this.loadingSessions = false;
            },
            timeout ? 1000 : 0
          );
        })
        .catch((error) => {
          console.error(error);
          this.loadingSessions = false;
        });
    },
    getRecentSessions: function (timeout = false) {
      if (!this.publicLoadingSessions) this.publicLoadingSessions = true;
      this.store
        .dispatch("getRecentSessions")
        .then((logs) => {
          this.store.dispatch("info", `Got ${logs.length} public recent logs`);
          setTimeout(
            // Make it seems like something is happening - requests can be very fast otherwise
            () => {
              this.publicRecentSessions = logs;
              this.publicLoadingSessions = false;
            },
            timeout ? 1000 : 0
          );
        })
        .catch((error) => {
          console.error(error);
          this.publicLoadingSessions = false;
        });
    },
    log: function (text: object | string) {
      console.log(text);
    },
  },
});
</script>
