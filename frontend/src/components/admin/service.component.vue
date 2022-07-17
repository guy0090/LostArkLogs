<template>
  <v-col cols="auto" md="9" lg="9" xl="9"
    ><v-row class="px-8 pt-5 pb-6" justify="center">
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
                <h2>Service Management and Overview</h2>
              </v-row>
              <v-row class="mt-1">
                <h4>Manage redis cache and other service features</h4>
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
                  <v-avatar color="indigo" icon="mdi-cached"></v-avatar>
                </v-col>
                <v-col class="align-self-center">
                  <v-row class="pt-1">
                    <h2>Redis Status</h2>
                  </v-row>
                </v-col>
              </v-row>
            </v-expansion-panel-title>
            <v-expansion-panel-text>
              <v-row class="pt-2">
                <v-col cols="6">
                  <v-row>
                    <v-col>
                      <h2 class="align-self-center">Commands</h2>
                    </v-col>
                  </v-row>
                  <v-row>
                    <v-col cols="auto">
                      <v-btn
                        color="red-darken-3"
                        prepend-icon="mdi-delete-forever"
                        :disabled="cachedKeys.length === 0"
                        v-on:click="flushCachedKeys"
                      >
                        Flush Cache
                      </v-btn>
                    </v-col>
                  </v-row>
                </v-col>
                <v-col cols="6">
                  <v-row>
                    <v-col cols="auto" class="align-self-center">
                      <v-badge :content="cachedKeys.length" color="red-darken-3"
                        ><h2 class="me-2 align-self-center">
                          Cached Keys
                        </h2></v-badge
                      >
                    </v-col>
                    <v-spacer></v-spacer>
                    <v-col cols="auto" class="align-self-center">
                      <v-btn
                        color="indigo-darken-3"
                        :disabled="keysLoading"
                        v-on:click="refreshKeys"
                      >
                        Refresh Keys
                      </v-btn>
                    </v-col>
                  </v-row>
                  <v-row>
                    <v-col cols="12">
                      <v-table>
                        <thead>
                          <tr>
                            <th class="text-left">Key</th>
                            <th class="text-left">Expires</th>
                            <th class="text-left"></th>
                          </tr>
                        </thead>
                        <tbody v-if="cachedKeys.length > 0">
                          <tr
                            v-for="entry of getPage(keysPage, pageSize)"
                            :key="entry.key"
                          >
                            <td>{{ entry.key }}</td>
                            <td>{{ getExpires(entry.ttl) }}</td>
                            <td>
                              <v-btn
                                density="comfortable"
                                color="red-darken-3"
                                v-on:click="delCachedKeys([entry.key])"
                              >
                                Del
                              </v-btn>
                            </td>
                          </tr>
                        </tbody>
                        <tbody v-else>
                          <tr>
                            <td></td>
                            <td>No Data</td>
                            <td></td>
                          </tr>
                        </tbody>
                      </v-table>
                    </v-col>
                  </v-row>
                  <v-row v-if="cachedKeys.length > pageSize">
                    <v-col cols="12">
                      <v-pagination
                        v-model="keysPage"
                        :length="Math.ceil(cachedKeys.length / pageSize)"
                        :total-visible="5"
                        class="mt-2"
                      ></v-pagination>
                    </v-col>
                  </v-row>
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

import dayjs from "dayjs";

export default defineComponent({
  name: "ServiceAdmin",

  setup() {
    const keySearch = ref("");
    const keysLoading = ref(false);
    const keysPage = ref(1);

    return {
      keySearch,
      keysLoading,
      keysPage,
    };
  },
  mounted() {
    // Async
    // this.getCacheInfo();
    this.getCachedKeys();
  },

  methods: {
    ...mapMutations(["deleteCachedKeys"]),
    ...mapActions([
      "error",
      "info",
      "request",
      "getCachedKeys",
      "flushCachedKeys",
    ]),
    async getCacheInfo() {
      try {
        const res = await this.request({
          endpoint: "admin/service/cache/status",
          body: {},
        });
        return this.reformatRedisInfo(res.split("\r\n"));
      } catch (err) {
        this.error(err);
        return {};
      }
    },
    reformatRedisInfo(info: string[], filter: "Memory" | "Clients" = "Memory") {
      const result: any = {};

      let currentSection = "";
      for (const line of info) {
        if (line === "") continue;
        if (line.startsWith("#")) {
          currentSection = line.substring(2);
          result[currentSection] = {};
          continue;
        }

        let [key, val] = line.split(":");
        result[currentSection][key] = val;
      }
      return result[filter];
    },
    getExpires(ttl: number) {
      return dayjs(new Date(ttl)).fromNow();
    },
    async delCachedKeys(keys: string[]) {
      try {
        const res = await this.request({
          endpoint: "admin/service/cache/del",
          body: { keys },
        });

        this.deleteCachedKeys(keys);
        this.info(res);
        return true;
      } catch (err) {
        this.error(err);
        return false;
      }
    },
    async refreshKeys() {
      this.keysLoading = true;
      await this.getCachedKeys();
      this.keysLoading = false;
    },
    getPage(page: number, pageSize = 10) {
      return this.cachedKeys.slice((page - 1) * pageSize, page * pageSize);
    },
  },

  computed: {
    ...mapGetters(["cachedKeys", "pageSize"]),
    cachedKeysHeader() {
      return [
        {
          text: "Key",
          align: "start",
          sortable: true,
          value: "key",
        },
        {
          text: "Expires In (s)",
          align: "start",
          sortable: true,
          value: "ttl",
        },
      ];
    },
  },
});
</script>
