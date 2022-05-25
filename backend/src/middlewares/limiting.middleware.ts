import { NODE_ENV } from '@/config';
import rateLimit from 'express-rate-limit';

export const limiterAuth = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: NODE_ENV === 'production' ? 30 : 99999, // limit each IP to 100 requests per windowMs
});

// Need to properly test this in prod
export const limiterUsers = rateLimit({
  windowMs: NODE_ENV === 'production' ? 15 * 60 * 1000 : 1000, // 15 minutes
  max: NODE_ENV === 'production' ? 500 : 99999, // limit each IP to X requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
});
