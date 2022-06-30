import mongoose from 'mongoose';

export enum ENTITY_TYPE {
  UNKNOWN = -1,
  MONSTER = 0,
  BOSS = 1,
  GUARDIAN = 2,
  PLAYER = 3,
}

export interface LogFilter {
  classes: number[];
  bosses: number[];
  gearLevel: [number, number];
  level: [number, number];
  range: [number, number];
  partyDps: number;
  server?: string;
  region?: string;
  key?: string;
  removeBreakdowns?: boolean;
}

export interface Log {
  _id: mongoose.Types.ObjectId;
  server?: string;
  region?: string;
  encounter?: string;
  creator: mongoose.Types.ObjectId;
  firstPacket?: number;
  lastPacket?: number;
  duration?: number;
  createdAt: number;
  entities: LogEntity[];
  damageStatistics: LogDamageStatistics;
}

export interface LogEntity {
  lastUpdate: number; // Epoch timestamp
  id: string;
  npcId: number | undefined;
  name: string;
  type: ENTITY_TYPE;
  class: string | undefined;
  classId: number;
  level: number;
  gearLevel: number;
  currentHp: number;
  maxHp: number;
  skills: LogEntitySkill[];
  stats: LogEntityStats;
}

export interface LogEntitySkill {
  id: number;
  name: string;
  stats: LogEntitySkillStats;
}

export interface LogEntitySkillStats {
  hits: number;
  crits: number;
  backHits: number;
  frontHits: number;
  counters: number;
  damageDealt: number;
  topDamage: number;
}

export interface LogEntityStats {
  hits: number;
  crits: number;
  backHits: number;
  frontHits: number;
  counters: number;
  damageDealt: number;
  healing: number;
  damageTaken: number;
  deaths: number;
  dps: number;
  dpsOverTime: number[];
}

export interface LogDamageStatistics {
  totalDamageDealt: number;
  topDamageDealt: number;
  totalDamageTaken: number;
  topDamageTaken: number;
  dps: number;
  dpsIntervals: number[];
}
