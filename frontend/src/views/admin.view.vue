<template>
  <admin />
</template>

<script lang="ts">
import { defineComponent } from "vue";

// Components
import Admin from "@/components/admin.component.vue";

export default defineComponent({
  name: "AdminView",

  components: {
    Admin,
  },
});
</script>
