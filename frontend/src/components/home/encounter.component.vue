<template>
  <v-col cols="12" class="py-1 px-0">
    <v-card
      class="mx-auto"
      border="indigo"
      rounded="sm"
      @click="openLog(session?.id)"
      @contextmenu="openLogNewTab(session?.id)"
      v-if="!raw"
    >
      <v-progress-linear model-value="100" height="7" color="indigo">
      </v-progress-linear>
      <v-card-content class="pa-3" v-if="!$vuetify.display.xs">
        <v-row :class="$vuetify.display.xs ? 'pb-2' : 'py-1'">
          <v-col cols="auto" class="align-self-center">
            <v-avatar
              rounded="0"
              :image="`/img/sprites/${encounterName}.webp`"
            />
          </v-col>
          <v-col cols="auto" class="align-self-center">
            <v-row
              ><h3>{{ bossName.toUpperCase() }}</h3></v-row
            >
            <v-row class="mt-3">
              <v-chip label density="comfortable" color="error px-2">
                <v-icon icon="mdi-sword" class="pe-1" />
                {{ getTotalDPS(getPlayerEntities()) }}/s
              </v-chip>
              &nbsp;
              <v-chip label density="comfortable" color="success px-2">
                <v-icon icon="mdi-timer-outline" class="pe-1" />
                {{ getDuration(session?.duration) }}
              </v-chip>
              &nbsp;
              <v-chip label density="comfortable" color="info">
                <v-icon icon="mdi-cloud-upload-outline" class="pe-1" />{{
                  timeSince(session?.createdAt)
                }}
              </v-chip>
            </v-row>
          </v-col>
          <v-col class="align-self-center pt-1 pb-1">
            <v-chip
              label
              v-for="(entity, i) in getPlayerEntities()"
              :key="i"
              :class="`mx-1 ${
                colors ? `c-${entity.classId}` : 'bg-blue-grey-darken-2'
              }`"
              :style="i >= 4 ? 'display: none' : ''"
            >
              <v-avatar
                rounded="0"
                :image="`/img/sprites/${entity.classId}.webp`"
              />
              <span v-if="!$vuetify.display.sm"
                >&nbsp;{{ $t(`classes.${entity.classId}`) }}</span
              >
            </v-chip>
            <v-chip v-if="getPlayerEntities().length > 4" label class="mx-1"
              >+{{ getPlayerEntities().length - 4 }} more</v-chip
            >
          </v-col>
        </v-row>
      </v-card-content>
      <v-card-content class="mb-3" v-else>
        <v-row justify="center" class="mb-1">
          <v-col cols="auto" class="align-self-center py-0 px-0">
            <v-avatar
              rounded="0"
              size="small"
              :image="`/img/sprites/${encounterName}.webp`"
            />
          </v-col>
          <v-col cols="auto" class="align-self-center py-0 px-1">
            <h3 class="d-inline-block text-truncate pt-2">
              {{ bossName.toUpperCase() }}
            </h3>
          </v-col>
        </v-row>
        <v-row justify="center" class="mb-4">
          <v-col cols="auto" class="pa-1"
            ><v-chip label density="comfortable" color="error px-2">
              <v-icon icon="mdi-sword" class="pe-1" />
              {{ getTotalDPS(getPlayerEntities()) }}/s
            </v-chip></v-col
          >
          <v-col cols="auto" class="pa-1"
            ><v-chip label density="comfortable" color="success px-2">
              <v-icon icon="mdi-timer-outline" class="pe-1" />
              {{ getDuration(session?.duration) }}
            </v-chip></v-col
          >
          <v-col cols="auto" class="pa-1"
            ><v-chip label density="comfortable" color="info">
              <v-icon icon="mdi-cloud-upload-outline" class="pe-1" />{{
                timeSince(session?.createdAt)
              }}
            </v-chip></v-col
          >
        </v-row>
        <v-row justify="center">
          <v-col
            cols="auto"
            v-for="(entity, i) in getPlayerEntities()"
            :key="i"
            class="align-self-center py-1 px-0"
          >
            <v-chip
              label
              :class="`mx-1 ${
                colors ? `c-${entity.classId}` : 'bg-blue-grey-darken-2'
              }`"
              :style="i >= 4 ? 'display: none' : ''"
            >
              <v-avatar
                rounded="0"
                :image="`/img/sprites/${entity.classId}.webp`"
              />
            </v-chip>
          </v-col>
          <v-col cols="auto" class="py-1 px-0">
            <v-chip v-if="getPlayerEntities().length > 4" label class="mx-1"
              >+{{ getPlayerEntities().length - 4 }} more</v-chip
            >
          </v-col>
        </v-row>
      </v-card-content>
    </v-card>
    <v-card class="mx-auto" border="indigo" rounded="sm" v-else>
      <v-progress-linear model-value="100" height="7" color="indigo">
      </v-progress-linear>
      <v-card-content class="pa-3" v-if="!$vuetify.display.xs">
        <v-row :class="$vuetify.display.xs ? 'pb-2' : 'py-1'">
          <v-col cols="auto" class="align-self-center">
            <v-avatar
              rounded="0"
              :image="`/img/sprites/${encounterName}.webp`"
            />
          </v-col>
          <v-col cols="auto" class="align-self-center">
            <v-row
              ><h3>{{ bossName.toUpperCase() }}</h3></v-row
            >
            <v-row class="mt-3">
              <v-chip label density="comfortable" color="error px-2">
                <v-icon icon="mdi-sword" class="pe-1" />
                {{ getTotalDPS(getPlayerEntities()) }}/s
              </v-chip>
              &nbsp;
              <v-chip label density="comfortable" color="success px-2">
                <v-icon icon="mdi-timer-outline" class="pe-1" />
                {{ getDuration(session?.duration) }}
              </v-chip>
              &nbsp;
              <v-chip label density="comfortable" color="info">
                <v-icon icon="mdi-cloud-upload-outline" class="pe-1" />{{
                  timeSince(session?.createdAt)
                }}
              </v-chip>
            </v-row>
          </v-col>
          <v-col class="align-self-center pt-1 pb-1">
            <v-chip
              label
              v-for="(entity, i) in getPlayerEntities()"
              :key="i"
              :class="`mx-1 ${
                colors ? `c-${entity.classId}` : 'bg-blue-grey-darken-2'
              }`"
              :style="i >= 4 ? 'display: none' : ''"
            >
              <v-avatar
                rounded="0"
                :image="`/img/sprites/${entity.classId}.webp`"
              />
              <span v-if="!$vuetify.display.sm"
                >&nbsp;{{ $t(`classes.${entity.classId}`) }}</span
              >
            </v-chip>
            <v-chip v-if="getPlayerEntities().length > 4" label class="mx-1"
              >+{{ getPlayerEntities().length - 4 }} more</v-chip
            >
          </v-col>
        </v-row>
        <v-divider class="mt-3 mb-2"></v-divider>
        <v-row>
          <v-col cols="auto" align-self="center">
            <v-btn
              v-if="!uploaded && !uploadFailed"
              color="indigo"
              v-on:click="tryUploadLog"
              :disabled="uploading"
              >{{ uploading ? "Uploading" : "Upload" }}</v-btn
            >
            <v-btn v-else-if="uploadFailed" color="error"> Failed </v-btn>
            <v-btn v-else color="success"> Uploaded </v-btn>
          </v-col>
          <v-col cols="auto" class="py-0 px-1" align-self="center">
            <v-checkbox
              v-model="unlistedUpload"
              label="Unlisted"
              color="success"
              hide-details
            ></v-checkbox>
          </v-col>
          <v-col cols="auto" v-if="uploadFailed" align-self="center">
            <span>Upload failed: {{ uploadErr }} </span>
          </v-col>
          <v-spacer v-if="uploaded"></v-spacer>
          <v-col cols="auto" v-if="uploaded" align-self="center">
            <v-btn
              color="indigo"
              prepend-icon="mdi-export-variant"
              @click="openLogNewTab(uploadedId, true)"
              >Open</v-btn
            >
          </v-col>
        </v-row>
      </v-card-content>
    </v-card>
  </v-col>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import dayjs from "dayjs";
import { Session, Entity, EntityType } from "@/interfaces/session.interface";
import { mapActions, mapGetters } from "vuex";
import { SimpleSession } from "@/log-parsing/lib/objects";

export default defineComponent({
  name: "EncounterCard",

  props: {
    session: Object,
    colors: Boolean,
    raw: Boolean,
    result: Boolean,
  },

  data() {
    let bossName = "UNKNOWN BOSS";
    let encounterName = "UNKNOWN ENCOUNTER";

    // If raw
    let unlistedUpload = false;
    let uploading = false;
    let uploaded = false;
    let uploadFailed = false;
    let uploadErr = "";
    let uploadedId = "";

    return {
      bossName,
      encounterName,
      unlistedUpload,
      uploading,
      uploaded,
      uploadFailed,
      uploadErr,
      uploadedId,
    };
  },

  mounted() {
    this.getEncounter();
  },

  methods: {
    ...mapActions(["uploadLog"]),
    openLog(id: string) {
      if (this.$props.raw || this.$props.result) return;

      this.$router.push({ path: `/logs/${id}` });
    },
    openLogNewTab(id: string, overrideRaw = false) {
      if (!overrideRaw && this.$props.raw) return;
      window.open(`/logs/${id}`);
    },
    getDuration(duration: number) {
      const start = new Date(0);
      const end = new Date(duration);

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

      return `${minDiff === 0 ? "00" : minDiff}:${
        secDiff < 10 ? `0${secDiff}` : secDiff
      }`;
    },

    timeSince(date: number) {
      const since = dayjs(date).fromNow(false);
      return since.replace("minutes", "min");
    },
    getPlayerEntities(duplicate = false) {
      let clone = [...this.session?.entities] as Entity[];
      if (duplicate) clone = this.duplicateEntities(this.session as Session);

      return clone
        .sort((a, b) => b.stats.damageDealt - a.stats.damageDealt)
        .filter((e) => e.type === 3);
    },
    duplicateEntities(session: Session) {
      return [
        ...session.entities,
        ...session.entities.map((ent) => {
          return {
            ...ent,
            id: `${ent.id}_${session.entities.length}`,
          };
        }),
      ];
    },
    getEncounter() {
      const entities = [...this.session?.entities] as Entity[];
      const bossEntities = entities
        .filter(
          (e) => e.type === EntityType.BOSS || e.type === EntityType.GUARDIAN
        )
        .sort((a, b) => b.lastUpdate - a.lastUpdate);
      const hasBoss = bossEntities.length > 0;
      if (!hasBoss) return;

      const boss = bossEntities[0];
      const bossName = this.$t(`monsters.${boss.npcId}`);

      let encounter = "ue";
      if (this.isSupportedBoss(boss.npcId, "abyssRaids")) {
        encounter = "ar";
      } else if (this.isSupportedBoss(boss.npcId, "abyssalDungeons")) {
        encounter = "ad";
      } else if (this.isSupportedBoss(boss.npcId, "legionRaids")) {
        encounter = "lr";
      } else if (this.isSupportedBoss(boss.npcId, "guardians")) {
        encounter = "gr";
      }

      this.bossName = bossName;
      this.encounterName = encounter.toLowerCase();
    },
    getDamageDealtPerSecond(entity: Entity) {
      const duration = this.session?.duration / 1000;
      return entity?.stats.damageDealt / duration;
    },
    getTotalDPS(entities: Entity[]) {
      let total = 0;

      for (let entity of entities)
        total += this.getDamageDealtPerSecond(entity);
      return this.abbrNum(Math.round(total), 2);
    },
    async tryUploadLog() {
      try {
        const encounter = JSON.parse(
          JSON.stringify(this.session)
        ) as SimpleSession;
        encounter.unlisted = this.unlistedUpload;

        const res = await this.uploadLog(encounter);
        this.uploadedId = res;
        setTimeout(() => {
          this.uploaded = true;
        }, 25);
      } catch (err: any) {
        const response = err.response;
        if (response) {
          this.uploadErr = response.data.message;
          this.uploadFailed = true;
        } else {
          this.uploadErr = err.message;
          this.uploadFailed = true;
        }
      }
    },
  },
  computed: {
    ...mapGetters(["isSupportedBoss", "abbrNum"]),
  },
});
</script>

<style scoped>
.c-102 {
  background-color: #ee2e48b7;
}
.c-103 {
  background-color: #7b9aa2;
}
.c-104 {
  background-color: #e1907e;
}
.c-105 {
  background-color: #ff9900;
}
.c-202 {
  background-color: #b38915;
}
.c-203 {
  background-color: #22aa99;
}
.c-204 {
  background-color: #674598;
}
.c-205 {
  background-color: #66aa00;
}
.c-302 {
  background-color: #aa5611;
}
.c-303 {
  background-color: #990099;
}
.c-304 {
  background-color: #316395;
}
.c-305 {
  background-color: #1f21c5d3;
}
.c-312 {
  background-color: #994499;
}
.c-402 {
  background-color: #a91a16;
}
.c-403 {
  background-color: #0099c6;
}
.c-404 {
  background-color: #109618;
}
.c-502 {
  background-color: #dd4477;
}
.c-503 {
  background-color: #4442a8;
}
.c-504 {
  background-color: #33670b;
}
.c-505 {
  background-color: #3b4292;
}
.c-512 {
  background-color: #6bcec2;
}
</style>
