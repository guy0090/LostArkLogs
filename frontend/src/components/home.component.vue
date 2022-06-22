<template>
  <v-container>
    <v-row class="text-center">
      <v-col class="mb-0">
        <h1 class="display-2 font-weight-bold mb-3">
          <v-avatar image="/img/sprites/ewip.png" /> SOON&trade;
        </h1>
      </v-col>
    </v-row>
    <v-row justify="center">
      <v-col cols="auto" lg="1"></v-col>
      <v-col v-if="store.getters.user" lg="4" md="12" sm="12" cols="12">
        <InfoPanel></InfoPanel>
      </v-col>
      <v-col v-if="store.getters.user" lg="6" md="12" sm="12" cols="12">
        <v-row justify="center" class="mb-2">
          <v-col align="left">
            <h2>
              <span v-if="!globalLogs">Your&nbsp;</span>Recent Uploads
              <small style="font-size: 10pt">(24hrs)</small>
            </h2>
          </v-col>
          <v-spacer></v-spacer>
          <v-col cols="auto" align="right" class="px-1">
            <v-btn
              :color="globalLogs ? 'blue-darken-3' : ''"
              @click="globalLogs = !globalLogs"
            >
              <v-icon icon="mdi-earth" />
            </v-btn>
          </v-col>
          <v-col cols="auto" align="right" class="px-1">
            <v-btn
              :color="colors ? 'blue-darken-3' : ''"
              @click="colors = !colors"
              ><v-icon icon="mdi-palette"
            /></v-btn>
          </v-col>
          <v-col cols="auto" align="right" class="px-1">
            <v-btn
              color="success"
              :disabled="loadingSessions"
              @click="getUserRecentSessions(100)"
            >
              <span v-if="loadingSessions">Loading</span>
              <span v-else>Refresh</span>
            </v-btn>
          </v-col>
        </v-row>
        <v-row
          v-if="!loadingSessions && recentSessions.length > 0"
          class="align-baseline"
          justify="space-around"
        >
          <EncounterCard
            class="mb-0"
            v-for="(session, index) in !globalLogs
              ? recentSessions
              : publicRecentSessions"
            :key="index"
            :session="session"
            :colors="colors"
          ></EncounterCard>
        </v-row>
        <v-row
          v-else-if="!loadingSessions && recentSessions.length === 0"
          justify="center"
        >
          <v-col cols="auto">NO RECENT ENCOUNTERS</v-col>
        </v-row>
        <v-row v-else-if="loadingSessions" justify="center">
          <v-col cols="6" class="text-center">
            <v-progress-linear
              indeterminate
              color="indigo darken-2"
              class="mb-2"
            ></v-progress-linear>
            <span>LOADING ENCOUNTERS</span>
          </v-col>
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
          <v-col cols="auto" align="right" class="px-0">
            <v-btn
              :color="colors ? 'blue-darken-3' : ''"
              @click="colors = !colors"
              ><v-icon icon="mdi-palette"
            /></v-btn>
          </v-col>
          <v-col cols="auto" align="right">
            <v-btn
              color="success"
              :disabled="publicLoadingSessions"
              @click="getRecentSessions(100)"
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
            class="mb-1"
            v-for="(session, index) in publicRecentSessions"
            :key="index"
            :session="session"
            :colors="colors"
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
      <v-col cols="auto" lg="1"></v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
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
    if (this.store.getters.user) {
      let retries = 10;
      const loader = setInterval(() => {
        if (retries === 0) {
          this.store.dispatch("info", "Maxed out retries; Clearing interval");
          clearInterval(loader);
          this.recentSessions = [];
          this.loadingSessions = false;
        }

        if (this.store.getters.uploadToken !== null) {
          this.store.dispatch(
            "info",
            "Got upload token; Requesting recent sessions"
          );
          clearInterval(loader);
          this.getUserRecentSessions(0);
        }

        retries--;
      }, 200);
    }

    this.getRecentSessions(500);
  },
  setup() {
    const store = useStore();
    const { cookies } = useCookies();
    const colors = ref(false);
    const globalLogs = ref(false);

    return { store, cookies, colors, globalLogs };
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
        if (res) this.store.dispatch("info", res);
      });
    },
    getUserRecentSessions: function (timeout = 1000) {
      if (!this.loadingSessions) this.loadingSessions = true;
      setTimeout(() => {
        this.store
          .dispatch("getUserRecentSessions")
          .then((logs) => {
            this.store.dispatch("info", `Got ${logs.length} recent logs`);

            this.recentSessions = logs.sort(
              (a: Session, b: Session) => b.createdAt - a.createdAt
            );
            this.loadingSessions = false;
          })
          .catch((error) => {
            this.store.dispatch("error", error);
            this.loadingSessions = false;
          });
      }, timeout);
    },
    getRecentSessions: function (timeout = 1000) {
      if (!this.publicLoadingSessions) this.publicLoadingSessions = true;
      setTimeout(() => {
        this.store
          .dispatch("getRecentSessions")
          .then((logs) => {
            this.store.dispatch(
              "info",
              `Got ${logs.length} public recent logs`
            );
            this.publicRecentSessions = logs.sort(
              (a: Session, b: Session) => b.createdAt - a.createdAt
            );
            this.publicLoadingSessions = false;
          })
          .catch((error) => {
            this.store.dispatch("error", error);
            this.publicLoadingSessions = false;
          });
      }, timeout);
    },
  },
});
</script>
