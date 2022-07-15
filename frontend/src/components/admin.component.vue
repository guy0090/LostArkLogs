<template>
  <v-container v-if="permissions.includes('admin')" fluid style="height: 100%">
    <v-row style="height: 100%" class="mt-2">
      <v-col cols="1"></v-col>
      <v-col cols="auto" style="height: fit-content">
        <v-list
          nav
          :selected="[adminTab]"
          v-on:click:select="setAdminTab($event.path[0])"
          density="compact"
          bg-color="transparent"
        >
          <v-list-subheader v-if="$vuetify.display.lg || $vuetify.display.xl"
            >Administration</v-list-subheader
          >
          <v-list-item disabled value="status" active-color="blue">
            <v-list-item-avatar start>
              <v-icon icon="mdi-format-list-bulleted" />
            </v-list-item-avatar>
            <v-list-item-title v-if="$vuetify.display.lg || $vuetify.display.xl"
              >Summary</v-list-item-title
            >
          </v-list-item>
          <v-list-item
            v-on:click="$router.push({ name: 'usersAdmin' })"
            value="users"
            active-color="blue"
          >
            <v-list-item-avatar start>
              <v-icon icon="mdi-account-group" />
            </v-list-item-avatar>
            <v-list-item-title>Users</v-list-item-title>
          </v-list-item>
          <v-list-item disabled value="logs" active-color="blue">
            <v-list-item-avatar start>
              <v-icon icon="mdi-math-log" />
            </v-list-item-avatar>
            <v-list-item-title>Logs</v-list-item-title>
          </v-list-item>
          <v-list-item
            v-on:click="$router.push({ name: 'serviceAdmin' })"
            value="service"
            active-color="blue"
          >
            <v-list-item-avatar start>
              <v-icon icon="mdi-server" />
            </v-list-item-avatar>
            <v-list-item-title>Service</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-col>
      <v-divider hidden vertical></v-divider>
      <router-view></router-view>
      <v-col cols="1"></v-col>
    </v-row>
  </v-container>
  <v-container v-else
    ><v-row justify="center"
      ><v-col cols="auto"><h2>Unauthorized</h2></v-col></v-row
    ></v-container
  >
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import { mapMutations, mapGetters, mapActions } from "vuex";

export default defineComponent({
  name: "AdminPage",

  setup() {
    // Request results
    const cachedKeys = ref([] as string[]);

    return {
      cachedKeys,
    };
  },

  async mounted() {
    this.getUnverifiedUsers();
    this.getBannedUsers();
  },

  methods: {
    ...mapActions([
      "error",
      "info",
      "request",
      "getUnverifiedUsers",
      "getBannedUsers",
    ]),
    ...mapMutations(["setAdminTab"]),
    async getUserPermissions(userId: string): Promise<string[]> {
      try {
        const res = await this.request("admin/users/permissions", {
          userId: userId,
        });
        return res;
      } catch (err) {
        this.error(err);
        return [];
      }
    },
    async getCachedKeys(): Promise<string[]> {
      try {
        const res = await this.request("admin/service/cache/keys", {});
        return res;
      } catch (err) {
        this.error(err);
        return [];
      }
    },
    async delCachedKeys(keys: string[]) {
      try {
        const res = await this.request("admin/service/cache/del", {
          keys: keys,
        });
        return res;
      } catch (err) {
        this.error(err);
        return null;
      }
    },
  },

  computed: {
    ...mapGetters(["unverifiedUsers", "apiUrl", "adminTab", "permissions"]),
  },
});
</script>
