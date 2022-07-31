import { NODE_ENV } from '@/config';
import rateLimit from 'express-rate-limit';
import ms from 'ms';

export const limiterAuth = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: NODE_ENV === 'production' ? 30 : 99999, // limit each IP to X requests per windowMs
});

// Need to properly test this in prod
export const limiterUsers = rateLimit({
  windowMs: NODE_ENV === 'production' ? 15 * 60 * 1000 : 1000, // 15 minutes
  max: NODE_ENV === 'production' ? 500 : 99999, // limit each IP to X requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
});

// Max 10 raw uploads every 10 minutes per IP
export const rawLimiter = rateLimit({
  windowMs: NODE_ENV === 'production' ? ms('10m') : 1000, // 10 min
  max: NODE_ENV === 'production' ? 10 : 99999, // limit each IP to X requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
});
