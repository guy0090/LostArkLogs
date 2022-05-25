import { ObjectId } from 'mongoose';

export interface Log {
  _id: ObjectId;
  server?: string;
  region?: string;
  encounter?: string;
  creator: string;
  started: number;
  ended: number;
  createdAt: number;
  entities: LogRecordEntity[];
  damageStatistics: LogDamageStatistics;
}

export interface LogRecordEntity {
  id: string;
  name: string;
  class: string;
  isPlayer: boolean;
  gearScore: number;
  damageDealt: number;
  damageTaken: number;
  skills: LogRecordEntitySkill[];
  stats: LogRecordEntityStat;
}

export interface LogRecordEntitySkill {
  id: number;
  useCount: number;
  totalDamage: number;
  history: LogRecordEntitySkillHistory[];
}

export interface LogRecordEntitySkillHistory {
  isCrit: boolean;
  isBackAttack: boolean;
  isFrontAttack: boolean;
  isCounter: boolean;
  damage: number;
  timestamp: number;
}

export interface LogRecordEntityStat {
  totalHits: number;
  crits: number;
  backAttacks: number;
  frontAttacks: number;
  counters: number;
}

export interface LogDamageStatistics {
  totalDamageDealt: number;
  topDamageDealt: number;
  totalDamageTaken: number;
  topDamageTaken: number;
}
