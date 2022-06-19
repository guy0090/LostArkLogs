import { NODE_ENV } from '@/config';
import { Exception } from '@/exceptions/Exception';
import { RequestWithUser } from '@/interfaces/auth.interface';
import { LogFilter } from '@/interfaces/logs.interface';
import { Log } from '@/interfaces/logs.interface';
import { LogObject } from '@/objects/log.object';
import LogsService from '@/services/logs.service';
import { NextFunction, Request, Response } from 'express';

class LogsController {
  public logService = new LogsService();

  public getLog = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const logId = req.body.id as string;
      const findLog: LogObject = await this.logService.getLogById(logId);
      if (!findLog) throw new Exception(404, 'Log not found');

      res.status(200).json(findLog);
    } catch (error) {
      next(new Exception(500, 'Error getting log'));
    }
  };

  public uploadLog = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const log: Log = { createdAt: +new Date(), creator: req.user._id, ...req.body.data };
      await this.logService.validateLog(new LogObject(log));

      const createdLog: LogObject = await this.logService.createLog(log);
      if (!createdLog) throw new Exception(500, 'Error creating log');

      res.status(200).json({ created: true, id: createdLog.id });
    } catch (error) {
      next(new Exception(400, NODE_ENV === 'production' ? 'Error creating log' : error.message));
    }
  };

  public deleteLog = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const logId = req.params.id;
      await this.logService.deleteLog(logId);

      res.status(200).json({ deleted: true });
    } catch (error) {
      next(new Exception(500, 'Error deleting log'));
    }
  };

  public getUniqueBosses = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const bosses = await this.logService.getUniqueEntities();
      res.status(200).json(bosses);
    } catch (err) {
      next(new Exception(500, 'Error getting bosses'));
    }
  };

  public getFilteredLogs = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const filter: LogFilter = req.body;
      const logs: LogObject[] = await this.logService.getFilteredLogs(filter);
      res.status(200).json(logs);
    } catch (err) {
      next(new Exception(500, 'Error getting logs'));
    }
  };
}

export default LogsController;
