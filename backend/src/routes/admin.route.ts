import { Router } from 'express';
import { Routes } from '@interfaces/routes.interface';
import validationMiddleware from '@middlewares/validation.middleware';
import UsersController from '@controllers/users.controller';
import LogsController from '@/controllers/logs.controller';
import { httpAuthMiddleware } from '@/middlewares/auth.middleware';
import { BanUserDTO, UnbanUserDTO, UserIdDTO, UserPermissionsDTO, UserRolesDTO } from '@/dtos/users.dto';
import { LogDeleteAdminDTO } from '@/dtos/logs.dto';

class AdminRoute implements Routes {
  public path = '/admin';
  public router = Router();

  // sub-routes
  public usersPath = '/users';
  public logsPath = '/logs';
  public servicePath = '/service';

  // controllers
  public usersController = new UsersController();
  public logsController = new LogsController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // User management
    this.router.post(
      `${this.path}${this.usersPath}/ban`,
      [validationMiddleware(BanUserDTO, 'body'), httpAuthMiddleware(['users.manage.moderate'])],
      this.usersController.banUser,
    );
    this.router.post(
      `${this.path}${this.usersPath}/unban`,
      [validationMiddleware(UnbanUserDTO, 'body'), httpAuthMiddleware(['users.manage.moderate'])],
      this.usersController.unbanUser,
    );
    this.router.post(`${this.path}${this.usersPath}/banned`, [httpAuthMiddleware(['users.manage.moderate'])], this.usersController.getBannedUsers);
    /**
     * TODO: Probably should not expose this just yet
     * this.router.post(
     *   `${this.path}${this.usersPath}/delete`,
     *   [validationMiddleware(UserIdDTO, 'body'), httpAuthMiddleware(['users.manage.delete'])],
     *   this.usersController.deleteUser,
     * );
     */
    // // User permissions
    this.router.post(
      `${this.path}${this.usersPath}/permissions`,
      [validationMiddleware(UserIdDTO, 'body'), httpAuthMiddleware(['users.manage.permissions.view'])],
      this.usersController.getUserPermissions,
    );
    this.router.post(
      `${this.path}${this.usersPath}/permissions/add`,
      [validationMiddleware(UserPermissionsDTO, 'body'), httpAuthMiddleware(['users.manage.permissions.modify'])],
      this.usersController.addUserPermissions,
    );
    this.router.post(
      `${this.path}${this.usersPath}/permissions/remove`,
      [validationMiddleware(UserPermissionsDTO, 'body'), httpAuthMiddleware(['users.manage.permissions.modify'])],
      this.usersController.removeUserPermissions,
    );
    // // User Roles
    this.router.post(
      `${this.path}${this.usersPath}/roles`,
      [validationMiddleware(UserIdDTO, 'body'), httpAuthMiddleware(['users.manage.roles.view'])],
      this.usersController.getUserPermissions,
    );
    this.router.post(
      `${this.path}${this.usersPath}/roles/add`,
      [validationMiddleware(UserRolesDTO, 'body'), httpAuthMiddleware(['users.manage.roles.modify'])],
      this.usersController.addUserPermissions,
    );
    this.router.post(
      `${this.path}${this.usersPath}/roles/remove`,
      [validationMiddleware(UserRolesDTO, 'body'), httpAuthMiddleware(['users.manage.roles.modify'])],
      this.usersController.removeUserPermissions,
    );

    // Log management
    this.router.post(
      `${this.path}${this.logsPath}/delete`,
      [validationMiddleware(LogDeleteAdminDTO, 'body'), httpAuthMiddleware(['logs.manage.delete'])],
      this.logsController.deleteLog,
    );
    // TODO: Updating individual fields of the log soon tm

    // Misc. management
    // TODO: Clear cached values, get service status (mongo, redis, express), user count, log count, etc.
  }
}

export default AdminRoute;
