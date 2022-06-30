import { config } from 'dotenv';
config({ path: `.env.${process.env.NODE_ENV || 'development'}.local` });

export const CREDENTIALS = process.env.CREDENTIALS === 'true';
export const {
  NODE_ENV,
  PORT,
  CLIENT_DOMAIN,
  SERVER_DOMAIN,
  DB_HOST,
  DB_PORT,
  DB_DATABASE,
  REDIS_HOST,
  REDIS_PORT,
  SECRET_KEY,
  LOG_FORMAT,
  LOG_DIR,
  ORIGIN,
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI,
  SSL_KEY,
  SSL_CERT,
} = process.env;
