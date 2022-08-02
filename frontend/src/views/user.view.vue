<template>
  <User />
</template>

<script lang="ts">
import { defineComponent } from "vue";

// Components
import User from "@/components/user.component.vue";

export default defineComponent({
  name: "UserView",

  components: {
    User,
  },
});
</script>
