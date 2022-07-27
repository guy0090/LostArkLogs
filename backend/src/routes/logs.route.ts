import { Router } from 'express';
import { Routes } from '@interfaces/routes.interface';
import { apiKeyMiddleware, optionalHttpAuthMiddleware } from '@middlewares/auth.middleware';
import { limiterUsers } from '@/middlewares/limiting.middleware';
import validationMiddleware from '@/middlewares/validation.middleware';
import { LogDeleteDTO, LogIdDTO, LogUploadDTO, LogFilterDTO } from '@/dtos/logs.dto';
import LogsController from '@/controllers/logs.controller';

class LogsRoute implements Routes {
  public path = '/logs';
  public router = Router();
  public logsController = new LogsController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // Get logs
    this.router.post(`${this.path}`, [limiterUsers, validationMiddleware(LogIdDTO, 'body')], this.logsController.getLog);

    // Get logs by filter
    this.router.post(
      `${this.path}/filter`,
      [limiterUsers, validationMiddleware(LogFilterDTO, 'body'), optionalHttpAuthMiddleware(['logs.unlisted'])],
      this.logsController.getFilteredLogs,
    );

    // Upload log
    this.router.post(
      `${this.path}/upload`,
      [limiterUsers, validationMiddleware(LogUploadDTO, 'body'), apiKeyMiddleware('body', ['log.upload'])],
      this.logsController.uploadLog,
    );

    // Delete a log
    this.router.post(
      `${this.path}/delete`,
      [limiterUsers, validationMiddleware(LogDeleteDTO, 'body'), apiKeyMiddleware('body', ['log.delete'], true)],
      this.logsController.deleteOwnLog,
    );

    // Get currently tracked bosses (bosses that exist in logs)
    this.router.get(`${this.path}/bosses`, [limiterUsers], this.logsController.getUniqueBosses);

    // Get IDs of supported bosses
    this.router.get(`${this.path}/supported`, [limiterUsers], this.logsController.getSupportedBosses);
  }
}

export default LogsRoute;
