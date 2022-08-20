import { Router } from 'express';
import { Routes } from '@interfaces/routes.interface';
import validationMiddleware from '@middlewares/validation.middleware';
import UsersController from '@controllers/users.controller';
import LogsController from '@/controllers/logs.controller';
import { httpAuthMiddleware } from '@/middlewares/auth.middleware';
import { BanUserDTO, UnbanUserDTO, UserIdDTO, UserPermissionsDTO, UserRolesDTO, SearchUsersDTO } from '@/dtos/users.dto';
import { LogDeleteAdminDTO } from '@/dtos/logs.dto';
import AdminController from '@/controllers/admin.controller';
import { RedisDelDTO } from '@/dtos/redis.dto';

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
  public adminController = new AdminController();

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
    this.router.post(`${this.path}${this.usersPath}/unverified`, [httpAuthMiddleware(['users.manage'])], this.usersController.getUnverifiedUsers);
    this.router.post(
      `${this.path}${this.usersPath}/verify`,
      [validationMiddleware(UserIdDTO, 'body'), httpAuthMiddleware(['users.manage'])],
      this.usersController.verifyUser,
    );
    this.router.post(
      `${this.path}${this.usersPath}/search`,
      [validationMiddleware(SearchUsersDTO, 'body'), httpAuthMiddleware(['users.manage'])],
      this.usersController.searchUsers,
    );
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
      [validationMiddleware(UserIdDTO, 'body'), httpAuthMiddleware(['users.manage.permissions'])],
      this.usersController.getUserPermissions,
    );
    this.router.post(
      `${this.path}${this.usersPath}/permissions/set`,
      [validationMiddleware(UserPermissionsDTO, 'body'), httpAuthMiddleware(['users.manage.permissions'])],
      this.usersController.setUserPermissions,
    );
    this.router.post(
      `${this.path}${this.usersPath}/permissions/add`,
      [validationMiddleware(UserPermissionsDTO, 'body'), httpAuthMiddleware(['users.manage.permissions'])],
      this.usersController.addUserPermissions,
    );
    this.router.post(
      `${this.path}${this.usersPath}/permissions/remove`,
      [validationMiddleware(UserPermissionsDTO, 'body'), httpAuthMiddleware(['users.manage.permissions'])],
      this.usersController.removeUserPermissions,
    );
    // // User Roles
    this.router.post(
      `${this.path}${this.usersPath}/roles`,
      [validationMiddleware(UserIdDTO, 'body'), httpAuthMiddleware(['users.manage.roles'])],
      this.usersController.getUserPermissions,
    );
    this.router.post(
      `${this.path}${this.usersPath}/roles/set`,
      [validationMiddleware(UserRolesDTO, 'body'), httpAuthMiddleware(['users.manage.roles'])],
      this.usersController.setUserPermissions,
    );
    this.router.post(
      `${this.path}${this.usersPath}/roles/add`,
      [validationMiddleware(UserRolesDTO, 'body'), httpAuthMiddleware(['users.manage.roles'])],
      this.usersController.addUserPermissions,
    );
    this.router.post(
      `${this.path}${this.usersPath}/roles/remove`,
      [validationMiddleware(UserRolesDTO, 'body'), httpAuthMiddleware(['users.manage.roles'])],
      this.usersController.removeUserPermissions,
    );

    // Log management
    this.router.post(
      `${this.path}${this.logsPath}/delete`,
      [validationMiddleware(LogDeleteAdminDTO, 'body'), httpAuthMiddleware(['logs.manage'])],
      this.logsController.deleteLog,
    );
    this.router.post(`${this.path}${this.logsPath}/fixZones`, httpAuthMiddleware(['logs.manage']), this.logsController.fixLogZones);
    // TODO: Updating individual fields of the log soon tm

    // Misc. service management
    // TODO: Decide what actually makes sense here
    // // Cache management
    this.router.post(
      `${this.path}${this.servicePath}/cache/status`,
      [httpAuthMiddleware(['service.manage.cache'])],
      this.adminController.getCacheStatus,
    );
    this.router.post(
      `${this.path}${this.servicePath}/cache/clear`,
      [httpAuthMiddleware(['service.manage.cache'], true)],
      this.adminController.clearCache,
    );
    this.router.post(
      `${this.path}${this.servicePath}/cache/keys`,
      [httpAuthMiddleware(['service.manage.cache'], true)],
      this.adminController.getCachedKeys,
    );
    this.router.post(
      `${this.path}${this.servicePath}/cache/del`,
      [validationMiddleware(RedisDelDTO, 'body'), httpAuthMiddleware(['service.manage.cache'], true)],
      this.adminController.removeCachedKey,
    );
  }
}

export default AdminRoute;
