<template>
  <v-container fluid>
    <InfoPanel v-if="user" class="my-5" />
    <v-row justify="center">
      <v-col v-if="user" lg="8" md="12" sm="12" cols="12" align-self="center">
        <v-row justify="center" class="mb-2">
          <v-col align="left">
            <h2>
              <span class="me-2">Your Recent Uploads</span>
              <small style="font-size: 11pt">(Last 24 hours)</small>
            </h2>
          </v-col>
          <v-spacer></v-spacer>
          <v-col cols="auto" align="right" class="px-1">
            <v-btn
              :color="colors ? 'blue-darken-3' : ''"
              @click="colors = !colors"
              ><v-icon icon="mdi-palette" />&nbsp;Class Colors</v-btn
            >
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
            v-for="(session, index) in recentSessions"
            :key="index"
            :session="session"
            :colors="colors"
          />
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
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import { mapGetters, mapActions } from "vuex";

import InfoPanel from "@/components/user/info.component.vue";
import EncounterCard from "@/components/home/encounter.component.vue";

import { Session } from "@/interfaces/session.interface";

export default defineComponent({
  name: "UserPage",

  components: {
    InfoPanel,
    EncounterCard,
  },

  mounted() {
    if (this.user) {
      let retries = 10;
      const loader = setInterval(() => {
        if (retries === 0) {
          this.info("Maxed out retries; Clearing interval");
          clearInterval(loader);
          this.recentSessions = [];
          this.loadingSessions = false;
        }

        if (this.uploadToken !== null) {
          this.info("Got upload token; Requesting recent sessions");
          clearInterval(loader);
          this.getUserSessions(100);
        }

        retries--;
      }, 200);
    }
  },

  setup() {
    let revealToken = ref(false);
    let colors = ref(false);
    let loadingSessions = ref(true);
    let recentSessions = ref([] as Session[]);
    let refreshTimeout = ref(false);

    return {
      revealToken,
      colors,
      loadingSessions,
      recentSessions,
      refreshTimeout,
    };
  },

  methods: {
    ...mapActions(["info", "error", "getUserRecentSessions"]),
    getUserSessions: function (timeout = 1000) {
      if (!this.loadingSessions) this.loadingSessions = true;
      setTimeout(() => {
        this.getUserRecentSessions()
          .then((res) => {
            const { logs } = res;
            this.info(`Got ${logs.length} recent logs`);

            this.recentSessions = logs.sort(
              (a: Session, b: Session) => b.createdAt - a.createdAt
            );
            this.loadingSessions = false;
          })
          .catch((error) => {
            this.error(error);
            this.loadingSessions = false;
          });
      }, timeout);
    },
  },

  computed: {
    ...mapGetters(["uploadToken", "user"]),
  },
});
</script>
