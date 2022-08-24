<template>
  <v-expansion-panels>
    <v-expansion-panel rounded="sm">
      <v-progress-linear model-value="100" height="7" color="indigo">
      </v-progress-linear>
      <v-expansion-panel-title class="py-3 ps-4">
        <h3>
          <v-icon color="red" icon="mdi-cloud-upload"></v-icon>
          &nbsp;Uploads
          <span style="font-size: 11pt; color: #999">
            Tracking {{ totalLogs }} uploads
          </span>
        </h3>
      </v-expansion-panel-title>
      <v-expansion-panel-text>
        <v-row justify="space-around" class="pt-2">
          <v-col cols="4" class="pb-0">
            <LogStatsGraph :type="'vis'" :gData="visData" />
          </v-col>
          <v-col cols="4" class="pb-0">
            <LogStatsGraph :type="'region'" :gData="regionData" />
          </v-col>
        </v-row>
      </v-expansion-panel-text>
    </v-expansion-panel>
  </v-expansion-panels>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import { mapActions } from "vuex";

import LogStatsGraph from "../graphs/logstats.component.vue";

export default defineComponent({
  name: "UploadStats",

  components: {
    LogStatsGraph,
  },

  setup() {
    const regionData = ref({});
    const visData = ref({});
    const totalLogs = ref(0);

    return {
      regionData,
      visData,
      totalLogs,
    };
  },

  mounted() {
    this.fetchLogCounts().then((stats) => {
      if (stats) {
        const { regions, visibility } = stats;
        this.regionData = regions;
        this.visData = visibility;

        this.totalLogs = visibility.reduce((acc: any, curr: any) => {
          return acc + curr.count;
        }, 0);
      }
    });
  },

  methods: {
    ...mapActions(["fetchLogCounts"]),
  },
});
</script>
