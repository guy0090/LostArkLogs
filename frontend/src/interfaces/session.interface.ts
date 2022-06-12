export enum ENTITY_TYPE {
  UNKNOWN = -1,
  MONSTER = 0,
  BOSS = 1,
  GUARDIAN = 2,
  PLAYER = 3,
}

export interface Session {
  server?: string;
  region?: string;
  encounter?: string;
  creator: string;
  started: number;
  ended: number;
  createdAt: number;
  entities: Entity[];
  damageStatistics: DamageStatistics;
}

export interface Entity {
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
  skills: Skill[];
  stats: Stats;
}

export interface Skill {
  id: number;
  name: string;
  breakdown: SkillBreakdown[];
  stats: SkillStats;
}

export interface SkillBreakdown {
  timestamp: number;
  damage: number;
  isCrit: boolean;
  isBackHit: boolean;
  isFrontHit: boolean;
  targetEntity: string;
  isCounter: boolean;
}

export interface SkillStats {
  hits: number;
  crits: number;
  backHits: number;
  frontHits: number;
  counters: number;
  damageDealt: number;
  topDamage: number;
}

export interface Stats {
  hits: number;
  crits: number;
  backHits: number;
  frontHits: number;
  counters: number;
  damageDealt: number;
  healing: number;
  damageTaken: number;
  deaths: number;
}

export interface DamageStatistics {
  totalDamageDealt: number;
  topDamageDealt: number;
  totalDamageTaken: number;
  topDamageTaken: number;
}
