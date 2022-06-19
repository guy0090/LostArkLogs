<template>
  <v-row class="mb-0 mt-1">
    <v-col cols="auto" class="pt-2 pb-0 ps-1 pe-0"
      ><v-avatar class="skill-icon"
        ><v-img :src="skillIcon" v-on:error="onImgMissing" /></v-avatar
    ></v-col>
    <v-col cols="auto" class="align-self-center ms-2">
      <v-row>
        <h4 class="d-inline-block text-truncate">
          {{ getSkillName() }}
          <small style="color: grey">{{ skill?.id }}</small>
        </h4>
      </v-row>
      <v-row class="pt-1">
        <span> Hits: {{ skill?.stats.hits }} </span>&nbsp;
        <span>
          Crits: {{ skill?.stats.crits }}
          <span style="font-size: 9pt">({{ getSkillCritRate() }}%)</span>
        </span>
      </v-row>
      <v-row class="pt-1">
        <span
          >Back Hits: {{ skill?.stats.backHits }}
          <span class="hide-on-sm" style="font-size: 10pt"
            >({{ getSkillBackHitRate() }}%)</span
          ></span
        >&nbsp;
        <span
          >Front Hits: {{ skill?.stats.frontHits }}
          <span class="hide-on-sm" style="font-size: 10pt"
            >({{ getSkillFrontHitRate() }}%)</span
          ></span
        >
      </v-row>
    </v-col>
    <v-spacer></v-spacer>
    <v-col>
      <v-row class="text-right">
        <h4 class="flex-grow-1">{{ getSkillDps() }}/s</h4>
      </v-row>
      <v-row class="pt-1 text-right">
        <span class="flex-grow-1">
          {{ abbrNum(skill?.stats.damageDealt, 2) }}
          <span style="font-size: 10pt"
            >({{
              new Intl.NumberFormat().format(getSkillPercentDamage())
            }}%)</span
          >
        </span>
      </v-row>
      <v-row class="pt-2 text-right">
        <span class="flex-grow-1">
          Max:
          {{ abbrNum(skill?.stats.topDamage, 2) }}
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
import { useStore } from "vuex";

export default defineComponent({
  name: "BreakdownSkills",

  data() {
    return { missingImage: false };
  },

  setup() {
    const store = useStore();
    return {
      store,
    };
  },

  props: {
    entity: Object,
    skill: Object,
    classId: Number,
    duration: Number,
  },

  computed: {
    skillIcon: function () {
      return this.missingImage
        ? "/img/sprites/unknown.png"
        : `/img/sprites/${this.skill?.id}.png`;
    },
  },

  methods: {
    getSkillDps() {
      const skill = this.skill as Skill;
      const damageDealt = skill.stats.damageDealt;

      let duration = this.duration || 0;

      if (damageDealt && duration) {
        const dps = damageDealt / duration;
        return this.abbrNum(dps, 2);
      } else {
        return "0";
      }
    },
    getSkillPercentDamage() {
      const totalEntityDamage = this.entity?.stats.damageDealt;
      const totalSkillDamage = this.skill?.stats.damageDealt;

      return Math.round((totalSkillDamage / totalEntityDamage) * 100);
    },
    getSkillCritRate() {
      const skill = this.skill as Skill;
      const crits = skill.stats.crits;
      const hits = skill.stats.hits;

      if (crits && hits) {
        const critRate = (crits / hits) * 100;
        return critRate.toFixed(1);
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
    onImgMissing(_event: Event) {
      this.missingImage = true;
    },
    getSkillName() {
      const skill = this.skill as Skill;
      let skillName =
        skill.id !== 0 ? this.$t(`skills.${skill.id}`) : this.$t(`skills.0`);

      if (skillName.includes("skills.")) skillName = skill.name;
      return skillName;
    },
    abbrNum(number: number, decPlaces: number) {
      return this.store.getters.abbrNum(number, decPlaces);
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
