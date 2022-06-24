import { randomBytes, createHmac } from 'crypto';
import { logger } from '@/utils/logger';

/**
 * @method getRandomString
 * @returns {String} random string
 * @description Generate a random string of characters
 *  */
export const getRandomString = (length = 16): string => {
  try {
    const buffer = randomBytes(Math.ceil(length / 2));
    const token = buffer.toString('hex').slice(0, length);
    return token;
  } catch (err) {
    logger.error(err.message);
    throw err;
  }
};

export const sha512 = (toHash: string, salt: string): { salt: string; hash: string } => {
  const hash = createHmac('sha512', salt);
  hash.update(toHash);
  const value = hash.digest('hex');

  return {
    salt: salt,
    hash: value,
  };
};

export const hashMatch = (toHash: string, salt: string, comparison: string): boolean => {
  const hash = createHmac('sha512', salt);
  hash.update(toHash);
  const value = hash.digest('hex');
  return comparison === value;
};
