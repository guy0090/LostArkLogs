import { Exception } from '@/exceptions/Exception';
import { ClassDistribution, ClassDpsRanking } from '@/interfaces/stats.interface';
import logsModel from '@/models/logs.model';
import ConfigService from './config.service';
import UserService from './users.service';
import RedisService from '@/services/redis.service';
import ms from 'ms';
import zlib from 'zlib';

class StatService {
  public logs = logsModel;
  // public rawLogs = this.logs.rawLogs;
  public users = new UserService();
  public config = new ConfigService();

  /**
   * Get the count of logs grouped by region, zone and visibility.
   */
  public getLogCounts = async (byPassCache = false) => {
    try {
      const cached = await RedisService.get('logStats');
      if (cached && !byPassCache) {
        return JSON.parse(cached);
      } else {
        // Log count by region
        const regionCount = await this.logs.aggregate().group({ _id: '$region', count: { $count: {} } });
        // Log count by zone
        const zoneCount = await this.logs.aggregate().group({ _id: '$zoneId', count: { $count: {} } });
        // Log count by visibility
        const visibilityCount = await this.logs.aggregate().group({ _id: '$unlisted', count: { $count: {} } });

        const stats = { regions: regionCount, zones: zoneCount, visibility: visibilityCount };
        await RedisService.set('logStats', JSON.stringify(stats), 'EX', ms('1m'));

        return stats;
      }
    } catch (err) {
      throw new Exception(400, err.message);
    }
  };

  /**
   * Get the total number or each class in database.
   *
   * Is not really indicative of the class distribution since uniques can't be determined right now
   */
  public getClassDistribution = async (byPassCache = false) => {
    try {
      const cached = await RedisService.get('classDistribution');

      if (cached && !byPassCache) {
        return JSON.parse(cached);
      } else {
        const pipeline = [
          {
            // Unwind into individual entities
            $unwind: {
              path: '$entities',
            },
          },
          {
            // Remove NPC entities
            $match: {
              'entities.npcId': 0,
            },
          },
          {
            // Group by class
            $group: {
              _id: '$entities.classId',
              count: {
                $count: {},
              },
            },
          },
        ];

        const results: ClassDistribution[] = await this.logs.aggregate(pipeline); //.sort({ count: -1 });
        const formatted = {};
        results.forEach(result => (formatted[result._id] = result.count));

        await RedisService.set('classDistribution', JSON.stringify(formatted), 'PX', ms('5m'));
        return formatted;
      }
    } catch (err) {
      throw new Exception(400, err.message);
    }
  };

  /**
   * Get the DPS for a class on a boss, decending by DPS.
   * If not class or zone is provided, it will return data for all classes on all bosses.
   *
   * Results are Gzip compressed to reduce memory usage in redis.
   *
   * @param classId The class to get the DPS for
   * @param zoneId The zone to get the DPS for
   * @param byPassCache Bypass the cache and get the data from the database
   */
  public getClassDpsRanking = async (classId?: number, zoneId?: number, byPassCache = false) => {
    try {
      const cached = await RedisService.get(`classDpsRanking:${classId}:${zoneId}`);

      if (cached && !byPassCache) {
        const buffer = Buffer.from(cached, 'base64');
        const decompress = zlib.gunzipSync(buffer).toString();
        return JSON.parse(decompress);
      } else {
        const pipeline = [
          {
            $match: {
              zoneId: zoneId ?? { $gte: 0 },
              'entities.classId': classId ?? { $gt: 0 },
              unlisted: false,
            },
          },
          {
            $unwind: {
              path: '$entities',
            },
          },
          {
            $match: {
              'entities.npcId': 0,
            },
          },
          {
            $sort: {
              'entities.stats.dps': -1,
            },
          },
          {
            $project: {
              region: '$region',
              entity: '$entities',
              dps: '$entities.stats.dps',
            },
          },
        ];

        const results: ClassDpsRanking[] = await this.logs.aggregate(pipeline);
        const buffer = Buffer.from(JSON.stringify(results));
        const compressed = zlib.gzipSync(buffer).toString('base64');

        await RedisService.set(`classDpsRanking:${classId}:${zoneId}`, compressed, 'PX', ms('15m'));

        return results;
      }
    } catch (err) {
      throw new Exception(400, err.message);
    }
  };
}

export default StatService;
