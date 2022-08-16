<template>
  <v-row class="mb-0 mt-1">
    <v-col cols="auto" class="pt-2 pb-0 ps-1 pe-0"
      ><v-avatar class="skill-icon" rounded="0"
        ><v-img :src="skillIcon" v-on:error="onImgMissing" /></v-avatar
    ></v-col>
    <v-col cols="6" class="align-self-center ms-2">
      <v-row>
        <h4 class="d-inline-block text-truncate">
          {{ getSkillName() }}
          <small v-if="!isXS()" style="color: grey">{{ skill?.id }}</small>
        </h4>
      </v-row>
      <v-row class="pt-2">
        <span class="detail">
          <span v-if="!isXS()">Casts:</span>
          <span v-else>C:</span>
          {{ skill?.stats.casts }}&nbsp;&nbsp;
        </span>
        <span class="detail">
          <span v-if="!isXS()">Hits:</span>
          <span v-else>H:</span>
          {{ skill?.stats.hits }}&nbsp;&nbsp;
        </span>
        <span class="detail">
          <span> HPM: {{ getSkillHitsPerMinute() }} </span>
        </span>
      </v-row>
      <v-row style="padding-top: 7px">
        <span class="detail">
          <span v-if="!isXS()"
            >Crits: {{ skill?.stats.crits }}
            <span class="detail-percent">{{ getSkillCritRate() }}%</span></span
          >
          <span v-else>C.R: {{ getSkillCritRate(0) }}%</span> </span
        >&nbsp;&nbsp;
        <span class="detail">
          <span v-if="!isXS()">B. Hits:</span>
          <span v-else>B.H:</span>
          {{ skill?.stats.backHits }}
          <span class="hide-on-sm detail-percent"
            >{{ getSkillBackHitRate() }}%</span
          >&nbsp;&nbsp;
        </span>
        <span class="detail">
          <span v-if="!isXS()">F. Hits:</span>
          <span v-else>F.H:</span>
          {{ skill?.stats.frontHits }}
          <span class="hide-on-sm detail-percent"
            >{{ getSkillFrontHitRate() }}%</span
          >
        </span>
      </v-row>
    </v-col>
    <v-col>
      <v-row class="text-right">
        <h4 class="flex-grow-1">{{ getSkillDps() }}/s</h4>
      </v-row>
      <v-row class="pt-1 text-right">
        <span class="flex-grow-1">
          {{ abbrevNum(skill?.stats.damageDealt, 2) }}
          <span class="hide-on-sm detail-percent"
            >{{
              new Intl.NumberFormat().format(getSkillPercentDamage())
            }}%</span
          >
        </span>
      </v-row>
      <v-row class="text-right pt-1">
        <span class="flex-grow-1 detail">
          <span v-if="!isXS()">Max:</span>
          <span v-else>M:</span>
          {{ abbrevNum(skill?.stats.topDamage, 2) }}
        </span>
      </v-row>
    </v-col>
    <v-progress-linear
      :model-value="getSkillPercentDamage()"
      :class="`c-${entity?.classId}`"
      striped
      height="5"
    >
    </v-progress-linear>
  </v-row>
</template>

<script lang="ts">
import { Skill } from "@/interfaces/session.interface";
import { defineComponent } from "vue";
import { mapGetters } from "vuex";

export default defineComponent({
  name: "BreakdownSkills",

  data() {
    return { missingImage: false };
  },

  props: {
    entity: Object,
    skill: Object,
    classId: Number,
    duration: Number,
  },

  methods: {
    getSkillHitsPerMinute() {
      const duration = this.duration || 0;

      return (this.skill?.stats.hits / (duration / 60)).toFixed(2);
    },
    getSkillDps() {
      const skill = this.skill as Skill;
      const damageDealt = skill.stats.damageDealt;

      let duration = this.duration || 0;

      if (damageDealt && duration) {
        const dps = damageDealt / duration;
        return this.abbrevNum(dps, 2);
      } else {
        return "0";
      }
    },
    getSkillPercentDamage() {
      const totalEntityDamage = this.entity?.stats.damageDealt;
      const totalSkillDamage = this.skill?.stats.damageDealt;

      return Math.round((totalSkillDamage / totalEntityDamage) * 100);
    },
    getSkillCritRate(toFixed = 1) {
      const skill = this.skill as Skill;
      const crits = skill.stats.crits;
      const hits = skill.stats.hits;

      if (crits && hits) {
        const critRate = (crits / hits) * 100;
        return critRate.toFixed(toFixed);
      } else {
        return "0";
      }
    },
    getSkillFrontHitRate() {
      const skill = this.skill as Skill;
      const frontHits = skill.stats.frontHits;
      const hits = skill.stats.hits;

      if (frontHits && hits) {
        const frontHitRate = (frontHits / hits) * 100;
        return frontHitRate.toFixed(1);
      } else {
        return "0";
      }
    },
    getSkillBackHitRate() {
      const skill = this.skill as Skill;
      const backHits = skill.stats.backHits;
      const hits = skill.stats.hits;

      if (backHits && hits) {
        const backHitRate = (backHits / hits) * 100;
        return backHitRate.toFixed(1);
      } else {
        return "0";
      }
    },
    onImgMissing() {
      this.missingImage = true;
    },
    getSkillName() {
      const skill = this.skill as Skill;
      let skillName =
        skill.id !== 0 ? this.$t(`skills.${skill.id}`) : this.$t(`skills.0`);

      if (skillName.includes("skills.")) skillName = "???";
      return skillName;
    },
    abbrevNum(number: number, decPlaces = 2) {
      if (this.isXS()) decPlaces = 1;
      return this.abbrNum(number, decPlaces);
    },
    isXS() {
      return this.$vuetify.display.xs;
    },
  },
  computed: {
    ...mapGetters(["abbrNum"]),
    skillIcon: function () {
      return this.missingImage
        ? "/img/sprites/e400.webp"
        : `/img/sprites/${this.skill?.id}.webp`;
    },
  },
});
</script>

<style scoped>
@media only screen and (max-width: 519px) {
  .hide-on-sm {
    display: none;
  }
}

.detail {
  font-size: 11pt;
}

.detail-percent {
  color: grey;
  font-size: 9pt;
}

.skill-icon {
  border-radius: 10% !important;
}

.c-102 {
  color: #ee2e48b7;
}
.c-103 {
  color: #7b9aa2;
}
.c-104 {
  color: #e1907e;
}
.c-105 {
  color: #ff9900;
}
.c-202 {
  color: #b38915;
}
.c-203 {
  color: #22aa99;
}
.c-204 {
  color: #674598;
}
.c-205 {
  color: #66aa00;
}
.c-302 {
  color: #aa5611;
}
.c-303 {
  color: #990099;
}
.c-304 {
  color: #316395;
}
.c-305 {
  color: #1f21c5d3;
}
.c-312 {
  color: #994499;
}
.c-402 {
  color: #a91a16;
}
.c-403 {
  color: #0099c6;
}
.c-404 {
  color: #109618;
}
.c-502 {
  color: #dd4477;
}
.c-503 {
  color: #4442a8;
}
.c-504 {
  color: #33670b;
}
.c-505 {
  color: #3b4292;
}
.c-512 {
  color: #6bcec2;
}
</style>
