<template>
  <Logs />
</template>

<script lang="ts">
import { defineComponent } from "vue";

// Components
import Logs from "@/components/logs.component.vue";

export default defineComponent({
  name: "LogsView",

  components: {
    Logs,
  },
});
</script>
