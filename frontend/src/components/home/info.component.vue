<template>
  <v-col align="center">
    <v-card min-width="410px" align="start" width="410">
      <template v-slot:title>
        User Info &nbsp;
        <v-spacer></v-spacer>
        <div v-if="!store.getters.uploadToken"></div>
      </template>
      <template v-slot:text>
        <p>
          <span style="color: white !important">User:</span>
          {{ store.getters.user.username }}#{{
            store.getters.user.discriminator
          }}
        </p>
        <p>
          <span style="color: white !important">ID:</span>
          {{ store.getters.user.id }}
        </p>
        <p>
          <span style="color: white !important">Registered:</span>
          {{
            new Intl.DateTimeFormat("en-US", {
              dateStyle: "full",
              timeStyle: "short",
            }).format(new Date(store.getters.user.registered))
          }}
        </p>
        <p v-if="store.getters.uploadToken">
          <span style="color: white !important">API Key: </span>
          <span v-if="!revealToken">
            {{
              Array.from(store.getters.uploadToken)
                .map((c) => "*")
                .join("")
            }}
          </span>
          <span v-else>{{ store.getters.uploadToken }} </span>
          <v-btn
            v-on:click="revealToken = !revealToken"
            size="small"
            color="indigo"
            style="margin-left: 5px"
            ><span v-if="!revealToken">Reveal</span
            ><span v-else>Hide</span></v-btn
          >
        </p>
      </template>
    </v-card>
  </v-col>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { useStore } from "vuex";

export default defineComponent({
  name: "InfoPanel",

  setup() {
    const store = useStore();
    return { store };
  },

  data() {
    return {
      revealToken: false,
    };
  },
});
</script>
