export interface Session {
  id: string;
  createdAt: number;
  started: number;
  ended: number;
  server: string;
  region: string;
  encounter: string;
  entities: SessionEntity[];
  damageStatistics: SessionDamageStatistics;
}

export interface SessionEntity {
  id: number;
  name: string;
  class: number;
  isPlayer: boolean;
  damageDealt: number;
  damageTaken: number;
  skills: SessionEntitySkill[];
  stats: SessionEntityStats;
}

export interface SessionEntitySkill {
  id: number;
  useCount: number;
  totalDamage: number;
  timestamps: number[];
}

export interface SessionEntityStats {
  totalHits: number;
  crits: number;
  backAttacks: number;
  frontAttacks: number;
  counters: number;
}

export interface SessionDamageStatistics {
  totalDamageDealt: number;
  totalDamageTaken: number;
  topDamageDealt: number;
  topDamageTaken: number;
}
