import { Exception } from '@/exceptions/Exception';
import { EntityType, Log, LogFilter, RawLog } from '@/interfaces/logs.interface';
import logsModel from '@/models/logs.model';
import { LogFilterOptions, LogObject, RawLogObject } from '@/objects/log.object';
import mongoose from 'mongoose';
import { validate, ValidationError } from 'class-validator';
import { logger } from '@/utils/logger';
import UserService from '@/services/users.service';
import RedisService from '@/services/redis.service';
import ms from 'ms';
import ConfigService from './config.service';
import rawLogsModel from '@/models/rawlogs.model';
import { PacketParser } from '@/helpers/log-parsing/parser';

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
  public createLog = async (log: LogObject, cache = true) => {
    try {
      const created = await this.logs.create(log);
      if (!created) throw new Exception(500, 'Error creating log');

      if (cache) RedisService.set(`log:${created._id}`, JSON.stringify(created), 'PX', ms('5m'));

      return new LogObject(created);
    } catch (err) {
      throw new Exception(400, err.message);
    }
  };

  /**
   * Creates a new raw log and if found, any encounters contained within.
   *
   * @param log The raw log to create
   * @returns The created log ID and the IDs of additional encounters created
   */
  public createRawLog = async (log: RawLog) => {
    const clientSession = await mongoose.startSession();
    clientSession.startTransaction();

    try {
      const created = await this.rawLogs.create([log], { session: clientSession });
      if (!created) {
        await clientSession.abortTransaction();
        clientSession.endSession();

        throw new Exception(500, 'Error creating log');
      }

      const { logLines, creator, createdAt, _id } = created[0];
      const { supportedBosses } = await this.configService.getConfig();

      const parser = new PacketParser(supportedBosses);
      const parsedEncounters = parser.parseLog(logLines);

      let children = [];
      if (parsedEncounters.length > 0) {
        const encounters = parsedEncounters.map(s => new LogObject({ ...s, creator, createdAt }));
        for (const encounter of encounters) {
          await this.validateLog(encounter);
          encounter.parent = `${_id}`;
          encounter.unlisted = log.unlisted;
        }

        const logs = await this.logs.create(encounters, { session: clientSession });
        children = logs.map((l: Log) => l._id);
      }
      await clientSession.commitTransaction();
      clientSession.endSession();

      return { children, raw: new RawLogObject(created[0]) };
    } catch (err) {
      await clientSession.abortTransaction();
      clientSession.endSession();

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
        if (!log) return undefined;

        await RedisService.set(`log:${id}`, JSON.stringify(log), 'PX', ms('5m'));
      }

      return new LogObject(log);
    } catch (err) {
      throw new Exception(400, err.message);
    }
  };

  /**
   * Get a raw LostArkLogger log.
   *
   * @param id The ID of the log to fetch
   * @returns The log if found in raw or parsed format.
   */
  public getRawLogById = async (id: mongoose.Types.ObjectId | string) => {
    try {
      const cached = await RedisService.get(`rawlog:${id}`);
      if (cached) {
        return JSON.parse(cached);
      } else {
        const log = await this.rawLogs.findById(id).lean();
        if (!log) return undefined;

        return new RawLogObject(log);
      }
    } catch (err) {
      throw new Exception(400, err.message);
    }
  };

  /**
   * Update a DPS log.
   *
   * @param id The ID of the log to update
   * @param update The update object
   * @returns The updated log
   */
  public updateLog = async (id: mongoose.Types.ObjectId | string, update: any) => {
    try {
      const log = await this.logs.findByIdAndUpdate(id, { $set: update }, { new: true, upsert: false });
      if (!log) throw new Exception(500, 'Error updating log');

      RedisService.set(`log:${log._id}`, JSON.stringify(log), 'PX', ms('5m'));

      return new LogObject(log);
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
  public getUniqueEntities = async (type?: EntityType[] | undefined): Promise<any[]> => {
    if (!type) type = [EntityType.BOSS, EntityType.GUARDIAN];

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
    let { includeUnlisted } = options;

    try {
      const aggrPipeline: any[] = [];

      const match = {
        // Only include publicly listed logs
        unlisted: false,
      };

      let userId: mongoose.Types.ObjectId | undefined = undefined;
      if (filter.key) {
        userId = (await this.users.findByApiKey(filter.key))._id;
        if (typeof userId === 'string') userId = new mongoose.Types.ObjectId(userId);

        // If a user is requesting their own logs, include all logs
        delete match.unlisted;
      } else if (filter.creator) {
        userId = new mongoose.Types.ObjectId(filter.creator);
      }

      // If the requesting user has access to view unlisted logs, show them as well
      if (includeUnlisted && match.unlisted !== undefined) delete match.unlisted;

      if (userId) {
        match['creator'] = userId;
      }

      match['entities.gearLevel'] = {
        $gte: filter.gearLevel[0], // default 302
        $lte: filter.gearLevel[1], // default 1625
      };

      match['damageStatistics.dps'] = {
        $gte: filter.partyDps, // default 1
      };

      if (filter.bosses.length > 0) {
        match['entities.npcId'] = {
          $in: filter.bosses,
        };
      }

      if (filter.classes.length > 0) {
        match['entities.classId'] = { $in: filter.classes };
      }

      aggrPipeline.push({ $match: match });
      // If sorting is requested, sort by the specified field
      // else sort by creation date descending by default (newest first)
      if (filter.sort) {
        let field = filter.sort[0] as string;
        if (field === 'dps') field = `damageStatistics.${field}`;
        const order = filter.sort[1];

        aggrPipeline.push({ $sort: { [field]: order } });
      } else {
        aggrPipeline.push({ $sort: { createdAt: -1 } });
      }

      aggrPipeline.push({ $limit: filter.limit ?? 200 });

      const result = await this.logs.aggregate(aggrPipeline);
      const count = result.length;
      if (count > 0) {
        const remapped = result.map(log => new LogObject(log));
        return { found: count, logs: remapped };
      } else {
        return { found: 0, logs: [] };
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

      const players = log.entities.filter(entity => entity.type === EntityType.PLAYER);
      if (players.length === 0) throw new Exception(418, 'No players found in log');

      const nonPlayers = log.entities.filter(entity => entity.type !== EntityType.PLAYER).map(entity => entity.npcId);
      const { supportedBosses } = await this.configService.getConfig();
      for (const npcId of nonPlayers) {
        if (!supportedBosses.includes(npcId)) throw new Exception(418, `${npcId} is not a supported boss`);
      }

      const bosses = log.getBosses();
      if (bosses.length > 0) {
        const totalHp = [...bosses].sort((a, b) => b.maxHp - a.maxHp)[0].maxHp;
        const totalTaken = bosses.reduce((p, c) => p + c.stats.damageTaken, 0);

        if (totalTaken < totalHp * 0.95) throw new Exception(418, "Bosses aren't dead or didn't take enough damage");
      } else {
        throw new Exception(418, 'Encounter has no bosses');
      }

      return;
    } catch (err) {
      logger.error(`Error validating log: ${err.message}`);
      throw err;
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
    if (linesLength <= 50) throw new Error(`Log is too short: ${linesLength} lines (must be at least 50)`);

    // const lastLine = lines[linesLength - 1];
    // if (!lastLine.startsWith('2|')) throw new Error('Log does not end correctly');

    // TODO: Better validation

    return;
  }

  /**
   * Find logs that are potential duplicates based on the log's creation date,
   * duration and encounter ID.
   *
   * TODO: this is not guaranteed to find all duplicates and may find false matches
   *
   * @param upload The upload object to compare against
   * @param range The time range to allow between session creation and duration
   * @returns A list of similar logs if any are found
   * @throws Exception if there is an error finding a the boss of the log
   */
  public async findDuplicateUploads(upload: LogObject, range = 15000) {
    const filter = {
      createdAt: {
        $gte: upload.createdAt - range,
        $lte: upload.createdAt + range,
      },
      duration: {
        $gte: upload.duration - range,
        $lte: upload.duration + range,
      },
    };

    const boss = upload.getBoss();
    if (!boss) throw new Exception(400, 'No boss found in log');
    filter['entities.npcId'] = boss.npcId;

    const res: Log[] = await this.logs.find(filter).lean();
    return res;
  }

  /**
   * Find other raw logs that may be duplicates
   *
   * TODO: is there some guaranteed way of doing this even?
   *
   * @param rawLog The raw log to find dupes for
   */
  public async findDuplicateRawLogs(rawLog: RawLog) {
    const dupes = await this.rawLogs.find({ hash: rawLog.hash }).count();

    return dupes;
  }
}

export default LogsService;
