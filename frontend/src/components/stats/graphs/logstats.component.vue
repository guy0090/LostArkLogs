<template>
  <section>
    <figure>
      <v-chart
        class="chart"
        :option="config"
        autoresize
        theme="custom-dark"
        :init-options="initOptions"
      >
      </v-chart>
    </figure>
  </section>
</template>

<script lang="ts">
import { defineComponent, PropType, ref } from "vue";

import { EChartsOption, PieSeriesOption } from "echarts/types/dist/shared";

export default defineComponent({
  name: "LogStatsGraph",

  props: {
    type: String as PropType<"vis" | "region">,
    gData: Array,
  },

  mounted() {
    switch (this.type) {
      case "vis":
        this.title = "Encounter Visibility";
        this.labelName = "Visibility";
        this.legend = ["Public", "Unlisted"];
        break;
      case "region":
        this.title = "Encounters By Region";
        this.labelName = "Region";
        this.legend = ["Unknown", "Korea", "Steam"];
        break;
    }
    this.data = this.generateSeries(this.type);
  },

  setup() {
    const title = ref("");
    const labelName = ref("");
    const legend = ref([] as string[]);
    const data = ref([] as any[]);
    const series = ref({
      name: labelName as any,
      type: "pie",
      avoidLabelOverlap: true,
      label: {
        show: false,
      },
      data: data as any,
    } as PieSeriesOption);
    const config = ref({
      title: {
        subtext: title as any,
        left: "center",
        top: -15,
      },
      legend: {
        data: legend as any,
        // type: "scroll",
        orient: "vertical",
        left: "left",
        top: "30",
      },
      tooltip: {
        trigger: "item",
      },
      toolbox: {
        feature: {
          restore: {},
        },
      },
      series: series,
    } as EChartsOption);
    const initOptions = ref({ renderer: "canvas" });

    return {
      title,
      labelName,
      legend,
      data,
      series,
      config,
      initOptions,
    };
  },

  methods: {
    generateSeries(type: "vis" | "region" | undefined) {
      if (!type) return [];

      let data: any[] = [];
      const gData = JSON.parse(JSON.stringify(this.gData));

      switch (type) {
        case "vis":
          data = [
            {
              name: "Public",
              value: gData.find((d: any) => !d._id).count,
            },
            {
              name: "Unlisted",
              value: gData.find((d: any) => d._id).count,
            },
          ];
          break;
        case "region":
          data = [
            {
              name: "Unknown",
              value: gData.find((d: any) => d._id === "Unknown").count,
            },
            {
              name: "Korea",
              value: gData.find((d: any) => d._id === "korea").count,
            },
            {
              name: "Steam",
              value: gData.find((d: any) => d._id === "steam").count,
            },
          ];
          break;
      }
      return data;
    },
  },
});
</script>

<style scoped>
.chart {
  min-height: 250px !important;
}
</style>
