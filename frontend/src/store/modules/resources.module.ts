import { Zone, ZoneType } from "@/interfaces/session.interface";
import { Module } from "vuex";

/**
 * Module containing game resource values (classes, bosses, dungeons etc)
 */
export const resources: Module<any, any> = {
  state: () => ({
    classes: [
      102, 103, 104, 105, 202, 203, 204, 205, 302, 303, 304, 305, 312, 402, 403,
      404, 502, 503, 504, 505, 512, 601, 602, 603,
    ],
    zones: [
      {
        id: 2,
        type: ZoneType.AbyssRaid,
        bosses: [634000],
      },
      {
        id: 3,
        type: ZoneType.AbyssRaid,
        bosses: [634010],
      },
      {
        id: 4,
        type: ZoneType.AbyssRaid,
        bosses: [634020],
      },
      {
        id: 5,
        type: ZoneType.AbyssalDungeon,
        bosses: [494206, 494207],
      },
      {
        id: 6,
        type: ZoneType.AbyssalDungeon,
        bosses: [494209, 494210],
      },
      {
        id: 7,
        type: ZoneType.AbyssalDungeon,
        bosses: [494407, 494408],
      },
      {
        id: 8,
        type: ZoneType.AbyssalDungeon,
        bosses: [494415, 494416],
      },
      {
        id: 9,
        type: ZoneType.LegionRaid,
        bosses: [480005, 480006, 480009, 480010, 480011],
      },
      {
        id: 10,
        type: ZoneType.LegionRaid,
        bosses: [480007, 480008, 42060070],
      },
      {
        id: 11,
        type: ZoneType.LegionRaid,
        bosses: [480208, 480209],
      },
      {
        id: 12,
        type: ZoneType.LegionRaid,
        bosses: [480210],
      },
      {
        id: 13,
        type: ZoneType.LegionRaid,
        bosses: [480211],
      },
      {
        id: 14,
        type: ZoneType.LegionRaid,
        bosses: [480601],
      },
      {
        id: 15,
        type: ZoneType.LegionRaid,
        bosses: [480611],
      },
      {
        id: 16,
        type: ZoneType.LegionRaid,
        bosses: [480631, 480635],
      },
      {
        id: 17,
        type: ZoneType.LegionRaid,
        bosses: [480815],
      },
      {
        id: 18,
        type: ZoneType.LegionRaid,
        bosses: [
          480805, 480874, 480875, 480876, 480806, 480807, 480877, 480878,
          480803, 480804, 480802,
        ],
      },
      {
        id: 19,
        type: ZoneType.LegionRaid,
        bosses: [480808, 480809],
      },
      {
        id: 20,
        type: ZoneType.LegionRaid,
        bosses: [480810],
      },
      {
        id: 21,
        type: ZoneType.LegionRaid,
        bosses: [480811],
      },
      {
        id: 22,
        type: ZoneType.LegionRaid,
        bosses: [480813],
      },
      {
        id: 23,
        type: ZoneType.LegionRaid,
        bosses: [480814],
      },
      {
        id: 24,
        type: ZoneType.Guardian,
        bosses: [
          509006, 512015, 620010, 622080, 630210, 632910, 633410, 634140,
        ],
      },
      {
        id: 25,
        type: ZoneType.Guardian,
        bosses: [
          512002, 620050, 620051, 620052, 622040, 622110, 624020, 630530,
          630810, 632730, 633720,
        ],
      },
      {
        id: 26,
        type: ZoneType.Guardian,
        bosses: [
          512004, 512014, 620210, 622010, 624010, 632830, 633230, 633620,
          720011,
        ],
      },
      {
        id: 27,
        type: ZoneType.Guardian,
        bosses: [512006, 512013, 620200, 622020, 632630, 633820],
      },
      {
        id: 28,
        type: ZoneType.ChallengeGuardian,
        bosses: [512008, 634130],
      },
      {
        id: 29,
        type: ZoneType.ChallengeGuardian,
        bosses: [512009, 634190],
      },
      {
        id: 30,
        type: ZoneType.ChallengeGuardian,
        bosses: [512011, 634120],
      },
      {
        id: 31,
        type: ZoneType.ChallengeGuardian,
        bosses: [512012, 634110],
      },
      {
        id: 32,
        type: ZoneType.Guardian,
        bosses: [
          512016, 620040, 622160, 630110, 630830, 632810, 633210, 633610,
          634220,
        ],
      },
      {
        id: 33,
        type: ZoneType.Guardian,
        bosses: [
          512017, 620060, 620061, 622030, 622100, 624021, 630820, 632930,
          633430, 633630,
        ],
      },
      {
        id: 34,
        type: ZoneType.Guardian,
        bosses: [
          512019, 620190, 622150, 630320, 631820, 632710, 633520, 634170,
        ],
      },
      {
        id: 35,
        type: ZoneType.Guardian,
        bosses: [
          512020, 620020, 622070, 630310, 630510, 631830, 633530, 634200,
        ],
      },
      {
        id: 36,
        type: ZoneType.Guardian,
        bosses: [512022, 620030, 622050, 630330, 630930, 633330, 634150],
      },
      {
        id: 37,
        type: ZoneType.Guardian,
        bosses: [
          512023, 620070, 620071, 622060, 630520, 630920, 632620, 633320,
          634160,
        ],
      },
      {
        id: 38,
        type: ZoneType.Guardian,
        bosses: [512025, 620150, 622170, 630610, 633840, 634180],
      },
      {
        id: 39,
        type: ZoneType.Guardian,
        bosses: [512027, 620180, 622200, 630020, 633710, 634210],
      },
      {
        id: 40,
        type: ZoneType.Guardian,
        bosses: [593007, 593017, 620260],
      },
      {
        id: 41,
        type: ZoneType.Guardian,
        bosses: [620080, 622090, 630420, 630910, 632720, 633310, 634240],
      },
      {
        id: 42,
        type: ZoneType.Guardian,
        bosses: [620100, 622140, 630220, 632820, 633220, 633730, 634250],
      },
      {
        id: 43,
        type: ZoneType.Guardian,
        bosses: [620110, 622130, 630620, 631810, 632610, 633510, 634230],
      },
      {
        id: 44,
        type: ZoneType.Guardian,
        bosses: [620140, 620145, 620146, 624140],
      },
      {
        id: 45,
        type: ZoneType.Guardian,
        bosses: [620160, 620250, 620270, 622210, 630030],
      },
      {
        id: 46,
        type: ZoneType.Guardian,
        bosses: [
          620170, 622120, 623070, 630120, 630410, 632920, 633420, 633830,
        ],
      },
      {
        id: 47,
        type: ZoneType.Guardian,
        bosses: [620220, 622190, 623031, 624030, 633810],
      },
      {
        id: 48,
        type: ZoneType.Guardian,
        bosses: [620230, 620237, 620238],
      },
      {
        id: 49,
        type: ZoneType.Guardian,
        bosses: [620240, 620241, 620242],
      },
      {
        id: 50,
        type: ZoneType.Guardian,
        bosses: [620280, 620281],
      },
      {
        id: 51,
        type: ZoneType.Guardian,
        bosses: [620290, 620295],
      },
    ],
    supportedBosses: [] as number[],
  }),
  getters: {
    classes(state) {
      return state.classes;
    },
    zones(state) {
      return state.zones;
    },
    supportedBosses(state) {
      return state.supportedBosses;
    },
  },
  mutations: {
    setSupportedBosses(state, payload) {
      state.supportedBosses = payload;
    },
  },
  actions: {
    getSupportedBosses(context): Promise<number[]> {
      const { dispatch, getters, rootGetters, commit } = context;
      const app = rootGetters.app;

      if (getters.supportedBosses.length > 0) {
        return JSON.parse(JSON.stringify(getters.supportedBosses));
      }

      dispatch("info", "[WS] Getting supported boss IDs");
      return new Promise((resolve, reject) => {
        const io = app.config.globalProperties.$io;
        io.timeout(5000).emit(
          "supported_bosses",
          {},
          (err: Error, res: number[]) => {
            if (err) {
              dispatch("error", err.message);
              reject(err);
            } else {
              commit("setSupportedBosses", res);
              resolve(res);
            }
          }
        );
      });
    },
    getTrackedZones(context) {
      const { dispatch, rootGetters } = context;
      const app = rootGetters.app;

      dispatch("info", "[WS] Getting tracked zones");
      return new Promise((resolve, reject) => {
        const io = app.config.globalProperties.$io;
        io.timeout(5000).emit(
          "tracked_zones",
          {},
          (err: Error, res: Zone[]) => {
            if (err) {
              dispatch("error", err.message);
              reject(err);
            } else {
              resolve(res);
            }
          }
        );
      });
    },
  },
};
