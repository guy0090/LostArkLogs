<template>
  <v-container fluid v-if="JSON.stringify(session) !== '{}'">
    <v-row id="title">
      <v-col cols="auto" class="align-self-center">
        <v-chip variant="contained-text" label color="success">
          UPLOADED {{ timeSince(session.createdAt).toUpperCase() }}
        </v-chip>
      </v-col>
    </v-row>
    <v-row id="summary" class="ma-1" justify="center">
      <v-col sm="12" md="12" lg="3" xl="3">
        <LogSummary :session="session"></LogSummary>
      </v-col>
      <v-col sm="12" md="12" lg="9" xl="9">
        <v-row>
          <EntityCard
            v-for="(entity, index) in session?.entities?.sort(
              (a, b) => b.damageDealt - a.damageDealt
            )"
            :key="index"
            :entity="entity"
            :entities="session?.entities?.length > 4 ? 6 : 12"
            :totalDamageDealt="session?.damageStatistics.totalDamageDealt"
            :duration="(session?.ended - session?.started) / 1000"
            :mvp="isMVP(entity)"
          >
          </EntityCard>
        </v-row>
        <v-row class="mt-4">
          <v-col>
            <Breakdowns :session="session"></Breakdowns>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
  </v-container>
  <v-container v-else>
    <v-col>
      <v-row justify="center">
        <h1>{{ loadingMessage }}</h1>
      </v-row>
    </v-col>
  </v-container>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { useStore } from "vuex";
import { Session, SessionEntity } from "@/interfaces/session.interface";

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);

import LogSummary from "@/components/logs/summary.component.vue";
import EntityCard from "@/components/logs/entitycard.component.vue";
import Breakdowns from "@/components/logs/breakdown.component.vue";
import axios from "axios";

export default defineComponent({
  name: "LogsPage",

  components: {
    LogSummary,
    EntityCard,
    Breakdowns,
  },

  mounted() {
    this.store.commit("setPageLoading", true);
    this.getSession();
  },

  setup() {
    const store = useStore();
    return { store };
  },

  data() {
    return {
      revealToken: false,
      loadingMessage: "LOADING",
      session: {} as Session,
      tab: null,
    };
  },

  methods: {
    getSession() {
      const id = this.$route.params.id;
      axios({
        method: "GET",
        url: `${this.store.getters.apiUrl}/logs/${id}`,
        withCredentials: true,
        responseType: "json",
      })
        .then((response) => {
          this.store.commit("setPageLoading", false);
          let session: Session = response.data;
          // session.entities = this.duplicateEntities(session);

          this.session = session;
        })
        .catch((err) => {
          this.store.dispatch("error", err.message);

          this.store.commit("setPageLoading", false);
          this.loadingMessage = `Error loading session ${id}`;
        });
    },
    duplicateEntities(session: Session) {
      return [
        ...session.entities,
        ...session.entities.map((ent) => {
          return {
            ...ent,
            id: ent.id + session.entities.length,
          };
        }),
      ];
    },
    openLog(id: string) {
      this.$router.push({ name: "logs", params: { id } });
    },
    getDuration(start: number, end: number) {
      const beginDate = dayjs(start);
      const endDate = dayjs(end);

      let minDiff: number | string = 0;
      let secDiff: string | number = endDate.diff(beginDate, "seconds", true);

      if (secDiff > 60) {
        minDiff = Math.floor(secDiff / 60);
        secDiff = Math.round(secDiff % 60);
      } else if (secDiff > 9) {
        secDiff = Math.round(secDiff);
      } else {
        secDiff = "0" + Math.round(secDiff);
      }

      return `${minDiff === 0 ? "00" : minDiff}:${secDiff}`;
    },

    timeSince(date: number) {
      return dayjs(date).fromNow();
    },

    isMVP(entity: SessionEntity) {
      return (
        entity.damageDealt === this.session?.damageStatistics?.topDamageDealt
      );
    },

    getTotalCrits(entities: SessionEntity[]) {
      let totalCrits = 0;
      entities.forEach((entity: SessionEntity) => {
        totalCrits += entity.stats.crits;
      });
      return totalCrits;
    },

    getTotalAttacks(type: string) {
      let total = 0;
      this.session?.entities?.forEach((entity: SessionEntity) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        total += (entity.stats as any)[type];
      });
      return total;
    },

    getDamageDealtPerSecond(entity: SessionEntity) {
      const duration = (this.session?.ended - this.session?.started) / 1000;
      // console.log(entity?.damageDealt, duration);
      return entity?.damageDealt / (duration || 0);
    },

    getTotalDPS(entities: SessionEntity[]) {
      let total = 0;
      entities.forEach((entity) => {
        total += this.getDamageDealtPerSecond(entity);
      });

      return Math.round(total);
    },

    getAverageDPS(entities: SessionEntity[]) {
      let total = 0;
      entities.forEach((entity) => {
        total += this.getDamageDealtPerSecond(entity);
      });

      return Math.round(total / entities.length);
    },

    getCritRate(entity: SessionEntity) {
      const rate = (entity.stats.crits / entity.stats.totalHits) * 100;
      return rate;
    },

    getAverageCritRate(entities: SessionEntity[]) {
      let total = 0;
      entities.forEach((entity) => {
        total += this.getCritRate(entity);
      });

      return Math.round(total / entities.length);
    },
  },
});
</script>
