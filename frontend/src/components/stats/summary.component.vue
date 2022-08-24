<template>
  <v-row>
    <v-col>
      <h2>
        <v-icon color="red" icon="mdi-chart-timeline-variant" /> Stats
        <span style="font-size: 11pt; color: #999">
          All data is refreshed depending on access frequency
        </span>
      </h2>
    </v-col>
  </v-row>
  <v-row>
    <v-col>
      <UploadStats />
    </v-col>
  </v-row>
  <v-row>
    <v-col>
      <v-card rounded="sm">
        <v-progress-linear model-value="100" height="7" color="indigo">
        </v-progress-linear>
        <v-card-content class="py-3 ps-4">
          <h3>
            <v-icon color="red" icon="mdi-chevron-triple-up"></v-icon>
            &nbsp;Top DPS
            <span style="font-size: 11pt; color: #999">
              &nbsp;Top 10 DPS from the last 24 hours
            </span>
          </h3>
        </v-card-content>
      </v-card>
    </v-col>
  </v-row>
</template>

<script lang="ts">
import { defineComponent } from "vue";

import UploadStats from "./components/uploads.component.vue";

export default defineComponent({
  name: "StatsSummary",

  components: {
    UploadStats,
  },
});
</script>
