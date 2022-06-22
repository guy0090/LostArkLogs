import { Exception } from '@/exceptions/Exception';
import { ENTITY_TYPE, Log, LogFilter } from '@/interfaces/logs.interface';
import logsModel from '@/models/logs.model';
import { LogObject } from '@/objects/log.object';
import mongoose from 'mongoose';
import { validate, ValidationError } from 'class-validator';
import { NODE_ENV } from '@/config';
import { bosses } from '@/config/supported-bosses';
import { logger } from '@/utils/logger';
import UserService from './users.service';
import { User } from '@/interfaces/users.interface';
import ms from 'ms';

class LogsService {
  public logs = logsModel;
  public users = new UserService();

  /**
   * Create a new DPS log.
   *
   * @param log The log to create
   * @returns The created log
   */
  public createLog = async (log: Log) => {
    try {
      const encounter = LogObject.getEncounterName(log.entities);
      log.encounter = encounter;

      const created = await this.logs.create(log);
      if (!created) throw new Exception(500, 'Error creating log');

      return new LogObject(created);
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
  public getLogById = async (id: mongoose.Types.ObjectId | string): Promise<LogObject> => {
    try {
      const log = await this.logs.findById(id).lean();
      if (!log) throw new Exception(500, 'Error finding log');

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

  public getUniqueEntities = async (type?: ENTITY_TYPE[] | undefined): Promise<any[]> => {
    if (!type) type = [ENTITY_TYPE.BOSS, ENTITY_TYPE.GUARDIAN];
    try {
      const bosses = [];
      // TODO: Use find here instead?
      const aggregate = this.logs.aggregate([
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

      for (const doc of await aggregate) {
        bosses.push(doc._id);
      }
      return bosses;
    } catch (err) {
      logger.error(err);
      throw new Exception(500, 'Error getting bosses');
    }
  };

  public getFilteredLogs = async (filter: LogFilter): Promise<LogObject[]> => {
    try {
      let user: User | undefined = undefined;
      if (filter.key) user = await this.users.findByApiKey(filter.key);

      const aggrQuery = [
        {
          $unwind: {
            path: '$entities',
            preserveNullAndEmptyArrays: false,
          },
        },
        {
          $match: {},
        },
        {
          $group: {
            _id: '$_id',
          },
        },
      ];

      const $match = {
        'entities.level': {
          $gte: filter.level[0],
          $lte: filter.level[1],
        },
        'entities.gearLevel': {
          $gte: filter.gearLevel[0],
          $lte: filter.gearLevel[1],
        },
      };

      if (user) {
        $match['creator'] = user._id;
      }

      if (filter.range.length > 0) {
        $match['createdAt'] = {
          $gte: filter.range[0],
          $lte: filter.range[1],
        };
      } else {
        $match['createdAt'] = {
          $gte: +new Date() - ms('24h'),
          $lte: +new Date(),
        };
      }

      if (filter.classes.length > 0) {
        $match['entities.classId'] = { $in: filter.classes };
      }

      aggrQuery[1] = { $match };

      const foundIds = await this.logs.aggregate(aggrQuery);
      if (foundIds.length > 0) {
        const findQuery = { _id: { $in: foundIds.map(doc => doc._id) } };
        if (filter.bosses.length > 0) {
          findQuery['entities.npcId'] = { $in: filter.bosses };
        }

        const foundLogs = await this.logs.find(findQuery).lean();
        return foundLogs.map(log => new LogObject(log));
      }

      return [];
    } catch (err) {
      logger.error(err);
      throw new Exception(500, 'Error getting filtered logs');
    }
  };

  public async validateLog(log: LogObject) {
    try {
      const errors: ValidationError[] = await validate(log, { validationError: { target: false, value: false } });
      if (errors.length > 0) {
        if (NODE_ENV !== 'development') throw new Exception(400, 'Invalid log structure');
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
      for (const npcId of nonPlayers) {
        if (!bosses.includes(npcId)) throw new Exception(400, `${npcId} is not a supported boss`);
      }

      return;
    } catch (err) {
      throw new Exception(400, err.message);
    }
  }

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
}

export default LogsService;
