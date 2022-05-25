<template>
  <v-card>
    <v-tabs fixed-tabs v-model="tab" background-color="success">
      <v-tab
        v-for="entity in $props.session?.entities"
        :key="'ent' + entity.id"
        :value="'ent' + entity.id"
        :id="'ent' + entity.id"
      >
        <span v-if="isMVP(entity)"
          ><v-badge inline rounded="sm" color="red-darken-3" content="MVP"
            >{{ $t(`classes.${entity.class}`) }}&nbsp;</v-badge
          ></span
        >
        <span v-else>{{ $t(`classes.${entity.class}`) }}</span>
      </v-tab>
    </v-tabs>

    <v-card-content>
      <v-window v-model="tab">
        <v-window-item
          v-for="entity in $props.session?.entities"
          :key="'ent' + entity.id"
          :value="'ent' + entity.id"
        >
          <v-row>
            <v-col
              ><Summary
                :session="$props.session"
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
import { SessionEntity } from "@/interfaces/session.interface";
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
    isMVP(entity: SessionEntity) {
      return (
        entity.damageDealt === this.session?.damageStatistics?.topDamageDealt
      );
    },
  },
});
</script>
