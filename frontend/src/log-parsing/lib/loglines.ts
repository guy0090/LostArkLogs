/* eslint-disable @typescript-eslint/no-unused-vars */
import { tryParseNum } from "./util";
import { EntityType } from "./objects";

export const LINE_SPLIT_CHAR = "|";

// logId = 1
export class LogInitEnv {
  timestamp: number;
  playerId: string;
  playerName: string;
  playerGearLevel: number;

  constructor(lineSplit: string[]) {
    this.timestamp = +new Date(lineSplit[1]);
    this.playerId = lineSplit[2];
    this.playerName = lineSplit[3];
    this.playerGearLevel = tryParseNum(lineSplit[4], true);
  }
}

// logId = 2
export class LogPhaseTransition {
  timestamp: number;
  raidResultType: RAID_RESULT;

  constructor(lineSplit: string[]) {
    this.timestamp = +new Date(lineSplit[1]);
    const type = tryParseNum(lineSplit[2]);

    switch (type) {
      case 0:
        this.raidResultType = RAID_RESULT.RAID_RESULT;
        break;
      case 1:
        this.raidResultType = RAID_RESULT.GUARDIAN_DEAD;
        break;
      case 2:
        this.raidResultType = RAID_RESULT.RAID_END;
        break;
      default:
        this.raidResultType = RAID_RESULT.UNK;
        break;
    }
  }
}

// logId = 3
export class LogNewPc {
  timestamp: number;
  id: string;
  name: string;
  classId: number;
  class: string;
  level: number;
  gearLevel: number;
  currentHp: number;
  maxHp: number;
  type: EntityType;

  constructor(lineSplit: string[]) {
    this.timestamp = +new Date(lineSplit[1]);
    this.id = lineSplit[2];
    this.name = lineSplit[3] || "Unknown Entity";
    this.classId = tryParseNum(lineSplit[4]);
    this.class = lineSplit[5] || "Unknown Class";
    this.level = tryParseNum(lineSplit[6]);
    this.gearLevel = tryParseNum(lineSplit[7], true);
    this.currentHp = tryParseNum(lineSplit[8]);
    this.maxHp = tryParseNum(lineSplit[9]);
    this.type = EntityType.PLAYER;
  }
}

// logId = 4
export class LogNewNpc {
  timestamp: number;
  id: string;
  npcId: number;
  name: string;
  currentHp: number;
  maxHp: number;
  type: EntityType;

  constructor(lineSplit: string[]) {
    this.timestamp = +new Date(lineSplit[1]);
    this.id = lineSplit[2];
    this.npcId = tryParseNum(lineSplit[3]);
    this.name = lineSplit[4] || "Unknown Entity";
    this.currentHp = tryParseNum(lineSplit[5]);
    this.maxHp = tryParseNum(lineSplit[6]);
    this.type = EntityType.UNKNOWN;
  }
}

// logId = 5
export class LogDeath {
  public timestamp: number;
  public id: string;
  public name: string;
  public killerId: string;
  public killerName: string;

  constructor(lineSplit: string[]) {
    this.timestamp = +new Date(lineSplit[1]);
    this.id = lineSplit[2];
    this.name = lineSplit[3] || "Unknown Entity";
    this.killerId = lineSplit[4];
    this.killerName = lineSplit[5] || "Unknown Entity";
  }
}

// logId = 6
export class LogSkillStart {
  timestamp: number;
  id: string;
  name: string;
  skillId: number;
  skillName: string;

  constructor(lineSplit: string[]) {
    this.timestamp = +new Date(lineSplit[1]);
    this.id = lineSplit[2];
    this.name = lineSplit[3] || "Unknown Entity";
    this.skillId = tryParseNum(lineSplit[4]);
    this.skillName = lineSplit[5] || "Unknown Skill";
  }
}

// logId = 7
export class LogSkillStage {
  timestamp: number;
  id: string;
  name: string;
  skillId: number;
  skillName: string;
  skillStage: number;

  constructor(lineSplit: string[]) {
    this.timestamp = +new Date(lineSplit[1]);
    this.id = lineSplit[2];
    this.name = lineSplit[3] || "Unknown Entity";
    this.skillId = tryParseNum(lineSplit[4]);
    this.skillName = lineSplit[5] || "Unknown Skill";
    this.skillStage = tryParseNum(lineSplit[6]);
  }
}

// logId = 8
export class LogDamage {
  timestamp: number;
  sourceId: string;
  sourceName: string;
  skillId: number;
  skillName: string;
  skillEffectId: number;
  skillEffect: string;
  targetId: string;
  targetName: string;
  damage: number;
  damageModifier: HitFlag;
  currentHp: number;
  maxHp: number;
  constructor(lineSplit: string[]) {
    this.timestamp = +new Date(lineSplit[1]);
    this.sourceId = lineSplit[2];
    this.sourceName = lineSplit[3] || "Unknown Entity";
    this.skillId = tryParseNum(lineSplit[4]);
    this.skillName = lineSplit[5] || "Unknown Skill";
    this.skillEffectId = tryParseNum(lineSplit[6]);
    this.skillEffect = lineSplit[7];
    this.targetId = lineSplit[8];
    this.targetName = lineSplit[9] || "Unknown Entity";
    this.damage = tryParseNum(lineSplit[10]);
    this.damageModifier = tryParseNum(lineSplit[11], false, 0, 16);
    this.currentHp = tryParseNum(lineSplit[12]);
    this.maxHp = tryParseNum(lineSplit[13]);
  }
}

// logId = 9
export class LogHeal {
  timestamp: number;
  id: string;
  name: string;
  healAmount: number;
  currentHp: number;
  constructor(lineSplit: string[]) {
    this.timestamp = +new Date(lineSplit[1]);
    this.id = lineSplit[2];
    this.name = lineSplit[3] || "Unknown Entity";
    this.healAmount = tryParseNum(lineSplit[4]);
    this.currentHp = tryParseNum(lineSplit[5]);
  }
}

// logId = 10
export class LogBuff {
  timestamp: number;
  id: string;
  name: string;
  buffId: string;
  buffName: string;
  sourceId: string;
  sourceName: string;
  shieldAmount: number;

  constructor(lineSplit: string[]) {
    this.timestamp = +new Date(lineSplit[1]);
    this.id = lineSplit[2];
    this.name = lineSplit[3] || "Unknown Entity";
    this.buffId = lineSplit[4];
    this.buffName = lineSplit[5] || "Unknown Buff";
    this.sourceId = lineSplit[6];
    this.sourceName = lineSplit[7] || "Unknown Entity";
    this.shieldAmount = tryParseNum(lineSplit[8], true, 0);
  }
}

// logId = 11
export class LogCounterAttack {
  timestamp: number;
  id: string;
  name: string;
  targetId: string;
  targetName: string;

  constructor(lineSplit: string[]) {
    this.timestamp = +new Date(lineSplit[1]);
    this.id = lineSplit[2];
    this.name = lineSplit[3] || "Unknown Entity";
    this.targetId = lineSplit[4];
    this.targetName = lineSplit[5] || "Unknown Entity";
  }
}

export enum RAID_RESULT {
  UNK = -1,
  RAID_RESULT = 0, // Raid ended; Not sure when it procs
  GUARDIAN_DEAD = 1, // Guardian died; Also procs on every Argos phase
  RAID_END = 2, // Non-guardian boss died; Party wiped (does not proc on guardian wipes)
}

export enum HitOption {
  HIT_OPTION_NONE = -1,
  HIT_OPTION_BACK_ATTACK = 0,
  HIT_OPTION_FRONTAL_ATTACK = 1,
  HIT_OPTION_FLANK_ATTACK = 2,
  HIT_OPTION_MAX = 3,
}

export enum HitFlag {
  HIT_FLAG_NORMAL = 0,
  HIT_FLAG_CRITICAL = 1,
  HIT_FLAG_MISS = 2,
  HIT_FLAG_INVINCIBLE = 3,
  HIT_FLAG_DOT = 4,
  HIT_FLAG_IMMUNE = 5,
  HIT_FLAG_IMMUNE_SILENCED = 6,
  HIT_FLAG_FONT_SILENCED = 7,
  HIT_FLAG_DOT_CRITICAL = 8,
  HIT_FLAG_DODGE = 9,
  HIT_FLAG_REFLECT = 10,
  HIT_FLAG_DAMAGE_SHARE = 11,
  HIT_FLAG_DODGE_HIT = 12,
  HIT_FLAG_MAX = 13,
}
