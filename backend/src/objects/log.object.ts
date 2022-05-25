import {
  Log,
  LogDamageStatistics,
  LogRecordEntity,
  LogRecordEntitySkill,
  LogRecordEntitySkillHistory,
  LogRecordEntityStat,
} from '@/interfaces/logs.interface';
import { getRandomString } from '@/utils/crypto';

export class LogObject {
  public id: string;
  public creator: string;
  public started: number;
  public ended: number;
  public server?: string;
  public region?: string;
  public encounter?: string;
  public createdAt: number;
  public entities: LogRecordEntityObject[];
  public damageStatistics: LogDamageStatisticsObject;

  constructor(log: Log) {
    try {
      this.id = `${log._id}`;
      this.creator = log.creator;
      this.started = log.started;
      this.ended = log.ended;
      this.server = log.server ?? 'Unknown';
      this.region = log.region ?? 'Unknown';
      this.encounter = log.encounter ?? 'Unknown';
      this.createdAt = log.createdAt;
      this.entities = log.entities.map(entity => new LogRecordEntityObject(entity));
      this.damageStatistics = new LogDamageStatisticsObject(log.damageStatistics);
    } catch (err) {
      console.log(err.message);
      throw err;
    }
  }
}

export class LogRecordEntityObject {
  public id: string;
  public name: string;
  public class: string;
  public gearScore: number;
  public isPlayer: boolean;
  public damageDealt: number;
  public damageTaken: number;
  public skills: LogRecordEntitySkillObject[];
  public stats: LogRecordEntityStatObject;

  constructor(entity: LogRecordEntity) {
    this.id = getRandomString(32);
    // this.name = entity.name; Temporarily disabled for privacy
    this.class = entity.class;
    this.isPlayer = entity.isPlayer;
    this.gearScore = entity.gearScore || 0;
    this.damageDealt = entity.damageDealt;
    this.damageTaken = entity.damageTaken;
    this.skills = entity.skills.map(skill => new LogRecordEntitySkillObject(skill));
    this.stats = new LogRecordEntityStatObject(entity.stats);
  }
}

export class LogRecordEntitySkillObject {
  public id: number;
  public useCount: number;
  public totalDamage: number;
  public history: LogRecordEntitySkillHistory[];

  constructor(skill: LogRecordEntitySkill) {
    this.id = skill.id;
    this.useCount = skill.useCount;
    this.totalDamage = skill.totalDamage;
    this.history = skill.history.map(hist => new LogRecordEntitySkillHistoryObject(hist));
  }
}

export class LogRecordEntitySkillHistoryObject {
  public isCrit: boolean;
  public isBackAttack: boolean;
  public isFrontAttack: boolean;
  public isCounter: boolean;
  public damage: number;
  public timestamp: number;

  constructor(history: LogRecordEntitySkillHistory) {
    this.isCrit = history.isCrit;
    this.isBackAttack = history.isBackAttack;
    this.isFrontAttack = history.isFrontAttack;
    this.isCounter = history.isCounter;
    this.damage = history.damage;
    this.timestamp = history.timestamp;
  }
}

export class LogRecordEntityStatObject {
  public totalHits: number;
  public crits: number;
  public backAttacks: number;
  public frontAttacks: number;
  public counters: number;

  constructor(stat: LogRecordEntityStat) {
    this.totalHits = stat.totalHits;
    this.crits = stat.crits;
    this.backAttacks = stat.backAttacks;
    this.frontAttacks = stat.frontAttacks;
    this.counters = stat.counters;
  }
}

export class LogDamageStatisticsObject {
  public totalDamageDealt: number;
  public topDamageDealt: number;
  public totalDamageTaken: number;
  public topDamageTaken: number;

  constructor(stat: LogDamageStatistics) {
    this.totalDamageDealt = stat.totalDamageDealt;
    this.topDamageDealt = stat.topDamageDealt;
    this.totalDamageTaken = stat.totalDamageTaken;
    this.topDamageTaken = stat.topDamageTaken;
  }
}
