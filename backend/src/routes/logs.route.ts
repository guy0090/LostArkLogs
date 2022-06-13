import { Router } from 'express';
import { Routes } from '@interfaces/routes.interface';
import { apiKeyMiddleware } from '@middlewares/auth.middleware';
import { limiterUsers } from '@/middlewares/limiting.middleware';
import validationMiddleware from '@/middlewares/validation.middleware';
import { LogDeleteDTO, LogIdDTO, LogUploadDTO } from '@/dtos/logs.dto';
import LogsController from '@/controllers/logs.controller';

class LogsRoute implements Routes {
  public path = '/logs';
  public router = Router();
  public logsController = new LogsController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}/:id`, [limiterUsers, validationMiddleware(LogIdDTO, 'params')], this.logsController.getLog);
    this.router.post(`${this.path}/recent`, [limiterUsers, apiKeyMiddleware('body', 'log.recents', true)], this.logsController.getUserRecentLogs);
    this.router.post(`${this.path}/publicRecent`, limiterUsers, this.logsController.getRecentLogs);
    this.router.post(
      `${this.path}/upload`,
      [limiterUsers, validationMiddleware(LogUploadDTO, 'body'), apiKeyMiddleware('body', 'log.upload')],
      this.logsController.uploadLog,
    );
    this.router.delete(
      `${this.path}/delete`,
      [limiterUsers, validationMiddleware(LogDeleteDTO, 'query'), apiKeyMiddleware('query', 'log.delete')],
      this.logsController.deleteLog,
    );
  }
}

export default LogsRoute;
