<template>
  <v-expansion-panels>
    <v-expansion-panel rounded="sm">
      <v-progress-linear model-value="100" height="7" color="indigo">
      </v-progress-linear>
      <v-expansion-panel-title class="py-3 ps-4">
        <h3>
          <v-icon color="red" icon="mdi-chart-timeline-variant"></v-icon>
          Party DPS Over Time
        </h3>
      </v-expansion-panel-title>
      <v-expansion-panel-text>
        <section>
          <figure>
            <v-chart
              class="dps-chart"
              :option="data"
              autoresize
              theme="custom-dark"
              :init-options="initOptions"
            >
            </v-chart>
          </figure>
        </section>
      </v-expansion-panel-text>
    </v-expansion-panel>
  </v-expansion-panels>
</template>

<script lang="ts">
import { Entity, ENTITY_TYPE } from "@/interfaces/session.interface";
import { EChartsOption, SeriesOption } from "echarts/types/dist/shared";
import { defineComponent, ref } from "vue";

export default defineComponent({
  name: "PartyDpsGraph",

  props: {
    dpsIntervals: Object,
    entities: [Object],
    duration: Number,
  },

  mounted() {
    const entities = this.entities as Entity[];
    this.legend = entities.map(
      (e) => `${this.$t(`classes.${e.classId}`)} (${e.iid})`
    );

    entities.sort((a, b) => a.stats.damageDealt - b.stats.damageDealt);

    this.intervals = this.dpsIntervals?.map((i: number) =>
      this.getTimeShortform(i)
    );
    const series = this.generateSeries(entities);
    this.series = series;
  },

  methods: {
    generateSeries(entities: Entity[]) {
      const series: SeriesOption[] = [];
      const players = entities?.filter(
        (e: Entity) => e.type === ENTITY_TYPE.PLAYER
      );

      players.forEach((e) => {
        let entityName = `${this.$t(`classes.${e.classId}`)} (${e.iid})`;
        series.push({
          name: entityName,
          type: "line",
          stack: "Total",
          color: this.classColors[e.classId],
          areaStyle: {},
          emphasis: {
            focus: "series",
          },
          data: e.stats.dpsOverTime,
        } as SeriesOption);
      });

      return series;
    },
    getTimeShortform(time: number) {
      const seconds = time / 1000;
      const date = new Date(0);
      date.setSeconds(seconds);

      // No way itll be an hour long right lol
      if (date.getMinutes() > 0)
        return `${
          date.getMinutes() > 9 ? date.getMinutes() : "0" + date.getMinutes()
        }:${
          date.getSeconds() > 9 ? date.getSeconds() : "0" + date.getSeconds()
        }`;
      else
        return `00:${
          date.getSeconds() > 9 ? date.getSeconds() : "0" + date.getSeconds()
        }`;
    },
  },

  setup() {
    let dataInterval = ref(5 * 1000); // 5s data interval
    let legend = ref([] as string[]);
    let intervals = ref([] as string[]);
    let series = ref([] as SeriesOption[]);
    let data = ref({
      tooltip: {
        trigger: "axis",
        axisPointer: {
          type: "cross",
          label: {
            backgroundColor: "#6a7985",
          },
        },
      },
      legend: {
        data: legend as any,
      },
      toolbox: {
        feature: {
          restore: {},
          dataZoom: {},
          saveAsImage: {},
        },
      },
      grid: {
        left: "3%",
        right: "4%",
        bottom: "3%",
        containLabel: true,
      },
      xAxis: [
        {
          type: "category",
          boundaryGap: false,
          data: intervals,
        },
      ],
      yAxis: [
        {
          type: "value",
        },
      ],
      series: series,
      aria: {
        enabled: true,
        decal: {
          show: true,
        },
      },
    } as EChartsOption);
    let initOptions = ref({ renderer: "canvas" });
    let classColors = ref({
      0: "#541165",
      101: "#6633cc",
      102: "#ee2e48",
      103: "#7b9aa2",
      104: "#E1907E",
      105: "#ff9900",
      201: "#df2871",
      202: "#b38915",
      203: "#22aa99",
      204: "#674598",
      205: "#66aa00",
      301: "#dc3912",
      302: "#aa5611",
      303: "#990099",
      304: "#316395",
      305: "#1f21c5d3",
      311: "#3366cc",
      312: "#994499",
      401: "#3752d8",
      402: "#a91a16",
      403: "#0099c6",
      404: "#109618",
      501: "#184B4D",
      502: "#dd4477",
      503: "#4442a8",
      504: "#33670b",
      505: "#3b4292",
      511: "#541165",
      512: "#6bcec2",
    } as { [key: number]: string });

    return {
      dataInterval,
      legend,
      intervals,
      series,
      data,
      initOptions,
      classColors,
    };
  },
});
</script>

<style scoped>
.dps-chart {
  min-height: 300px !important;
}
</style>
