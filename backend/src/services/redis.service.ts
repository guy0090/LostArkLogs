import { logger } from '@/utils/logger';
import Redis from 'ioredis';

class RedisService {
  public static connection: undefined | Redis;
  public static connected = false;

  public static async connect(port: number, host: string) {
    if (RedisService.connected) return true;
    RedisService.connection = new Redis(port, host, {
      enableReadyCheck: true,
      maxRetriesPerRequest: 2,
    });

    RedisService.connection.on('error', err => {
      logger.error('REDIS ERR:', err);
    });

    RedisService.connection.on('ready', () => {
      logger.info('Redis connected');
      RedisService.connected = true;
    });

    RedisService.connection.on('reconnecting', () => {
      logger.info('Redis reconnecting');
      RedisService.connected = false;
    });

    RedisService.connection.on('end', () => {
      logger.info('Redis disconnected');
      RedisService.connected = false;
    });
  }

  public static async ping() {
    if (RedisService.connection && RedisService.connected) return RedisService.connection.ping();
    else return Promise.reject('Redis not connected');
  }

  public static async get(key: string) {
    if (RedisService.connection && RedisService.connected) return RedisService.connection.get(key);
    else return Promise.reject('Redis not connected');
  }

  public static async set(key: string, value: string, expireType?: 'KEEPTTL' | 'PX' | 'EX' | undefined, expireTime?: number) {
    if (RedisService.connection && RedisService.connected) {
      switch (expireType) {
        case 'KEEPTTL':
          return RedisService.connection.set(key, value, 'KEEPTTL');
        case 'PX':
          return RedisService.connection.set(key, value, 'PX', expireTime);
        case 'EX':
          return RedisService.connection.set(key, value, 'EX', expireTime);
        default:
          return RedisService.connection.set(key, value);
      }
    } else return Promise.reject('Redis not connected');
  }

  public static async del(...keys: string[]) {
    if (RedisService.connection && RedisService.connected) return RedisService.connection.del(keys);
    else return Promise.reject('Redis not connected');
  }
}

export default RedisService;
