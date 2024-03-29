<template>
  <v-container fluid v-if="!loadingSessions && !profileOf">
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
    <InfoPanel :profileOf="profileOf" class="my-5" />
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
import { mapActions, mapGetters, mapMutations } from "vuex";
import ms from "ms";

import InfoPanel from "@/components/user/info.component.vue";
import EncounterCard from "@/components/home/encounter.component.vue";
import { User } from "@/interfaces/user.interface";

export default defineComponent({
  name: "UserLookup",

  components: {
    InfoPanel,
    EncounterCard,
  },

  setup() {
    let loadingSessions = ref(true);
    let page = ref();
    let pages = ref(0);
    let foundSessions = ref([] as Session[]);
    let resultsFound = ref(0);
    let discodRgx = /^@.{2,32}#[0-9]{4,4}$/;
    let profileOf = ref(undefined as unknown as User);

    return {
      page,
      loadingSessions,
      pages,
      foundSessions,
      resultsFound,
      discodRgx,
      profileOf,
    };
  },
  async mounted() {
    this.setPageLoading(true);

    let user: User | undefined = undefined;
    try {
      let id = this.$route.params.id as string;
      if (id.startsWith("@")) id = `${id}${this.$route.hash}`;

      if (this.discodRgx.test(id)) {
        const [username, discriminator] = id.split("#");
        user = await this.getUser({
          username: username.substring(1),
          discriminator: parseInt(discriminator),
        });
      } else if (this.$route.params.id && this.$route.params.id.length === 24) {
        user = await this.getUser({ userId: id });
      } else {
        this.setPageLoading(false);
      }
      if (user) {
        this.profileOf = user;
        this.getFilteredSessions();
      } else {
        this.loadingSessions = false;
        this.setPageLoading(false);
      }
    } catch (e) {
      this.error(e);
      this.loadingSessions = false;
      this.setPageLoading(false);
    }
  },

  methods: {
    ...mapActions(["getUser", "error"]),
    ...mapMutations(["setPageLoading"]),
    async getFilteredSessions() {
      try {
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
            range: [],
            level: [0, 60],
            partyDps: 1,
            server: "any",
            region: "any",
            sort: ["createdAt", -1],
            creator: this.profileOf.id,
            limit: 50,
          },
        });

        const { found, logs } = data;
        this.resultsFound = found;
        this.pages = Math.ceil(found / this.pageSize);

        this.foundSessions = (logs as Session[]).sort(
          (a, b) => b.createdAt - a.createdAt
        );
      } catch (err) {
        this.foundSessions = [];
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
    ...mapGetters(["uploadToken", "apiUrl", "user", "uploadToken", "pageSize"]),
  },
});
</script>
