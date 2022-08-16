<template>
  <v-container fluid v-if="!$route.params.id || $route.params.id.length !== 24">
    <v-row justify="center">
      <v-col cols="auto">
        <h1>Error loading: User is invalid or doesn't exist</h1>
      </v-col>
    </v-row>
  </v-container>
  <v-container fluid v-else-if="loadingSessions">
    <v-row justify="center">
      <v-col cols="auto"> <h1>Loading User Profile</h1> </v-col>
    </v-row>
  </v-container>
  <v-container fluid v-else>
    <InfoPanel class="my-5" />
    <v-row class="mt-2" v-if="foundSessions.length > 0" justify="center">
      <v-col lg="8" md="12" sm="12" cols="12" align-self="center">
        <v-row class="mb-2">
          <h2>
            <v-icon icon="mdi-cloud-upload" /><span class="ms-2 me-2"
              >Last 50
              <small style="color: grey; display: none">
                {{ foundSessions.length }}
              </small>
              Uploads</span
            >
          </h2>
        </v-row>
        <v-row v-for="(session, index) of foundSessions" :key="index">
          <EncounterCard class="my-2" :session="session"></EncounterCard
        ></v-row>
      </v-col>
    </v-row>
    <v-row v-else class="mt-2" justify="center">
      <v-col lg="8" md="12" sm="12" cols="12" align-self="center">
        <v-row class="mt-3" justify="center">
          <img src="/img/sprites/e404.webp" />
        </v-row>
        <v-row class="mt-2" justify="center">
          <h2>
            <span class="ms-2 me-2">No Recent Uploads</span>
          </h2>
        </v-row>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { Session } from "@/interfaces/session.interface";
import axios from "axios";
import { defineComponent, ref } from "vue";
import { mapGetters, mapMutations } from "vuex";
import ms from "ms";

import InfoPanel from "@/components/user/info.component.vue";
import EncounterCard from "@/components/home/encounter.component.vue";

export default defineComponent({
  name: "UserLookup",

  components: {
    InfoPanel,
    EncounterCard,
  },

  setup() {
    let loadingSessions = ref(true);
    let pageSize = ref(10);
    let page = ref();
    let pages = ref(0);
    let foundSessions = ref([] as Session[]);
    let resultsFound = ref(0);

    return {
      page,
      loadingSessions,
      pageSize,
      pages,
      foundSessions,
      resultsFound,
    };
  },

  mounted() {
    this.setPageLoading(true);

    if (this.$route.params.id && this.$route.params.id.length === 24) {
      this.getFilteredSessions();
    } else {
      this.setPageLoading(false);
    }
  },

  methods: {
    ...mapMutations(["setPageLoading"]),
    async getFilteredSessions() {
      try {
        const creator = this.$route.params.id;

        const { data } = await axios({
          method: "POST",
          url: `${this.apiUrl}/logs/filter`,
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
          data: {
            classes: [] as number[],
            bosses: [] as number[],
            gearLevel: [0, 1625],
            range: [+new Date() - ms("1d"), +new Date()],
            level: [0, 60],
            partyDps: 0,
            server: "any",
            region: "any",
            sort: ["createdAt", -1],
            creator: creator,
            limit: 50,
          },
        });

        const { found, pageSize, logs } = data;
        this.pageSize = pageSize;
        this.resultsFound = found;
        this.pages = Math.ceil(found / pageSize);

        this.foundSessions = (logs as Session[]).sort(
          (a, b) => b.createdAt - a.createdAt
        );
      } catch (err) {
        this.foundSessions = [];
        this.pageSize = 0;
        this.resultsFound = 0;
        this.pages = 0;
      }
      setTimeout(() => {
        this.setPageLoading(false);
        this.loadingSessions = false;
      }, 200);
    },
    getPagedResults(page: number | undefined) {
      if (!page || page < 0) page = 1;

      const results = this.foundSessions.slice(
        (page - 1) * this.pageSize,
        page * this.pageSize
      );
      return results;
    },
  },
  computed: {
    ...mapGetters(["uploadToken", "apiUrl", "user", "uploadToken"]),
  },
});
</script>
