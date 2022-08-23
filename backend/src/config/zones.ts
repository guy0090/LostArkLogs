export enum ZoneType {
  Unknown = 0,
  Guardian = 1,
  ChallengeGuardian = 2,
  AbyssRaid = 3,
  AbyssalDungeon = 4,
  ChallengeAbyssalDungeon = 5,
  LegionRaid = 6,
}

export interface Zone {
  id: number;
  type: ZoneType;
  name: string;
  bosses: number[];
}

export const zones: Zone[] = [
  /*
  {
    id: 0,
    type: ZoneType.Guardian,
    name: 'Guardian',
    bosses: [
      509006, 512002, 512004, 512006, 512008, 512009, 512011, 512012, 512013, 512014, 512015, 512016, 512017, 512019, 512020, 512022, 512023, 512025,
      512027, 593007, 593017, 620010, 620020, 620030, 620040, 620050, 620051, 620052, 620060, 620061, 620070, 620071, 620080, 620100, 620110, 620140,
      620145, 620146, 620150, 620170, 620180, 620190, 620200, 620210, 620220, 620230, 620237, 620238, 620240, 620241, 620242, 620260, 622010, 622020,
      622030, 622040, 622050, 622060, 622070, 622080, 622090, 622100, 622110, 622120, 622130, 622140, 622150, 622160, 622170, 622190, 622200, 623031,
      623070, 624010, 624020, 624021, 624030, 624140, 630020, 630110, 630120, 630210, 630220, 630310, 630320, 630330, 630410, 630420, 630510, 630520,
      630530, 630610, 630620, 630810, 630820, 630830, 630910, 630920, 630930, 631810, 631820, 631830, 632610, 632620, 632630, 632710, 632720, 632730,
      632810, 632820, 632830, 632910, 632920, 632930, 633210, 633220, 633230, 633310, 633320, 633330, 633410, 633420, 633430, 633510, 633520, 633530,
      633610, 633620, 633630, 633710, 633720, 633730, 633810, 633820, 633830, 633840, 634110, 634120, 634130, 634140, 634150, 634160, 634170, 634180,
      634190, 634200, 634210, 634220, 634230, 634240, 634250, 720011, 620290, 620295, 620160, 620250, 620270, 622210, 630030, 620281, 620280,
    ],
  },
  {
    id: 1,
    type: ZoneType.ChallengeGuardian,
    name: 'Challenge Guardian',
    bosses: [],
  },
  */
  {
    id: 2,
    type: ZoneType.AbyssRaid,
    name: 'Argos P1',
    bosses: [
      634000, // P1?
    ],
  },
  {
    id: 3,
    type: ZoneType.AbyssRaid,
    name: 'Argos P2',
    bosses: [
      634010, // P2?
    ],
  },
  {
    id: 4,
    type: ZoneType.AbyssRaid,
    name: 'Argos P3',
    bosses: [
      634020, // P3?
    ],
  },
  {
    id: 5,
    type: ZoneType.AbyssalDungeon,
    name: 'Airas Oculus (NM)',
    bosses: [
      494206, // Frenzied Cicerra
      494207, // Lost Seto
    ],
  },
  {
    id: 6,
    type: ZoneType.AbyssalDungeon,
    name: 'Airas Oculus (HM)',
    bosses: [
      494209, // Frenzied Cicerra
      494210, // Lost Seto
    ],
  },
  {
    id: 7,
    type: ZoneType.AbyssalDungeon,
    name: 'Oreha Prevaza (NM)',
    bosses: [
      494407, // Angry Moguro Captain
      494408, // Corrupted Albion
    ],
  },
  {
    id: 8,
    type: ZoneType.AbyssalDungeon,
    name: 'Oreha Prevaza (HM)',
    bosses: [
      494415, // Angry Moguro Captain
      494416, // Corrupted Albion
    ],
  },
  {
    id: 9,
    type: ZoneType.LegionRaid,
    name: 'Valtan G1',
    bosses: [
      480005, // Leader Lugaru
      480006, // Destroyer Lucas
      480009, // Dark Mountain Predator
      480010, // Dark Mountain Predator
      480011, // Dark Mountain Predator
    ],
  },
  {
    id: 10,
    type: ZoneType.LegionRaid,
    name: 'Valtan G2',
    bosses: [
      480007, // Demon Beast Commander Valtan
      480008, // Torn Demon Beast Lord (Ghost?)
      42060070, // Valtan Ghost
    ],
  },
  {
    id: 11,
    type: ZoneType.LegionRaid,
    name: 'Vykas G1',
    bosses: [
      480208, // Incubus Morphe
      480209, // Nightmarish Morphe
    ],
  },
  {
    id: 12,
    type: ZoneType.LegionRaid,
    name: 'Vykas G2',
    bosses: [
      480210, // Covetous Devourer Vykas
    ],
  },
  {
    id: 13,
    type: ZoneType.LegionRaid,
    name: 'Vykas G3',
    bosses: [
      480211, // Covetous Legion Commander Vykas
    ],
  },
  {
    id: 14,
    type: ZoneType.LegionRaid,
    name: 'Kakul-Saydon G1',
    bosses: [
      480601, // Saydon
    ],
  },
  {
    id: 15,
    type: ZoneType.LegionRaid,
    name: 'Kakul-Saydon G2',
    bosses: [
      480611, // Kakul
    ],
  },
  {
    id: 16,
    type: ZoneType.LegionRaid,
    name: 'Kakul-Saydon G3',
    bosses: [
      480631, // Kakul-Saydon
      480635, // Encore-Desiring Kakul-Saydon
    ],
  },
  {
    id: 17,
    type: ZoneType.LegionRaid,
    name: 'Brelshaza G0',
    bosses: [
      480815, // Brelshaza, Monarch of Nightmares
    ],
  },
  {
    id: 18,
    type: ZoneType.LegionRaid,
    name: 'Brelshaza G1',
    bosses: [
      480805, // Crushing Phantom Wardog
      480874, // Molting Phantom Wardog
      480875, // Echoing Phantom Wardog
      480876, // Raging Phantom Wardog
      480806, // Grieving Statue
      480807, // Furious Statue
      480877, // Despairing Statue
      480878, // Eroded Statue
      480803, // Nightmare Gehenna
      480804, // Nightmare Helkasirs
      480802, // Gehenna Helkasirs
    ],
  },
  {
    id: 19,
    type: ZoneType.LegionRaid,
    name: 'Brelshaza G2',
    bosses: [
      480808, // Prokel
      480809, // Prokel's Spiritual Echo
    ],
  },
  {
    id: 20,
    type: ZoneType.LegionRaid,
    name: 'Brelshaza G3',
    bosses: [
      480810, // Ashtarot
    ],
  },
  {
    id: 21,
    type: ZoneType.LegionRaid,
    name: 'Brelshaza G4',
    bosses: [
      480811, // Primal Nightmare
    ],
  },
  {
    id: 22,
    type: ZoneType.LegionRaid,
    name: 'Brelshaza G5',
    bosses: [
      480813, // Brelshaza, Monarch of Nightmares
    ],
  },
  {
    id: 23,
    type: ZoneType.LegionRaid,
    name: 'Brelshaza G6',
    bosses: [
      480814, // Phantom Legion Commander Brelshaza
    ],
  },
  {
    id: 24,
    type: ZoneType.Guardian,
    name: 'Vertus',
    bosses: [509006, 512015, 620010, 622080, 630210, 632910, 633410, 634140],
  },
  {
    id: 25,
    type: ZoneType.Guardian,
    name: 'Dark Legoros',
    bosses: [512002, 620050, 620051, 620052, 622040, 622110, 624020, 630530, 630810, 632730, 633720],
  },
  {
    id: 26,
    type: ZoneType.Guardian,
    name: 'Lumerus',
    bosses: [512004, 512014, 620210, 622010, 624010, 632830, 633230, 633620, 720011],
  },
  {
    id: 27,
    type: ZoneType.Guardian,
    name: "Ur'nil",
    bosses: [512006, 512013, 620200, 622020, 632630, 633820],
  },
  {
    id: 28,
    type: ZoneType.ChallengeGuardian,
    name: 'Icy Legoros+',
    bosses: [512008, 634130],
  },
  {
    id: 29,
    type: ZoneType.ChallengeGuardian,
    name: 'Dark Legoros+',
    bosses: [512009, 634190],
  },
  {
    id: 30,
    type: ZoneType.ChallengeGuardian,
    name: 'Lumerus+',
    bosses: [512011, 634120],
  },
  {
    id: 31,
    type: ZoneType.ChallengeGuardian,
    name: "Ur'nil+",
    bosses: [512012, 634110],
  },
  {
    id: 32,
    type: ZoneType.Guardian,
    name: 'Frost Helgaia',
    bosses: [512016, 620040, 622160, 630110, 630830, 632810, 633210, 633610, 634220],
  },
  {
    id: 33,
    type: ZoneType.Guardian,
    name: 'Icy Legoros',
    bosses: [512017, 620060, 620061, 622030, 622100, 624021, 630820, 632930, 633430, 633630],
  },
  {
    id: 34,
    type: ZoneType.Guardian,
    name: 'Flame Fox Yoho',
    bosses: [512019, 620190, 622150, 630320, 631820, 632710, 633520, 634170],
  },
  {
    id: 35,
    type: ZoneType.Guardian,
    name: 'Helgaia',
    bosses: [512020, 620020, 622070, 630310, 630510, 631830, 633530, 634200],
  },
  {
    id: 36,
    type: ZoneType.Guardian,
    name: 'Chromanium',
    bosses: [512022, 620030, 622050, 630330, 630930, 633330, 634150],
  },
  {
    id: 37,
    type: ZoneType.Guardian,
    name: 'Nacrasena',
    bosses: [512023, 620070, 620071, 622060, 630520, 630920, 632620, 633320, 634160],
  },
  {
    id: 38,
    type: ZoneType.Guardian,
    name: 'Tytalos',
    bosses: [512025, 620150, 622170, 630610, 633840, 634180],
  },
  {
    id: 39,
    type: ZoneType.Guardian,
    name: 'Night Fox Yoho',
    bosses: [512027, 620180, 622200, 630020, 633710, 634210],
  },
  {
    id: 40,
    type: ZoneType.Guardian,
    name: 'Deskaluda',
    bosses: [593007, 593017, 620260],
  },
  {
    id: 41,
    type: ZoneType.Guardian,
    name: 'Levanos',
    bosses: [620080, 622090, 630420, 630910, 632720, 633310, 634240],
  },
  {
    id: 42,
    type: ZoneType.Guardian,
    name: 'Armored Nacrasena',
    bosses: [620100, 622140, 630220, 632820, 633220, 633730, 634250],
  },
  {
    id: 43,
    type: ZoneType.Guardian,
    name: 'Lava Chromanium',
    bosses: [620110, 622130, 630620, 631810, 632610, 633510, 634230],
  },
  {
    id: 44,
    type: ZoneType.Guardian,
    name: 'Achates',
    bosses: [620140, 620145, 620146, 624140],
  },
  {
    id: 45,
    type: ZoneType.Guardian,
    name: 'Caliligos',
    bosses: [620160, 620250, 620270, 622210, 630030],
  },
  {
    id: 46,
    type: ZoneType.Guardian,
    name: 'Calventus',
    bosses: [620170, 622120, 623070, 630120, 630410, 632920, 633420, 633830],
  },
  {
    id: 47,
    type: ZoneType.Guardian,
    name: 'Velganos',
    bosses: [620220, 622190, 623031, 624030, 633810],
  },
  {
    id: 48,
    type: ZoneType.Guardian,
    name: 'Igrexion',
    bosses: [620230, 620237, 620238],
  },
  {
    id: 49,
    type: ZoneType.Guardian,
    name: 'Alberhastic',
    bosses: [620240, 620241, 620242],
  },
  {
    id: 50,
    type: ZoneType.Guardian,
    name: 'Hanumatan',
    bosses: [620280, 620281],
  },
  {
    id: 51,
    type: ZoneType.Guardian,
    name: 'Kungelanium',
    bosses: [620290, 620295],
  },
];
