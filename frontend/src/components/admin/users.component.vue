<template>
  <v-col cols="auto" md="9" lg="9" xl="9">
    <v-row class="px-8 pt-5 pb-6" justify="center">
      <v-card width="100%" rounded="0">
        <v-progress-linear model-value="100" height="7" color="indigo">
        </v-progress-linear>
        <v-card-content>
          <v-row>
            <v-col cols="auto" class="ms-2">
              <v-avatar color="indigo" icon="mdi-account-group"></v-avatar>
            </v-col>
            <v-col cols="auto" class="align-self-center">
              <v-row>
                <h2>User Management and Overview</h2>
              </v-row>
              <v-row class="mt-1">
                <h4>Manage users, view statistics and more.</h4>
              </v-row>
            </v-col>
          </v-row>
        </v-card-content>
      </v-card>
    </v-row>
    <v-row class="px-5 pb-2">
      <v-col cols="12">
        <v-expansion-panels>
          <v-expansion-panel>
            <v-progress-linear model-value="100" height="7" color="indigo">
            </v-progress-linear>
            <v-expansion-panel-title>
              <v-row>
                <v-col cols="auto">
                  <v-avatar
                    color="indigo"
                    icon="mdi-chart-bar-stacked"
                  ></v-avatar>
                </v-col>
                <v-col class="align-self-center">
                  <v-row class="pt-1">
                    <h2>User Statistics</h2>
                  </v-row>
                </v-col>
              </v-row>
            </v-expansion-panel-title>
            <v-expansion-panel-text>
              <v-row justify="center">
                <v-col cols="auto" class="pb-1"><h3>TODO</h3></v-col>
              </v-row>
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>
      </v-col>
    </v-row>
    <v-row class="px-5 pb-2">
      <v-col cols="12">
        <v-expansion-panels>
          <v-expansion-panel>
            <v-progress-linear model-value="100" height="7" color="indigo">
            </v-progress-linear>
            <v-expansion-panel-title>
              <v-row>
                <v-col cols="auto">
                  <v-avatar color="indigo" icon="mdi-account-search"></v-avatar>
                </v-col>
                <v-col class="align-self-center">
                  <v-row class="pt-1">
                    <h2>Search Users</h2>
                  </v-row>
                  <v-row class="mt-3">
                    <h4>Search by Discord username or database ID</h4>
                  </v-row>
                </v-col>
              </v-row>
            </v-expansion-panel-title>
            <v-expansion-panel-text>
              <v-row justify="center" class="mt-1">
                <v-col cols="auto" class="align-self-center">
                  <h3 v-if="userSearchResults.length === 0">No Results</h3>
                  <h3 v-else>
                    Found
                    {{ userSearchResults.length }}
                    User{{ userSearchResults.length === 1 ? "" : "s" }}
                    <!-- Yes this is necessary -->
                  </h3>
                </v-col>
                <v-col cols="6" class="pe-1 align-self-center">
                  <v-text-field
                    variant="outlined"
                    label="Username or ID (ex: id:1234567890)"
                    prepend-inner-icon="mdi-pound"
                    density="compact"
                    :hide-details="true"
                    :loading="searchLoading"
                    color="success"
                    v-model="userSearch"
                    :clearable="true"
                    v-on:change="searchUsers"
                    v-on:click:clear="resetSearch"
                  ></v-text-field>
                </v-col>
                <v-col cols="2" class="ps-1 align-self-center">
                  <v-btn
                    prepend-icon="mdi-account-search"
                    color="green-darken-3"
                    v-on:click="searchUsers"
                    :disabled="userSearch === '' || searchLoading"
                    >Search</v-btn
                  >
                </v-col>
              </v-row>
              <v-row
                v-if="userSearchResults.length > 0"
                justify="center"
                class="mt-2"
              >
                <SearchUserCard
                  v-for="(searchUser, i) of userSearchResults"
                  :key="i"
                  :searchUser="searchUser"
                  :isSearcher="searchUser.id === user.id"
                />
              </v-row>
              <v-row v-else justify="center">
                <v-col cols="auto" class="align-self-center">
                  <h3>Press search to get results</h3>
                </v-col>
              </v-row>
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>
      </v-col>
    </v-row>
    <v-row class="px-5">
      <v-col cols="12" lg="6">
        <v-expansion-panels>
          <v-expansion-panel>
            <v-progress-linear model-value="100" height="7" color="indigo">
            </v-progress-linear>
            <v-expansion-panel-title>
              <v-row>
                <v-col cols="auto">
                  <v-avatar
                    color="indigo"
                    icon="mdi-account-alert-outline"
                  ></v-avatar>
                </v-col>
                <v-col class="align-self-center">
                  <v-row class="pt-1">
                    <v-badge
                      color="red-darken-3"
                      :content="unverifiedUsers.length"
                      ><h2 class="me-2">Unverified Users</h2></v-badge
                    >
                  </v-row>
                </v-col>
              </v-row>
            </v-expansion-panel-title>
            <v-expansion-panel-text
              v-if="unverifiedUsers && unverifiedUsers.length > 0"
              class="px-0 mb-0 pt-2"
            >
              <UnverifiedUserCard
                v-for="user of unverifiedUsers"
                :key="user.id"
                :unverifiedUser="user"
                class="my-2"
              />
            </v-expansion-panel-text>
            <v-expansion-panel-text v-else>
              <v-row justify="center">
                <v-col cols="auto">
                  <h2>No Unverified Users</h2>
                </v-col>
              </v-row>
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>
      </v-col>
      <v-col cols="12" lg="6">
        <v-expansion-panels>
          <v-expansion-panel>
            <v-progress-linear model-value="100" height="7" color="indigo">
            </v-progress-linear>
            <v-expansion-panel-title>
              <v-row>
                <v-col cols="auto">
                  <v-avatar color="indigo" icon="mdi-gavel"></v-avatar>
                </v-col>
                <v-col class="align-self-center">
                  <v-row class="pt-1">
                    <h2>Banned Users</h2>
                  </v-row>
                </v-col>
              </v-row>
            </v-expansion-panel-title>
            <v-expansion-panel-text
              v-if="bannedUsers && bannedUsers.length > 0"
              class="px-0 mb-0 pt-2"
            >
              <BannedUserCard
                v-for="bUser of bannedUsers"
                :key="bUser.id"
                :bannedUser="bUser"
                class="my-2"
              />
            </v-expansion-panel-text>
            <v-expansion-panel-text v-else>
              <v-row justify="center">
                <v-col cols="auto">
                  <h2>No Banned Users</h2>
                </v-col>
              </v-row>
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>
      </v-col>
    </v-row>
  </v-col>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import { mapActions, mapGetters, mapMutations } from "vuex";

import UnverifiedUserCard from "@/components/admin/users/unverified.component.vue";
import BannedUserCard from "@/components/admin/users/banned.component.vue";
import SearchUserCard from "@/components/admin/users/search.component.vue";

export default defineComponent({
  name: "UserAdmin",

  components: {
    UnverifiedUserCard,
    BannedUserCard,
    SearchUserCard,
  },

  setup() {
    const searchLoading = ref(false);
    const userSearch = ref("");
    const lastSearch = ref("");

    return {
      searchLoading,
      userSearch,
      lastSearch,
    };
  },

  methods: {
    ...mapActions(["info", "error", "request"]),
    ...mapMutations(["setUserSearchResults"]),
    async searchUsers() {
      if (this.lastSearch === this.userSearch) return;

      this.searchLoading = true;
      this.setUserSearchResults([]);

      this.lastSearch = this.userSearch;

      try {
        const isIdSearch = this.userSearch.startsWith("id:");
        let search = this.userSearch;

        if (isIdSearch) {
          search = this.userSearch.substring(3);
        }

        // Discord usernames are between 2 and 32 characters long.
        // DB IDs must be 24 characters long
        if (
          search.length < 2 ||
          search.length > 32 ||
          (isIdSearch && search.length !== 24)
        ) {
          this.searchLoading = false;
          this.setUserSearchResults([]);
        } else {
          const body: { id?: string; username?: string } = {};
          if (isIdSearch) body.id = search;
          else body.username = search;

          const res = await this.request({
            endpoint: "admin/users/search",
            body,
          });

          this.setUserSearchResults(res);
          this.searchLoading = false;
        }
      } catch (err) {
        this.setUserSearchResults([]);
        this.searchLoading = false;
      }
    },
    resetSearch() {
      this.setUserSearchResults([]);
      this.lastSearch = "";
    },
  },

  computed: {
    ...mapGetters([
      "unverifiedUsers",
      "bannedUsers",
      "userSearchResults",
      "user",
    ]),
  },
});
</script>
