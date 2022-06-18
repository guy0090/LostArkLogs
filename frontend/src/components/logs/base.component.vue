<template>
  <v-container v-if="!store.getters.pageLoading">
    <v-row justify="center">
      <v-col
        class="mx-0 px-0 hide-on-sm"
        sm="auto"
        md="auto"
        lg="2"
        xl="2"
      ></v-col>
      <v-col lg="8" xl="8">
        <v-expansion-panels v-model="open">
          <v-expansion-panel rounded="sm" value="filters">
            <v-progress-linear model-value="100" height="7" color="indigo">
            </v-progress-linear>
            <v-expansion-panel-title>
              <v-row>
                <v-col cols="auto">
                  <v-avatar color="indigo" icon="mdi-filter"></v-avatar>
                </v-col>
                <v-col class="align-self-center">
                  <v-row>
                    <h2>Search Logged Encounters</h2>
                  </v-row>
                  <v-row class="hide-on-sm mt-4">
                    <h4 style="font-weight: 400">
                      Filter for specific encounters by class, encounter name,
                      gear score and level
                    </h4>
                  </v-row>
                </v-col>
              </v-row>
            </v-expansion-panel-title>
            <v-expansion-panel-text>
              <!-- TODO: MOVE THIS TO COMPONENT - CHANGE TO VUEX -->
              <v-row>
                <v-col>
                  <v-row class="my-1">
                    <h3>
                      <v-icon icon="mdi-gamepad"></v-icon>&nbsp;Classes
                      <v-btn
                        flat
                        class="ms-1"
                        color="indigo"
                        size="small"
                        variant="contained"
                        v-on:click="filter.classes = [...classes]"
                        >All</v-btn
                      >
                      <v-btn
                        flat
                        class="mx-2"
                        color="red-darken-4"
                        size="small"
                        variant="contained"
                        v-on:click="filter.classes = []"
                        >None</v-btn
                      >
                    </h3>
                  </v-row>
                  <v-row class="ma-1 justify-center">
                    <v-col
                      cols="auto"
                      class="pa-0"
                      v-for="(c, i) in getClasses()"
                      :key="i"
                    >
                      <v-chip
                        :class="`ma-2 ps-1 ${
                          $vuetify.display.xs ? 'pe-0' : ''
                        } ${filter.classes.includes(c.id) ? `c-${c.id}` : ''}`"
                        label
                        :id="c.id"
                        :ripple="false"
                        style="user-select: none"
                        v-on:click="toggleClassFilter(c.id)"
                      >
                        <v-avatar
                          class="me-1"
                          :image="`/img/sprites/${c.id}.png`"
                          style="user-select: none"
                        ></v-avatar>
                        <span class="hide-on-sm" style="user-select: none">{{
                          c.name
                        }}</span>
                      </v-chip>
                    </v-col>
                  </v-row>
                </v-col>
              </v-row>
              <v-divider class="my-2"></v-divider>
              <v-row>
                <v-col>
                  <v-row class="my-1">
                    <h3>
                      <v-icon icon="mdi-space-invaders"></v-icon>&nbsp;Bosses
                      <v-btn
                        flat
                        class="ms-1"
                        color="indigo"
                        size="small"
                        variant="contained"
                        v-on:click="filter.bosses = supported.map((s) => s.id)"
                        >All</v-btn
                      >
                      <v-btn
                        flat
                        class="mx-2"
                        color="red-darken-4"
                        size="small"
                        variant="contained"
                        v-on:click="filter.bosses = []"
                        >None</v-btn
                      >
                    </h3>
                  </v-row>
                  <v-row class="ma-1 justify-center">
                    <v-col
                      cols="auto"
                      class="pa-0"
                      v-for="(boss, i) in supported"
                      :key="i"
                    >
                      <v-chip
                        :class="`ma-2 ps-1  ${
                          filter.bosses.includes(boss.id)
                            ? `bg-indigo-darken-3`
                            : ''
                        }`"
                        label
                        :id="boss.id"
                        :ripple="false"
                        style="user-select: none"
                        v-on:click="toggleBossFilter(boss.id)"
                      >
                        <v-avatar
                          class="me-1"
                          :image="`/img/sprites/${boss.type}.webp`"
                          style="user-select: none"
                        ></v-avatar>
                        <span style="user-select: none">{{ boss.name }}</span>
                      </v-chip>
                    </v-col>
                  </v-row>
                </v-col>
              </v-row>
              <!--END TODO: MOVE THIS TO COMPONENT - CHANGE TO VUEX -->
              <v-divider class="my-2"></v-divider>
              <v-row justify="space-around">
                <v-col cols="12" sm="12" md="3" lg="3" xl="3">
                  <v-row class="my-1">
                    <h3><v-icon icon="mdi-shield"></v-icon>&nbsp;Gear Level</h3>
                  </v-row>
                  <v-row class="pt-2">
                    <v-col cols="6" class="px-0 pb-0">
                      <v-text-field
                        variant="outlined"
                        density="comfortable"
                        label="Min"
                        class="pe-2"
                        :model-value="filter.gearLevel[0]"
                        v-on:update:model-value="
                          (v) =>
                            updateRangeFilter('gearLevel', 'min', v, {
                              min: 0,
                              max: 1625,
                            })
                        "
                      ></v-text-field>
                    </v-col>
                    <v-col cols="6" class="px-0 pb-0">
                      <v-text-field
                        variant="outlined"
                        density="comfortable"
                        label="Max"
                        class="pe-2"
                        :model-value="filter.gearLevel[1]"
                        v-on:update:model-value="
                          (v) =>
                            updateRangeFilter('gearLevel', 'max', v, {
                              min: 0,
                              max: 1625,
                            })
                        "
                      ></v-text-field>
                    </v-col>
                  </v-row>
                </v-col>
                <v-col cols="12" sm="12" md="3" lg="3" xl="3">
                  <v-row class="my-1">
                    <h3>
                      <v-icon icon="mdi-arrow-up-bold"></v-icon>&nbsp;Level
                    </h3>
                  </v-row>
                  <v-row class="pt-2">
                    <v-col cols="6" class="px-0 pb-0">
                      <v-text-field
                        variant="outlined"
                        density="comfortable"
                        label="Min"
                        class="pe-2"
                        :model-value="filter.level[0]"
                        v-on:update:model-value="
                          (v) =>
                            updateRangeFilter('level', 'min', v, {
                              min: 0,
                              max: 60,
                            })
                        "
                      ></v-text-field>
                    </v-col>
                    <v-col cols="6" class="px-0 pb-0">
                      <v-text-field
                        variant="outlined"
                        density="comfortable"
                        label="Max"
                        class="pe-2"
                        :model-value="filter.level[1]"
                        v-on:update:model-value="
                          (v) =>
                            updateRangeFilter('level', 'max', v, {
                              min: 0,
                              max: 60,
                            })
                        "
                      ></v-text-field>
                    </v-col>
                  </v-row>
                </v-col>
              </v-row>
              <v-row :justify="$vuetify.display.xs ? 'center' : 'end'">
                <v-col cols="auto" class="px-1">
                  <v-btn color="red-darken-3" v-on:click="resetFilter"
                    ><v-icon icon="mdi-refresh"></v-icon>Reset</v-btn
                  >
                </v-col>
                <v-col hidden cols="auto" class="px-1">
                  <v-btn color="blue-darken-3" v-on:click="saveFilter"
                    ><v-icon icon="mdi-floppy"></v-icon>Save Filter</v-btn
                  >
                </v-col>
                <v-col cols="auto" class="ps-1">
                  <v-btn color="green-darken-3" v-on:click="filterForLogs">
                    <v-icon icon="mdi-magnify"></v-icon>Search
                  </v-btn>
                </v-col>
              </v-row>
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>
        <v-row class="mt-3" v-if="filtered.length === 0" justify="center">
          <v-col cols="auto">
            <v-row>
              <img src="/img/sprites/e404.png" />
            </v-row>
            <v-row justify="center" class="mt-1">
              <strong>NO RESULTS</strong>
            </v-row>
          </v-col>
        </v-row>
        <v-row class="mt-3 mx-0" v-else>
          <EncounterCard
            class="mb-2"
            v-for="(session, index) in filtered"
            :key="index"
            :session="session"
          ></EncounterCard>
        </v-row>
      </v-col>
      <v-col
        class="mx-0 px-0 hide-on-sm"
        sm="auto"
        md="auto"
        lg="2"
        xl="2"
      ></v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { ENTITY_TYPE, Session } from "@/interfaces/session.interface";
import {
  LogFilter,
  SupportedRaid,
  TrackedBosses,
} from "@/interfaces/util.interface";
import axios from "axios";
import { defineComponent, reactive, ref } from "vue";
import { useStore } from "vuex";

import EncounterCard from "@/components/home/encounter.component.vue";

export default defineComponent({
  name: "BaseLogsPage",

  components: {
    EncounterCard,
  },

  setup() {
    const open = ref([] as string[]);
    const store = useStore();
    const supported = ref([] as any[]);
    const tracked = ref([] as TrackedBosses[]);
    const classes = store.getters.classes;
    const filter = reactive({
      classes: [] as number[],
      bosses: [] as number[],
      gearLevel: [302, 1625],
      level: [50, 60],
      server: "any",
      region: "any",
    } as LogFilter);
    const lastFilter = ref({} as LogFilter);
    const savedFilters = ref([]);
    const onlyTracked = localStorage.getItem("onlyTracked") || "1";
    const filtered = ref([] as Session[]);

    return {
      open,
      store,
      supported,
      tracked,
      classes,
      filter,
      lastFilter,
      savedFilters,
      onlyTracked,
      filtered,
    };
  },

  mounted() {
    this.store.commit("setPageLoading", true);

    this.loadFilters();

    this.getSupportedBosses(this.onlyTracked).then((s) => {
      this.store.commit("setPageLoading", false);
      this.supported = s;

      this.open = ["filters"];
    });
  },

  methods: {
    loadFilters() {
      const filters = localStorage.getItem("filters");
      if (!filters) return [];
      return JSON.parse(filters);
    },
    saveFilter() {
      const newFilter = JSON.parse(JSON.stringify(this.filter));
      console.log(newFilter);
      return newFilter;
    },
    resetFilter() {
      this.filter.bosses = [];
      this.filter.classes = [];
      this.filter.gearLevel = [302, 1625];
      this.filter.level = [50, 60];
      this.filter.region = "any";
      this.filter.server = "any";

      this.filtered = [];
    },
    getClasses() {
      const classes: any[] = [];
      for (const cId of this.classes) {
        let name = this.$t(`classes.${cId}`);

        classes.push({ name, id: cId });
      }
      return classes.sort((a, b) => a.name.localeCompare(b.name));
    },
    toggleClassFilter(id: number) {
      if (this.filter.classes.includes(id))
        this.filter.classes.splice(this.filter.classes.indexOf(id), 1);
      else this.filter.classes.push(id);
    },
    toggleBossFilter(id: number) {
      if (this.filter.bosses.includes(id))
        this.filter.bosses.splice(this.filter.bosses.indexOf(id), 1);
      else this.filter.bosses.push(id);
    },
    updateRangeFilter(
      key: "gearLevel" | "level",
      type: "min" | "max",
      value: string,
      defaults = { min: 0, max: 60 }
    ) {
      const [min, max] = this.filter[key];

      try {
        let newVal = parseFloat(value);

        if (type === "min") {
          if (isNaN(newVal) || newVal < defaults.min) newVal = defaults.min;
          if (newVal > max) newVal = max;

          this.filter[key][0] = newVal;
        }

        if (type === "max") {
          if (isNaN(newVal) || newVal > defaults.max) newVal = defaults.max;
          if (newVal < min) newVal = min;

          this.filter[key][1] = newVal;
        }
      } catch (err) {
        console.log(err);
        if (type === "min") this.filter[key][0] = defaults.min;
        else this.filter[key][1] = defaults.max;
      }
    },
    async getTrackedBosses() {
      try {
        const res = await axios.get(`${this.store.getters.apiUrl}/logs/bosses`);
        return res.data as TrackedBosses[];
      } catch (err) {
        console.error(err);
        return [];
      }
    },
    async reformatStoreBosses() {
      const argosRgx = /^(argos)?$/i;
      const stored = this.store.getters.supportedBosses;

      const reformatted = [];
      for (const [type, values] of Object.entries(stored)) {
        switch (type) {
          case "legionRaid":
            for (const raid of values as SupportedRaid[]) {
              if (raid.disabled) continue;
              for (const boss of raid.bosses) {
                reformatted.push({
                  name: this.$t(`monsters.${boss}`),
                  id: boss,
                  type: "lr",
                });
              }
            }
            break;
          case "abyssal":
            for (const raid of values as SupportedRaid[]) {
              for (const boss of raid.bosses) {
                reformatted.push({
                  name: this.$t(`monsters.${boss}`),
                  id: boss,
                  type: "ad",
                });
              }
            }
            break;
          case "guardians":
            for (const boss of values as number[]) {
              let name = this.$t(`monsters.${boss}`);
              console.log(name, boss);
              if (argosRgx.test(name)) {
                reformatted.push({
                  name: name,
                  id: boss,
                  type: "ar",
                });
              } else {
                reformatted.push({
                  name: name,
                  id: boss,
                  type: "gr",
                });
              }
            }
            break;
        }
      }
      return reformatted;
    },
    async getSupportedBosses(onlyTracked = "1") {
      const supported = [];
      if (onlyTracked === "0") return this.reformatStoreBosses();

      const argosRgx = /^(argos)?$/i;
      try {
        const tracked = await this.getTrackedBosses();
        for (const boss of tracked) {
          let name = this.$t(`monsters.${boss.id}`);
          switch (boss.type) {
            case ENTITY_TYPE.GUARDIAN:
              if (argosRgx.test(name)) {
                supported.push({
                  name: name,
                  id: boss.id,
                  type: "ar",
                });
              } else {
                supported.push({
                  name: name,
                  id: boss.id,
                  type: "gr",
                });
              }
              break;
            case ENTITY_TYPE.BOSS:
              if (this.isLegionRaidBoss(boss.id)) {
                supported.push({
                  name: this.$t(`monsters.${boss.id}`),
                  id: boss.id,
                  type: "lr",
                });
              } else if (this.isAbyssalDungeon(boss.id)) {
                supported.push({
                  name: this.$t(`monsters.${boss.id}`),
                  id: boss.id,
                  type: "ad",
                });
              }
              break;
          }
        }
        return supported;
      } catch (err) {
        console.log(err);
        return [];
      }
    },
    isLegionRaidBoss(id: number) {
      const legionRaids = this.store.getters.supportedBosses.legionRaid;
      return legionRaids.find((r: SupportedRaid) => r.bosses.includes(id));
    },
    isAbyssalDungeon(id: number) {
      const abyssals = this.store.getters.supportedBosses.abyssal;
      return abyssals.find((r: SupportedRaid) => r.bosses.includes(id));
    },
    async filterForLogs() {
      const filter = JSON.parse(JSON.stringify(this.filter));
      const last = JSON.stringify(this.lastFilter);

      // Order of keys is consistent
      if (last === JSON.stringify(filter)) return;
      else this.lastFilter = filter;

      try {
        const logs = await axios.post(
          `${this.store.getters.apiUrl}/logs/filter`,
          {
            ...filter,
          }
        );

        this.filtered = logs.data;
      } catch (err) {
        console.error(err);
        this.filtered = [];
      }
    },
  },
});
</script>

<style scoped>
@media only screen and (max-width: 600px) {
  .hide-on-sm {
    display: none;
  }
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
