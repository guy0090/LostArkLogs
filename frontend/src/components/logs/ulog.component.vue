<template>
  <v-container v-if="!fileLoaded" style="height: 100%">
    <v-row align="center" justify="center" style="height: 100%">
      <v-col cols="4">
        <v-file-input
          prepend-icon="mdi-upload"
          accept=".enc"
          label="Log File"
          v-on:change="onFileChange"
        ></v-file-input>
      </v-col>
    </v-row>
  </v-container>
  <Log v-else :uSession="session" :isUpload="true"></Log>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import pako from "pako";
import { v4 as uuidv4 } from "uuid";

import {
  ENTITY_TYPE,
  SkillBreakdown,
  UEntity,
  USession,
} from "@/interfaces/session.interface";

import Log from "@/components/logs/log.component.vue";

export default defineComponent({
  name: "UploadedLog",

  components: {
    Log,
  },

  setup() {
    let fileLoaded = ref(false);
    let session = ref({} as USession | undefined);

    return {
      fileLoaded,
      session,
    };
  },

  methods: {
    async onFileChange(e: any) {
      const file = e.target.files[0] as File;
      const data = await file.arrayBuffer();

      this.readSession(data);
    },
    reformatUpload(session: USession) {
      const clone: USession = JSON.parse(JSON.stringify(session));

      clone.entities = clone.entities.filter(
        (e) => e.type !== ENTITY_TYPE.MONSTER && e.type !== ENTITY_TYPE.UNKNOWN
      );

      const bosses = clone.entities.filter(
        (e) => e.type === ENTITY_TYPE.BOSS || e.type === ENTITY_TYPE.GUARDIAN
      );
      // If multiple bosses are logged, only keep the most recent one
      if (bosses.length > 1) {
        const filtered = bosses
          .sort((a, b) => b.lastUpdate - a.lastUpdate)
          .slice(1)
          .map((e) => e.id);

        clone.entities = clone.entities.filter((e) => !filtered.includes(e.id));
      }

      // Generate data intervals
      const intervals = this.generateIntervals(
        clone.firstPacket,
        clone.lastPacket
      );
      clone.damageStatistics.dpsIntervals = intervals;

      // Create DPS over time data for ECharts for each player entity
      for (const e of clone.entities) {
        if (e.type === ENTITY_TYPE.PLAYER) {
          e.id = uuidv4();
          e.gearLevel = parseFloat(e.gearLevel as string);
          delete e.name;
          e.stats.dpsOverTime = this.getEntityData(
            intervals,
            e,
            clone.firstPacket
          );
        }
      }

      // Remove breakdowns; Not needed anymore
      clone.entities.forEach((e) => {
        Object.values(e.skills).forEach((s) => {
          delete s.breakdown;
        });
      });

      return clone;
    },
    async readSession(data: ArrayBuffer) {
      try {
        console.time("readSession");
        let restored: USession = JSON.parse(
          pako.inflate(data, { to: "string" })
        );
        restored = this.reformatUpload(restored);
        console.timeEnd("readSession");

        restored.entities.forEach((e) => {
          e.skills = Object.values(e.skills);
        });

        restored.duration = restored.lastPacket - restored.firstPacket;
        this.session = restored;
        this.fileLoaded = true;
      } catch (e) {
        console.error(e);
      }
    },

    generateIntervals(started: number, ended: number) {
      const duration = ended - started;
      const intervals = [];

      const parts = duration / 5000;
      for (let i = 0; i <= Math.floor(parts); i++) {
        if (i === Math.floor(parts)) intervals.push(parts * 5000);
        else intervals.push(i * 5000);
      }
      return intervals;
    },

    getEntityData(intervals: number[], player: UEntity, started: number) {
      const data: number[] = [];

      intervals.forEach((i) => {
        const damage = this.getEntityDamageInRange(
          started,
          started + i,
          player
        );
        const dps = parseFloat(this.getEntityDPS(i / 1000, damage));
        data.push(dps);
      });

      return data;
    },
    getEntityDamageInRange(begin: number, end: number, entity: UEntity) {
      const skills = Object.values(entity.skills);
      const damageDealtInRange = skills.reduce((acc, skill) => {
        const skillEntries = (skill.breakdown as SkillBreakdown[]).filter(
          (d) => d.timestamp >= begin && d.timestamp <= end
        );
        return acc + skillEntries.reduce((acc, d) => acc + d.damage, 0);
      }, 0);

      if (!damageDealtInRange || isNaN(damageDealtInRange)) return 0;
      return damageDealtInRange;
    },
    getEntityDPS(duration: number, damage: number) {
      return damage > 0 ? (damage / duration).toFixed(2) : "0";
    },
  },
});
</script>
