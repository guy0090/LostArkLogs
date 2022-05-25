<template>
  <home />
</template>

<script lang="ts">
import { defineComponent } from "vue";

// Components
import Home from "@/components/home.component.vue";

export default defineComponent({
  name: "HomeView",

  components: {
    Home,
  },
});
</script>
