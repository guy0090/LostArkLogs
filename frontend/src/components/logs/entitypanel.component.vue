<template>
  <v-col
    sm="12"
    md="12"
    :lg="12"
    :xl="entities"
    class="pt-2 pb-0 px-1 expand-sm"
  >
    <v-expansion-panels>
      <v-expansion-panel rounded="sm">
        <v-progress-linear
          :model-value="
            getPercentDamageDealt(
              totalDamageDealt || 0,
              entity?.stats.damageDealt
            )
          "
          striped
          :class="`c-${entity?.classId}`"
          height="7"
        >
        </v-progress-linear>
        <v-expansion-panel-title class="py-3 ps-4">
          <v-row>
            <v-col cols="auto" class="pt-3 pb-1 pe-1 ps-1">
              <img
                width="52"
                height="52"
                :src="'/img/sprites/' + entity?.classId + '.png'"
              />
            </v-col>
            <v-col cols="auto" class="align-self-center">
              <!-- Class & GS/MVP -->
              <v-row>
                <v-col
                  cols="auto"
                  class="align-self-center ps-0 pe-1 py-0 hide-on-sm"
                >
                  <h3 class="hide-on-sm">
                    <span style="color: grey; font-size: 9pt">{{
                      entity?.iid
                    }}</span>
                    {{ $t(`classes.${entity?.classId}`) }}
                  </h3>
                </v-col>
                <v-col
                  v-if="mvp"
                  cols="auto"
                  class="align-self-center px-0 py-0"
                >
                  <v-badge
                    inline
                    color="red-darken-3"
                    :rounded="0"
                    content="MVP"
                    class="badge-pad"
                  >
                    <h3></h3>
                  </v-badge>
                </v-col>
                <v-col cols="auto" class="align-self-center px-0 py-0"
                  ><v-badge
                    inline
                    color="red-darken-3"
                    :rounded="0"
                    :content="entity?.gearLevel"
                    class="badge-pad"
                  >
                    <h3></h3> </v-badge
                ></v-col>
              </v-row>
              <!-- Crits & Counters -->
              <v-row class="hide-on-sm">
                <v-col cols="auto" class="px-0 pb-1">
                  <span class="stat-details"
                    >C.R: {{ getEntityCritRate() }}%</span
                  >
                </v-col>
                <v-col cols="auto" class="px-2 pb-1">
                  <span>Counters: {{ entity?.stats?.counters }}</span>
                </v-col>
              </v-row>
              <!-- Hits -->
              <v-row class="hide-on-sm">
                <v-col cols="auto" class="px-0 pt-2 pb-0">
                  <span class="stat-details">
                    B. Hits: {{ entity?.stats?.backHits }}
                    <span class="percent-detail" style="font-size: 8pt"
                      >({{ getEntityBackAttackRate() }}%)</span
                    >
                  </span>
                </v-col>
                <v-col cols="auto" class="px-2 pt-2 pb-0">
                  <span class="stat-details">
                    F. Hits: {{ entity?.stats?.frontHits }}
                    <span class="percent-detail" style="font-size: 8pt"
                      >({{ getEntityFrontAttackRate() }}%)</span
                    >
                  </span>
                </v-col>
              </v-row>
            </v-col>
            <v-spacer></v-spacer>
            <v-col class="align-self-center me-4">
              <v-row class="text-right pb-3">
                <h3 class="flex-grow-1">{{ getDamageDealtPerSecond() }}/s</h3>
              </v-row>
              <v-row class="mt-1 text-right pb-2">
                <h4 class="flex-grow-1">
                  {{ getDamageDealt() }}
                  ({{
                    getPercentDamageDealt(
                      totalDamageDealt || 0,
                      entity?.stats.damageDealt
                    )
                  }}%)
                </h4>
              </v-row>
              <v-row class="text-right pt-2">
                <h4 class="flex-grow-1">
                  <span class="text-green">{{ getEntityHealing() }}</span
                  >&nbsp;
                  <span class="text-red">{{ getEntityDamageTaken() }}</span>
                </h4>
              </v-row>
            </v-col>
          </v-row>
        </v-expansion-panel-title>
        <v-expansion-panel-text class="px-0">
          <entity-skill
            v-for="skill in sortedSkills()"
            :key="skill.id"
            :skill="skill"
            :entity="entity"
            :duration="duration"
          ></entity-skill>
        </v-expansion-panel-text>
      </v-expansion-panel>
    </v-expansion-panels>
  </v-col>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { useStore } from "vuex";

import EntitySkill from "@/components/logs/breakdown/skill.component.vue";
import { Skill } from "@/interfaces/session.interface";

export default defineComponent({
  name: "EntityCard",

  components: {
    EntitySkill,
  },

  setup() {
    const store = useStore();
    return {
      store,
    };
  },

  props: {
    entity: Object,
    entities: Number,
    totalDamageDealt: Number,
    duration: Number || 0,
    mvp: Boolean || false,
  },

  methods: {
    getPercentDamageDealt(
      totalSessionDamage: number,
      totalEntityDamage: number
    ) {
      let percent = (totalEntityDamage / totalSessionDamage) * 100;
      return Math.round(percent);
    },
    getDamageDealt(abbreviate = true) {
      const damageDealt = this.entity?.stats.damageDealt;
      if (!abbreviate) return new Intl.NumberFormat().format(damageDealt);
      return this.abbrNum(damageDealt, 2);
    },
    getDamageDealtPerSecond(abbreviate = true) {
      const damageDealt = this.entity?.stats.damageDealt / (this.duration || 0);
      if (!abbreviate) return new Intl.NumberFormat().format(damageDealt);
      return this.abbrNum(damageDealt, 2);
    },
    clickTab(target: string) {
      const tab: any = document.querySelector(`#${target}`);
      tab.click();
    },
    getCritRate() {
      const rate = (this.entity?.stats?.crits / this.entity?.stats?.hits) * 100;
      return isNaN(rate) ? 0 : rate;
    },
    getEntityCritRate() {
      const hits = this.entity?.stats?.hits;
      const crits = this.entity?.stats?.crits;

      if (hits && crits) {
        const critRate = (crits / hits) * 100;
        return critRate.toFixed(1);
      } else {
        return 0;
      }
    },
    getEntityBackAttackRate() {
      const hits = this.entity?.stats?.hits;
      const backHits = this.entity?.stats?.backHits;

      if (hits && backHits) {
        const backAttackRate = (backHits / hits) * 100;
        return backAttackRate.toFixed(1);
      } else {
        return 0;
      }
    },
    getEntityFrontAttackRate() {
      const hits = this.entity?.stats?.hits;
      const frontHits = this.entity?.stats?.frontHits;

      if (hits && frontHits) {
        const frontAttackRate = (frontHits / hits) * 100;
        return frontAttackRate.toFixed(1);
      } else {
        return 0;
      }
    },
    getEntityHealing(abbreviate = true) {
      const healing = this.entity?.stats?.healing;

      if (healing) {
        if (!abbreviate) return Intl.NumberFormat().format(healing);
        return this.abbrNum(healing, 2);
      } else {
        return 0;
      }
    },
    getEntityDamageTaken(abbreviate = true) {
      const damageTaken = this.entity?.stats?.damageTaken;

      if (damageTaken) {
        if (!abbreviate) return Intl.NumberFormat().format(damageTaken);
        return this.abbrNum(damageTaken, 2);
      } else {
        return 0;
      }
    },
    sortedSkills() {
      const clone = [...this.entity?.skills] as Skill[];
      return clone.sort((a, b) => b.stats.damageDealt - a.stats.damageDealt);
    },
    abbrNum(number: number, decPlaces: number) {
      // 2 decimal places => 100, 3 => 1000, etc
      decPlaces = Math.pow(10, decPlaces);

      let abbreviated = "0";
      // Enumerate number abbreviations
      const abbrev = ["k", "m", "b", "t"];

      // Go through the array backwards, so we do the largest first
      for (let i = abbrev.length - 1; i >= 0; i--) {
        // Convert array index to "1000", "1000000", etc
        const size = Math.pow(10, (i + 1) * 3);

        // If the number is bigger or equal do the abbreviation
        if (size <= number) {
          // Here, we multiply by decPlaces, round, and then divide by decPlaces.
          // This gives us nice rounding to a particular decimal place.
          number = Math.round((number * decPlaces) / size) / decPlaces;

          // Handle special case where we round up to the next abbreviation
          if (number == 1000 && i < abbrev.length - 1) {
            number = 1;
            i++;
          }

          // Add the letter for the abbreviation
          abbreviated = number + abbrev[i];

          // We are done... stop
          break;
        }
      }

      return abbreviated;
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

@media only screen and (max-width: 600px) {
  .expand-sm {
    min-width: 100% !important;
  }
}

.badge-pad {
  padding-bottom: 2px !important;
}

.stat-details {
  font-size: 11pt;
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
