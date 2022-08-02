<template>
  <v-container>
    <v-row class="mt-5" justify="center">
      <v-col lg="8" md="12" sm="12" align="center">
        <v-row justify="center" class="mb-5">
          <v-col align="left">
            <h2>
              Recent Uploads
              <small style="font-size: 11pt">(Last 24 hours)</small>
            </h2>
          </v-col>
          <v-spacer></v-spacer>
          <v-col cols="auto" align="right" class="px-0">
            <v-btn
              :color="colors ? 'blue-darken-3' : ''"
              @click="colors = !colors"
              ><v-icon icon="mdi-palette" />&nbsp;Class Colors</v-btn
            >
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
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import { useCookies } from "vue3-cookies";
import { mapActions, mapGetters, useStore } from "vuex";

import EncounterCard from "@/components/home/encounter.component.vue";
import { Session } from "@/interfaces/session.interface";

export default defineComponent({
  // eslint-disable-next-line vue/multi-word-component-names
  name: "HomePage",
  components: {
    EncounterCard,
  },
  mounted() {
    this.getRecentSessions(100);
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
    ...mapActions(["info", "error"]),
    emit: function (event: string) {
      this.$io.emit(event, {}, (res: unknown) => {
        if (res) this.info(res);
      });
    },
    getUserRecentSessions: function (timeout = 1000) {
      if (!this.loadingSessions) this.loadingSessions = true;
      setTimeout(() => {
        this.store
          .dispatch("getUserRecentSessions")
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
    getRecentSessions: function (timeout = 1000) {
      if (!this.publicLoadingSessions) this.publicLoadingSessions = true;
      setTimeout(() => {
        this.store
          .dispatch("getRecentSessions")
          .then((res) => {
            const { logs } = res;
            this.info(`Got ${logs.length} public recent logs`);
            this.publicRecentSessions = logs.sort(
              (a: Session, b: Session) => b.createdAt - a.createdAt
            );
            this.publicLoadingSessions = false;
          })
          .catch((error) => {
            this.error(error);
            this.publicLoadingSessions = false;
          });
      }, timeout);
    },
  },
  computed: {
    ...mapGetters(["user", "uploadToken"]),
  },
});
</script>
