import { SupportedRaid } from "@/interfaces/util.interface";
import { Module } from "vuex";

/**
 * Module containing game resource values (classes, bosses, dungeons etc)
 */
export const resources: Module<any, any> = {
  state: () => ({
    supportedBossIds: [] as number[],
    supportedBosses: {
      abyssRaids: [
        {
          dungeonName: "Argos",
          disabled: false,
          bosses: [634000, 634010, 634020], // P1, P2, P3
        },
      ],
      abyssalDungeons: [
        {
          dungeonName: "Aira's Oculus (HM)",
          disabled: false,
          bosses: [
            494209, // Frenzied Cicerra
            494210, // Lost Seto
          ],
        },
        {
          dungeonName: "Oreha Prevaza (HM)",
          disabled: false,
          bosses: [
            494415, // Angry Moguro Captain
            494416, // Corrupted Albion,
          ],
        },
      ],
      legionRaids: [
        {
          dungeonName: "Valtan",
          disabled: false,
          bosses: [
            480005, // Leader Lugaru
            480006, // Destroyer Lucas
            480007, // Demon Beast Commander Valtan
            480008, // Torn Demon Beast Lord (Valtan ghost phase?)
            480009, // Dark Mountain Predator (Lucas/Lugaru single form)
            480010, // Dark Mountain Predator (^)
            480011, // Dark Mountain Predator (^)
          ],
        },
        {
          dungeonName: "Vykas",
          disabled: false,
          bosses: [
            480208, // Incubus Morphe
            480209, // Nightmarish Morphe
            480210, // Covetous Devourer Vykas (?)
            480211, // Covetous Devourer Vykas (?)
          ],
        },
      ],
      /* Guardians */
      guardians: [
        509006, 512002, 512004, 512006, 512008, 512009, 512011, 512012, 512013,
        512014, 512015, 512016, 512017, 512019, 512020, 512022, 512023, 512025,
        512027, 593007, 593017, 620010, 620020, 620030, 620040, 620050, 620051,
        620052, 620060, 620061, 620070, 620071, 620080, 620100, 620110, 620140,
        620145, 620146, 620150, 620170, 620180, 620190, 620200, 620210, 620220,
        620230, 620237, 620238, 620240, 620241, 620242, 620260, 622010, 622020,
        622030, 622040, 622050, 622060, 622070, 622080, 622090, 622100, 622110,
        622120, 622130, 622140, 622150, 622160, 622170, 622190, 622200, 623031,
        623070, 624010, 624020, 624021, 624030, 624140, 630020, 630110, 630120,
        630210, 630220, 630310, 630320, 630330, 630410, 630420, 630510, 630520,
        630530, 630610, 630620, 630810, 630820, 630830, 630910, 630920, 630930,
        631810, 631820, 631830, 632610, 632620, 632630, 632710, 632720, 632730,
        632810, 632820, 632830, 632910, 632920, 632930, 633210, 633220, 633230,
        633310, 633320, 633330, 633410, 633420, 633430, 633510, 633520, 633530,
        633610, 633620, 633630, 633710, 633720, 633730, 633810, 633820, 633830,
        633840, 634110, 634120, 634130, 634140, 634150, 634160, 634170, 634180,
        634190, 634200, 634210, 634220, 634230, 634240, 634250, 720011, 620290,
        620295, 620160, 620250, 620270, 622210, 630030, 620281, 620280,
      ],
    },
    classes: [
      102, 103, 104, 105, 202, 203, 204, 205, 302, 303, 304, 305, 312, 402, 403,
      404, 502, 503, 504, 505, 512,
    ],
  }),
  getters: {
    supportedBossIds: (state) => state.supportedBossIds,
    supportedBosses(state) {
      return state.supportedBosses;
    },
    classes(state) {
      return state.classes;
    },
    isSupportedBoss:
      (state) =>
      (
        id: number,
        type: "abyssRaids" | "abyssalDungeons" | "legionRaids" | "guardians"
      ) => {
        if (type === "guardians")
          return state.supportedBosses.guardians.includes(id);

        const raids: SupportedRaid[] = state.supportedBosses[type];

        const bossIds = raids
          .map((d) => d.bosses)
          .reduce((acc, cur) => {
            return [...cur, ...acc];
          });

        return bossIds.includes(id);
      },
  },
  mutations: {
    setSupportedBossIds(state, payload: number[]) {
      state.supportedBossIds = payload;
    },
  },
  actions: {
    getSupportedBosses(context) {
      const { dispatch, getters, rootGetters, commit } = context;
      const app = rootGetters.app;

      if (getters.supportedBossIds.length > 0)
        return JSON.parse(JSON.stringify(getters.supportedBossIds));
      dispatch("info", "[WS] Getting supported boss IDs");
      return new Promise((resolve, reject) => {
        const io = app.config.globalProperties.$io;
        io.timeout(5000).emit(
          "supported_bosses",
          {},
          (
            err: Error,
            res: {
              supportedBosses: number[];
            }
          ) => {
            if (err) {
              dispatch("error", err.message);
              reject(err);
            } else {
              commit("setSupportedBossIds", res.supportedBosses);
              resolve(res.supportedBosses);
            }
          }
        );
      });
    },
  },
};
