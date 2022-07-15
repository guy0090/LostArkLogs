<template>
  <v-col cols="6" class="py-2">
    <v-card color="rgb(56,56,56)">
      <v-card-content>
        <v-row>
          <v-col cols="auto">
            <v-avatar color="indigo"><v-img :src="avatar"></v-img></v-avatar>
          </v-col>
          <v-col cols="auto" class="mt-1 align-self-center">
            <v-row>
              <h4>
                {{ searchUser?.username }}#{{ searchUser?.discriminator }}
              </h4>
              <v-chip
                v-if="isSearcher"
                class="bg-green-darken-3 ms-2"
                rounded="sm"
                density="compact"
              >
                YOU
              </v-chip>
              <v-chip
                v-if="searchUser?.banned"
                class="bg-red-darken-3 ms-2"
                rounded="sm"
                density="compact"
              >
                BANNED
              </v-chip>
            </v-row>
            <v-row class="mt-2"
              ><small class="text-grey-lighten-2"
                >ID: {{ searchUser?.id }}</small
              ></v-row
            >
          </v-col>
          <v-spacer></v-spacer>
          <v-col cols="auto" class="align-self-center py-1">
            <v-menu location="end">
              <template v-slot:activator="{ props }">
                <v-btn
                  elevation="0"
                  rounded="10"
                  icon="mdi-dots-vertical"
                  color="transparent"
                  v-bind="props"
                ></v-btn>
              </template>
              <v-list density="compact">
                <v-list-subheader>Actions</v-list-subheader>
                <v-list-subheader>Reason #TODO</v-list-subheader>
                <v-list-item
                  link
                  value="unban"
                  class="ps-1"
                  v-on:click="unBanUser"
                  v-if="searchUser?.banned"
                >
                  <v-list-item-avatar start icon="mdi-gavel" />
                  <v-list-item-title v-text="'Unban'" />
                </v-list-item>
                <v-list-item
                  link
                  value="ban"
                  class="ps-1"
                  v-on:click="banUser"
                  v-else
                >
                  <v-list-item-avatar start icon="mdi-gavel" />
                  <v-list-item-title v-text="'Ban'" />
                </v-list-item>
              </v-list>
            </v-menu>
          </v-col>
        </v-row>
      </v-card-content>
    </v-card>
  </v-col>
</template>

<script lang="ts">
import { User } from "@/interfaces/user.interface";
import { defineComponent, PropType, ref } from "vue";
import { mapActions, mapMutations } from "vuex";

export default defineComponent({
  name: "SearchUser",
  props: {
    searchUser: Object as PropType<User>,
    isSearcher: Boolean as PropType<boolean>,
  },

  setup() {
    const avatar = ref("");

    return {
      avatar,
    };
  },

  mounted() {
    this.parseDiscordAvatarHash(this.searchUser)
      .then((ava) => {
        this.avatar = ava;
      })
      .catch((err) => {
        this.error(err);
      });
  },

  methods: {
    ...mapActions([
      "info",
      "error",
      "parseDiscordAvatarHash",
      "request",
      "getBannedUsers",
      "getUnverifiedUsers",
    ]),
    ...mapMutations(["setUserSearchResultBanned"]),
    async banUser() {
      const { id } = this.searchUser as User;
      try {
        const res = await this.request({
          endpoint: "admin/users/ban",
          body: { userId: id, banReason: "" },
        });
        this.info(res);

        this.setUserSearchResultBanned({
          id: this.searchUser?.id,
          banned: true,
        });
        await this.getBannedUsers();
        await this.getUnverifiedUsers();
        return true;
      } catch (err) {
        return false;
      }
    },
    async unBanUser() {
      const { id } = this.searchUser as User;
      try {
        const res = await this.request({
          endpoint: "admin/users/unban",
          body: { userId: id },
        });
        this.info(res);

        this.setUserSearchResultBanned({
          id: this.searchUser?.id,
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
