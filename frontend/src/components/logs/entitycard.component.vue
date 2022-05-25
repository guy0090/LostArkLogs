<template>
  <v-col :cols="$props.entities" class="pt-3 pb-0">
    <v-card
      min-width="100%"
      max-width="100%"
      class="mx-auto"
      rounded="sm"
      hover
      @click="clickTab('ent' + $props.entity?.id)"
    >
      <v-progress-linear
        :model-value="
          getPercentDamageDealt(
            $props.totalDamageDealt || 0,
            $props.entity?.damageDealt
          )
        "
        color="success"
        height="7"
      >
      </v-progress-linear>
      <v-card-content class="py-2">
        <v-row>
          <v-col cols="auto">
            <img
              width="52"
              height="52"
              :src="'/img/sprites/' + $props.entity?.class + '.png'"
            />
          </v-col>
          <v-col cols="auto" class="align-self-center ps-0">
            <v-badge
              v-if="$props.mvp"
              inline
              color="red-darken-3"
              rounded="sm"
              content="MVP"
              ><h3>
                {{ $t(`classes.${$props.entity?.class}`).toUpperCase() }}&nbsp;
              </h3></v-badge
            >
            <h3 v-else>
              {{ $t(`classes.${$props.entity?.class}`).toUpperCase() }}
            </h3>
          </v-col>
          <v-spacer></v-spacer>
          <v-col cols="auto" class="align-self-center me-2">
            <v-row>
              <h3>
                {{
                  new Intl.NumberFormat().format(getDamageDealtPerSecond())
                }}/s
              </h3>
            </v-row>
            <v-row class="mt-1">
              <h4>
                {{
                  new Intl.NumberFormat().format(
                    $props.entity?.damageDealt || 0
                  )
                }}
                ({{
                  getPercentDamageDealt(
                    $props.totalDamageDealt || 0,
                    $props.entity?.damageDealt
                  )
                }}%)
              </h4>
            </v-row>
          </v-col>
        </v-row>
      </v-card-content>
    </v-card>
  </v-col>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { useStore } from "vuex";

export default defineComponent({
  name: "EntityCard",

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

    getDamageDealtPerSecond() {
      return this.entity?.damageDealt / (this.duration || 0);
    },
    clickTab(target: string) {
      const tab: any = document.querySelector(`#${target}`);
      tab.click();
    },
  },
});
</script>

<style scoped>
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
