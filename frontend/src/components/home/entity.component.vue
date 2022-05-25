<template>
  <v-col cols="auto" class="mb-1">
    <v-card :class="`c-${$props.entity?.class}`">
      <v-row dense>
        <v-col cols="auto" class="ms-1 me-0">
          <v-avatar size="26">
            <img
              width="28"
              height="28"
              :src="'/img/sprites/' + $props.entity?.class + '.png'"
            />
          </v-avatar>
        </v-col>
        <v-col cols="auto" class="align-self-center">
          <span class="me-2">{{ $t(`classes.${$props.entity?.class}`) }} </span>
        </v-col>
      </v-row>
    </v-card>
  </v-col>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "EntityCard",

  props: {
    entity: Object,
  },
});
</script>

<style scoped>
.c-102 {
  background-color: #ee2e48b7;
}
.c-103 {
  background-color: #7b9aa2;
}
.c-104 {
  background-color: #e1907e;
}
.c-105 {
  background-color: #ff9900;
}
.c-202 {
  background-color: #b38915;
}
.c-203 {
  background-color: #22aa99;
}
.c-204 {
  background-color: #674598;
}
.c-205 {
  background-color: #66aa00;
}
.c-302 {
  background-color: #aa5611;
}
.c-303 {
  background-color: #990099;
}
.c-304 {
  background-color: #316395;
}
.c-305 {
  background-color: #1f21c5d3;
}
.c-312 {
  background-color: #994499;
}
.c-402 {
  background-color: #a91a16;
}
.c-403 {
  background-color: #0099c6;
}
.c-404 {
  background-color: #109618;
}
.c-502 {
  background-color: #dd4477;
}
.c-503 {
  background-color: #4442a8;
}
.c-504 {
  background-color: #33670b;
}
.c-505 {
  background-color: #3b4292;
}
.c-512 {
  background-color: #6bcec2;
}
</style>
