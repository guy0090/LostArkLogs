import { ENTITY_TYPE, Log, LogDamageStatistics, LogEntity, LogEntitySkill, LogEntitySkillStats, LogEntityStats } from '@/interfaces/logs.interface';
import { getRandomString } from '@/utils/crypto';
import { logger } from '@/utils/logger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Length,
  Max,
  MaxLength,
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

  @IsNumber()
  @Min(0)
  public dps: number;

  @IsArray()
  @ArrayMinSize(0)
  @ArrayMaxSize(200) // TODO: Decide on this properly
  @IsNumber({}, { each: true })
  public dpsIntervals: number[];

  constructor(stat: LogDamageStatistics) {
    this.totalDamageDealt = stat.totalDamageDealt;
    this.topDamageDealt = stat.topDamageDealt;
    this.totalDamageTaken = stat.totalDamageTaken;
    this.topDamageTaken = stat.topDamageTaken;
    this.dps = stat.dps;
    this.dpsIntervals = stat.dpsIntervals;
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

  @IsOptional()
  @IsString()
  public name: string;

  @IsObject()
  @Type(() => LogEntitySkillStatsObject)
  public stats: LogEntitySkillStatsObject;

  constructor(skill: LogEntitySkill) {
    this.id = skill.id;
    // this.name = skill.name;
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

  @IsNumber()
  @Min(0)
  public dps: number;

  @IsArray()
  @ArrayMinSize(0)
  @ArrayMaxSize(200) // TODO: Decide on this properly; always same length as dpsIntervals
  @IsNumber({}, { each: true })
  dpsOverTime: number[];

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
    this.dps = stat.dps;
    this.dpsOverTime = stat.dpsOverTime;
  }
}

export class LogEntityObject {
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

  @IsNumber()
  @Min(0)
  public classId: number;

  @IsNumber()
  @Min(0)
  @Max(60)
  public level: number;

  @IsNumber()
  @Min(0)
  @Max(1625)
  public gearLevel: number;

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
    this.id = getRandomString(32);
    this.npcId = entity.npcId;
    this.type = entity.type;
    this.classId = entity.classId;
    this.level = entity.level;
    this.gearLevel = entity.gearLevel || 0;
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
  @ValidateIf(o => o.id !== undefined)
  @IsString()
  @MaxLength(0) // Don't let the uploader set ID; DTO validation is only performed when uploading
  public id?: string;

  @IsString() // Cannot be set by user upload; only generated by server
  public creator: string;

  @IsNumber()
  @Min(0)
  public duration: number;

  @IsOptional()
  @IsString()
  public server?: string;

  @IsOptional()
  @IsString()
  public region?: string;

  @IsNumber()
  @Min(0)
  public createdAt: number;

  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(9) // 8 Players, 1 Boss, TODO: Maybe more?
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
      this.duration = log.firstPacket && log.lastPacket ? log.lastPacket - log.firstPacket : log.duration;
      this.server = log.server ?? 'Unknown';
      this.region = log.region ?? 'Unknown';
      this.createdAt = log.createdAt;
      this.entities = log.entities.map(entity => new LogEntityObject(entity));
      this.damageStatistics = new LogDamageStatisticsObject(log.damageStatistics);
    } catch (err) {
      logger.error(err.message);
      throw err;
    }
  }
}
