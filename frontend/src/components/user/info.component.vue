<template>
  <v-row justify="center">
    <v-card rounded="sm" width="600px">
      <v-progress-linear model-value="100" height="7" color="indigo">
      </v-progress-linear>
      <v-card-content class="mx-3 mb-1 mt-1">
        <v-row>
          <v-col cols="auto" align-self="center" class="ps-1">
            <v-avatar :image="avatar"></v-avatar>
          </v-col>
          <v-col cols="auto" align-self="center">
            <v-row>
              <h2>{{ profileOf?.username }}#{{ profileOf?.discriminator }}</h2>
            </v-row>
            <v-row class="mt-1">
              <span style="color: grey">{{ profileOf?.id }} </span>
            </v-row>
          </v-col>
          <v-spacer v-if="!$route.params.id" />
          <v-col v-if="!$route.params.id" cols="auto" align-self="center">
            <v-btn
              color="indigo"
              :append-icon="!copied ? 'mdi-content-copy' : 'mdi-check'"
              @click="copyToClipboard"
            >
              {{ !copied ? "Copy API Key" : "Copied" }}</v-btn
            >
          </v-col>
        </v-row>
      </v-card-content>
    </v-card>
  </v-row>
</template>

<script lang="ts">
import { User } from "@/interfaces/user.interface";
import { defineComponent, PropType } from "vue";
import { mapActions, mapGetters } from "vuex";

export default defineComponent({
  name: "InfoPanel",

  props: {
    profileOf: Object as PropType<User>,
  },

  data() {
    return {
      copied: false,
      avatar: "",
      revealToken: false,
    };
  },

  async mounted() {
    this.avatar = await this.parseDiscordAvatarHash(this.profileOf);
  },

  methods: {
    ...mapActions(["parseDiscordAvatarHash", "getUser"]),
    copyToClipboard() {
      if (this.copied) return;
      setTimeout(() => {
        this.copied = false;
      }, 2000);

      navigator.clipboard.writeText(this.uploadToken);
      this.copied = true;
    },
  },

  computed: {
    ...mapGetters(["user", "uploadToken"]),
  },
});
</script>
