<template>
  <v-card
    min-width="100%"
    max-width="100%"
    class="mx-auto"
    border="indigo"
    rounded="sm"
    hover
    @click="openLog($props.session?.id)"
  >
    <v-card-content class="pa-3">
      <v-row style="background-image: url(/img/app-bar-loaders/0.jpg)">
        <v-progress-linear model-value="100" height="7" color="indigo">
        </v-progress-linear>
        <v-col cols="5" class="bg-grey-darken-4">
          <v-row class="mt-1 mb-4">
            <span class="ms-2 mt-1 mb-0" style="font-size: 14pt">
              <v-icon start icon="mdi-help"></v-icon
              >{{
                $props.session?.encounter !== "Unknown"
                  ? $props.session?.encounter
                  : "Unknown Encounter"
              }}
            </span>
          </v-row>
          <v-row justify="center" class="ps-2 pe-2 mb-1">
            <v-col cols="auto" class="pa-0">
              <span class="text-error d-flex">
                <v-icon start icon="mdi-sword"></v-icon
                >{{
                  new Intl.NumberFormat().format(
                    $props.session?.damageStatistics?.totalDamageDealt
                  )
                }}
              </span>
            </v-col>
            <v-divider vertical class="mx-2"></v-divider>
            <v-col cols="auto" class="pa-0">
              <span class="text-success d-flex">
                <v-icon start icon="mdi-timer-outline"></v-icon
                >{{
                  getDuration($props.session?.started, $props.session?.ended)
                }}
              </span>
            </v-col>
            <v-divider vertical class="mx-2"></v-divider>
            <v-col cols="auto" class="pa-0">
              <span class="text-info d-flex">
                <v-icon start icon="mdi-cloud-upload-outline"></v-icon
                >{{ timeSince($props.session?.createdAt) }}
              </span>
            </v-col>
          </v-row>
        </v-col>
        <v-col
          cols="7"
          class="pt-3 pb-2 align-self-center"
          style="max-height: 500px"
        >
          <v-row dense>
            <EntityCard
              v-for="entity in $props.session?.entities"
              :key="entity.id"
              :entity="entity"
            ></EntityCard>
          </v-row>
        </v-col>
      </v-row>
    </v-card-content>
  </v-card>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import EntityCard from "@/components/home/entity.component.vue";
import dayjs from "dayjs";
import { Session } from "@/interfaces/session.interface";

export default defineComponent({
  name: "EncounterCard",

  props: {
    session: Object,
  },

  components: {
    EntityCard,
  },

  methods: {
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
      const since = dayjs(date).fromNow(false);
      return since.replace("minutes", "min");
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
  },
});
</script>
