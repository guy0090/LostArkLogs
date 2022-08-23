<template>
  <v-container v-if="!fileLoaded" style="height: 100%">
    <v-row align="center" justify="center" style="height: 100%">
      <v-col cols="4">
        <v-file-input
          prepend-icon="mdi-upload"
          accept=".enc,.log"
          label="Log File"
          v-on:change="onFileChange"
          variant="outlined"
        ></v-file-input>
      </v-col>
    </v-row>
  </v-container>
  <Log v-else-if="logType === 'enc'" :uSession="session" :isUpload="true"></Log>
  <v-container fluid v-else>
    <v-row class="my-1" justify="center">
      <v-col cols="7">
        <v-row class="mb-5 px-1">
          <v-btn color="warning" v-on:click="goBack">Back</v-btn>
        </v-row>
        <v-row class="mb-2">
          <RawDetails :details="rawDetails" />
        </v-row>
        <v-row class="mt-1 mb-0" v-if="unlistedUpload" justify="center">
          <v-col cols="auto" align-self="center">
            <h3>
              <v-icon icon="mdi-information" color="white" /> Encounters
              associated with an unlisted log will not show up when searching
              encounters.
            </h3>
          </v-col>
        </v-row>
        <!--
        <v-row>
          <v-spacer />
          <v-col cols="auto">
            <v-checkbox
              v-model="unlistedUpload"
              label="Unlisted"
              color="success"
              hide-details
            ></v-checkbox>
          </v-col>
          <v-col cols="auto">
            <v-checkbox
              v-model="guestUpload"
              label="Upload as guest"
              color="success"
              hide-details
              :disabled="!uploadToken"
            ></v-checkbox>
          </v-col>
          <v-col cols="auto" align-self="center">
            <v-btn
              v-if="!uploaded"
              color="indigo"
              v-on:click="uploadRawLog"
              :disabled="uploading || uploadError !== ''"
              >{{ uploading ? "Uploading..." : "Upload" }}</v-btn
            >
            <v-btn v-else color="success"> Uploaded! </v-btn>
          </v-col>
        </v-row>
        <v-row justify="center" v-if="uploadError !== ''">
          <v-col class="px-0" cols="8">
            <v-alert
              class="my-2"
              prominent
              closable
              icon="mdi-alert-circle-outline"
              :elevation="0"
              color="red-darken-3"
            >
              Failed to upload: {{ uploadError }}
            </v-alert>
          </v-col>
        </v-row>
        -->
        <v-row class="mt-3 mb-2 px-1">
          <h3 style="color: grey">
            Parsed
            <span style="color: white">{{ rawDetails.found }}</span>
            potential encounters and found
            <span style="color: white">{{ rawDetails.parsed }}</span>
            valid encounter{{ rawDetails.parsed === 1 ? "" : "s" }}.
          </h3>
        </v-row>
        <v-row class="my-3">
          <v-card
            min-width="100%"
            max-width="100%"
            class="mx-auto"
            rounded="sm"
          >
            <v-progress-linear model-value="100" height="7" color="indigo">
            </v-progress-linear>
            <v-card-content>
              <v-row>
                <v-col cols="auto">
                  <v-avatar color="indigo" icon="mdi-upload"></v-avatar>
                </v-col>
                <v-col class="align-self-center">
                  <v-row>
                    <h2>Valid Encounters</h2>
                  </v-row>
                  <v-row class="pt-3">
                    Encounters listed here were successfully parsed and can be
                    uploaded
                  </v-row>
                </v-col>
              </v-row>
            </v-card-content>
          </v-card>
        </v-row>
        <v-row
          class="mt-2"
          v-for="(session, index) in rawDetails.encounters"
          :key="index"
        >
          <EncounterCard
            class="mb-1"
            :session="session"
            :raw="true"
            :colors="false"
          />
        </v-row>
        <!--
        <v-row class="my-3">
          <v-expansion-panels>
            <v-expansion-panel v-if="rawDetails.results.length === 0">
              <v-progress-linear model-value="100" height="7" color="indigo">
              </v-progress-linear>
              <v-expansion-panel-title class="ps-4">
                <v-row>
                  <v-col cols="auto">
                    <v-avatar color="indigo" icon="mdi-upload"></v-avatar>
                  </v-col>
                  <v-col class="align-self-center">
                    <v-row>
                      <h2>Valid Encounters</h2>
                    </v-row>
                    <v-row class="pt-3">
                      Any encounters listed here will be uploaded as well.
                    </v-row>
                  </v-col>
                </v-row>
              </v-expansion-panel-title>
              <v-expansion-panel-text>
                <v-row
                  class="mt-2"
                  v-for="(session, index) in rawDetails.encounters"
                  :key="index"
                >
                  <EncounterCard
                    class="mb-1"
                    :session="session"
                    :raw="true"
                    :colors="false"
                  />
                </v-row>
              </v-expansion-panel-text>
            </v-expansion-panel>
            <v-expansion-panel v-else>
              <v-progress-linear model-value="100" height="7" color="indigo">
              </v-progress-linear>
              <v-expansion-panel-title class="ps-4">
                <v-row>
                  <v-col cols="auto">
                    <v-avatar color="indigo" icon="mdi-check"></v-avatar>
                  </v-col>
                  <v-col class="align-self-center">
                    <v-row>
                      <h2>Uploaded Encounters</h2>
                    </v-row>
                    <v-row class="pt-3">
                      Right click any encounter to open in a new tab.
                    </v-row>
                  </v-col>
                </v-row>
              </v-expansion-panel-title>
              <v-expansion-panel-text>
                <v-row class="mt-1">
                  <EncounterCard
                    class="mb-1"
                    v-for="(session, index) in rawDetails.results"
                    :key="index"
                    :session="session"
                    :raw="false"
                    :result="true"
                    :colors="false"
                  />
                </v-row>
              </v-expansion-panel-text>
            </v-expansion-panel>
          </v-expansion-panels>
        </v-row>
        -->
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { defineComponent, reactive, ref } from "vue";
import { mapGetters, mapActions } from "vuex";
import pako from "pako";
import { v4 as uuidv4 } from "uuid";
import { PacketParser } from "@/log-parsing/parser";
import {
  EntityType,
  RawSessionDetails,
  SkillBreakdown,
  UEntity,
  USession,
  Zone,
  ZoneType,
} from "@/interfaces/session.interface";

import Log from "@/components/logs/log.component.vue";
import RawDetails from "@/components/logs/log/raw/details.component.vue";
import EncounterCard from "@/components/home/encounter.component.vue";
import axios, { AxiosRequestConfig } from "axios";
import { Session } from "@/interfaces/session.interface";

export default defineComponent({
  name: "UploadedLog",

  components: {
    Log,
    RawDetails,
    EncounterCard,
  },

  mounted() {
    if (!this.uploadToken) this.guestUpload = true;
  },

  setup() {
    let fileLoaded = ref(false);
    let session = ref({} as USession | undefined);
    let logType = ref("" as "" | "enc" | "raw");
    let unlistedUpload = ref(false);
    let guestUpload = ref(false);
    let rawDetails = reactive({
      data: "",
      name: "",
      date: new Date(),
      parsed: 0,
      found: 0,
      dropped: 0,
      encounters: [],
      results: [],
    } as RawSessionDetails);
    let uploadError = ref("");
    let uploading = ref(false);
    let uploaded = ref(false);

    return {
      fileLoaded,
      session,
      logType,
      unlistedUpload,
      guestUpload,
      rawDetails,
      uploadError,
      uploading,
      uploaded,
    };
  },

  methods: {
    ...mapActions(["info", "error", "getLogWS"]),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async onFileChange(e: any) {
      try {
        const file = e.target.files[0] as File;
        this.rawDetails.name = file.name;
        if (file.name.endsWith(".log")) {
          this.logType = "raw";

          const data = await file.text();
          this.rawDetails.data = data;

          this.info("Reading in raw log");
          this.readRawSession(data);
        } else if (file.name.endsWith(".enc")) {
          this.logType = "enc";

          const data = await file.arrayBuffer();

          this.info("Reading in enc log");
          this.readSession(data);
        }
      } catch (err) {
        this.uploadError = (err as Error).message;
        console.error(err);
      }
    },
    reformatUpload(session: USession) {
      const clone: USession = JSON.parse(JSON.stringify(session));

      clone.entities = clone.entities.filter(
        (e) => e.type !== EntityType.MONSTER && e.type !== EntityType.UNKNOWN
      );

      const bosses = clone.entities.filter(
        (e) => e.type === EntityType.BOSS || e.type === EntityType.GUARDIAN
      );
      // If multiple bosses are logged, only keep the most recent one
      if (bosses.length > 1) {
        const filtered = bosses
          .sort((a, b) => b.lastUpdate - a.lastUpdate)
          .slice(1)
          .map((e) => e.id);

        clone.entities = clone.entities.filter((e) => !filtered.includes(e.id));
      }

      // Generate data intervals
      const intervals = this.generateIntervals(
        clone.firstPacket,
        clone.lastPacket
      );
      clone.damageStatistics.dpsIntervals = intervals;

      // Create DPS over time data for ECharts for each player entity
      for (const e of clone.entities) {
        if (e.type === EntityType.PLAYER) {
          e.id = uuidv4();
          e.gearLevel = parseFloat(e.gearLevel as string);
          delete e.name;
          e.stats.dpsOverTime = this.getEntityData(
            intervals,
            e,
            clone.firstPacket
          );
        }
      }

      // Remove breakdowns; Not needed anymore
      clone.entities.forEach((e) => {
        Object.values(e.skills).forEach((s) => {
          delete s.breakdown;
        });
      });

      return clone;
    },
    async readRawSession(data: string) {
      const parser = new PacketParser(this.zones);

      const lines = data.trim().replace(/\r?\n/g, "\n").split("\n");
      const { encounters, parsed, found, dropped } = parser.parseLog(lines);

      this.rawDetails.found = found;
      this.rawDetails.dropped = dropped;
      if (encounters.length > 0) {
        this.rawDetails.date = new Date(encounters[0].firstPacket);
        this.rawDetails.parsed = parsed;

        this.rawDetails.encounters = encounters;
      }
      this.fileLoaded = true;
    },
    async readSession(data: ArrayBuffer) {
      try {
        console.time("readSession");
        let restored: USession = JSON.parse(
          pako.inflate(data, { to: "string" })
        );
        restored = this.reformatUpload(restored);
        console.timeEnd("readSession");

        restored.entities.forEach((e) => {
          e.skills = Object.values(e.skills);
        });

        restored.duration = restored.lastPacket - restored.firstPacket;
        this.session = restored;
        this.fileLoaded = true;
      } catch (e) {
        console.error(e);
        throw e;
      }
    },
    generateIntervals(started: number, ended: number) {
      const duration = ended - started;
      const intervals = [];

      const parts = duration / 5000;
      for (let i = 0; i <= Math.floor(parts); i++) {
        if (i === Math.floor(parts)) intervals.push(parts * 5000);
        else intervals.push(i * 5000);
      }
      return intervals;
    },
    getEntityData(intervals: number[], player: UEntity, started: number) {
      const data: number[] = [];

      intervals.forEach((i) => {
        const damage = this.getEntityDamageInRange(
          started,
          started + i,
          player
        );
        const dps = parseFloat(this.getEntityDPS(i / 1000, damage));
        data.push(dps);
      });

      return data;
    },
    getEntityDamageInRange(begin: number, end: number, entity: UEntity) {
      const skills = Object.values(entity.skills);
      const damageDealtInRange = skills.reduce((acc, skill) => {
        const skillEntries = (skill.breakdown as SkillBreakdown[]).filter(
          (d) => d.timestamp >= begin && d.timestamp <= end
        );
        return acc + skillEntries.reduce((acc, d) => acc + d.damage, 0);
      }, 0);

      if (!damageDealtInRange || isNaN(damageDealtInRange)) return 0;
      return damageDealtInRange;
    },
    getEntityDPS(duration: number, damage: number) {
      return damage > 0 ? (damage / duration).toFixed(2) : "0";
    },
    resetRawDetails() {
      this.rawDetails.name = "";
      this.rawDetails.date = new Date();
      this.rawDetails.parsed = 0;
      this.rawDetails.found = 0;
      this.rawDetails.dropped = 0;
      this.rawDetails.encounters = [];
      this.rawDetails.results = [];
    },
    goBack() {
      this.resetRawDetails();
      this.logType = "";
      this.uploadError = "";
      this.uploading = false;
      this.uploaded = false;
      this.fileLoaded = false;
    },
    uploadRawLog() {
      this.uploading = true;
      // Timeout to let uploading ref update; Compression will hang UI even on semi-large files
      setTimeout(() => {
        try {
          if (this.rawDetails.data === "") throw new Error("Upload is invalid");
          const compressed = pako.gzip(this.rawDetails.data);

          const request = {
            url: `${this.apiUrl}/logs/raw/upload?unlisted=${
              this.unlistedUpload ? "1" : "0"
            }`,
            method: "POST",
            withCredentials: !this.guestUpload,
            headers: {
              "Content-Type": "application/octet-stream",
            },
            data: compressed,
          } as AxiosRequestConfig;

          axios(request)
            .then(async (response) => {
              this.uploaded = true;

              const associated = response.data.children;
              const logs: Session[] = [];
              for (const id of associated) {
                const log = await this.getLog(id);
                logs.push(log);
              }

              this.rawDetails.encounters = [];
              this.rawDetails.results = logs;
            })
            .catch((uploadErr) => {
              const err = uploadErr.response.data
                ? uploadErr.response.data.message
                : uploadErr.message;

              this.uploadError = err;
              console.error("Upload error", err);
            });
        } catch (e) {
          this.uploadError = (e as Error).message;
          console.error("Error uploading raw log", (e as Error).message);
          throw e;
        }
      }, 10);
    },
    async getLog(id: string) {
      try {
        const log: Session = await this.getLogWS(id);
        return log;
      } catch (e) {
        console.error(e);
        throw e;
      }
    },
  },
  computed: {
    ...mapGetters(["uploadToken", "apiUrl", "zones"]),
  },
});
</script>
