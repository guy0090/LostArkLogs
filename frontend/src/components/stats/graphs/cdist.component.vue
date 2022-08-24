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
import { defineComponent, ref } from "vue";
import { EChartsOption, PieSeriesOption } from "echarts/types/dist/shared";
import { mapActions } from "vuex";

export default defineComponent({
  name: "ClassDistributionGraph",

  mounted() {
    this.fetchClassDistribution().then((dist) => {
      const data = this.generateData(dist);
      this.series.data = data;
    });
  },

  setup() {
    let legend = ref([] as string[]);
    let data = ref([] as any[]);
    let series = ref({
      name: "Class",
      type: "pie",
      radius: ["40%", "80%"],
      avoidLabelOverlap: false,
      label: {
        show: false,
        position: "center",
      },
      emphasis: {
        label: {
          show: true,
          fontSize: "40",
          fontWeight: "bold",
        },
      },
      labelLine: {
        show: false,
      },
      data: [],
      left: "25%",
    } as PieSeriesOption);
    let config = ref({
      legend: {
        data: legend as any,
        top: 25,
        // type: "scroll",
        orient: "vertical",
        left: "left",
      },
      tooltip: {
        trigger: "item",
        formatter: "{a} <br/>{b} : {c} ({d}%)",
      },
      toolbox: {
        feature: {
          restore: {},
          saveAsImage: {},
        },
      },
      series: series,
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
      legend,
      data,
      series,
      config,
      initOptions,
      classColors,
    };
  },

  methods: {
    ...mapActions(["fetchClassDistribution"]),
    generateData(dist: { [key: number]: number }) {
      const total = Object.values(dist).reduce((a, b) => a + b, 0);

      const data = [];
      for (let key in dist) {
        if (key === "0") continue;

        const className = this.$t(`classes.${key}`);
        this.legend.push(className);

        const val = parseFloat(((dist[key] / total) * 100).toFixed(2));

        data.push({
          name: className,
          value: val,
          itemStyle: {
            color: this.classColors[key],
          },
          valueFormatter: (value: number) => value + "%",
        });
      }
      data.sort((a, b) => b.value - a.value);
      this.legend.sort((a, b) => a.localeCompare(b));
      return data;
    },
  },
});
</script>

<style scoped>
.chart {
  min-height: 450px !important;
}
</style>
