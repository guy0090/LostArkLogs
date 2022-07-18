import { Exception } from '@/exceptions/Exception';
import { RequestWithUser } from '@/interfaces/auth.interface';
import { LogFilter } from '@/interfaces/logs.interface';
import { Log } from '@/interfaces/logs.interface';
import { LogObject } from '@/objects/log.object';
import LogsService from '@/services/logs.service';
import { NextFunction, Request, Response } from 'express';
class LogsController {
  public logService = new LogsService();

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
   * Attempt to create a new DPS log.
   * The log will be validated and created if valid, an error is thrown otherwise.
   *
   * @param req The passed request from express middleware with the new log and the uploader's information
   * @param res The passed response from express middleware
   * @param next The next function to be called on fail to pass along to error middleware
   */
  public uploadLog = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const log: Log = { ...req.body.data, creator: req.user._id, createdAt: +new Date() };
      const toValidate = new LogObject(log);
      await this.logService.validateLog(toValidate);

      const createdLog: LogObject = await this.logService.createLog(toValidate);
      if (!createdLog) throw new Exception(500, 'Error creating log');

      res.status(200).json({ created: true, id: createdLog.id });
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
   * Get a list of all logs that match a provided filter.
   *
   * @param req The passed request from express middleware with the log filter
   * @param res The passed response from express middleware
   * @param next The next function to be called on fail to pass along to error middleware
   */
  public getFilteredLogs = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const filter: LogFilter = req.body;
      const logs: { found: number; pageSize: number; logs: LogObject[] } = await this.logService.getFilteredLogs(filter);
      res.status(200).json(logs);
    } catch (error) {
      next(error);
    }
  };
}

export default LogsController;
