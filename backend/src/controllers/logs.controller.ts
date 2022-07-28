import { Exception } from '@/exceptions/Exception';
import { RequestWithUser, RequestWithUserAndLog } from '@/interfaces/auth.interface';
import { LogFilter, LogFilterResult, RawLog } from '@/interfaces/logs.interface';
import { Log } from '@/interfaces/logs.interface';
import { LogObject, RawLogObject } from '@/objects/log.object';
import ConfigService from '@/services/config.service';
import LogsService from '@/services/logs.service';
import { logger } from '@/utils/logger';
import { NextFunction, Request, Response } from 'express';
import mongoose from 'mongoose';

class LogsController {
  public logService = new LogsService();
  public configService = new ConfigService();

  /**
   * Get a DPS log.
   *
   * @param req The passed request from express middleware with log ID
   * @param res The passed response from express middleware
   * @param next The next function to be called on fail to pass along to error middleware
   */
  public getLog = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const logId = req.body.id as string;
      const findLog: LogObject = await this.logService.getLogById(logId);
      if (!findLog) throw new Exception(404, 'Log not found');

      res.status(200).json(findLog);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get a raw DPS log.
   *
   * @param req The passed request from express middleware with log ID
   * @param res The passed response from express middleware
   * @param next The next function to be called on fail to pass along to error middleware
   */
  public getRawLog = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const logId = req.query.id as string;
      const findLog: RawLogObject = await this.logService.getRawLogById(logId);
      if (!findLog) throw new Exception(404, 'Log not found');

      res.status(200).json(findLog);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Attempt to create a new DPS log.
   * The log will be validated and created if valid, an error is thrown otherwise.
   *
   * @param req The passed request from express middleware with the new log and the uploader's information
   * @param res The passed response from express middleware
   * @param next The next function to be called on fail to pass along to error middleware
   */
  public uploadLog = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const config = await this.configService.getConfig();
      const { allowUploads } = config;
      if (!allowUploads) throw new Exception(403, 'Uploads are disabled');

      const user = req.user;
      if (user.banned) throw new Exception(403, `User ${user._id} is banned: ${user.banReason}`);

      const log: Log = { ...req.body.data, creator: user._id, createdAt: +new Date() };
      const toValidate = new LogObject(log);
      await this.logService.validateLog(toValidate);

      const dupes = await this.logService.findDuplicateUploads(toValidate, 5000);
      if (dupes.length > 0) {
        logger.info(`Rejecting duplicate log for ${toValidate.creator}. Encounter ID: ${toValidate.getBoss().npcId}`);

        res.status(200).json({ created: false, dupe: true, id: dupes[0]._id });
      } else {
        const createdLog: LogObject = await this.logService.createLog(toValidate);
        if (!createdLog) throw new Exception(500, 'Error creating log');

        res.status(200).json({ created: true, dupe: false, id: createdLog.id });
      }
    } catch (error) {
      next(error);
    }
  };

  public uploadRawLog = async (req: RequestWithUserAndLog, res: Response, next: NextFunction) => {
    try {
      const config = await this.configService.getConfig();
      const { allowUploads } = config;
      if (!allowUploads) throw new Exception(403, 'Uploads are disabled');

      // const user = req.user;
      // if (user.banned) throw new Exception(403, `User ${user._id} is banned: ${user.banReason}`);

      // Test user, temp until auth is re-implemented
      const creator = new mongoose.Types.ObjectId('62e2155766a63b6311df989b');
      const toValidate: RawLog = { unlisted: true, creator: creator, createdAt: +new Date(), logLines: req.log };
      this.logService.validateRawLog(toValidate.logLines);

      const createdLog = await this.logService.createRawLog(toValidate);
      if (!createdLog) throw new Exception(500, 'Error creating log');

      res.status(200).json({ created: true, dupe: false, id: createdLog.id });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Delete a DPS log.
   *
   * @param req The passed request from express middleware with log ID
   * @param res The passed response from express middleware
   * @param next The next function to be called on fail to pass along to error middleware
   */
  public deleteLog = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const logId: string = req.body.logId;
      await this.logService.deleteLog(logId);

      res.status(200).json({ id: logId, deleted: true });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Helper function to delete a user's own DPS log.
   * If the user attempting to delete the log is not the owner, an error is thrown.
   *
   * @param req The passed request from express middleware with the ID of the log to delete and the user's information
   * @param res The passed response from express middleware
   * @param next The next function to be called on fail to pass along to error middleware
   */
  public deleteOwnLog = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const user = req.user;
      const logId: string = req.body.logId;

      const findLog = await this.logService.getLogById(logId);
      if (!findLog) throw new Exception(404, 'Log not found');
      if (findLog.creator === `${user._id}`) {
        await this.logService.deleteLog(logId);
        res.status(200).json({ deleted: true });
      } else {
        throw new Exception(403, 'You do not have permission to delete this log');
      }
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get a list of all currently tracked bosses.
   *
   * @param req The passed request from express middleware
   * @param res The passed response from express middleware
   * @param next The next function to be called on fail to pass along to error middleware
   */
  public getUniqueBosses = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const bosses = await this.logService.getUniqueEntities();
      res.status(200).json(bosses);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get a list of IDs of all supported bosses
   *
   * @param req The passed request from express middleware with the filter to use
   * @param res The passed response from express middleware
   * @param next The next function to be called on fail to pass along to error middleware
   */
  public getSupportedBosses = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { supportedBosses } = await this.configService.getConfig();
      res.status(200).json(supportedBosses);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get a list of all logs that match a provided filter.
   *
   * @param req The passed request from express middleware with the log filter
   * @param res The passed response from express middleware
   * @param next The next function to be called on fail to pass along to error middleware
   */
  public getFilteredLogs = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const user = req.user;
      let includeUnlisted = false;
      if (user) includeUnlisted = true;

      const filter: LogFilter = req.body;
      const logs: LogFilterResult = await this.logService.getFilteredLogs(filter, { includeUnlisted });
      res.status(200).json(logs);
    } catch (error) {
      next(error);
    }
  };
}

export default LogsController;
