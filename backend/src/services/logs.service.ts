import { Exception } from '@/exceptions/Exception';
import { ENTITY_TYPE, Log, LogFilter, RawLog } from '@/interfaces/logs.interface';
import logsModel from '@/models/logs.model';
import { LogFilterOptions, LogObject, RawLogObject } from '@/objects/log.object';
import mongoose from 'mongoose';
import { validate, ValidationError } from 'class-validator';
import { logger } from '@/utils/logger';
import UserService from '@/services/users.service';
import RedisService from '@/services/redis.service';
import ms from 'ms';
import { md5 } from '@/utils/crypto';
import ConfigService from './config.service';
import rawLogsModel from '@/models/rawlogs.model';

class LogsService {
  public logs = logsModel;
  public rawLogs = rawLogsModel;
  public users = new UserService();
  public configService = new ConfigService();

  /**
   * Create a new DPS log.
   *
   * @param log The log to create
   * @returns The created log
   */
  public createLog = async (log: LogObject) => {
    try {
      const created = await this.logs.create(log);
      if (!created) throw new Exception(500, 'Error creating log');

      RedisService.set(`log:${created._id}`, JSON.stringify(created), 'PX', ms('5m'));

      return new LogObject(created);
    } catch (err) {
      throw new Exception(400, err.message);
    }
  };

  public createRawLog = async (log: RawLog) => {
    try {
      const created = await this.rawLogs.create(log);
      if (!created) throw new Exception(500, 'Error creating log');

      return new RawLogObject(created);
    } catch (err) {
      throw new Exception(400, err.message);
    }
  };

  /**
   * Get a DPS log by its ID.
   *
   * @param id Get a log by its ID
   * @returns The log if found
   */
  public getLogById = async (id: mongoose.Types.ObjectId | string, byPassCache = false): Promise<LogObject> => {
    try {
      let log: Log = null;
      const cached = await RedisService.get(`log:${id}`);
      if (cached && !byPassCache) {
        log = JSON.parse(cached);
      } else {
        log = await this.logs.findById(id).lean();
        if (!log) throw new Exception(500, 'Error finding log');
        await RedisService.set(`log:${id}`, JSON.stringify(log), 'PX', ms('5m'));
      }

      return new LogObject(log);
    } catch (err) {
      throw new Exception(400, err.message);
    }
  };

  public getRawLogById = async (id: mongoose.Types.ObjectId | string) => {
    try {
      const log = await this.rawLogs.findById(id).lean();
      if (!log) throw new Exception(404, 'Raw log not found');

      return new RawLogObject(log);
    } catch (err) {
      throw new Exception(400, err.message);
    }
  };

  /**
   * Delete a log by its ID.
   *
   * @param id The ID of the log to delete
   * @returns Nothing
   */
  public deleteLog = async (id: mongoose.Types.ObjectId | string): Promise<void> => {
    try {
      await this.logs.findByIdAndDelete(id);

      const logged = await RedisService.get(`log:${id}`);
      if (logged) await RedisService.del(`log:${id}`);

      return;
    } catch (err) {
      throw new Exception(400, err.message);
    }
  };

  /**
   * Delete all logs associated with a user.
   *
   * @param userId The user to delete logs for
   * @returns Nothing
   */
  public deleteAllUserLogs = async (userId: mongoose.Types.ObjectId): Promise<void> => {
    try {
      await this.logs.deleteMany({ creator: userId });
      return;
    } catch (err) {
      throw new Exception(400, err.message);
    }
  };

  /**
   * Gets a unique list of all currently tracked bosses in logs.
   *
   * @param type The type of entities to get
   * @returns The list of entities
   */
  public getUniqueEntities = async (type?: ENTITY_TYPE[] | undefined): Promise<any[]> => {
    if (!type) type = [ENTITY_TYPE.BOSS, ENTITY_TYPE.GUARDIAN];

    const cached = await RedisService.get(`uniqueEntities:${type.join(',')}`);
    if (cached) return JSON.parse(cached);

    try {
      const bosses = [];
      // TODO: Use find here instead?
      const aggregate = await this.logs.aggregate([
        {
          $unwind: {
            path: '$entities',
            preserveNullAndEmptyArrays: false,
          },
        },
        {
          $match: {
            'entities.type': {
              $in: type,
            },
          },
        },
        {
          $group: {
            _id: {
              id: '$entities.npcId',
              // name: '$entities.name',
              type: '$entities.type',
            },
          },
        },
      ]);

      for (const doc of aggregate) {
        bosses.push(doc._id);
      }

      await RedisService.set(`uniqueEntities:${type.join(',')}`, JSON.stringify(bosses), 'PX', ms('5m'));

      return bosses;
    } catch (err) {
      logger.error(err);
      throw new Exception(500, 'Error getting bosses');
    }
  };

  /**
   * Get a list of logs based on a specified filter.
   * TODO: Describe this in more detail
   *
   * @param filter The filter to use
   * @param options The options to use
   * @returns The list of logs
   */
  public getFilteredLogs = async (filter: LogFilter, options?: LogFilterOptions) => {
    options = new LogFilterOptions(options);
    // eslint-disable-next-line prefer-const
    let { pageSize, includeUnlisted } = options;

    try {
      const aggrPipeline: any[] = [
        {
          // Match for filtered bosses, creator and creation date first
          $match: {},
        },
        {
          // Unwind entities to allow specific filters
          $unwind: {
            path: '$entities',
            preserveNullAndEmptyArrays: false,
          },
        },
        {
          // Add specific entity filters
          $match: {},
        },
        {
          // Group by ID and DPS
          $group: {
            _id: {
              id: '$_id',
              createdAt: '$createdAt',
              dps: '$damageStatistics.dps',
            },
          },
        },
      ];

      const firstMatch = {
        // Only include publicly listed logs
        unlisted: false,
      };

      let userId: mongoose.Types.ObjectId | undefined = undefined;
      if (filter.key) {
        userId = (await this.users.findByApiKey(filter.key))._id;
        if (typeof userId === 'string') userId = new mongoose.Types.ObjectId(userId);

        // If a user is requesting their own logs, include all logs
        delete firstMatch.unlisted;
      } else if (filter.creator) {
        userId = new mongoose.Types.ObjectId(filter.creator);
      }

      // If the requesting user has access to view unlisted logs, show them as well
      if (includeUnlisted && firstMatch.unlisted !== undefined) delete firstMatch.unlisted;

      if (userId) {
        firstMatch['creator'] = userId;
      }

      if (filter.bosses.length > 0) {
        firstMatch['entities.npcId'] = {
          $in: filter.bosses,
        };
      }

      if (filter.sort) {
        const field = `_id.${filter.sort[0]}`;
        const order = filter.sort[1];

        aggrPipeline.push({ $sort: { [field]: order } });
      }

      // If the filter contains a time range, sort by creation date (by most recent)
      // If it doesn't contain a time range, sort by DPS (by highest)
      // TODO: Add an option to sort by either
      if (filter.range.length > 0) {
        firstMatch['createdAt'] = {
          $gte: filter.range[0],
          $lte: filter.range[1],
        };
        if (!filter.sort) aggrPipeline.push({ $sort: { '_id.createdAt': -1 } });
      } else {
        if (!filter.sort) aggrPipeline.push({ $sort: { '_id.dps': -1 } });
      }

      const secondMatch = {
        'entities.level': {
          $gte: filter.level[0], // default 0
          $lte: filter.level[1], // default 60
        },
        'entities.gearLevel': {
          $gte: filter.gearLevel[0], // default 302
          $lte: filter.gearLevel[1], // default 1625
        },
        'damageStatistics.dps': {
          $gte: filter.partyDps, // default 0
        },
      };

      if (filter.classes.length > 0) {
        secondMatch['entities.classId'] = { $in: filter.classes };
      }

      aggrPipeline[0] = { $match: firstMatch };
      aggrPipeline[2] = { $match: secondMatch };
      aggrPipeline.push({ $limit: 200 });

      const hash = md5(JSON.stringify(aggrPipeline));
      const cached = await RedisService.get(`filteredLogs:${hash}`);
      let foundIds = [];
      if (cached !== null) {
        foundIds = JSON.parse(cached);
      } else {
        foundIds = await this.logs.aggregate(aggrPipeline);
        RedisService.set(`filteredLogs:${hash}`, JSON.stringify(foundIds), 'PX', ms('5m'));
      }

      const count = foundIds.length;
      const page = filter.page;
      if (filter.pageSize) pageSize = filter.pageSize;

      // If page exists, it must be greater than 0, therefore we 0 index before slicing
      if (page) foundIds = foundIds.slice((page - 1) * pageSize, page * pageSize);

      if (foundIds.length > 0) {
        const logIds = foundIds.map(grp => grp._id.id);
        const findQuery = { _id: { $in: logIds } };
        const foundLogs = await this.logs.find(findQuery).lean();
        const remapped = foundLogs.map(log => new LogObject(log));

        return { found: count, pageSize, logs: remapped };
      } else {
        return { found: 0, pageSize: 0, logs: [] };
      }
    } catch (err) {
      logger.error(`Error filtering for logs: ${err.message}`);
      throw new Exception(400, 'Error getting filtered logs');
    }
  };

  /**
   * Validate a log object.
   *
   * @param log The log object to validate
   * @returns nothing
   * @throws Exception if the log is invalid
   */
  public async validateLog(log: LogObject) {
    try {
      const errors: ValidationError[] = await validate(log, { validationError: { target: false, value: false } });
      if (errors.length > 0) {
        let allErrors = [];

        errors.forEach(error => {
          const transformed = this.transformError(error);
          allErrors = [...allErrors, ...transformed];
        });

        throw new Exception(400, JSON.stringify(allErrors));
      }

      const players = log.entities.filter(entity => entity.type === ENTITY_TYPE.PLAYER);
      if (players.length === 0) throw new Exception(400, 'No players found in log');

      const nonPlayers = log.entities.filter(entity => entity.type !== ENTITY_TYPE.PLAYER).map(entity => entity.npcId);
      const { supportedBosses } = await this.configService.getConfig();
      for (const npcId of nonPlayers) {
        if (!supportedBosses.includes(npcId)) throw new Exception(400, `${npcId} is not a supported boss`);
      }

      return;
    } catch (err) {
      throw new Exception(400, err.message);
    }
  }

  /**
   * Fetch nested validation errors and return them
   *
   * @param error The error to transform
   * @returns The transformed errors
   */
  private transformError(error: ValidationError) {
    const errors = [];
    if (error.constraints) {
      errors.push(error.constraints);
    }

    if (error.children.length > 0) {
      error.children.forEach(child => {
        errors.push(...this.transformError(child));
      });
    }

    return errors;
  }

  public validateRawLog(lines: string[]) {
    const linesLength = lines.length;
    if (linesLength <= 100) throw new Error('Log is too short');

    // const lastLine = lines[linesLength - 1];
    // if (!lastLine.startsWith('2|')) throw new Error('Log does not end correctly');

    // TODO: Better validation

    return;
  }

  /**
   * Find logs that are potential duplicates based on the log's creation date,
   * duration and encounter ID.
   *
   * TODO: this is most likely not fool-proof, testing required
   *
   * @param upload The upload object to compare against
   * @param range The time range to allow between session creation and duration
   * @returns A list of similar logs if any are found
   */
  public async findDuplicateUploads(upload: LogObject, range = 15000) {
    const { npcId } = upload.getBoss();

    const filter = {
      createdAt: {
        $gte: upload.createdAt - range,
        $lte: upload.createdAt + range,
      },
      duration: {
        $gte: upload.duration - range,
        $lte: upload.duration + range,
      },
      'entities.npcId': npcId,
    };

    const res: Log[] = await this.logs.find(filter).lean();
    return res;
  }
}

export default LogsService;
