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
      494209, // Frenzied Cicerra
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
];
