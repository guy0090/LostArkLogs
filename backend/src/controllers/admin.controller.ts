import RedisService from '@/services/redis.service';
import { NextFunction, Response } from 'express';
import { RequestWithUser } from '@/interfaces/auth.interface';

class AdminController {
  /**
   * Get info about redis instance.
   *
   * @param req The passed request from express middleware
   * @param res The passed response from express middleware
   * @param next The next function to be called on fail to pass along to error middleware
   */
  public getCacheStatus = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const status = await RedisService.info();
      res.status(200).json(status);
    } catch (err) {
      next(err);
    }
  };

  /**
   * Clear all cached keys from Redis.
   *
   * @param req The passed request from express middleware
   * @param res The passed response from express middleware
   * @param next The next function to be called on fail to pass along to error middleware
   */
  public clearCache = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const keys = await RedisService.keys();
      await RedisService.flush();
      res.status(200).json({ message: 'Cache cleared', keysCleared: keys.length });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get all cached keys from Redis.
   *
   * @param req The passed request from express middleware
   * @param res The passed response from express middleware
   * @param next The next function to be called on fail to pass along to error middleware
   */
  public getCachedKeys = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const keys = await RedisService.keys();
      const withTtl = [];
      for (const key of keys) {
        const [field, val] = key.split(':');
        if (field === 'user' && val.length === 32) {
          // Don't add keys with API keys to the list
          continue;
        }
        const ttl = await RedisService.pexpiretime(key);

        withTtl.push({
          key,
          ttl,
        });
      }

      res.status(200).json(withTtl);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Remove one or more cached keys from Redis.
   *
   * @param req The passed request from express middleware with key to remove
   * @param res The passed response from express middleware
   * @param next The next function to be called on fail to pass along to error middleware
   */
  public removeCachedKey = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const keys: string[] = req.body.keys;
      await RedisService.mdel(keys);
      res.status(200).json({ message: 'Removed key', keys });
    } catch (error) {
      next(error);
    }
  };
}

export default AdminController;
