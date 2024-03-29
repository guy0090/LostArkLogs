import { getClassId, getClassName } from "./lib/game-classes";
import { EventEmitter } from "events";
import {
  LINE_SPLIT_CHAR,
  LogHeal,
  LogDeath,
  LogNewPc,
  LogDamage,
  LogNewNpc,
  LogInitEnv,
  LogBuff,
  LogCounterAttack,
  /*LogPhaseTransition,*/
  LogSkillStart,
  HitFlag,
  HitOption,
} from "./lib/loglines";

import {
  Entity,
  EntityType,
  Session,
  SimpleSession,
  Skill,
  SkillBreakdown,
} from "./lib/objects";
import {
  generateIntervals,
  getEntityData,
  getEntityDps,
  getTotalDps,
  tryParseNum,
  trySetClassFromSkills,
} from "./lib/util";
import { Zone, ZoneType } from "@/interfaces/session.interface";

export interface ActiveUser {
  id: string;
  name: string;
  realName: string;
  classId: number;
  level: number;
  gearLevel: number;
}

export interface PacketParserConfig {
  removeOverkillDamage?: boolean | undefined;
}

export class PacketParser extends EventEmitter {
  private session: Session;
  private removeOverkillDamage: boolean;
  private hasBossEntity: boolean;
  private activeUser: ActiveUser;
  private supportedBosses: number[];
  private guardians: number[];

  // TODO: Temp workaround for valtan ghost phase
  private valtanGhostId: string | undefined = undefined;

  constructor(zones: Zone[]) {
    // Extend
    super();

    // Config
    this.removeOverkillDamage = true;
    this.hasBossEntity = false;
    this.activeUser = {
      id: "0",
      name: "You",
      realName: "",
      classId: 0,
      level: 1,
      gearLevel: 0,
    };

    // Init
    this.supportedBosses = zones
      .filter(
        (z) =>
          z.type !== ZoneType.Guardian && z.type !== ZoneType.ChallengeGuardian
      )
      .reduce((acc, zone) => [...acc, ...zone.bosses], [] as number[]);
    this.guardians = zones
      .filter(
        (z) =>
          z.type === ZoneType.Guardian || z.type === ZoneType.ChallengeGuardian
      )
      .reduce((acc, zone) => [...acc, ...zone.bosses], [] as number[]);
    this.session = new Session();
  }

  parseLog(logData: string[]) {
    const encounters: SimpleSession[] = [];
    const phaseRanges = this.getPhaseRanges(logData);

    console.log(`Parsing ${phaseRanges.length} potential encounters`);
    for (const phaseRange of phaseRanges) {
      const lines = logData.slice(phaseRange[0], phaseRange[1] + 1);
      lines.forEach((line) => this.parse(line));

      const bosses = this.session.getBosses();
      if (bosses.length > 0) {
        const totalHp = [...bosses].sort((a, b) => b.maxHp - a.maxHp)[0].maxHp;
        const totalTaken = bosses.reduce((p, c) => p + c.stats.damageTaken, 0);

        // If damage taken is at least 95% of total, keep the encounter
        if (totalTaken >= totalHp * 0.95) {
          encounters.push(this.session.toSimpleObject());
        }
      }

      // If session has started, reset it
      if (this.session.firstPacket > 0) {
        this.session = new Session();
        this.hasBossEntity = false;
      }

      this.valtanGhostId = "";
    }
    console.log(
      `Parser found ${encounters.length} encounters (dropped ${
        phaseRanges.length - encounters.length
      })`
    );

    return {
      encounters,
      parsed: encounters.length,
      found: phaseRanges.length,
      dropped: phaseRanges.length - encounters.length,
    };
  }

  getPhaseRanges(lines: string[]): [[number, number]] {
    const phaseIndices: number[] = lines.reduce((acc, line, index) => {
      if (line.startsWith("2|")) acc.push(index);
      return acc;
    }, [] as number[]);

    const phaseRanges: [[number, number]] = [[0, phaseIndices[0]]];
    phaseIndices.forEach((envIndex, i) => {
      if (i !== 0) phaseRanges.push([phaseRanges[i - 1][1] + 1, envIndex]);
    });

    return phaseRanges;
  }

  getSession(): Session {
    return this.session;
  }

  getEntity(id: string, byName = false): Entity | undefined {
    if (byName)
      return this.session.entities.find((entity) => entity.name === id);
    return this.session.entities.find((entity) => entity.id === id);
  }

  getEntityIndex(id: string, byName = false): number {
    if (byName)
      return this.session.entities.findIndex((entity) => entity.name === id);
    return this.session.entities.findIndex((entity) => entity.id === id);
  }

  isBossEntity(entityNpcId: number) {
    if (this.guardians.includes(entityNpcId)) return false;
    return this.supportedBosses.includes(entityNpcId);
  }

  isGuardianEntity(entityNpcId: number) {
    return this.guardians.includes(entityNpcId);
  }

  setRemoveOverkillDamage(removeOverkillDamage: boolean) {
    this.removeOverkillDamage = removeOverkillDamage;
  }

  hasBoss(entities: Entity[], mustBeAlive = true) {
    return entities.some(
      (entity) =>
        (entity.type === EntityType.BOSS ||
          entity.type === EntityType.GUARDIAN) &&
        (mustBeAlive ? entity.currentHp > 0 : true)
    );
  }

  getBoss() {
    const bosses = this.session.entities.filter(
      (entity) =>
        entity.type === EntityType.BOSS || entity.type === EntityType.GUARDIAN
    );

    if (bosses.length > 0) {
      return bosses.sort((a, b) => {
        return b.lastUpdate - a.lastUpdate;
      })[0];
    } else {
      return undefined;
    }
  }

  parse(line: string) {
    if (!line) {
      return;
    }

    const lineSplit = line.trim().split(LINE_SPLIT_CHAR);
    if (lineSplit.length < 1 || !lineSplit[0]) {
      return;
    }
    try {
      const logType = tryParseNum(lineSplit[0]);
      const timestamp = +new Date(lineSplit[1]);

      switch (logType) {
        case 1:
          this.onInitEnv(new LogInitEnv(lineSplit));
          break;
        case 2:
          this.onPhaseTransition(/*new LogPhaseTransition(lineSplit)*/);
          break;
        case 3:
          this.onNewPc(new LogNewPc(lineSplit));
          break;
        case 4:
          this.onNewNpc(new LogNewNpc(lineSplit));
          break;
        case 5:
          this.onDeath(new LogDeath(lineSplit));
          break;
        case 6:
          this.onSkillStart(new LogSkillStart(lineSplit));
          break;
        /*
        case 7:
          this.onSkillStage(new LogSkillStage(lineSplit));
          break;
        */
        case 8:
          this.onDamage(new LogDamage(lineSplit));
          break;
        case 9:
          this.onHeal(new LogHeal(lineSplit));
          break;
        case 10:
          this.onBuff(new LogBuff(lineSplit));
          break;
        /**
          case 11
          this.onBuffRemove(linesplit);
          break;
        */
        case 12:
          this.onCounter(new LogCounterAttack(lineSplit));
          break;
      }

      this.session.lastPacket = timestamp;
      // this.broadcastSessionChange();
    } catch (err) {
      // console.log(`Failed to parse log line: ${(err as Error).message}`);
    }
  }

  // logId = 1 | On: Most loading screens
  onInitEnv(packet: LogInitEnv) {
    const player = this.getEntity(this.activeUser.id);
    if (player) player.id = packet.playerId;
    this.activeUser.id = packet.playerId;

    const boss = this.getBoss();
    if (boss && boss.currentHp >= 0) boss.currentHp = -1;
  }

  // logId = 2 | On: Any encounter (with a boss?) ending, wiping or transitioning phases
  onPhaseTransition(/*packet: LogPhaseTransition*/) {
    this.session.cleanEntities();
    this.session.damageStatistics.dps = getTotalDps(this.session);

    this.session.entities.forEach((e) => {
      if (e.type !== EntityType.PLAYER) return;
      e.stats.dps = getEntityDps(
        e,
        this.session.firstPacket,
        this.session.lastPacket
      );
    });

    // Generate data intervals
    const intervals = generateIntervals(
      this.session.firstPacket,
      this.session.lastPacket
    );
    this.session.damageStatistics.dpsIntervals = intervals;

    // Create DPS over time data for ECharts for each player entity
    for (const e of this.session.entities) {
      if (e.type === EntityType.PLAYER) {
        e.stats.dpsOverTime = getEntityData(
          intervals,
          e,
          this.session.firstPacket
        );
      }
    }
  }

  // logId = 3 | On: A new player character is found (can be the user if the meter was started after a loading screen)
  onNewPc(packet: LogNewPc) {
    if (packet.id === packet.name) {
      return;
    }

    let user = this.getEntity(packet.id) || this.getEntity(packet.name, true);
    if (!user) {
      user = new Entity(packet);
      if (user.classId === 0) {
        user.classId = getClassId(user.class);
        user.class = getClassName(user.classId);
      }

      if (user.id === this.activeUser.id) {
        user.name = this.activeUser.name; // this.activeUser.realName;
        user.level = this.activeUser.level;
        user.gearLevel = this.activeUser.gearLevel;
      }

      user.lastUpdate = packet.timestamp;
      this.session.entities.push(user);
    } else {
      user.id = packet.id;
      user.class = packet.class;
      user.classId = packet.classId;
      user.type = EntityType.PLAYER;

      if (packet.id === this.activeUser.id) {
        user.name = this.activeUser.name;
        user.level = this.activeUser.level;
        user.gearLevel = this.activeUser.gearLevel;
      }

      user.lastUpdate = packet.timestamp;
    }
  }

  // logId = 4 | On: A new non-player character is found
  onNewNpc(packet: LogNewNpc) {
    const isBoss = this.isBossEntity(packet.npcId);
    const isGuardian = this.isGuardianEntity(packet.npcId);

    if (isBoss) packet.type = EntityType.BOSS;
    else if (isGuardian) packet.type = EntityType.GUARDIAN;
    else packet.type = EntityType.MONSTER;

    // TODO: name is passed in korean
    if (packet.npcId === 42060070) {
      packet.name = "Ravaged Tyrant of Beasts";
      packet.id = this.valtanGhostId as string;
    }

    let npc = this.getEntity(packet.id); // || this.getEntity(packet.name, true);
    if (npc) {
      npc.currentHp = packet.currentHp;
      npc.maxHp = packet.maxHp;
      npc.name = packet.name;
      npc.id = packet.id;
      npc.lastUpdate = packet.timestamp;
    } else {
      npc = new Entity(packet);
      // Only persist Boss-type NPCs
      npc.lastUpdate = packet.timestamp;
      if (isBoss || isGuardian) {
        this.session.entities.push(npc);
      }
    }

    this.hasBossEntity = this.hasBoss(this.session.entities);
  }

  // logId = 5 | On: Death of any NPC or PC
  onDeath(packet: LogDeath) {
    const target = this.getEntity(packet.id);
    const skipFilter = [EntityType.GUARDIAN, EntityType.BOSS];

    if (target && !skipFilter.includes(target.type)) {
      if (target.type === EntityType.PLAYER) {
        target.stats.deaths += 1;
        target.lastUpdate = packet.timestamp;
      } else {
        const entityIndex = this.getEntityIndex(packet.id);
        this.session.entities.splice(entityIndex, 1);
      }
    }
  }

  // logId = 6
  onSkillStart(packet: LogSkillStart) {
    const source = this.getEntity(packet.id);
    if (
      source &&
      source.type === EntityType.PLAYER &&
      this.session.firstPacket > 0
    ) {
      source.stats.casts += 1;

      if (!(packet.skillId in source.skills)) {
        source.addSkill(
          packet.skillId,
          new Skill({ id: packet.skillId, name: packet.skillName })
        );
      }
      const activeSkill = source.skills[packet.skillId];
      activeSkill.stats.casts += 1;
    }
  }

  /*
  // logId = 7
  onSkillStage(packet: LogSkillStage) {
    console.log("Skill Stage", { packet });
  }
  */

  // logId = 8 | On: Any damage event
  onDamage(packet: LogDamage) {
    if (Object.keys(packet).length < 13) {
      console.warn(`onDamage is too short: ${JSON.stringify(packet)}`);
      return;
    }

    const { damageModifier } = packet;
    const hitFlag: HitFlag = damageModifier & 0xf;

    if (hitFlag === HitFlag.HIT_FLAG_INVINCIBLE) return;

    let source = this.getEntity(packet.sourceId);
    let sourceMissing = false;
    if (!source) {
      source = new Entity({
        id: packet.sourceId,
        name: packet.sourceName,
        lastUpdate: packet.timestamp,
      });
      sourceMissing = true;
    }

    let target = this.getEntity(packet.targetId);
    if (!target) {
      target = this.getEntity(packet.targetName, true);
      if (target) {
        target.id = packet.targetId;
        target.currentHp = packet.currentHp;
        target.maxHp = packet.maxHp;
      } else return;
    }

    // Only process damage events if the target is a boss or player
    // Only process damage events if a boss is present in session
    // Don't count damage if session is paused
    if (
      target.type === EntityType.MONSTER ||
      target.type === EntityType.UNKNOWN ||
      !this.hasBossEntity ||
      this.session.paused
    ) {
      return;
    }

    target.currentHp = packet.currentHp;
    target.maxHp = packet.maxHp;

    target.lastUpdate = packet.timestamp;
    source.lastUpdate = packet.timestamp;

    if (
      target.type !== EntityType.PLAYER &&
      this.removeOverkillDamage &&
      packet.currentHp < 0
    ) {
      this.hasBossEntity = this.hasBoss(this.session.entities);
      packet.damage += packet.currentHp;
    }

    if (!(packet.skillId in source.skills)) {
      source.addSkill(
        packet.skillId,
        new Skill({ id: packet.skillId, name: packet.skillName })
      );
    }

    const activeSkill = source.skills[packet.skillId];
    if (source.type === EntityType.PLAYER && source.classId === 0) {
      trySetClassFromSkills(source);
    }

    // Try to add a missing player
    if (
      sourceMissing &&
      source.classId === 0 &&
      source.type === EntityType.UNKNOWN
    ) {
      trySetClassFromSkills(source);
      if (source.classId !== 0) this.session.entities.push(source);
    }

    if (target.type === EntityType.PLAYER && target.classId === 0) {
      trySetClassFromSkills(target);
    }

    const hitOption: HitOption = ((damageModifier >> 4) & 0x7) - 1;

    const isCrit =
      hitFlag === HitFlag.HIT_FLAG_CRITICAL ||
      hitFlag === HitFlag.HIT_FLAG_DOT_CRITICAL;
    const isBackAttack = hitOption === HitOption.HIT_OPTION_BACK_ATTACK;
    const isFrontAttack = hitOption === HitOption.HIT_OPTION_FRONTAL_ATTACK;

    const critCount = isCrit ? 1 : 0;
    const backAttackCount = isBackAttack ? 1 : 0;
    const frontAttackCount = isFrontAttack ? 1 : 0;

    activeSkill.stats.damageDealt += packet.damage;
    if (packet.damage > activeSkill.stats.topDamage)
      activeSkill.stats.topDamage = packet.damage;

    source.stats.damageDealt += packet.damage;
    target.stats.damageTaken += packet.damage;

    source.stats.hits += 1;
    source.stats.crits += critCount;
    source.stats.backHits += backAttackCount;
    source.stats.frontHits += frontAttackCount;

    activeSkill.stats.hits += 1;
    activeSkill.stats.crits += critCount;
    activeSkill.stats.backHits += backAttackCount;
    activeSkill.stats.frontHits += frontAttackCount;

    if (source.type === EntityType.PLAYER) {
      activeSkill.breakdown?.push(
        new SkillBreakdown({
          timestamp: packet.timestamp,
          damage: packet.damage,
          isCrit: isCrit,
          isBackHit: isBackAttack,
          isFrontHit: isFrontAttack,
          targetEntity: target.id,
        })
      );

      this.session.damageStatistics.totalDamageDealt += packet.damage;
      this.session.damageStatistics.topDamageDealt = Math.max(
        this.session.damageStatistics.topDamageDealt,
        source.stats.damageDealt
      );
    }

    if (target.type === EntityType.PLAYER) {
      this.session.damageStatistics.totalDamageTaken += packet.damage;
      this.session.damageStatistics.topDamageTaken = Math.max(
        this.session.damageStatistics.topDamageTaken,
        target.stats.damageTaken
      );
    }

    if (this.session.firstPacket === 0) {
      this.session.firstPacket = packet.timestamp;
    }
  }

  // logId = 9
  onHeal(packet: LogHeal) {
    const source = this.getEntity(packet.id);

    if (source) {
      source.lastUpdate = packet.timestamp;
      source.stats.healing += packet.healAmount;
    }
  }

  onBuff(packet: LogBuff) {
    // TODO: Workaround for valtan ghost damage
    if (
      packet.buffName ===
      "하얗게 불사르고 망령화_마수군단장의 근성 감소 버프 제거 인보크 버프"
    ) {
      this.valtanGhostId = packet.sourceId;
    }
  }

  // logId = 11
  onCounter(packet: LogCounterAttack) {
    const source = this.getEntity(packet.id);

    if (source) {
      source.lastUpdate = packet.timestamp;
      source.stats.counters += 1;
    }
  }
}
