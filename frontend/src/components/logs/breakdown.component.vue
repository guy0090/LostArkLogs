<template>
  <v-card>
    <v-tabs fixed-tabs v-model="tab" background-color="success">
      <v-tab
        v-for="entity in getPlayerEntities()"
        :key="'ent' + entity.id"
        :value="'ent' + entity.id"
        :id="'ent' + entity.id"
      >
        <span v-if="isMVP(entity)"
          ><v-badge inline rounded="sm" color="red-darken-3" content="MVP"
            >{{ $t(`classes.${entity.classId}`) }}&nbsp;</v-badge
          ></span
        >
        <span v-else>{{ $t(`classes.${entity.classId}`) }}</span>
      </v-tab>
    </v-tabs>

    <v-card-content>
      <v-window v-model="tab">
        <v-window-item
          v-for="entity in getPlayerEntities()"
          :key="'ent' + entity.id"
          :value="'ent' + entity.id"
        >
          <v-row>
            <v-col
              ><Summary
                :session="session"
                :entity="JSON.parse(JSON.stringify(entity))"
              ></Summary
            ></v-col>
          </v-row>
        </v-window-item>
      </v-window>
    </v-card-content>
  </v-card>
</template>

<script lang="ts">
import { Entity } from "@/interfaces/session.interface";
import { defineComponent } from "vue";

import Summary from "@/components/logs/breakdown/summary.component.vue";

export default defineComponent({
  name: "EntitiesBreakdown",

  components: {
    Summary,
  },

  data: function () {
    return {
      tab: null,
    };
  },

  props: {
    session: Object,
  },

  methods: {
    isMVP(entity: Entity) {
      return (
        entity.stats.damageDealt ===
        this.session?.damageStatistics?.topDamageDealt
      );
    },
    getPlayerEntities() {
      let clone = [...this.session?.entities] as Entity[];
      return clone
        .sort((a, b) => b.stats.damageDealt - a.stats.damageDealt)
        .filter((e) => e.type === 3);
    },
  },
});
</script>
