<template>
  <v-row class="mt-1">
    <v-progress-linear
      :model-value="getSkillPercentDamage()"
      color="success"
      height="2"
    >
    </v-progress-linear>
    <v-col cols="auto"
      ><v-avatar class="skill-icon"
        ><v-img :src="skillIcon" v-on:error="onImgMissing" /></v-avatar
    ></v-col>
    <v-col cols="auto" class="align-self-center"
      ><h4>
        {{
          $props.skill?.id !== 0
            ? $t(`skills.${$props.skill?.id}`).toUpperCase()
            : $t(`skills.0`).toUpperCase()
        }}
      </h4></v-col
    >
    <v-spacer></v-spacer>
    <v-col cols="auto">
      <h3>
        {{ new Intl.NumberFormat().format($props.skill?.totalDamage) }} ({{
          new Intl.NumberFormat().format(getSkillPercentDamage())
        }}%)
      </h3>
    </v-col>
  </v-row>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "BreakdownSkills",

  data() {
    return { missingImage: false };
  },

  props: {
    entity: Object,
    skill: Object,
    classId: Number,
  },

  computed: {
    skillIcon: function () {
      return this.missingImage
        ? "/img/sprites/unknown.png"
        : `/img/sprites/${this.skill?.id}.png`;
    },
  },

  methods: {
    getSkillDamagePerSecond() {
      const skillDamage = this.skill?.totalDamage;
      const totalDamage = this.entity?.damageDealt;

      return skillDamage / totalDamage;
    },
    getSkillPercentDamage() {
      const totalEntityDamage = this.entity?.damageDealt;
      const totalSkillDamage = this.skill?.totalDamage;

      return Math.round((totalSkillDamage / totalEntityDamage) * 100);
    },
    onImgMissing(_event: Event) {
      this.missingImage = true;
    },
  },
});
</script>

<style scoped>
.skill-icon {
  border-radius: 10% !important;
}
</style>
