<template>
  <v-card min-width="100%" max-width="100%" class="mx-auto" rounded="sm">
    <v-progress-linear model-value="100" height="7" color="indigo">
    </v-progress-linear>
    <v-card-content>
      <v-row>
        <v-col cols="auto">
          <v-avatar color="indigo" icon="mdi-post" />
        </v-col>
        <v-col class="align-self-center">
          <v-row>
            <h2>{{ details?.name }}</h2>
          </v-row>
          <v-row class="pt-1"
            >Logged
            {{
              details?.date.toLocaleString() || new Date().toLocaleString()
            }}</v-row
          >
        </v-col>
      </v-row>
    </v-card-content>
  </v-card>
</template>

<script lang="ts">
import { RawSessionDetails } from "@/interfaces/session.interface";
import { defineComponent, PropType } from "vue";

export default defineComponent({
  name: "RawLogDetails",

  props: {
    details: Object as PropType<RawSessionDetails>,
  },
});
</script>
