<template>
  <v-row class="pt-3 px-1">
    <v-card min-width="100%" max-width="100%" class="mx-auto" rounded="sm">
      <v-progress-linear model-value="100" height="7" color="indigo">
      </v-progress-linear>
      <v-card-content>
        <v-row>
          <v-col cols="auto">
            <v-avatar
              rounded="0"
              :image="
                encounterShort === 'ue'
                  ? '/img/sprites/e400.webp'
                  : `/img/sprites/${encounterShort}.webp`
              "
            ></v-avatar>
          </v-col>
          <v-col class="align-self-center">
            <v-row>
              <h2>{{ bossName }}</h2>
            </v-row>
            <v-row class="pt-1">{{ encounterName }}</v-row>
          </v-col>
        </v-row>
      </v-card-content>
    </v-card>
  </v-row>
  <v-row class="pt-5 px-1">
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
            <v-row class="pt-1">
              CLEARED IN
              {{ getDuration(session?.duration) }}
            </v-row>
          </v-col>
        </v-row>
      </v-card-content>
    </v-card>
  </v-row>
  <v-row class="pt-4" justify="center">
    <v-col lg="12" xl="6" class="py-1 px-1">
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
                      session?.damageStatistics.totalDamageDealt
                    )
                  }}
                </h3></v-row
              >
            </v-col>
          </v-row>
        </v-card-content>
      </v-card>
    </v-col>
    <v-col lg="12" xl="6" class="py-1 px-1">
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
                      getTotalDPS(session?.entities)
                    )
                  }}/s
                </h3></v-row
              >
            </v-col>
          </v-row>
        </v-card-content>
      </v-card>
    </v-col>
    <v-col lg="12" xl="6" class="py-1 px-1">
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
                      getAverageDPS(session?.entities)
                    )
                  }}/s
                </h3></v-row
              >
            </v-col>
          </v-row>
        </v-card-content>
      </v-card>
    </v-col>
    <v-col lg="12" xl="6" class="py-1 px-1">
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
                      getAverageCritRate(session?.entities)
                    )
                  }}%
                </h3></v-row
              >
            </v-col>
          </v-row>
        </v-card-content>
      </v-card>
    </v-col>
    <v-col lg="12" xl="6" class="py-1 px-1">
      <v-card class="mx-auto summary-card" rounded="sm">
        <v-progress-linear model-value="100" height="5" color="red-darken-4">
        </v-progress-linear>
        <v-card-content>
          <v-row>
            <v-col cols="auto">
              <v-avatar color="red-darken-4" icon="mdi-skull"></v-avatar>
            </v-col>
            <v-col class="align-self-center me-2">
              <v-row>DEATHS</v-row>
              <v-row style="padding-top: 2px"
                ><h3>
                  {{
                    new Intl.NumberFormat().format(
                      getTotalDeaths(session?.entities)
                    )
                  }}
                </h3></v-row
              >
            </v-col>
          </v-row>
        </v-card-content>
      </v-card>
    </v-col>
    <v-col lg="12" xl="6" class="py-1 px-1">
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
                      getTotalAttacks(session?.entities, "frontHits")
                    )
                  }}
                </h3></v-row
              >
            </v-col>
          </v-row>
        </v-card-content>
      </v-card>
    </v-col>
    <v-col lg="12" xl="6" class="py-1 px-1">
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
                      getTotalAttacks(session?.entities, "backHits")
                    )
                  }}
                </h3></v-row
              >
            </v-col>
          </v-row>
        </v-card-content>
      </v-card>
    </v-col>
    <v-col lg="12" xl="6" class="py-1 px-1">
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
                    new Intl.NumberFormat().format(
                      getTotalAttacks(session?.entities, "counters")
                    )
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
import { Entity, EntityType } from "@/interfaces/session.interface";
import { defineComponent } from "vue";
import dayjs from "dayjs";
import { mapGetters } from "vuex";

export default defineComponent({
  name: "LogSummary",

  props: {
    session: Object,
  },

  data() {
    let bossName = "UNKNOWN BOSS";
    let encounterName = "UNKNOWN ENCOUNTER";
    let encounterShort = "ue";

    return {
      bossName,
      encounterName,
      encounterShort,
    };
  },

  mounted() {
    this.getEncounter();
  },

  methods: {
    openLog(id: string) {
      this.$router.push({ name: "logs", params: { id } });
    },
    getDuration(duration: number) {
      const start = new Date(0);
      const end = new Date(duration);

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

      return `${minDiff === 0 ? "00" : minDiff}:${
        secDiff < 10 ? `0${secDiff}` : secDiff
      }`;
    },

    timeSince(date: number) {
      return dayjs(date).fromNow();
    },

    isMVP(entity: Entity) {
      return (
        entity.stats.damageDealt ===
        this.session?.damageStatistics?.topDamageDealt
      );
    },

    getTotalCrits(entities: Entity[]) {
      let totalCrits = 0;
      entities.forEach((entity: Entity) => {
        totalCrits += entity.stats.crits;
      });
      return totalCrits;
    },

    getTotalAttacks(entities: Entity[], type: string) {
      let total = 0;

      for (let entity of entities) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        total += (entity.stats as any)[type];
      }

      return total;
    },

    getTotalDeaths(entities: Entity[]) {
      let total = 0;
      for (let entity of entities) {
        if (entity.type === EntityType.PLAYER) total += entity.stats.deaths;
      }

      return total;
    },

    getDamageDealtPerSecond(entity: Entity) {
      const duration = this.session?.duration / 1000;
      return entity?.stats.damageDealt / (duration || 0);
    },

    getTotalDPS(entities: Entity[]) {
      let total = 0;

      for (let entity of entities)
        total += this.getDamageDealtPerSecond(entity);

      return Math.round(total);
    },

    getAverageDPS(entities: Entity[]) {
      let total = 0;
      for (let entity of entities)
        total += this.getDamageDealtPerSecond(entity);

      return Math.round(total / entities.length);
    },

    getCritRate(entity: Entity) {
      const rate = (entity.stats.crits / entity.stats.hits) * 100;
      return rate;
    },

    getAverageCritRate(entities: Entity[]) {
      let total = 0;
      for (let entity of entities) total += this.getCritRate(entity);

      return Math.round(total / entities.length);
    },

    getEncounter() {
      const entities = this.session?.entities as Entity[];
      const bossEntities = entities
        .filter(
          (e) => e.type === EntityType.BOSS || e.type === EntityType.GUARDIAN
        )
        .sort((a, b) => b.lastUpdate - a.lastUpdate);
      const hasBoss = bossEntities.length > 0;
      if (!hasBoss) return;

      const boss = bossEntities[0];
      const bossName = this.$t(`monsters.${boss.npcId}`);

      let encounter = "UNKNOWN ENCOUNTER";
      if (this.isSupportedBoss(boss.npcId, "abyssRaids")) {
        encounter = "ABYSS RAID";
      } else if (this.isSupportedBoss(boss.npcId, "abyssalDungeons")) {
        encounter = "ABYSSAL DUNGEON";
      } else if (this.isSupportedBoss(boss.npcId, "legionRaids")) {
        encounter = "LEGION RAID";
      } else if (this.isSupportedBoss(boss.npcId, "guardians")) {
        encounter = "GUARDIAN RAID";
      }

      this.bossName = bossName.toUpperCase();
      this.encounterName = encounter.toUpperCase();
      this.encounterShort = encounter
        .split(" ")
        .map((w) => w[0].toLowerCase())
        .join("");
    },
  },
  computed: {
    ...mapGetters(["isSupportedBoss"]),
  },
});
</script>

<style scoped>
.summary-card {
  min-width: 218px !important;
}
</style>
