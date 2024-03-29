import { SimpleSession } from "@/log-parsing/lib/objects";

export enum EntityType {
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
  type: EntityType;
  classId: number;
  gearLevel: string | number;
  skills: { [key: string]: Skill } | Skill[];
  stats: Stats;
  iid?: number;
}

export interface Session {
  id: string;
  parent?: string;
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
  lastUpdate: number;
  type: EntityType;
  classId: number;
  gearLevel: number;
  skills: Skill[];
  stats: Stats;
  iid?: number;
  currentHp: number;
  maxHp: number;
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

export interface RawSessionDetails {
  data: string;
  name: string;
  date: Date;
  parsed: number;
  found: number;
  dropped: number;
  encounters: SimpleSession[];
  results: Session[];
}

export interface UniqueBosses {
  guardians: number[];
  bosses: Zone[];
}

export interface SupportedBosses {
  name: string;
  id: number;
  zoneType: ZoneType;
  bosses: number[];
}

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
