import { getClassName } from '@/utils/game-classes';
import { getClassIdFromSkillId } from '@/utils/skills';
import ms from 'ms';
import { Session, ENTITY_TYPE, Entity, SkillBreakdown } from './objects';

export const DATA_INTERVAL = ms('5s');

export const formatDate = (number?: number) => {
  if (!number) number = +new Date();
  const date = new Date(number).toISOString().replace(/T/, '_').replace(/:/g, '-').replace(/\./, '-').replace(/Z/, '');

  return date;
};

export const getTotalDps = (encounter: Session) => {
  const duration = (encounter.lastPacket - encounter.firstPacket) / 1000;
  let total = 0;
  for (const entity of encounter.entities) {
    if (entity.type !== ENTITY_TYPE.PLAYER) continue;
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
      player.type = ENTITY_TYPE.PLAYER;
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
    console.log('Failed to parse', intString, err.message);
    intNum = defaultValue;
  }

  return intNum;
};
