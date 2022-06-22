<template>
  <v-col cols="12" class="py-1 px-0">
    <v-card
      class="mx-auto"
      border="indigo"
      rounded="sm"
      hover
      @click="openLog(session?.id)"
    >
      <v-progress-linear model-value="100" height="7" color="indigo">
      </v-progress-linear>
      <v-card-content class="pa-3">
        <v-row :class="$vuetify.display.xs ? 'pb-2' : 'py-1'">
          <v-col cols="auto" class="align-self-center">
            <v-avatar :image="`/img/sprites/${encounterName}.webp`" />
          </v-col>
          <v-col cols="auto" class="align-self-center">
            <v-row
              ><h3>{{ bossName.toUpperCase() }}</h3></v-row
            >
            <v-row class="mt-3">
              <v-chip label density="comfortable" color="error px-2">
                <v-icon icon="mdi-sword" class="pe-1" />
                {{ getTotalDPS(getPlayerEntities()) }}/s
              </v-chip>
              &nbsp;
              <v-chip label density="comfortable" color="success px-2">
                <v-icon icon="mdi-timer-outline" class="pe-1" />
                {{ getDuration(session?.started, session?.ended) }}
              </v-chip>
              &nbsp;
              <v-chip label density="comfortable" color="info">
                <v-icon start icon="mdi-cloud-upload-outline"></v-icon
                >{{ timeSince(session?.createdAt) }}
              </v-chip>
            </v-row>
          </v-col>
          <v-col class="align-self-center pt-1 pb-1">
            <v-chip
              label
              v-for="(entity, i) in getPlayerEntities()"
              :key="i"
              :class="`mx-1 ${
                colors ? `c-${entity.classId}` : 'bg-blue-grey-darken-2'
              }`"
              :style="i >= 4 ? 'display: none' : ''"
            >
              <v-avatar :image="`/img/sprites/${entity.classId}.png`" />
              <span v-if="!$vuetify.display.xs"
                >&nbsp;{{ $t(`classes.${entity.classId}`) }}</span
              >
            </v-chip>
            <v-chip v-if="getPlayerEntities().length > 4" label
              >+{{ getPlayerEntities().length - 4 }} more</v-chip
            >
          </v-col>
        </v-row>
      </v-card-content>
    </v-card>
  </v-col>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import dayjs from "dayjs";
import { Session, Entity, ENTITY_TYPE } from "@/interfaces/session.interface";
import { useStore } from "vuex";

export default defineComponent({
  name: "EncounterCard",

  props: {
    session: Object,
    colors: Boolean,
  },

  data() {
    // TODO: Switch this to NPC IDs asap
    let abyssBosses =
      /^(Frenzied Cicerra|Lost Seto|Angry Moguro Captain|Corrupted Albion|)?$/i;
    let legionRaidBosses =
      /(Demon Beast Commander Valtan|Leader Lugaru|Destroyer Lucas|Ravaged Tyrant of Beasts|Vykas)/i;
    let guardians =
      /^(Argos|Ur'nil|Lumerus|Icy Legoros|Vertus|Chromanium|Nacrasena|Flame Fox Yoho|Tytalos|Dark Legoros|Helgaia|Calventus|Achates|Frost Helgaia|Lava Chromanium|Levanos|Alberhastic|Armored Nacrasena|Igrexion|Night Fox Yoho|Velganos|Deskaluda)[+]?$/;

    let bossName = "UNKNOWN BOSS";
    let encounterName = "UNKNOWN ENCOUNTER";

    return {
      abyssBosses,
      legionRaidBosses,
      guardians,
      bossName,
      encounterName,
    };
  },

  mounted() {
    this.getEncounter();
  },

  setup() {
    const store = useStore();
    return { store };
  },

  methods: {
    openLog(id: string) {
      this.$router.push({ path: `/logs/${id}` });
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
      const since = dayjs(date).fromNow(false);
      return since.replace("minutes", "min");
    },
    getPlayerEntities(duplicate = false) {
      let clone = [...this.session?.entities] as Entity[];
      if (duplicate) clone = this.duplicateEntities(this.session as Session);

      return clone
        .sort((a, b) => b.stats.damageDealt - a.stats.damageDealt)
        .filter((e) => e.type === 3);
    },
    duplicateEntities(session: Session) {
      return [
        ...session.entities,
        ...session.entities.map((ent) => {
          return {
            ...ent,
            id: `${ent.id}_${session.entities.length}`,
          };
        }),
      ];
    },
    getEncounter() {
      const entities = [...this.session?.entities] as Entity[];
      const bossEntities = entities.filter(
        (e) => e.type === ENTITY_TYPE.BOSS || e.type === ENTITY_TYPE.GUARDIAN
      );
      const hasBoss = bossEntities.length > 0;
      if (!hasBoss) return;

      const boss = bossEntities.sort((a, b) => b.lastUpdate - a.lastUpdate)[0];

      let encounter = "UNKNOWN ENCOUNTER";
      if (this.abyssBosses.test(boss.name)) {
        // console.log("Detected Abyss Boss");
        encounter = "ad";
      } else if (this.legionRaidBosses.test(boss.name)) {
        // console.log("Detected Legion Raid Boss");
        encounter = "lr";
      } else if (this.guardians.test(boss.name)) {
        // console.log("Detected Guardian");
        encounter = "gr";
      } else {
        // console.log("Detected Unknown Boss:", boss.name);
        encounter = "0";
      }

      this.bossName = boss.name;
      this.encounterName = encounter.toLowerCase();
    },
    getDamageDealtPerSecond(entity: Entity) {
      const duration = (this.session?.ended - this.session?.started) / 1000;
      return entity?.stats.damageDealt / (duration || 0);
    },
    getTotalDPS(entities: Entity[]) {
      let total = 0;

      for (let entity of entities)
        total += this.getDamageDealtPerSecond(entity);
      return this.store.getters.abbrNum(Math.round(total), 2);
    },
  },
});
</script>

<style scoped>
.c-102 {
  background-color: #ee2e48b7;
}
.c-103 {
  background-color: #7b9aa2;
}
.c-104 {
  background-color: #e1907e;
}
.c-105 {
  background-color: #ff9900;
}
.c-202 {
  background-color: #b38915;
}
.c-203 {
  background-color: #22aa99;
}
.c-204 {
  background-color: #674598;
}
.c-205 {
  background-color: #66aa00;
}
.c-302 {
  background-color: #aa5611;
}
.c-303 {
  background-color: #990099;
}
.c-304 {
  background-color: #316395;
}
.c-305 {
  background-color: #1f21c5d3;
}
.c-312 {
  background-color: #994499;
}
.c-402 {
  background-color: #a91a16;
}
.c-403 {
  background-color: #0099c6;
}
.c-404 {
  background-color: #109618;
}
.c-502 {
  background-color: #dd4477;
}
.c-503 {
  background-color: #4442a8;
}
.c-504 {
  background-color: #33670b;
}
.c-505 {
  background-color: #3b4292;
}
.c-512 {
  background-color: #6bcec2;
}
</style>
