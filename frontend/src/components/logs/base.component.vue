<template>
  <v-container v-if="!pageLoading" fluid>
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
                      gear score and more
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
                        } ${
                          filter.classes.includes(c.id)
                            ? 'bg-indigo-darken-3'
                            : ''
                        }`"
                        label
                        :id="c.id"
                        :ripple="false"
                        style="user-select: none"
                        v-on:click="toggleClassFilter(c.id)"
                      >
                        <v-avatar
                          class="me-1"
                          :image="`/img/sprites/${c.id}.webp`"
                          style="user-select: none"
                          rounded="0"
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
                      <v-icon icon="mdi-space-invaders"></v-icon
                      >&nbsp;Encounters
                      <v-btn
                        flat
                        class="ms-1"
                        color="indigo"
                        size="small"
                        variant="contained"
                        v-on:click="
                          filter.bosses = supported.reduce(
                            (c, b) => [...c, ...b.bosses],
                            []
                          )
                        "
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
                      v-for="(zone, i) in supported"
                      :key="i"
                    >
                      <v-chip
                        :class="`ma-2 ps-1  ${
                          zone.bosses.some((id) => filter.bosses.includes(id))
                            ? `bg-indigo-darken-3`
                            : ''
                        }`"
                        label
                        :id="zone.id"
                        :ripple="false"
                        style="user-select: none"
                        v-on:click="toggleBossFilter(zone.bosses)"
                      >
                        <v-avatar
                          class="me-1"
                          :image="`/img/zones/${zone.zoneType}.webp`"
                          style="user-select: none"
                          rounded="0"
                        ></v-avatar>
                        <span style="user-select: none">{{
                          $t(`zones.${zone.id}`)
                        }}</span>
                      </v-chip>
                    </v-col>
                  </v-row>
                </v-col>
              </v-row>
              <v-divider class="my-2"></v-divider>
              <v-row justify="space-around">
                <v-col cols="12" md="3" lg="3" xl="3">
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
                        :hide-details="true"
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
                        :hide-details="true"
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
                <v-col cols="12" md="3" lg="3" xl="3">
                  <v-row class="my-1">
                    <h3>
                      <v-icon icon="mdi-sword"></v-icon>&nbsp;Min. Party DPS
                    </h3>
                  </v-row>
                  <v-row class="pt-2">
                    <v-col cols="12" class="px-0 pb-0">
                      <v-text-field
                        variant="outlined"
                        density="comfortable"
                        label="Minimum DPS"
                        class="pe-2"
                        :hide-details="true"
                        :model-value="filter.partyDps"
                        v-on:update:model-value="(v) => updateDpsFilter(v)"
                      ></v-text-field>
                    </v-col>
                  </v-row>
                </v-col>
                <v-col cols="12" md="3" lg="3" xl="3">
                  <v-row class="my-1">
                    <h3><v-icon icon="mdi-account"></v-icon>&nbsp;User</h3>
                    <v-btn
                      v-if="user && uploadToken"
                      class="ps-1 pe-1 mx-2"
                      density="comfortable"
                      color="success"
                      v-on:click="creator = user.id"
                      >Me</v-btn
                    >
                  </v-row>
                  <v-row class="pt-2">
                    <v-col cols="12" class="ps-0 pe-1 pb-0">
                      <v-text-field
                        v-model="creator"
                        label="User ID"
                        variant="outlined"
                        density="comfortable"
                        :hide-details="false"
                        :clearable="true"
                        v-on:click:clear="resetCreator"
                        :rules="[
                          (v) =>
                            v.length === 0 ||
                            v.length === 24 ||
                            'ID must be 24 characters long',
                        ]"
                        counter
                        maxlength="24"
                      ></v-text-field>
                    </v-col>
                  </v-row>
                </v-col>
              </v-row>
              <v-row justify="space-around" class="mt-0">
                <v-col cols="12" md="5">
                  <v-row class="my-1">
                    <h3>
                      <v-icon icon="mdi-calendar"></v-icon>&nbsp;Time Range
                    </h3>
                  </v-row>
                  <v-row class="pt-2">
                    <v-col
                      cols="12"
                      md="12"
                      lg="auto"
                      :class="`${
                        $vuetify.display.lg || $vuetify.display.xl
                          ? 'ps-0 pe-1'
                          : 'px-0'
                      } pb-0`"
                    >
                      <v-text-field
                        v-model="filter.range[0]"
                        label="Start"
                        variant="outlined"
                        density="comfortable"
                        :hide-details="true"
                        type="datetime-local"
                      ></v-text-field>
                    </v-col>
                    <v-col
                      cols="12"
                      md="12"
                      lg="auto"
                      :class="`${
                        $vuetify.display.lg || $vuetify.display.xl
                          ? 'ps-1 pe-0'
                          : 'px-0'
                      } pb-0`"
                    >
                      <v-text-field
                        v-model="filter.range[1]"
                        label="End"
                        variant="outlined"
                        density="comfortable"
                        :hide-details="true"
                        type="datetime-local"
                      ></v-text-field>
                    </v-col>
                  </v-row>
                </v-col>
                <v-col cols="12" md="5">
                  <v-row class="my-1">
                    <h3><v-icon icon="mdi-sort"></v-icon>&nbsp;Sorting</h3>
                  </v-row>
                  <v-row class="pt-2">
                    <v-col cols="6" class="ps-0 pe-1 pb-0">
                      <v-select
                        v-model="sortBy"
                        :items="['DPS', 'Upload Date']"
                        label="Sort By"
                        variant="outlined"
                        density="comfortable"
                        v-on:update:model-value="updateSortBy"
                      ></v-select>
                    </v-col>
                    <v-col cols="6" class="ps-1 pe-0 pb-0">
                      <v-select
                        v-model="sortOrder"
                        :items="['Descending', 'Ascending']"
                        label="Order"
                        variant="outlined"
                        density="comfortable"
                        v-on:update:model-value="updateSortOrder"
                      ></v-select>
                    </v-col>
                  </v-row>
                </v-col>
              </v-row>
              <v-row
                :justify="$vuetify.display.xs ? 'center' : 'end'"
                class="mt-4"
              >
                <v-col cols="auto" class="px-1">
                  <v-btn
                    color="red-darken-3"
                    v-on:click="resetFilter"
                    prepend-icon="mdi-refresh"
                  >
                    <span>Reset</span>
                  </v-btn>
                </v-col>
                <v-col hidden cols="auto" class="px-1">
                  <v-btn
                    color="blue-darken-3"
                    v-on:click="saveFilter"
                    prepend-icon="mdi-floppy"
                  >
                    <span>Save Filter</span>
                  </v-btn>
                </v-col>
                <v-col cols="auto" class="ps-1">
                  <v-btn
                    color="green-darken-3"
                    @click="filterForLogs"
                    :loading="loading"
                    :disabled="loading || !isValidCreator()"
                    :prepend-icon="!loading ? 'mdi-magnify' : ''"
                  >
                    <span v-if="!loading">Search</span>
                    <v-progress-circular
                      v-else
                      indeterminate
                      color="white"
                      :size="25"
                    ></v-progress-circular>
                  </v-btn>
                </v-col>
              </v-row>
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>
        <v-row class="mt-3" v-if="filtered.length === 0" justify="center">
          <v-col cols="auto">
            <v-row>
              <img src="/img/sprites/e404.webp" />
            </v-row>
            <v-row justify="center" class="mt-1">
              <strong>NO RESULTS</strong>
            </v-row>
          </v-col>
        </v-row>
        <v-row class="mt-2" v-if="pages > 1" justify="center">
          <v-col cols="auto">
            <v-pagination
              v-model="page"
              :length="Math.ceil(resultsFound / pageSize)"
              :total-visible="5"
            ></v-pagination>
          </v-col>
        </v-row>
        <v-row class="mt-3 mx-0 px-0" v-if="filtered.length > 0">
          <EncounterCard
            class="mb-2"
            v-for="(session, index) in getPagedResults(page)"
            :key="index"
            :session="session"
          ></EncounterCard>
        </v-row>
        <v-row class="mt-2" v-if="pages > 1" justify="center">
          <v-col cols="auto">
            <v-pagination
              v-model="page"
              :length="Math.ceil(resultsFound / pageSize)"
              :total-visible="5"
            ></v-pagination>
          </v-col>
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
import {
  Session,
  SupportedBosses,
  UniqueBosses,
  Zone,
  ZoneType,
} from "@/interfaces/session.interface";
import { LogFilter } from "@/interfaces/util.interface";
import { defineComponent, reactive, ref } from "vue";
import { mapActions, mapGetters, mapMutations } from "vuex";
import axios from "axios";
import EncounterCard from "@/components/home/encounter.component.vue";

export default defineComponent({
  name: "BaseLogsPage",

  components: {
    EncounterCard,
  },

  data() {
    return {
      loading: false,
    };
  },

  setup() {
    const open = ref([] as string[]);
    const supported = ref([] as SupportedBosses[]);
    const filter = reactive({
      classes: [] as number[],
      bosses: [] as number[],
      gearLevel: [302, 1625],
      // range: [+new Date() - ms("23h"), +new Date()],
      range: ["", ""],
      level: [0, 60],
      partyDps: 1,
      server: "any",
      region: "any",
      sort: ["dps", -1],
    } as LogFilter);
    const page = ref();
    const pages = ref(0);
    const resultsFound = ref(0);
    const lastFilter = ref({} as LogFilter);
    const savedFilters = ref([]);
    const onlyTracked = localStorage.getItem("onlyTracked") || "1";
    const filtered = ref([] as Session[]);
    const creator = ref();
    const sortBy = ref("DPS");
    const sortOrder = ref("Descending");

    return {
      open,
      supported,
      filter,
      page,
      pages,
      resultsFound,
      lastFilter,
      savedFilters,
      onlyTracked,
      filtered,
      creator,
      sortBy,
      sortOrder,
    };
  },

  mounted() {
    this.setPageLoading(true);

    const lastFilter = localStorage.getItem("lastFilter");
    if (lastFilter) this.loadFilter(JSON.parse(lastFilter));

    this.getSupportedBosses().then((s) => {
      this.setPageLoading(false);
      this.supported = s;

      this.open = ["filters"];
    });
  },

  methods: {
    ...mapActions(["error", "info", "getTrackedZones", "filterLogs"]),
    ...mapMutations(["setPageLoading"]),
    loadFilters() {
      const filters = localStorage.getItem("filters");
      if (!filters) return [];
      return JSON.parse(filters);
    },
    loadFilter(filter: LogFilter) {
      try {
        this.filter.bosses = filter.bosses || [];
        this.filter.classes = filter.classes || [];
        this.filter.gearLevel = filter.gearLevel || [302, 1625];
        this.filter.range = filter.range || ["", ""];
        this.filter.level = filter.level || [0, 60];
        this.filter.partyDps = filter.partyDps || 1;
        this.filter.server = filter.server || "any";
        this.filter.region = filter.region || "any";
        if (filter.creator) {
          this.filter.creator = filter.creator;
          this.creator = filter.creator;
        }

        if (this.filter.sort) {
          this.filter.sort = filter.sort;
          this.sortBy = filter.sort[0] === "dps" ? "DPS" : "Upload Date";
          this.sortOrder = filter.sort[1] === 1 ? "Ascending" : "Descending";
        } else {
          this.filter.sort = ["dps", -1];
          this.sortBy = "DPS";
          this.sortOrder = "Descending";
        }
      } catch (err) {
        this.error(`Failed to read saved filter - resetting: ${err}`);
        localStorage.removeItem("lastFilter");
      }
    },
    saveFilter() {
      const newFilter = JSON.parse(JSON.stringify(this.filter));
      return newFilter;
    },
    resetFilter() {
      this.filter.bosses = [];
      this.filter.classes = [];
      this.filter.gearLevel = [302, 1625];
      // this.filter.range = [+new Date() - ms("1d"), +new Date()];
      this.filter.range = ["", ""];
      this.filter.level = [0, 60];
      this.filter.partyDps = 1;
      this.filter.region = "any";
      this.filter.server = "any";
      this.filter.sort = ["dps", -1];
      if (this.filter.creator) {
        delete this.filter.creator;
      }

      this.creator = "";
      this.sortBy = "DPS";
      this.sortOrder = "Descending";

      this.page = undefined;
      this.pages = 0;
      this.resultsFound = 0;
      this.filtered = [];
      this.lastFilter = {} as LogFilter;

      localStorage.removeItem("lastFilter");
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
    toggleBossFilter(id: number | number[]) {
      if (typeof id === "number") {
        if (this.filter.bosses.includes(id))
          this.filter.bosses.splice(this.filter.bosses.indexOf(id), 1);
        else this.filter.bosses.push(id);
      } else {
        if (this.filter.bosses.some((b) => id.includes(b))) {
          this.filter.bosses = this.filter.bosses.filter(
            (b) => !id.includes(b)
          );
        } else {
          this.filter.bosses = this.filter.bosses.concat(id);
        }
      }
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
          // if (newVal < min) newVal = min;

          this.filter[key][1] = newVal;
        }
      } catch (err) {
        this.error(err);

        if (type === "min") this.filter[key][0] = defaults.min;
        else this.filter[key][1] = defaults.max;
      }
    },
    updateDpsFilter(value: string) {
      try {
        let newVal = parseFloat(value);
        if (isNaN(newVal) || newVal < 0) newVal = 0;
        this.filter.partyDps = newVal;
      } catch (err) {
        this.error(err);
        this.filter.partyDps = 1;
      }
    },
    updateSortBy(v: string) {
      if (v === "DPS") this.filter.sort[0] = "dps";
      else this.filter.sort[0] = "createdAt";
    },
    updateSortOrder(v: string) {
      if (v === "Ascending") this.filter.sort[1] = 1;
      else this.filter.sort[1] = -1;
    },
    async getSupportedBosses(): Promise<SupportedBosses[]> {
      try {
        const trackedZones: Zone[] = await this.getTrackedZones();
        const supported = [];

        for (const zone of trackedZones) {
          const name = this.$t(`zones.${zone.id}`);
          supported.push({
            name: name,
            id: zone.id,
            zoneType: zone.type,
            bosses: zone.bosses,
          });
        }

        return supported;
      } catch (err) {
        this.error(err);
        return [];
      }
    },
    async filterForLogs() {
      const filter = JSON.parse(JSON.stringify(this.filter)) as LogFilter;
      const last = JSON.stringify(this.lastFilter);

      if (filter.range.length === 2) {
        const [begin, end] = filter.range as [number, number];
        if (!begin || !end) {
          filter.range = [];
        } else {
          filter.range[0] = +new Date(begin);
          filter.range[1] = +new Date(end);
        }
      } else {
        filter.range = [];
      }

      const creatorId = this.creator;
      if (creatorId && creatorId.length > 0) filter.creator = creatorId;
      if (filter.key) delete filter.key;

      // Order of keys is consistent
      if (last === JSON.stringify(filter)) {
        this.loading = false;
        return;
      } else {
        this.filtered = [];
        this.lastFilter = filter;
        localStorage.setItem("lastFilter", JSON.stringify(filter));
        this.loading = true;
      }

      // Add user upload key if it exists
      // Doing this after same filter check to ensure key isn't persisted in storage
      if (this.uploadToken && this.user && filter.creator === this.user.id) {
        delete filter.creator;
        filter.key = this.uploadToken;
      }

      try {
        // TODO: Testing via socket
        // const data = await this.filterLogs(filter);

        const { data } = await axios({
          method: "POST",
          url: `${this.apiUrl}/logs/filter`,
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
          data: { ...filter },
        });

        const { found, logs } = data;
        this.resultsFound = found;
        this.pages = Math.ceil(found / this.pageSize);

        this.filtered = logs;
        // this.filtered = this.sortResults(logs);
        this.loading = false;
      } catch (err) {
        this.filtered = [];
        this.resultsFound = 0;
        this.pages = 0;
        this.loading = false;
      }
    },
    getPagedResults(page: number | undefined) {
      if (!page || page < 0) page = 1;

      const results = this.filtered.slice(
        (page - 1) * this.pageSize,
        page * this.pageSize
      );
      return results;
    },
    sortResults(
      data: Session[],
      by?: "dps" | "createdAt" | undefined,
      order?: -1 | 1 | undefined
    ) {
      const copy = JSON.parse(JSON.stringify(data)) as Session[];
      if (!by) by = this.filter.sort[0];
      if (!order) order = this.filter.sort[1];

      if (by === "dps") {
        copy.sort((a, b) => {
          if (order === -1) {
            return b.damageStatistics.dps - a.damageStatistics.dps;
          } else {
            return a.damageStatistics.dps - b.damageStatistics.dps;
          }
        });
      } else {
        copy.sort((a, b) => {
          if (order === -1) {
            return b.createdAt - a.createdAt;
          } else {
            return a.createdAt - b.createdAt;
          }
        });
      }
      return copy;
    },
    resetCreator() {
      if (this.filter.creator) delete this.filter.creator;
    },
    isValidCreator() {
      if (
        !this.creator ||
        this.creator.length === 0 ||
        this.creator.length === 24
      )
        return true;
      else return false;
    },
  },
  computed: {
    ...mapGetters([
      "pageLoading",
      "classes",
      "apiUrl",
      "user",
      "uploadToken",
      "pageSize",
      "zones",
    ]),
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
