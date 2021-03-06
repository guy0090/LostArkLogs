import { getClassName } from './game-classes';
import { getClassIdFromSkillId } from './skills';
import ms from 'ms';
import { Session, EntityType, Entity, SkillBreakdown } from './objects';

export const DATA_INTERVAL = ms('5s');

export const getTotalDps = (encounter: Session) => {
  const duration = (encounter.lastPacket - encounter.firstPacket) / 1000;
  let total = 0;
  for (const entity of encounter.entities) {
    if (entity.type !== EntityType.PLAYER) continue;
    total += entity.stats.damageDealt;
  }
  return duration > 0 && total > 0 ? total / duration : 0;
};

export const getEntityDps = (entity: Entity, begin: number, end: number) => {
  const duration = (end - begin) / 1000;
  return duration > 0 && entity.stats.damageDealt > 0 ? entity.stats.damageDealt / duration : 0;
};

export const trySetClassFromSkills = (player: Entity) => {
  const skills = Object.values(player.skills);
  skills.every(skill => {
    const classId = getClassIdFromSkillId(skill.id);
    if (classId !== 0) {
      player.classId = classId;
      player.class = getClassName(classId);
      player.type = EntityType.PLAYER;
      player.lastUpdate = +new Date();
      return false;
    }
    return true;
  });
};

export const getEntityDamageInRange = (begin: number, end: number, entity: Entity) => {
  const skills = Object.values(entity.skills);
  const damageDealtInRange = skills.reduce((acc, skill) => {
    const skillEntries = (skill.breakdown as SkillBreakdown[]).filter(d => d.timestamp >= begin && d.timestamp <= end);
    return acc + skillEntries.reduce((acc, d) => acc + d.damage, 0);
  }, 0);

  if (!damageDealtInRange || isNaN(damageDealtInRange)) return 0;
  return damageDealtInRange;
};

export const getEntityDPS = (duration: number, damage: number) => {
  return damage > 0 ? (damage / duration).toFixed(2) : '0';
};

export const generateIntervals = (started: number, ended: number) => {
  if (started === 0 || ended === 0) return [];

  const duration = ended - started;
  const intervals = [];

  const parts = duration / DATA_INTERVAL;
  for (let i = 0; i <= Math.floor(parts); i++) {
    if (i === Math.floor(parts)) intervals.push(parts * DATA_INTERVAL);
    else intervals.push(i * DATA_INTERVAL);
  }
  return intervals;
};

export const getEntityData = (intervals: number[], player: Entity, started: number) => {
  const data: number[] = [];

  intervals.forEach(i => {
    const damage = getEntityDamageInRange(started, started + i, player);
    const dps = parseFloat(getEntityDPS(i / 1000, damage));
    data.push(dps);
  });

  return data;
};

export const tryParseNum = (intString: string, float = false, defaultValue = 0, radix = 10) => {
  let intNum: number;

  try {
    intNum = float ? parseFloat(intString.replace(/,/g, '.')) : parseInt(intString, radix);
    if (isNaN(intNum)) intNum = defaultValue;
  } catch (err) {
    // console.log('Failed to parse', intString, err.message);
    intNum = defaultValue;
  }

  return intNum;
};

export const guardians = [
  509006, 512002, 512004, 512006, 512008, 512009, 512011, 512012, 512013, 512014, 512015, 512016, 512017, 512019, 512020, 512022, 512023, 512025,
  512027, 593007, 593017, 620010, 620020, 620030, 620040, 620050, 620051, 620052, 620060, 620061, 620070, 620071, 620080, 620100, 620110, 620140,
  620145, 620146, 620150, 620170, 620180, 620190, 620200, 620210, 620220, 620230, 620237, 620238, 620240, 620241, 620242, 620260, 622010, 622020,
  622030, 622040, 622050, 622060, 622070, 622080, 622090, 622100, 622110, 622120, 622130, 622140, 622150, 622160, 622170, 622190, 622200, 623031,
  623070, 624010, 624020, 624021, 624030, 624140, 630020, 630110, 630120, 630210, 630220, 630310, 630320, 630330, 630410, 630420, 630510, 630520,
  630530, 630610, 630620, 630810, 630820, 630830, 630910, 630920, 630930, 631810, 631820, 631830, 632610, 632620, 632630, 632710, 632720, 632730,
  632810, 632820, 632830, 632910, 632920, 632930, 633210, 633220, 633230, 633310, 633320, 633330, 633410, 633420, 633430, 633510, 633520, 633530,
  633610, 633620, 633630, 633710, 633720, 633730, 633810, 633820, 633830, 633840, 634110, 634120, 634130, 634140, 634150, 634160, 634170, 634180,
  634190, 634200, 634210, 634220, 634230, 634240, 634250, 720011, 620290, 620295, 620160, 620250, 620270, 622210, 630030, 620281, 620280,
];
