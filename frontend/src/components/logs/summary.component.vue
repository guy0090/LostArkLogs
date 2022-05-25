<template>
  <v-row class="pt-3">
    <v-card min-width="100%" max-width="100%" class="mx-auto" rounded="sm">
      <v-progress-linear model-value="100" height="7" color="indigo">
      </v-progress-linear>
      <v-card-content>
        <v-row>
          <v-col cols="auto">
            <v-avatar color="indigo" icon="mdi-help"></v-avatar>
          </v-col>
          <v-col class="align-self-center">
            <v-row>
              <h2>UNKNOWN ENCOUNTER</h2>
            </v-row>
            <v-row>UNKNOWN BOSS</v-row>
          </v-col>
        </v-row>
      </v-card-content>
    </v-card>
  </v-row>
  <v-row class="pt-5">
    <v-card min-width="100%" max-width="100%" class="mx-auto" rounded="sm">
      <v-progress-linear model-value="100" height="7" color="indigo">
      </v-progress-linear>
      <v-card-content>
        <v-row>
          <v-col cols="auto">
            <v-avatar color="indigo" icon="mdi-poll"></v-avatar>
          </v-col>
          <v-col class="align-self-center">
            <v-row>
              <h2>ENCOUNTER STATS</h2>
            </v-row>
            <v-row class="pt-2">
              CLEARED IN
              {{ getDuration($props.session?.started, $props.session?.ended) }}
            </v-row>
          </v-col>
        </v-row>
      </v-card-content>
    </v-card>
  </v-row>
  <v-row class="pt-5" justify="center">
    <v-col lg="12" xl="auto" class="pa-1">
      <v-card class="mx-auto summary-card" rounded="sm">
        <v-progress-linear model-value="100" height="5" color="red-darken-4">
        </v-progress-linear>
        <v-card-content>
          <v-row>
            <v-col cols="auto">
              <v-avatar color="red-darken-4" icon="mdi-sword"></v-avatar>
            </v-col>
            <v-col class="align-self-center me-2">
              <v-row>DAMAGE DEALT</v-row>
              <v-row style="padding-top: 2px"
                ><h3>
                  {{
                    new Intl.NumberFormat().format(
                      $props.session?.damageStatistics.totalDamageDealt
                    )
                  }}
                </h3></v-row
              >
            </v-col>
          </v-row>
        </v-card-content>
      </v-card>
    </v-col>
    <v-col lg="12" xl="auto" class="pa-1">
      <v-card class="mx-auto summary-card" rounded="sm">
        <v-progress-linear model-value="100" height="5" color="red-darken-4">
        </v-progress-linear>
        <v-card-content>
          <v-row>
            <v-col cols="auto">
              <v-avatar color="red-darken-4" icon="mdi-fire"></v-avatar>
            </v-col>
            <v-col class="align-self-center me-2">
              <v-row>PARTY DPS</v-row>
              <v-row style="padding-top: 2px"
                ><h3>
                  {{
                    new Intl.NumberFormat().format(
                      getTotalDPS($props.session?.entities)
                    )
                  }}/s
                </h3></v-row
              >
            </v-col>
          </v-row>
        </v-card-content>
      </v-card>
    </v-col>
    <v-col lg="12" xl="auto" class="pa-1">
      <v-card class="mx-auto summary-card" rounded="sm">
        <v-progress-linear model-value="100" height="5" color="red-darken-4">
        </v-progress-linear>
        <v-card-content>
          <v-row>
            <v-col cols="auto">
              <v-avatar color="red-darken-4" icon="mdi-fire"></v-avatar>
            </v-col>
            <v-col class="align-self-center me-2">
              <v-row> AVG. PARTY DPS</v-row>
              <v-row style="padding-top: 2px"
                ><h3>
                  {{
                    new Intl.NumberFormat().format(
                      getAverageDPS($props.session?.entities)
                    )
                  }}/s
                </h3></v-row
              >
            </v-col>
          </v-row>
        </v-card-content>
      </v-card>
    </v-col>
    <v-col lg="12" xl="auto" class="pa-1">
      <v-card class="mx-auto summary-card" rounded="sm">
        <v-progress-linear model-value="100" height="5" color="red-darken-4">
        </v-progress-linear>
        <v-card-content>
          <v-row>
            <v-col cols="auto">
              <v-avatar
                color="red-darken-4"
                icon="mdi-lightning-bolt"
              ></v-avatar>
            </v-col>
            <v-col class="align-self-center me-2">
              <v-row>TOTAL CRITS</v-row>
              <v-row style="padding-top: 2px"
                ><h3>
                  {{ new Intl.NumberFormat().format(getTotalAttacks("crits")) }}
                </h3></v-row
              >
            </v-col>
          </v-row>
        </v-card-content>
      </v-card>
    </v-col>
    <v-col lg="12" xl="auto" class="pa-1">
      <v-card class="mx-auto summary-card" rounded="sm">
        <v-progress-linear model-value="100" height="5" color="red-darken-4">
        </v-progress-linear>
        <v-card-content>
          <v-row>
            <v-col cols="auto">
              <v-avatar
                color="red-darken-4"
                icon="mdi-lightning-bolt"
              ></v-avatar>
            </v-col>
            <v-col class="align-self-center me-2">
              <v-row>AVG. PARTY CRIT</v-row>
              <v-row style="padding-top: 2px"
                ><h3>
                  {{
                    new Intl.NumberFormat().format(
                      getAverageCritRate($props.session?.entities)
                    )
                  }}%
                </h3></v-row
              >
            </v-col>
          </v-row>
        </v-card-content>
      </v-card>
    </v-col>
    <v-col lg="12" xl="auto" class="pa-1">
      <v-card class="mx-auto summary-card" rounded="sm">
        <v-progress-linear model-value="100" height="5" color="red-darken-4">
        </v-progress-linear>
        <v-card-content>
          <v-row>
            <v-col cols="auto">
              <v-avatar
                color="red-darken-4"
                icon="mdi-arrow-collapse-right"
              ></v-avatar>
            </v-col>
            <v-col class="align-self-center me-2">
              <v-row>FRONT ATTACKS</v-row>
              <v-row style="padding-top: 2px"
                ><h3>
                  {{
                    new Intl.NumberFormat().format(
                      getTotalAttacks("frontAttacks")
                    )
                  }}
                </h3></v-row
              >
            </v-col>
          </v-row>
        </v-card-content>
      </v-card>
    </v-col>
    <v-col lg="12" xl="auto" class="pa-1">
      <v-card class="mx-auto summary-card" rounded="sm">
        <v-progress-linear model-value="100" height="5" color="red-darken-4">
        </v-progress-linear>
        <v-card-content>
          <v-row>
            <v-col cols="auto">
              <v-avatar
                color="red-darken-4"
                icon="mdi-arrow-collapse-left"
              ></v-avatar>
            </v-col>
            <v-col class="align-self-center me-2">
              <v-row>BACK ATTACKS</v-row>
              <v-row style="padding-top: 2px"
                ><h3>
                  {{
                    new Intl.NumberFormat().format(
                      getTotalAttacks("backAttacks")
                    )
                  }}
                </h3></v-row
              >
            </v-col>
          </v-row>
        </v-card-content>
      </v-card>
    </v-col>
    <v-col lg="12" xl="auto" class="pa-1">
      <v-card class="mx-auto summary-card" rounded="sm">
        <v-progress-linear model-value="100" height="5" color="red-darken-4">
        </v-progress-linear>
        <v-card-content>
          <v-row>
            <v-col cols="auto">
              <v-avatar color="red-darken-4" icon="mdi-hand"></v-avatar>
            </v-col>
            <v-col class="align-self-center me-2">
              <v-row>COUNTERS</v-row>
              <v-row style="padding-top: 2px"
                ><h3>
                  {{
                    new Intl.NumberFormat().format(getTotalAttacks("counters"))
                  }}
                </h3></v-row
              >
            </v-col>
          </v-row>
        </v-card-content>
      </v-card>
    </v-col>
  </v-row>
</template>

<script lang="ts">
import { SessionEntity } from "@/interfaces/session.interface";
import { defineComponent } from "vue";
import dayjs from "dayjs";

export default defineComponent({
  name: "LogSummary",

  props: {
    session: Object,
  },

  methods: {
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
        entity.damageDealt ===
        this.$props.session?.damageStatistics?.topDamageDealt
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

<style scoped>
.summary-card {
  min-width: 225px !important;
}
</style>
