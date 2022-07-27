export enum ENTITY_TYPE {
  UNKNOWN = -1,
  MONSTER = 0,
  BOSS = 1,
  GUARDIAN = 2,
  PLAYER = 3,
}

export interface USession {
  id: string;
  server?: string;
  region?: string;
  firstPacket: number;
  lastPacket: number;
  duration?: number;
  createdAt: number;
  entities: UEntity[];
  damageStatistics: DamageStatistics;
}

export interface UEntity {
  id: string;
  npcId: number | undefined;
  name?: string;
  lastUpdate: number;
  type: ENTITY_TYPE;
  classId: number;
  level: number;
  gearLevel: string | number;
  skills: { [key: string]: Skill } | Skill[];
  stats: Stats;
  iid?: number;
}

export interface Session {
  id: string;
  unlisted: boolean;
  server?: string;
  region?: string;
  creator: string;
  firstPacket: number;
  lastPacket: number;
  duration: number;
  createdAt: number;
  entities: Entity[];
  damageStatistics: DamageStatistics;
}

export interface Entity {
  id: string;
  npcId: number | undefined;
  type: ENTITY_TYPE;
  classId: number;
  level: number;
  gearLevel: number;
  skills: Skill[];
  stats: Stats;
  iid?: number;
}

export interface Skill {
  id: number;
  breakdown?: SkillBreakdown[];
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
  casts: number;
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
  dps: number;
  dpsOverTime: number[];
}

export interface DamageStatistics {
  totalDamageDealt: number;
  topDamageDealt: number;
  totalDamageTaken: number;
  topDamageTaken: number;
  dps: number;
  dpsIntervals: number[];
}
