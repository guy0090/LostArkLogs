<template>
  <v-card color="rgb(56,56,56)">
    <v-card-content>
      <v-row>
        <v-col cols="auto">
          <v-avatar><v-img :src="avatar"></v-img></v-avatar>
        </v-col>
        <v-col cols="auto" class="align-self-center">
          <v-row>
            <h4>{{ bannedUser?.username }}#{{ bannedUser?.discriminator }}</h4>
          </v-row>
          <v-row class="mt-2">
            <small class="text-grey-lighten-2">
              ID: {{ bannedUser?.id }}
            </small>
          </v-row>
          <v-row class="mt-2">
            <small class="text-grey-lighten-2"
              >Reason: {{ bannedUser?.banReason }}</small
            >
          </v-row>
        </v-col>
        <v-col></v-col>
        <v-col cols="auto" class="align-self-center">
          <v-btn
            prepend-icon="mdi-gavel"
            class="bg-red-darken-3"
            v-on:click="unBanUser"
          >
            Unban
          </v-btn>
        </v-col>
      </v-row>
    </v-card-content>
  </v-card>
</template>

<script lang="ts">
import { defineComponent, PropType, ref } from "vue";
import { mapActions, mapMutations } from "vuex";
import { BannedUser } from "@/interfaces/user.interface";

export default defineComponent({
  name: "BannedUserCard",

  setup() {
    const avatar = ref("");

    return {
      avatar,
    };
  },

  mounted() {
    this.parseDiscordAvatarHash(this.bannedUser)
      .then((ava) => {
        this.avatar = ava;
      })
      .catch((err) => {
        this.error(err);
      });
  },

  props: {
    bannedUser: Object as PropType<BannedUser>,
  },

  methods: {
    ...mapActions([
      "error",
      "info",
      "parseDiscordAvatarHash",
      "request",
      "getBannedUsers",
      "getUnverifiedUsers",
    ]),
    ...mapMutations(["removeUnverifiedUser", "setUserSearchResultBanned"]),
    async unBanUser() {
      const { id } = this.bannedUser as BannedUser;
      try {
        const res = await this.request({
          endpoint: "admin/users/unban",
          body: { userId: id },
        });
        this.info(res);

        this.setUserSearchResultBanned({
          id: this.bannedUser?.id,
          banned: false,
        });

        await this.getBannedUsers();
        await this.getUnverifiedUsers();
        return true;
      } catch (err) {
        return false;
      }
    },
  },
});
</script>
