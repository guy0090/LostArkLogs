<template>
  <v-row>
    <v-col>
      <v-card flat>
        <v-card-content>
          <v-row justify="space-evenly">
            <v-col cols="auto">
              <v-row> DAMAGE DEALT </v-row>
              <v-row class="pt-1">
                <h3>
                  {{
                    new Intl.NumberFormat().format($props.entity?.damageDealt)
                  }}
                  <small>({{ getPercentDamageDealt() }}%)</small>
                </h3>
              </v-row>
            </v-col>
            <v-col cols="auto">
              <v-row> DAMAGE PER SECOND </v-row>
              <v-row class="pt-1">
                <h3>
                  {{
                    new Intl.NumberFormat().format(getDamageDealtPerSecond())
                  }}
                </h3>
              </v-row>
            </v-col>
            <v-col cols="auto">
              <v-row> CRIT RATE </v-row>
              <v-row class="pt-1">
                <h3>{{ new Intl.NumberFormat().format(getCritRate()) }}%</h3>
              </v-row>
            </v-col>
            <v-col cols="auto">
              <v-row> DAMAGE TAKEN </v-row>
              <v-row class="pt-1">
                <h3>
                  {{
                    new Intl.NumberFormat().format($props.entity?.damageTaken)
                  }}
                  <small>({{ getPercentDamageTaken() }}%)</small>
                </h3>
              </v-row>
            </v-col>
            <v-col cols="auto">
              <v-row> ATTACKS </v-row>
              <v-row class="pt-1">
                <h3>
                  {{ $props.entity?.stats.totalHits }}
                </h3>
              </v-row>
            </v-col>
            <v-col cols="auto">
              <v-row> FRONT ATTACKS </v-row>
              <v-row class="pt-1">
                <h3>
                  {{
                    new Intl.NumberFormat().format(
                      $props.entity?.stats.frontAttacks
                    )
                  }}
                </h3>
              </v-row>
            </v-col>
            <v-col cols="auto">
              <v-row> BACK ATTACKS </v-row>
              <v-row class="pt-1">
                <h3>
                  {{
                    new Intl.NumberFormat().format(
                      $props.entity?.stats.backAttacks
                    )
                  }}
                </h3>
              </v-row>
            </v-col>
            <v-col cols="auto">
              <v-row> COUNTERS </v-row>
              <v-row class="pt-1">
                <h3>{{ $props.entity?.stats.counters }}</h3>
              </v-row>
            </v-col>
          </v-row>
        </v-card-content>
      </v-card>
    </v-col>
  </v-row>
  <v-row>
    <v-col>
      <BreakdownSkill
        v-for="skill in $props.entity?.skills.sort(
          (a, b) => b.totalDamage - a.totalDamage
        )"
        :key="skill.id"
        :skill="skill"
        :entity="$props.entity"
        >{{ skill.id }}</BreakdownSkill
      >
    </v-col>
  </v-row>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import BreakdownSkill from "@/components/logs/breakdown/skill.component.vue";

export default defineComponent({
  name: "BreakdownSummary",

  components: {
    BreakdownSkill,
  },

  props: {
    entity: Object,
    session: Object,
  },

  methods: {
    getCritRate() {
      const rate =
        (this.entity?.stats?.crits / this.entity?.stats?.totalHits) * 100;
      return isNaN(rate) ? 0 : rate;
    },
    getPercentDamageDealt() {
      const totalEntityDamage = this.entity?.damageDealt;
      const totalSessionDamage =
        this.session?.damageStatistics?.totalDamageDealt;

      const percent = (totalEntityDamage / totalSessionDamage) * 100;
      return isNaN(percent) ? 0 : Math.round(percent);
    },

    getPercentDamageTaken() {
      const totalEntityDamage = this.entity?.damageTaken;
      const totalSessionDamage =
        this.session?.damageStatistics?.totalDamageTaken;

      const percent = (totalEntityDamage / totalSessionDamage) * 100;
      return isNaN(Math.round(percent)) ? 0 : Math.round(percent);
    },

    getDamageDealtPerSecond() {
      const duration = (this.session?.ended - this.session?.started) / 1000;
      const dps = this.entity?.damageDealt / duration;
      return isNaN(dps) ? 0 : dps;
    },
  },
});
</script>
