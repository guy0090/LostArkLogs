import { Exception } from '@/exceptions/Exception';
import { RequestWithUser } from '@/interfaces/auth.interface';
import { Log } from '@/interfaces/logs.interface';
import { LogObject } from '@/objects/log.object';
import { TimeRangeQuery } from '@/objects/util.object';
import LogsService from '@/services/logs.service';
import { NextFunction, Request, Response } from 'express';

class LogsController {
  public logService = new LogsService();

  public getLog = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const logId = req.params.id;
      const findLog: LogObject = await this.logService.getLogById(logId);
      if (!findLog) throw new Exception(404, 'Log not found');

      res.status(200).json(findLog);
    } catch (error) {
      next(new Exception(500, 'Error getting log'));
      // next(error);
    }
  };

  public uploadLog = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const log: Log = { createdAt: +new Date(), creator: req.user._id, ...req.body.data };
      const createdLog: LogObject = await this.logService.createLog(log);
      if (!createdLog) throw new Exception(500, 'Error creating log');

      res.status(200).json({ created: true, id: createdLog.id });
    } catch (error) {
      next(new Exception(500, 'Error creating log'));
      // next(error);
    }
  };

  public deleteLog = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const logId = req.params.id;
      await this.logService.deleteLog(logId);

      res.status(200).json({ deleted: true });
    } catch (error) {
      next(new Exception(500, 'Error deleting log'));
      // next(error);
    }
  };

  public getUserRecentLogs = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      let logs: LogObject[] = [];

      const timeRange = req.body.range;
      if (timeRange) {
        const range = new TimeRangeQuery(timeRange.begin, timeRange.end);
        logs = await this.logService.getRecentLogsByCreator(req.user._id, 10, range.begin, range.end);
      } else {
        logs = await this.logService.getRecentLogsByCreator(req.user._id);
      }
      res.status(200).json(logs);
    } catch (err) {
      next(new Exception(500, 'Error getting logs'));
    }
  };

  public getRecentLogs = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const logs: LogObject[] = await this.logService.getRecentLogs();
      res.status(200).json(logs);
    } catch (err) {
      next(new Exception(500, 'Error getting logs'));
    }
  };
}

export default LogsController;
