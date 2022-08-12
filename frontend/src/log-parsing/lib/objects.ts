import { v4 as uuidv4 } from "uuid";
import { tryParseNum } from "./util";

export enum EntityType {
  UNKNOWN = -1,
  MONSTER = 0,
  BOSS = 1,
  GUARDIAN = 2,
  PLAYER = 3,
}

export class Session {
  public id: string;
  public unlisted?: boolean;
  public paused: boolean;
  public live: boolean;
  public protocol?: boolean;
  public firstPacket: number;
  public lastPacket: number;
  public duration?: number;
  public entities: Entity[];
  public damageStatistics: DamageStatistics;

  constructor(session?: {
    id?: string;
    unlisted?: boolean;
    paused?: boolean;
    live?: boolean;
    protocol?: boolean;
    firstPacket?: number;
    lastPacket?: number;
    duration?: number;
    entities?: Entity[];
    damageStatistics?: DamageStatistics;
  }) {
    this.id = session?.id || uuidv4();
    this.unlisted = session?.unlisted || true;
    this.paused = session?.paused || false;
    this.live = session?.live || true;
    this.protocol = session?.protocol || false;
    this.firstPacket = session?.firstPacket || 0;
    this.lastPacket = session?.lastPacket || 0;
    this.duration = session?.duration || 0;
    this.entities = session?.entities || [];
    this.damageStatistics = session?.damageStatistics || new DamageStatistics();
  }

  cleanEntities(
    entityFilter: EntityType[] | undefined = [
      EntityType.GUARDIAN,
      EntityType.BOSS,
      EntityType.PLAYER,
    ]
  ) {
    if (entityFilter) {
      this.entities = this.entities.filter((e) =>
        entityFilter.includes(e.type)
      );
    }

    this.entities = this.entities.filter((e) => {
      if (e.type === EntityType.BOSS || e.type == EntityType.GUARDIAN) {
        return true;
      } else if (
        e.type === EntityType.PLAYER &&
        Object.keys(e.skills).length > 0
      ) {
        return true;
      } else {
        return false;
      }
    });
  }

  getDps() {
    const duration = (this.lastPacket - this.firstPacket) / 1000;
    const damage = this.entities.reduce(
      (acc, e) => acc + e.stats.damageDealt,
      0
    );
    return damage / duration;
  }

  getBoss(): Entity | undefined {
    const bosses = this.entities.filter(
      (e) => e.type === EntityType.BOSS || e.type === EntityType.GUARDIAN
    );

    let boss: Entity | undefined = undefined;
    if (bosses.length > 1) {
      boss = bosses.sort((a, b) => b.lastUpdate - a.lastUpdate)[0];
    } else if (bosses.length === 1) {
      boss = bosses[0];
    } else {
      boss = undefined;
    }

    return boss;
  }

  toSimpleObject() {
    return new SimpleSession(this);
  }
}

export class DamageStatistics {
  public totalDamageDealt: number;
  public totalDamageTaken: number;
  public topDamageDealt: number;
  public topDamageTaken: number;
  public dps: number;
  public dpsIntervals: number[];

  public constructor(damageStatistics?: {
    totalDamageDealt?: number;
    totalDamageTaken?: number;
    topDamageDealt?: number;
    topDamageTaken?: number;
    dps?: number;
    dpsIntervals?: number[];
  }) {
    this.totalDamageDealt = damageStatistics?.totalDamageDealt || 0;
    this.totalDamageTaken = damageStatistics?.totalDamageTaken || 0;
    this.topDamageDealt = damageStatistics?.topDamageDealt || 0;
    this.topDamageTaken = damageStatistics?.topDamageTaken || 0;
    this.dps = damageStatistics?.dps || 0;
    this.dpsIntervals = damageStatistics?.dpsIntervals || [];
  }
}

export class Entity {
  public lastUpdate: number;
  public id: string;
  public npcId: number;
  public name: string;
  public type: EntityType;
  public class: string;
  public classId: number;
  public level: number;
  public gearLevel: number;
  public currentHp: number;
  public maxHp: number;
  public skills: { [key: string]: Skill };
  public stats: Stats;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(entity: Record<string, any>) {
    this.lastUpdate = entity.lastUpdate || +new Date();
    this.id = entity.id || 0;
    this.npcId = tryParseNum(entity.npcId);
    this.name = entity.name || "Unknown Entity";
    this.type = entity.type || EntityType.UNKNOWN;
    this.class = entity.class || "Unknown Class";
    this.classId = entity.classId || 0;
    this.level = entity.level || 0;
    this.gearLevel = entity.gearLevel || 0;
    this.currentHp = entity.currentHp || 0;
    this.maxHp = entity.maxHp || 0;
    this.skills = entity.skills || {};
    this.stats = new Stats(entity.stats);
  }

  addSkill(id: number, content: Skill) {
    this.skills[id] = content;
  }
}

export class Stats {
  public casts: number;
  public hits: number;
  public crits: number;
  public backHits: number;
  public frontHits: number;
  public counters: number;
  public damageDealt: number;
  public healing: number;
  public damageTaken: number;
  public deaths: number;
  public dps: number;
  public dpsOverTime: number[];

  constructor(stats?: {
    casts?: number;
    hits?: number;
    crits?: number;
    backHits?: number;
    frontHits?: number;
    counters?: number;
    damageDealt?: number;
    healing?: number;
    damageTaken?: number;
    deaths?: number;
    dps?: number;
    dpsOverTime?: number[];
  }) {
    this.casts = stats?.casts || 0;
    this.hits = stats?.hits || 0;
    this.crits = stats?.crits || 0;
    this.backHits = stats?.backHits || 0;
    this.frontHits = stats?.frontHits || 0;
    this.counters = stats?.counters || 0;
    this.damageDealt = stats?.damageDealt || 0;
    this.healing = stats?.healing || 0;
    this.damageTaken = stats?.damageTaken || 0;
    this.deaths = stats?.deaths || 0;
    this.dps = stats?.dps || 0;
    this.dpsOverTime = stats?.dpsOverTime || [];
  }
}

export class Skill {
  public id: number;
  public name: string;
  public breakdown?: SkillBreakdown[];
  public stats: SkillStats;

  constructor(skill: {
    id: number;
    name?: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    breakdown?: Record<string, any>;
    stats?: Record<string, number>;
  }) {
    this.id = skill.id;
    this.name = skill.name || "Unknown Skill";
    this.breakdown =
      skill.breakdown?.map(
        (breakdown: SkillBreakdown) => new SkillBreakdown(breakdown)
      ) || [];
    this.stats = new SkillStats(skill?.stats);
  }
}

export class SkillBreakdown {
  public timestamp: number;
  public damage: number;
  public isCrit: boolean;
  public isBackHit: boolean;
  public isFrontHit: boolean;
  public targetEntity: string;
  public isCounter: boolean;

  constructor(breakdown: {
    timestamp: number;
    damage: number;
    isCrit: boolean;
    isBackHit: boolean;
    isFrontHit: boolean;
    targetEntity: string;
    isCounter?: boolean;
  }) {
    this.timestamp = breakdown.timestamp;
    this.damage = breakdown.damage;
    this.isCrit = breakdown.isCrit;
    this.isBackHit = breakdown.isBackHit;
    this.isFrontHit = breakdown.isFrontHit;
    this.targetEntity = breakdown.targetEntity;
    this.isCounter = breakdown.isCounter || false;
  }
}

export class SkillStats {
  public casts: number;
  public hits: number;
  public crits: number;
  public backHits: number;
  public frontHits: number;
  public counters: number;
  public damageDealt: number;
  public topDamage: number;

  constructor(stats?: Record<string, number>) {
    this.casts = stats?.casts || 0;
    this.hits = stats?.hits || 0;
    this.crits = stats?.crits || 0;
    this.backHits = stats?.backHits || 0;
    this.frontHits = stats?.frontHits || 0;
    this.counters = stats?.counters || 0;
    this.damageDealt = stats?.damageDealt || 0;
    this.topDamage = stats?.topDamage || 0;
  }
}

export class SimpleSession {
  public id: string;
  public createdAt: number;
  public unlisted: boolean;
  public firstPacket: number;
  public lastPacket: number;
  public duration: number;
  public entities: SimpleEntity[];
  public damageStatistics: DamageStatistics;

  constructor(session: Session) {
    this.id = session.id;
    this.createdAt = session.firstPacket || 0;
    this.unlisted = session.unlisted || true;
    this.firstPacket = session.firstPacket || 0;
    this.lastPacket = session.lastPacket || 0;
    this.duration = this.lastPacket - this.firstPacket;
    this.entities = session.entities.map((entity) => new SimpleEntity(entity));

    // Only keep players with skills
    this.entities = this.entities.filter((e) => {
      if (e.type === EntityType.BOSS || e.type === EntityType.GUARDIAN) {
        return true;
      } else if (
        e.type === EntityType.PLAYER &&
        Object.keys(e.skills).length > 2
      ) {
        return true;
      } else {
        return false;
      }
    });

    this.damageStatistics = session.damageStatistics;
  }
}

export class SimpleEntity {
  public lastUpdate: number;
  public id: string;
  public npcId: number;
  public name: string;
  public type: EntityType;
  public classId: number;
  public gearLevel: number;
  public currentHp: number;
  public maxHp: number;
  public skills: SimpleSkill[];
  public stats: Stats;

  constructor(entity: Entity) {
    this.lastUpdate = entity.lastUpdate;
    this.id = entity.id;
    this.npcId = entity.npcId;
    this.name = entity.name;
    this.type = entity.type;
    this.classId = entity.classId;
    this.gearLevel = entity.gearLevel;
    this.currentHp = entity.currentHp;
    this.maxHp = entity.maxHp;
    this.skills = Object.values(entity.skills).map(
      (skill) => new SimpleSkill(skill)
    );
    this.stats = entity.stats;
  }
}

export class SimpleSkill {
  public id: number;
  public name: string;
  public stats: SkillStats;

  constructor(skill: Skill) {
    this.id = skill.id;
    this.name = skill.name;
    this.stats = skill.stats;
  }
}
