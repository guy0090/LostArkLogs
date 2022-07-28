import { LogObject } from '@/objects/log.object';
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
  sort?: ['dps' | 'createdAt', -1 | 1]; // -1 = desc, 1 = asc
  creator?: string;
  page?: number;
  pageSize?: number;
}

export interface LogFilterResult {
  found: number;
  pageSize: number;
  logs: LogObject[];
}

export interface LogFilterOptions {
  pageSize?: number;
  includeUnlisted?: boolean;
}

export interface Log {
  _id: mongoose.Types.ObjectId;
  unlisted?: boolean;
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
  classId: number;
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
  casts: number;
  hits: number;
  crits: number;
  backHits: number;
  frontHits: number;
  counters: number;
  damageDealt: number;
  topDamage: number;
}

export interface LogEntityStats {
  casts: number;
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

export interface RawLog {
  _id?: mongoose.Types.ObjectId;
  unlisted?: boolean;
  creator: mongoose.Types.ObjectId;
  createdAt: number;
  logLines: string[];
}
