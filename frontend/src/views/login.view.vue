<template>
  <login />
</template>

<script lang="ts">
import { defineComponent } from "vue";

// Components
import Login from "@/components/login.component.vue";

export default defineComponent({
  name: "LoginPage",

  components: {
    Login,
  },
});
</script>
