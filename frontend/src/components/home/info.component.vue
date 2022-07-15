<template>
  <v-row justify="center">
    <v-card rounded="sm">
      <v-progress-linear model-value="100" height="7" color="indigo">
      </v-progress-linear>
      <v-card-content class="mx-3 mb-2">
        <v-row>
          <h2>{{ user.username }}#{{ user.discriminator }}</h2>
        </v-row>
        <v-row class="mt-1">
          <span style="color: grey">ID: {{ user.id }}</span>
        </v-row>
        <v-row class="mt-3">
          <span style="color: grey"
            ><span style="color: white !important">Registered:</span>
            {{
              new Intl.DateTimeFormat("en-US", {
                dateStyle: "full",
                timeStyle: "short",
              }).format(new Date(user.registered))
            }}</span
          >
        </v-row>
        <v-row class="mt-3">
          <span style="font-size: 11pt" v-if="uploadToken">
            <span style="color: white !important">API Key: </span>
            <span style="color: grey" v-if="!revealToken">
              {{
                Array.from(uploadToken)
                  .map((c) => "*")
                  .join("")
              }}
            </span>
            <span v-else>{{ uploadToken }} </span>
            <v-btn
              v-on:click="revealToken = !revealToken"
              size="small"
              color="indigo"
              style="margin-left: 5px"
              ><span v-if="!revealToken">Reveal</span
              ><span v-else>Hide</span></v-btn
            >
          </span>
        </v-row>
      </v-card-content>
    </v-card>
  </v-row>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { mapGetters } from "vuex";

export default defineComponent({
  name: "InfoPanel",

  data() {
    return {
      revealToken: false,
    };
  },

  computed: {
    ...mapGetters(["user", "uploadToken"]),
  },
});
</script>
