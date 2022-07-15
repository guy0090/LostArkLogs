<template>
  <v-card color="rgb(56,56,56)">
    <v-card-content>
      <v-row>
        <v-col cols="auto">
          <v-avatar><v-img :src="avatar"></v-img></v-avatar>
        </v-col>
        <v-col cols="auto" class="align-self-center">
          <v-row>
            <h4>
              {{ unverifiedUser?.username }}#{{ unverifiedUser?.discriminator }}
            </h4>
          </v-row>
          <v-row class="mt-2">
            <small class="text-grey-lighten-2">
              ID: {{ unverifiedUser?.id }}
            </small>
          </v-row>
          <v-row class="mt-2">
            <small class="text-grey-lighten-2"
              >Registered: {{ getTimeRegistered() }}</small
            >
          </v-row>
        </v-col>
        <v-col></v-col>
        <v-col cols="auto" class="align-self-center">
          <v-btn
            prepend-icon="mdi-check"
            color="green-darken-3"
            v-on:click="verifyUser"
            v-if="!unverifiedUser?.banned"
          >
            Verify
          </v-btn>
          <v-btn prepend-icon="mdi-gavel" v-else class="bg-red-darken-3">
            Banned
          </v-btn>
        </v-col>
      </v-row>
    </v-card-content>
  </v-card>
</template>

<script lang="ts">
import { defineComponent, PropType, ref } from "vue";
import { mapActions, mapMutations } from "vuex";
import { UnverifiedUser } from "@/interfaces/user.interface";

export default defineComponent({
  name: "UnverifiedUserCard",

  setup() {
    const avatar = ref("");

    return {
      avatar,
    };
  },

  mounted() {
    this.parseDiscordAvatarHash(this.unverifiedUser)
      .then((ava) => {
        this.avatar = ava;
      })
      .catch((err) => {
        this.error(err);
      });
  },

  props: {
    unverifiedUser: Object as PropType<UnverifiedUser>,
  },

  methods: {
    ...mapActions(["error", "info", "parseDiscordAvatarHash", "request"]),
    ...mapMutations(["removeUnverifiedUser"]),
    getTimeRegistered() {
      const time = this.unverifiedUser?.registered as string;
      return new Date(time).toLocaleString();
    },
    async verifyUser() {
      try {
        await this.request({
          endpoint: "admin/users/verify",
          body: { userId: this.unverifiedUser?.id },
        });
        this.removeUnverifiedUser(this.unverifiedUser);
        return true;
      } catch (err) {
        this.error(err);
        return false;
      }
    },
  },
});
</script>
