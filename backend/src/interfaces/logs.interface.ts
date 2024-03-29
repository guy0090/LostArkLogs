import { ZoneType } from '@/config/zones';
import { LogObject } from '@/objects/log.object';
import mongoose from 'mongoose';

export enum EntityType {
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
  limit?: number;
}

export interface LogFilterResult {
  found: number;
  logs: LogObject[];
}

export interface LogFilterOptions {
  includeUnlisted?: boolean;
}

export interface Log {
  _id?: mongoose.Types.ObjectId;
  parent?: mongoose.Types.ObjectId;
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
  zoneId?: number;
  zoneType?: ZoneType;
}

export interface LogEntity {
  lastUpdate: number; // Epoch timestamp
  id: string;
  npcId: number | undefined;
  name: string;
  type: EntityType;
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
  shielding: number;
  damageTaken: number;
  deaths: number;
  deathTime: number;
  dps: number;
  dpsOverTime: number[];
}

export interface LogDamageStatistics {
  totalDamageDealt: number;
  topDamageDealt: number;
  totalDamageTaken: number;
  topDamageTaken: number;
  totalHealingDone: number;
  topHealingDone: number;
  totalShieldDone: number;
  topShieldDone: number;
  dps: number;
  dpsIntervals: number[];
}

export interface RawLog {
  _id?: mongoose.Types.ObjectId;
  unlisted?: boolean;
  creator: mongoose.Types.ObjectId;
  createdAt: number;
  hash: string;
  logLines: string[];
}
