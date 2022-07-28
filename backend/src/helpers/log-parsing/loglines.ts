/* eslint-disable @typescript-eslint/no-unused-vars */
import { tryParseNum } from './util';
import { ENTITY_TYPE } from './objects';

export const LINE_SPLIT_CHAR = '|';

// logId = -1
export class LogMessage {
  timestamp: number;
  message: string | unknown;
  constructor(lineSplit: string[]) {
    this.timestamp = +new Date(lineSplit[1]);
    this.message = lineSplit[2];
  }
}

// logId = 0
export class LogInitPc {
  timestamp: number;
  id: string;
  name: string;
  classId: number;
  class: string;
  level: number;
  gearLevel: number;
  currentHp: number;
  maxHp: number;
  type: ENTITY_TYPE;

  constructor(lineSplit: string[]) {
    this.timestamp = +new Date(lineSplit[1]);
    this.id = lineSplit[2];
    this.name = lineSplit[3] || 'Unknown Entity';
    this.classId = tryParseNum(lineSplit[4]);
    this.class = lineSplit[5] || 'Unknown Class';
    this.level = tryParseNum(lineSplit[6]);
    this.gearLevel = tryParseNum(lineSplit[7], true);
    this.currentHp = tryParseNum(lineSplit[8]);
    this.maxHp = tryParseNum(lineSplit[9]);
    this.type = ENTITY_TYPE.PLAYER;
  }
}

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

export enum RAID_RESULT {
  UNK = -1,
  RAID_RESULT = 0, // Raid ended; Not sure when it procs
  GUARDIAN_DEAD = 1, // Guardian died; Also procs on every Argos phase
  RAID_END = 2, // Non-guardian boss died; Party wiped (does not proc on guardian wipes)
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
export class LogNewPc extends LogInitPc {
  constructor(lineSplit: string[]) {
    super(lineSplit);
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
  type: ENTITY_TYPE;

  constructor(lineSplit: string[]) {
    this.timestamp = +new Date(lineSplit[1]);
    this.id = lineSplit[2];
    this.npcId = tryParseNum(lineSplit[3]);
    this.name = lineSplit[4] || 'Unknown Entity';
    this.currentHp = tryParseNum(lineSplit[5]);
    this.maxHp = tryParseNum(lineSplit[6]);
    this.type = ENTITY_TYPE.UNKNOWN;
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
    this.name = lineSplit[3] || 'Unknown Entity';
    this.killerId = lineSplit[4];
    this.killerName = lineSplit[5] || 'Unknown Entity';
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
    this.name = lineSplit[3] || 'Unknown Entity';
    this.skillId = tryParseNum(lineSplit[4]);
    this.skillName = lineSplit[5] || 'Unknown Skill';
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
    this.name = lineSplit[3] || 'Unknown Entity';
    this.skillId = tryParseNum(lineSplit[4]);
    this.skillName = lineSplit[5] || 'Unknown Skill';
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
  damageModifier: number;
  isCrit: boolean;
  isBackAttack: boolean;
  isFrontAttack: boolean;
  currentHp: number;
  maxHp: number;
  constructor(lineSplit: string[]) {
    this.timestamp = +new Date(lineSplit[1]);
    this.sourceId = lineSplit[2];
    this.sourceName = lineSplit[3] || 'Unknown Entity';
    this.skillId = tryParseNum(lineSplit[4]);
    this.skillName = lineSplit[5] || 'Unknown Skill';
    this.skillEffectId = tryParseNum(lineSplit[6]);
    this.skillEffect = lineSplit[7];
    this.targetId = lineSplit[8];
    this.targetName = lineSplit[9] || 'Unknown Entity';
    this.damage = tryParseNum(lineSplit[10]);
    this.damageModifier = tryParseNum(lineSplit[11], false, 0, 16);
    this.isCrit = lineSplit[12] === '1';
    this.isBackAttack = lineSplit[13] === '1';
    this.isFrontAttack = lineSplit[14] === '1';
    this.currentHp = tryParseNum(lineSplit[15]);
    this.maxHp = tryParseNum(lineSplit[16]);
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
    this.name = lineSplit[3] || 'Unknown Entity';
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
  isNew: boolean;
  sourceId: string;
  sourceName: string;
  shieldAmount: number;

  constructor(lineSplit: string[]) {
    this.timestamp = +new Date(lineSplit[1]);
    this.id = lineSplit[2];
    this.name = lineSplit[3] || 'Unknown Entity';
    this.buffId = lineSplit[4];
    this.buffName = lineSplit[5] || 'Unknown Buff';
    this.isNew = lineSplit[6] === '1';
    this.sourceId = lineSplit[7];
    this.sourceName = lineSplit[8] || 'Unknown Entity';
    this.shieldAmount = tryParseNum(lineSplit[9], true, 0);
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
    this.name = lineSplit[3] || 'Unknown Entity';
    this.targetId = lineSplit[4];
    this.targetName = lineSplit[5] || 'Unknown Entity';
  }
}
