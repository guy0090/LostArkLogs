<template>
  <v-container fluid>
    <v-row justify="center">
      <v-col cols="auto">
        <v-list
          nav
          :selected="[statTab]"
          density="compact"
          bg-color="transparent"
          v-on:click:select="setStatTab($event.path[0])"
          active-color="blue"
          style="width: 160px !important"
        >
          <v-list-subheader> Encounter Stats </v-list-subheader>
          <v-list-item
            v-on:click="$router.push({ name: 'statsSummary' })"
            value="summary"
          >
            <v-list-item-avatar
              ><v-icon icon="mdi-format-list-bulleted"
            /></v-list-item-avatar>
            <v-list-item-title>Summary</v-list-item-title>
          </v-list-item>
          <v-list-item
            v-on:click="$router.push({ name: 'statsClasses' })"
            value="classes"
          >
            <v-list-item-avatar
              ><v-icon icon="mdi-gamepad"
            /></v-list-item-avatar>
            <v-list-item-title>Classes</v-list-item-title>
          </v-list-item>
          <v-list-item
            v-on:click="$router.push({ name: 'statsEncounters' })"
            value="encounters"
          >
            <v-list-item-avatar
              ><v-icon icon="mdi-space-invaders"
            /></v-list-item-avatar>
            <v-list-item-title>Encounters</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-col>
      <v-col cols="8">
        <router-view />
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";

export default defineComponent({
  name: "StatsBase",

  mounted() {
    this.setStatTab(this.$route.meta.tab as string);
  },

  setup() {
    const showPlayerGraph = ref(false);
    const statTab = ref("summary");

    return {
      showPlayerGraph,
      statTab,
    };
  },

  methods: {
    setStatTab(tab: string) {
      this.statTab = tab;
    },
  },
});
</script>
