import { LogFilterDTO } from '@/dtos/logs.dto';
import {
  GetLogDTO,
  GetUserDTO,
  GetUserPermissionsDTO,
  GetUsersDTO,
  HasPermissionsDTO,
  PageAccessDTO,
  UpdateLogVisibilityDTO,
} from '@/dtos/sockets.dto';
import { WsException } from '@/exceptions/Exception';
import { LogFilter } from '@/interfaces/logs.interface';
import { User } from '@/interfaces/users.interface';
import { DataStoredInToken } from '@/objects/auth.object';
import { LogObject } from '@/objects/log.object';
import { UserObject } from '@/objects/user.object';
import ConfigService from '@/services/config.service';
import LogsService from '@/services/logs.service';
import PageService from '@/services/pages.service';
import PermissionsService from '@/services/permissions.service';
import SocketService from '@/services/socket.service';
import UserService from '@/services/users.service';
import { logger } from '@/utils/logger';
import { plainToInstance } from 'class-transformer';
import { validate, ValidationError } from 'class-validator';

class SocketHandler {
  public static socketService = new SocketService();
  public static pageService = new PageService();
  public static permissionService = new PermissionsService();
  public static logService = new LogsService();
  public static userService = new UserService();
  public static configService = new ConfigService();

  public static handlers = {
    // #region | Authentication
    /**
     * Event for logging in a user, returns the user's data, a token and their permissions
     */
    login: async (args: any, callback: any) => {
      const user: User = args.u;
      try {
        if (!args.rt) throw new WsException(404, 'Authorization Missing');
        const token = new DataStoredInToken(args.rt);
        await this.validateArgs(token);

        const { access, uploadKey, returnedUser } = await this.socketService.refreshToken(token);
        const permissions = await this.permissionService.getUserPermissions(args.u._id);

        callback({ at: access, u: returnedUser, ut: uploadKey, p: permissions });
      } catch (err) {
        logger.error(`[WS] Failed to login user ${user.username}:${user._id} => ${err.message}`);
        callback(null);
      }
    },
    /**
     * Event for refreshing the user's access token.
     */
    tokens: async (args: any, callback: any) => {
      const user: User = args.u;
      try {
        if (!args.rt) throw new WsException(404, 'Authorization Missing');
        const token = new DataStoredInToken(args.rt);
        await this.validateArgs(token);

        const { access, returnedUser } = await this.socketService.refreshToken(token);

        callback({ at: access, u: returnedUser });
      } catch (err) {
        logger.error(`[WS] Error getting tokens for ${user._id}:${user.username} => ${err.message}`);
        callback(null);
      }
    },
    // #endregion

    // #region | Page Access
    /**
     * Event for checking if a user has access to a page.
     */
    page_access: async (args: any, callback: any) => {
      const page: string = args.page;
      const user: User = args.u;
      try {
        await this.validateArgs(args, true, PageAccessDTO);

        const { permissions } = await this.pageService.getPageByName(page);
        let access = false;

        if (permissions.length === 0) {
          access = true;
        } else {
          access = await this.permissionService.userHasPermissions(user._id, permissions);
        }

        logger.info(`[WS] Authorized ${user._id}:${user.username} to access page '${page}'`);
        callback({ access });
      } catch (err) {
        logger.error(`[WS] Error authorizing access to page '${page}' for ${user._id}:${user.username} => ${err.message}`);
        callback({ access: false });
      }
    },

    /**
     * Event for checking if a user (requester) has the provided permissions
     */
    has_permissions: async (args: any, callback: any) => {
      const user: User = args.u;

      try {
        await this.validateArgs(args, true, HasPermissionsDTO);
        const permissions: string[] = args.permissions;

        const hasPermission = await this.permissionService.userHasPermissions(user._id, permissions);
        callback({ p: hasPermission });
      } catch (err) {
        logger.error(`[WS] Error getting permission ${args.p} for ${user._id}:${user.username} => ${err.message}`);
        callback({ p: false });
      }
    },
    // #endregion

    // #region | User (all) events

    /**
     * Event for getting a single user
     */
    get_user: async (args: any, callback: any) => {
      try {
        await this.validateArgs(args, true, GetUserDTO);

        let user = undefined;
        if (args.userId) {
          user = await this.userService.findUserById(args.userId);
        } else {
          const { username, discriminator } = args;
          user = await this.userService.findUserByDiscordName(username, discriminator);
        }

        if (!user) throw new WsException(404, 'User not found');
        callback(new UserObject(user));
      } catch (err) {
        logger.error(`[WS] Error getting user => ${err.message}`);
        callback(null);
      }
    },

    /**
     * Event for getting users.
     */
    get_users: async (args: any, callback: any) => {
      const userIds = args.users;
      try {
        await this.validateArgs(args, true, GetUsersDTO);

        const users = await this.userService.findUsers(userIds);
        callback({ users: users.map((user: User) => new UserObject(user)) });
      } catch (err) {
        logger.error(`[WS] Error getting users: ${err.message}`);
        callback({ users: [] });
      }
    },

    /**
     * Event for getting a user's own permissions.
     */
    get_user_permissions: async (args: any, callback: any) => {
      const userId = args.target;
      try {
        await this.validateArgs(args, true, GetUserPermissionsDTO);

        const permissions = await this.permissionService.getUserPermissions(userId);
        callback(permissions);
      } catch (err) {
        logger.error(`[WS] Error getting user permissions for ${userId} => ${err.message}`);
        callback([]);
      }
    },
    // #endregion

    // #region | User (self)
    /**
     * Event for getting the user's own data.
     */
    get_self: async (args: any, callback: any) => {
      const user: User = args.u;
      callback(new UserObject(user));
    },
    /**
     * Event for getting a user's own permissions.
     */
    get_permissions: async (args: any, callback: any) => {
      const user: User = args.u;
      const permissions = await this.permissionService.getUserPermissions(user._id);
      callback(permissions);
    },
    // #endregion

    // #region | Logs
    /**
     * Event for getting logs.
     */
    get_log: async (args: any, callback: any) => {
      const logId = args.logId;

      try {
        await this.validateArgs(args, true, GetLogDTO);

        const log = await this.logService.getLogById(logId);
        callback({ log });
      } catch (err) {
        logger.error(`[WS] Error getting log ${logId} => ${err.message}`);
        callback(null);
      }
    },
    /**
     * Event for uploading a DPS log.
     */
    upload_log: async (args: any, callback: any) => {
      const user: User = args.u;
      try {
        const log = { ...args.data, creator: user._id, createdAt: +new Date() };
        const toValidate = new LogObject(log);
        await this.logService.validateLog(toValidate);

        const createdLog: LogObject = await this.logService.createLog(toValidate);
        if (!createdLog) throw new WsException(500, 'Log could not be created');

        callback({ created: true, id: createdLog.id });
      } catch (err) {
        logger.error(`[WS] Error uploading log for ${user._id}:${user.username} => ${err.message}`);
        callback(null);
      }
    },
    /**
     * Event for getting a list of unique bosses.
     */
    unique_bosses: async (_args: any, callback: any) => {
      try {
        const bosses = await this.logService.getUniqueEntities();
        callback({ bosses });
      } catch (err) {
        logger.error(`[WS] Error getting unique bosses: ${err.message}`);
        callback({ bosses: [] });
      }
    },

    /**
     * Event for getting a list of supported bosses.
     */
    supported_bosses: async (_args: any, callback: any) => {
      try {
        const { supportedBosses } = await this.configService.getConfig();
        callback({ supportedBosses });
      } catch (err) {
        logger.error(`[WS] Error getting supported bosses: ${err.message}`);
        callback({ supportedBosses: [] });
      }
    },

    /**
     * Event for getting a list of filtered logs.
     */
    filter_logs: async (args: any, callback: any) => {
      try {
        const filter: LogFilter = args.filter;
        await this.validateArgs(filter, true, LogFilterDTO);

        const result = await this.logService.getFilteredLogs(filter);
        callback(result);
      } catch (err) {
        logger.error(`[WS] Error filtering logs: ${err.message}`);
        callback({ found: 0, pageSize: 0, logs: [] });
      }
    },

    /**
     * Event for setting a logs visibility.
     */
    update_log_visibility: async (args: any, callback: any) => {
      try {
        const update = args.update;
        await this.validateArgs(update, true, UpdateLogVisibilityDTO);

        const user: User = args.u;
        const log = await this.logService.getLogById(update.logId);

        const overrides = this.permissionService.userHasPermissions(user._id, ['logs.manage']);
        if (log.creator === `${user._id}` || overrides) {
          const newLog = await this.logService.updateLog(log.id, { unlisted: update.visibility });
          callback(newLog);
        } else {
          callback(null);
        }
      } catch (err) {
        logger.error(`[WS] Error updating log visibility: ${err.message}`);
        callback(null);
      }
    },
    // #endregion

    // #region | Miscellaneous
    /**
     * TESTING FOO
     * SEND A COMMAND TO A TARGET CLIENT
     */
    send_command: async (args: any, callback: any) => {
      const requestingUser = args.u as User;
      const canAccess = await this.permissionService.userHasPermissions(requestingUser._id, ['send_command']);

      if (args.cmd && canAccess) {
        const targetUser = args.t as string;
        try {
          await this.socketService.sendUserMessage(targetUser, args.cmd);
          callback({ success: true });
        } catch (sendErr) {
          callback({ err: sendErr.message });
        }
      } else {
        callback({ err: 'Unauthorized' });
      }
    },
    // #endregion
  };

  public static getHandler(event: string) {
    return this.handlers[event];
  }

  public static async validateArgs(object: any, instance = false, dto?: any) {
    try {
      const errors = instance ? await validate(plainToInstance(dto, object)) : await validate(object);
      if (errors.length > 0) {
        const message = errors.map((error: ValidationError) => Object.values(error.constraints)).join(', ');
        throw new Error(message);
      }
    } catch (err) {
      throw err;
    }
  }
}

export default SocketHandler;
