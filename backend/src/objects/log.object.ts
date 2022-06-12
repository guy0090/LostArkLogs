import {
  ENTITY_TYPE,
  Log,
  LogDamageStatistics,
  LogEntity,
  LogEntitySkill,
  LogEntitySkillBreakdown,
  LogEntitySkillStats,
  LogEntityStats,
} from '@/interfaces/logs.interface';
import { getRandomString } from '@/utils/crypto';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsEnum,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Length,
  Min,
  ValidateIf,
  ValidateNested,
} from 'class-validator';

export class LogDamageStatisticsObject {
  @IsNumber()
  @Min(0)
  public totalDamageDealt: number;

  @IsNumber()
  @Min(0)
  public topDamageDealt: number;

  @IsNumber()
  @Min(0)
  public totalDamageTaken: number;

  @IsNumber()
  @Min(0)
  public topDamageTaken: number;

  constructor(stat: LogDamageStatistics) {
    this.totalDamageDealt = stat.totalDamageDealt;
    this.topDamageDealt = stat.topDamageDealt;
    this.totalDamageTaken = stat.totalDamageTaken;
    this.topDamageTaken = stat.topDamageTaken;
  }
}

export class LogEntitySkillBreakdownObject {
  @IsNumber()
  @Min(0)
  public timestamp: number;

  @IsNumber()
  public damage: number;

  @IsBoolean()
  public isCrit: boolean;

  @IsBoolean()
  public isBackHit: boolean;

  @IsBoolean()
  public isFrontHit: boolean;

  @IsOptional()
  @IsString()
  public targetEntity: string | undefined;

  @IsBoolean()
  public isCounter: boolean;

  constructor(breakdown: LogEntitySkillBreakdown) {
    this.timestamp = breakdown.timestamp;
    this.damage = breakdown.damage;
    this.isCrit = breakdown.isCrit;
    this.isBackHit = breakdown.isBackHit;
    this.isFrontHit = breakdown.isFrontHit;
    // this.targetEntity = breakdown.targetEntity;
    this.isCounter = breakdown.isCounter;
  }
}

export class LogEntitySkillStatsObject {
  @IsNumber()
  @Min(0)
  public hits: number;

  @IsNumber()
  @Min(0)
  public crits: number;

  @IsNumber()
  @Min(0)
  public backHits: number;

  @IsNumber()
  @Min(0)
  public frontHits: number;

  @IsNumber()
  @Min(0)
  public counters: number;

  @IsNumber()
  @Min(0)
  public damageDealt: number;

  @IsNumber()
  @Min(0)
  public topDamage: number;

  constructor(stats: LogEntitySkillStats) {
    this.hits = stats.hits;
    this.crits = stats.crits;
    this.backHits = stats.backHits;
    this.frontHits = stats.frontHits;
    this.counters = stats.counters;
    this.damageDealt = stats.damageDealt;
    this.topDamage = stats.topDamage;
  }
}

export class LogEntitySkillObject {
  @IsNumber()
  @Min(0)
  public id: number;

  @IsString()
  public name: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LogEntitySkillBreakdownObject)
  public breakdown: LogEntitySkillBreakdownObject[];

  @IsObject()
  @Type(() => LogEntitySkillStatsObject)
  public stats: LogEntitySkillStatsObject;

  constructor(skill: LogEntitySkill) {
    this.id = skill.id;
    this.name = skill.name;
    this.breakdown = skill.breakdown.map((breakdown: LogEntitySkillBreakdown) => new LogEntitySkillBreakdownObject(breakdown));
    this.stats = new LogEntitySkillStatsObject(skill.stats);
  }
}

export class LogEntityStatObject {
  @IsNumber()
  @Min(0)
  public hits: number;

  @IsNumber()
  @Min(0)
  public crits: number;

  @IsNumber()
  @Min(0)
  public backHits: number;

  @IsNumber()
  @Min(0)
  public frontHits: number;

  @IsNumber()
  @Min(0)
  public counters: number;

  @IsNumber()
  @Min(0)
  public damageDealt: number;

  @IsNumber()
  @Min(0)
  public healing: number;

  @IsNumber()
  @Min(0)
  public damageTaken: number;

  @IsNumber()
  @Min(0)
  public deaths: number;

  constructor(stat: LogEntityStats) {
    this.hits = stat.hits;
    this.crits = stat.crits;
    this.backHits = stat.backHits;
    this.frontHits = stat.frontHits;
    this.counters = stat.counters;
    this.damageDealt = stat.damageDealt;
    this.healing = stat.healing;
    this.damageTaken = stat.damageTaken;
    this.deaths = stat.deaths;
  }
}

export class LogEntityObject {
  @IsNumber()
  @Min(0)
  public lastUpdate: number; // Epoch timestamp

  @IsString()
  @Length(1, 32)
  public id: string;

  @IsOptional()
  @IsNumber()
  public npcId: number | undefined;

  @IsOptional()
  @IsString()
  public name: string | undefined;

  @IsEnum(ENTITY_TYPE)
  public type: ENTITY_TYPE;

  @IsOptional()
  @IsString()
  public class: string | undefined;

  @IsNumber()
  @Min(0)
  public classId: number;

  @IsNumber()
  @Min(0)
  public level: number;

  @IsString()
  @Length(1, 8)
  public gearLevel: string;

  @IsNumber()
  public currentHp: number;

  @IsNumber()
  @Min(0)
  public maxHp: number;

  @ValidateIf(o => o.type === ENTITY_TYPE.PLAYER)
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(20)
  @ValidateNested({ each: true })
  @Type(() => LogEntitySkillObject)
  public skills: LogEntitySkillObject[];

  @IsObject()
  @Type(() => LogEntityStatObject)
  public stats: LogEntityStatObject;

  constructor(entity: LogEntity) {
    this.lastUpdate = entity.lastUpdate;
    this.id = getRandomString(32);
    // this.id = entity.id; Don't use game-provided identifier
    this.name = entity.type !== ENTITY_TYPE.PLAYER ? entity.name : undefined;
    this.npcId = entity.npcId;
    this.type = entity.type;
    this.class = entity.class;
    this.classId = entity.classId;
    this.level = entity.level;
    this.gearLevel = entity.gearLevel || '0';
    this.currentHp = entity.currentHp;
    this.maxHp = entity.maxHp;
    if (entity.skills && entity.type === ENTITY_TYPE.PLAYER) this.skills = Object.values(entity.skills).map(skill => new LogEntitySkillObject(skill));
    else this.skills = [];
    this.stats = new LogEntityStatObject(entity.stats);
  }

  isPlayer() {
    return this.type === ENTITY_TYPE.PLAYER;
  }

  isGuardian() {
    return this.type === ENTITY_TYPE.GUARDIAN;
  }

  isMonster() {
    return this.type === ENTITY_TYPE.MONSTER;
  }

  isBoss() {
    return this.type === ENTITY_TYPE.BOSS;
  }
}

export class LogObject {
  @IsOptional()
  @IsString()
  public id?: string;

  @IsString()
  public creator: string;

  @IsNumber()
  @Min(0)
  public started: number;

  @IsNumber()
  @Min(0)
  public ended: number;

  @IsOptional()
  @IsString()
  public server?: string;

  @IsOptional()
  @IsString()
  public region?: string;

  @IsOptional()
  @IsString()
  public encounter?: string;

  @IsNumber()
  @Min(0)
  public createdAt: number;

  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(20)
  @ValidateNested({ each: true })
  @Type(() => LogEntityObject)
  public entities: LogEntityObject[];

  @IsObject()
  @Type(() => LogDamageStatisticsObject)
  public damageStatistics: LogDamageStatisticsObject;

  constructor(log: Log) {
    try {
      this.id = log._id ? `${log._id}` : undefined;
      this.creator = `${log.creator}`;
      this.started = log.firstPacket ?? log.started;
      this.ended = log.lastPacket ?? log.ended;
      this.server = log.server ?? 'Unknown';
      this.region = log.region ?? 'Unknown';
      this.encounter = log.encounter ?? 'Unknown';
      this.createdAt = log.createdAt;
      this.entities = log.entities.map(entity => new LogEntityObject(entity));
      this.damageStatistics = new LogDamageStatisticsObject(log.damageStatistics);
    } catch (err) {
      console.log(err.message);
      throw err;
    }
  }

  static getEncounterName(entities: LogEntity[]) {
    const bosses = entities.filter(entity => entity.type === ENTITY_TYPE.BOSS || entity.type === ENTITY_TYPE.GUARDIAN);
    let encounterName = 'Unknown';
    if (bosses.length > 0) {
      encounterName = bosses.sort((a, b) => b.lastUpdate - a.lastUpdate)[0].name;
      console.log("Set encounter to boss's name: ", encounterName);
    }
    return encounterName;
  }
}
