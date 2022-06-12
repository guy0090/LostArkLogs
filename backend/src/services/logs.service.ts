import { Exception } from '@/exceptions/Exception';
import { Log } from '@/interfaces/logs.interface';
import logsModel from '@/models/logs.model';
import { LogObject } from '@/objects/log.object';
import mongoose from 'mongoose';
import { validate, ValidationError } from 'class-validator';
import { NODE_ENV } from '@/config';

class LogsService {
  public logs = logsModel;

  /**
   * Create a new DPS log.
   *
   * @param log The log to create
   * @returns The created log
   */
  public async createLog(log: Log) {
    try {
      const encounter = LogObject.getEncounterName(log.entities);
      log.encounter = encounter;

      const created = await this.logs.create(log);
      if (!created) throw new Exception(500, 'Error creating log');

      return new LogObject(created);
    } catch (err) {
      throw new Exception(400, err.message);
    }
  }

  /**
   * Get a DPS log by its ID.
   *
   * @param id Get a log by its ID
   * @returns The log if found
   */
  public async getLogById(id: mongoose.Types.ObjectId | string): Promise<LogObject> {
    try {
      const log = await this.logs.findById(id);
      if (!log) throw new Exception(500, 'Error finding log');

      return new LogObject(log);
    } catch (err) {
      throw new Exception(400, err.message);
    }
  }

  /**
   * Get `limit` recent logs within the given time range.
   *
   * @param limit The limit of logs to return
   * @param begin The begin date (default -1hr)
   * @param end The end date
   * @param extraFilters Any additional filters to apply, ie: region, server, etc.
   * @returns Logs between provided dates
   */
  public async getRecentLogs(
    limit = 10,
    begin = +new Date(Date.now() - 1000 * 60 * 60 * 24),
    end = +new Date(),
    extraFilters = undefined,
  ): Promise<LogObject[]> {
    try {
      let filter = { createdAt: { $gte: begin, $lte: end } };
      if (extraFilters) filter = { ...extraFilters, ...filter };

      const logs = await this.logs.find(filter).limit(limit);
      if (!logs) throw new Exception(500, 'Error finding logs');

      return logs.map(log => new LogObject(log));
    } catch (err) {
      throw new Exception(400, err.message);
    }
  }

  /**
   * Get `limit` recent logs within the given time range for a specified user.
   *
   * @param userId The user to get logs for
   * @param limit The limit of logs to return
   * @param begin The begin date
   * @param end The end date
   * @param extraFilters Any additional filters to apply, ie: region, server, etc.
   * @returns Logs between provided dates for the specified user
   */
  public async getRecentLogsByCreator(
    userId: mongoose.Types.ObjectId,
    limit = 10,
    begin = +new Date(Date.now() - 1000 * 60 * 60 * 24),
    end = +new Date(),
    extraFilters = undefined,
  ): Promise<LogObject[]> {
    try {
      let filter = { creator: `${userId}`, createdAt: { $gte: begin, $lte: end } };
      if (extraFilters) filter = { ...extraFilters, ...filter };

      const logs = await this.logs.find(filter).limit(limit);
      if (!logs) throw new Exception(500, 'Error finding log');

      return logs.map(log => new LogObject(log));
    } catch (err) {
      throw new Exception(400, err.message);
    }
  }

  /**
   * Delete a log by its ID.
   *
   * @param id The ID of the log to delete
   * @returns Nothing
   */
  public async deleteLog(id: mongoose.Types.ObjectId | string): Promise<void> {
    try {
      await this.logs.findByIdAndDelete(id);
      return;
    } catch (err) {
      throw new Exception(400, err.message);
    }
  }

  /**
   * Delete all logs associated with a user.
   *
   * @param userId The user to delete logs for
   * @returns Nothing
   */
  public async deleteAllUserLogs(userId: mongoose.Types.ObjectId): Promise<void> {
    try {
      await this.logs.deleteMany({ creator: `${userId}` });
      return;
    } catch (err) {
      throw new Exception(400, err.message);
    }
  }

  public validateTimeRange(begin: number, end: number, maxRange = 604800000): boolean {
    if ((begin && !end) || typeof begin !== 'number' || typeof end !== 'number' || begin > end || begin < 0 || end < 0 || end - begin > maxRange) {
      return false;
    }
    return true;
  }

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
