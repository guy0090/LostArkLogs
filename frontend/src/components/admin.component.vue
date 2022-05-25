<template>
  <v-container>
    <v-row class="text-center">
      <v-col class="mb-4">
        <h1 id="logging-in" class="display-2 font-weight-bold mb-3">
          Authorized route: {{ $route.fullPath }} | {{ $route.name }}
        </h1>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { useCookies } from "vue3-cookies";
import { useStore } from "vuex";

export default defineComponent({
  name: "AdminPage",
  setup() {
    const store = useStore();
    const { cookies } = useCookies();

    return {
      store,
      cookies,
    };
  },
});
</script>
