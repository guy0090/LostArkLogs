<template>
  <v-container fluid v-if="JSON.stringify(session) !== '{}'">
    <v-snackbar
      v-model="notify"
      :timeout="5000"
      :color="notifyColor"
      variant="contained"
    >
      <v-row justify="center">
        <v-col cols="auto">
          <h3>{{ notifyMsg }}</h3>
        </v-col>
      </v-row>
    </v-snackbar>
    <v-row id="title">
      <v-col class="mx-0 px-0" sm="auto" md="auto" lg="1" xl="1"></v-col>
      <v-col cols="auto" align-self="center">
        <v-chip
          v-if="!isUpload && !session.unlisted"
          variant="contained-text"
          label
          color="success"
          rounded="sm"
          prepend-icon="mdi-cloud-upload"
          style="margin-left: 6px !important"
        >
          UPLOADED {{ timeSince(session.createdAt).toUpperCase() }}
        </v-chip>
        <v-chip
          v-if="session.unlisted"
          variant="contained-text"
          label
          color="indigo-accent-3"
          rounded="sm"
          class="ms-2"
          prepend-icon="mdi-incognito"
        >
          UNLISTED
        </v-chip>
      </v-col>
      <v-col
        cols="auto"
        class="ps-0"
        v-if="session.region?.toLowerCase() !== 'unknown'"
        align-self="center"
      >
        <v-chip
          v-if="session.region?.toLowerCase() === 'steam'"
          variant="contained-text"
          label
          rounded="sm"
          prepend-icon="mdi-steam"
        >
          STEAM
        </v-chip>
        <v-chip
          v-else-if="session.region?.toLowerCase() === 'korea'"
          variant="contained-text"
          label
          rounded="sm"
          class="ps-2"
        >
          <v-img width="18" height="18" src="/img/kor.webp" />
          <span class="ps-2">KOREA</span>
        </v-chip>
      </v-col>
      <v-spacer v-if="!$vuetify.display.sm && !$vuetify.display.xs"></v-spacer>
      <v-col
        cols="auto"
        class="me-2"
        v-if="uploadToken !== null && !isUpload && session.creator === user.id"
      >
        <v-dialog v-model="dialog">
          <template v-slot:activator="{ props }">
            <v-btn
              color="orange-darken-2"
              class="me-2"
              style="color: #fff !important"
              v-bind="props"
            >
              Edit
            </v-btn>
          </template>

          <v-card width="300">
            <v-toolbar>
              <v-icon>mdi-pencil</v-icon>
              <v-toolbar-title class="ps-2">Edit Session</v-toolbar-title>
            </v-toolbar>
            <v-card-content>
              <v-row>
                <v-col cols="auto">
                  <h3><v-icon icon="mdi-eye" /> Visibility</h3>
                </v-col>
              </v-row>
              <v-row>
                <v-col cols="12">
                  <v-select
                    v-model="visibility"
                    :items="['Unlisted', 'Public']"
                    label="Public | Unlisted"
                    variant="outlined"
                    hide-details
                  ></v-select>
                </v-col>
              </v-row>
            </v-card-content>
            <v-card-actions>
              <v-btn color="red darken-3" text @click="cancelEdit">
                Cancel
              </v-btn>
              <v-spacer></v-spacer>
              <v-btn color="green accent-3" text @click="saveEdit">
                Save
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>

        <v-btn color="red-darken-3" v-on:click="tryDelete">
          <span v-if="deleting === 0">Delete</span>
          <span v-if="deleting === 1">Confirm</span>
        </v-btn>
      </v-col>
      <v-col v-if="uploadToken !== null && isUpload" cols="auto" class="me-2">
        <v-btn color="success" v-on:click="saveUpload">SAVE</v-btn>
      </v-col>
      <v-col class="mx-0 px-0" sm="auto" md="auto" lg="1" xl="1"></v-col>
    </v-row>
    <v-row id="summary" class="ma-1" justify="center">
      <v-col class="hide-on-sm px-0" sm="auto" md="auto" lg="1" xl="1"></v-col>
      <v-col sm="12" md="12" lg="3" xl="3" class="expand-sm">
        <LogSummary :session="session"></LogSummary>
      </v-col>
      <v-col class="expand-sm" sm="12" md="12" lg="7" xl="7">
        <v-row class="pt-1 mb-2">
          <v-col cols="12" class="pt-2 pb-0 px-1 expand-sm">
            <PartyDPSGraph
              :entities="JSON.parse(JSON.stringify(players))"
              :duration="session.duration"
              :dpsIntervals="session.damageStatistics.dpsIntervals"
            ></PartyDPSGraph>
          </v-col>
        </v-row>
        <v-row class="pt-1">
          <EntityPanel
            v-for="(entity, index) in players"
            :key="index"
            :idx="index"
            :entity="entity"
            :entities="12"
            :totalDamageDealt="session?.damageStatistics.totalDamageDealt"
            :duration="session.duration / 1000"
            :mvp="isMVP(entity)"
          >
          </EntityPanel>
        </v-row>
        <v-row class="mt-4"> </v-row>
      </v-col>
      <v-col class="px-0" sm="auto" md="auto" lg="1" xl="1"></v-col>
    </v-row>
  </v-container>
  <v-container v-else>
    <v-col>
      <v-row justify="center">
        <h1>{{ loadingMessage }}</h1>
      </v-row>
    </v-col>
  </v-container>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import { mapActions, mapGetters, mapMutations } from "vuex";
import { Session, Entity } from "@/interfaces/session.interface";

import axios from "axios";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);

// Components
import LogSummary from "@/components/logs/log/summary.component.vue";
import EntityPanel from "@/components/logs/log/entitypanel.component.vue";
import PartyDPSGraph from "@/components/logs/log/graphs/partydps.component.vue";

export default defineComponent({
  name: "LogPage",

  components: {
    LogSummary,
    EntityPanel,
    PartyDPSGraph,
  },

  props: {
    uSession: Object || undefined,
    isUpload: false || Boolean,
  },

  setup() {
    const notify = ref(false);
    const notifyMsg = ref("");
    const notifyColor = ref("success");
    const dialog = ref(false);
    const visibility = ref("Public");
    const players = ref([] as Entity[]);
    const deleting = ref(0);
    const loadingMessage = ref("LOADING");
    const session = ref({} as unknown as Session);

    return {
      notify,
      notifyMsg,
      notifyColor,
      dialog,
      visibility,
      players,
      deleting,
      loadingMessage,
      session,
    };
  },

  mounted() {
    this.setPageLoading(true);
    if (this.$props.uSession) {
      const session = this.$props.uSession as Session;
      this.loadFileSession(session);
    } else {
      this.getSession();
    }
  },

  methods: {
    ...mapActions(["info", "error", "uploadLog", "deleteOwnLog", "updateLog"]),
    ...mapMutations(["setPageLoading", "addCachedLog"]),
    getSession() {
      const id = this.$route.params.id;

      const exists = this.getCachedLog(id);
      if (exists) {
        this.setPageLoading(false);
        this.session = exists;

        this.visibility = this.session.unlisted ? "Unlisted" : "Public";
        this.players = this.getPlayerEntities(false);
        return;
      }

      axios
        .post(`${this.apiUrl}/logs`, { id })
        .then((response) => {
          setTimeout(() => {
            this.setPageLoading(false);
            let session: Session = response.data;

            this.session = session;

            this.addCachedLog(JSON.parse(JSON.stringify(session)));

            this.visibility = this.session.unlisted ? "Unlisted" : "Public";
            this.players = this.getPlayerEntities(false);
          }, 200);
        })
        .catch((err) => {
          this.error(err);

          this.setPageLoading(false);
          this.loadingMessage = `Error loading session ${id}`;
        });
    },
    loadFileSession(session: Session) {
      this.session = session;
      this.players = this.getPlayerEntities(false);

      this.setPageLoading(false);
    },
    duplicateEntities(session: Session) {
      return [
        ...session.entities,
        ...session.entities.map((ent) => {
          return {
            ...ent,
            id: ent.id + session.entities.length,
          };
        }),
      ];
    },
    openLog(id: string) {
      this.$router.push({ name: "logs", params: { id } });
    },
    getDuration(start: number, end: number) {
      const beginDate = dayjs(start);
      const endDate = dayjs(end);

      let minDiff: number | string = 0;
      let secDiff: string | number = endDate.diff(beginDate, "seconds", true);

      if (secDiff > 60) {
        minDiff = Math.floor(secDiff / 60);
        secDiff = Math.round(secDiff % 60);
      } else if (secDiff > 9) {
        secDiff = Math.round(secDiff);
      } else {
        secDiff = "0" + Math.round(secDiff);
      }

      return `${minDiff === 0 ? "00" : minDiff}:${secDiff}`;
    },
    timeSince(date: number) {
      return dayjs(date).fromNow();
    },
    isMVP(entity: Entity) {
      return (
        entity.stats.damageDealt ===
        this.session?.damageStatistics?.topDamageDealt
      );
    },
    getTotalCrits(entities: Entity[]) {
      let totalCrits = 0;
      entities.forEach((entity: Entity) => {
        totalCrits += entity.stats.crits;
      });
      return totalCrits;
    },
    getTotalAttacks(type: string) {
      let total = 0;
      this.session?.entities?.forEach((entity: Entity) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        total += (entity.stats as any)[type];
      });
      return total;
    },
    getDamageDealtPerSecond(entity: Entity) {
      const duration = this.session?.duration / 1000;
      return entity?.stats.damageDealt / (duration || 0);
    },
    getTotalDPS(entities: Entity[]) {
      let total = 0;
      entities.forEach((entity) => {
        total += this.getDamageDealtPerSecond(entity);
      });

      return Math.round(total);
    },
    getAverageDPS(entities: Entity[]) {
      let total = 0;
      entities.forEach((entity) => {
        total += this.getDamageDealtPerSecond(entity);
      });

      return Math.round(total / entities.length);
    },
    getCritRate(entity: Entity) {
      const rate = (entity.stats.crits / entity.stats.hits) * 100;
      return rate;
    },
    getAverageCritRate(entities: Entity[]) {
      let total = 0;
      entities.forEach((entity) => {
        total += this.getCritRate(entity);
      });

      return Math.round(total / entities.length);
    },
    getPlayerEntities(duplicate = false) {
      let clone = [...this.session?.entities] as Entity[];
      if (duplicate) clone = this.duplicateEntities(this.session);

      return clone
        .sort((a, b) => b.stats.damageDealt - a.stats.damageDealt)
        .filter((e) => e.type === 3)
        .map((e, idx) => {
          return { ...e, iid: idx + 1 };
        });
    },
    async saveUpload() {
      const session: Session = JSON.parse(JSON.stringify(this.session));
      const createdId = await this.uploadLog(session);
      this.$router.push({ path: `/logs/${createdId}` });
    },
    async tryDelete() {
      setTimeout(() => {
        this.deleting = 0;
      }, 2000);

      if (this.deleting === 1) {
        await this.deleteOwnLog(this.session.id);
        this.$router.push({ name: "home" });
      } else {
        this.deleting += 1;
      }
    },
    cancelEdit() {
      this.visibility = this.session.unlisted ? "Unlisted" : "Public";
      this.dialog = false;
    },
    saveEdit() {
      const visibility = this.visibility === "Unlisted" ? true : false;
      this.updateLog({ id: this.session.id, visibility })
        .then((update) => {
          this.session = update;

          this.notifyColor = "success";
          this.notifyMsg = "Successfully updated log";

          this.notify = true;
          this.dialog = false;
        })
        .catch(() => {
          this.notifyColor = "error";
          this.notifyMsg = "Failed to update log";

          this.notify = true;
          this.dialog = false;
        });
    },
  },
  computed: {
    ...mapGetters(["uploadToken", "apiUrl", "getCachedLog", "user"]),
  },
});
</script>

<style scoped>
@media only screen and (max-width: 519px) {
  .hide-on-sm {
    display: none;
  }
}

@media only screen and (max-width: 600px) {
  .expand-sm {
    min-width: 100% !important;
  }
}

.c-102 {
  color: #ee2e48b7;
}
.c-103 {
  color: #7b9aa2;
}
.c-104 {
  color: #e1907e;
}
.c-105 {
  color: #ff9900;
}
.c-202 {
  color: #b38915;
}
.c-203 {
  color: #22aa99;
}
.c-204 {
  color: #674598;
}
.c-205 {
  color: #66aa00;
}
.c-302 {
  color: #aa5611;
}
.c-303 {
  color: #990099;
}
.c-304 {
  color: #316395;
}
.c-305 {
  color: #1f21c5d3;
}
.c-312 {
  color: #994499;
}
.c-402 {
  color: #a91a16;
}
.c-403 {
  color: #0099c6;
}
.c-404 {
  color: #109618;
}
.c-502 {
  color: #dd4477;
}
.c-503 {
  color: #4442a8;
}
.c-504 {
  color: #33670b;
}
.c-505 {
  color: #3b4292;
}
.c-512 {
  color: #6bcec2;
}
.c-602,
.c-603 {
  color: #dd4477;
}
</style>
