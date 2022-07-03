import { NextFunction, Response } from 'express';
import { User } from '@interfaces/users.interface';
import UserService from '@services/users.service';
import LogsService from '@/services/logs.service';
import { RequestWithUser } from '@/interfaces/auth.interface';
import { UserObject } from '@/objects/user.object';
import { HttpException } from '@/exceptions/HttpException';
import PermissionsService from '@/services/permissions.service';
import DiscordService from '@/services/discord.service';

class UsersController {
  public userService = new UserService();
  public logService = new LogsService();
  public permissionsService = new PermissionsService();
  public discordService = new DiscordService();

  /**
   * Get the user found in the request reformatted to not include sensitive information.
   *
   * @param req Request with user object
   * @param res Response object
   * @param next The next function to be called on fail to pass along to error middleware
   */
  public getSelf = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const findUser: User = req.user;
      res.status(200).json(new UserObject(findUser));
    } catch (error) {
      next(error);
    }
  };

  public getUser = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const userId = req.body.userId;
      const findUser: User = await this.userService.findUserById(userId);
      if (!findUser) throw new HttpException(404, 'User not found');

      res.status(200).json(new UserObject(findUser));
    } catch (error) {
      next(error);
    }
  };

  public deleteUser = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const userId = req.body.userId;
      const findUser: User = await this.userService.findUserById(userId);
      if (!findUser) throw new HttpException(404, 'User not found');

      await Promise.all([
        this.userService.deleteUser(userId),
        this.discordService.deleteGrant(userId),
        this.permissionsService.deletePermissions(userId),
        this.logService.deleteAllUserLogs(userId),
      ]);

      res.status(200).json({ message: 'User and associated data deleted' });
    } catch (error) {
      next(error);
    }
  };

  public banUser = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const { userId, banReason } = req.body;
      const banned = await this.userService.banUser(userId, banReason);

      res.status(200).json({ message: `User ${banned.username}#${banned.discriminator} (${userId}) banned for: ${banReason}` });
    } catch (error) {
      next(error);
    }
  };

  public unbanUser = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const { userId } = req.body;
      const unbanned = await this.userService.unbanUser(userId);

      res.status(200).json({ message: `User ${unbanned.username}#${unbanned.discriminator} (${userId}) unbanned` });
    } catch (error) {
      next(error);
    }
  };

  public getBannedUsers = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const bannedUsers = await this.userService.getBannedUsers();
      res.status(200).json(bannedUsers);
    } catch (error) {
      next(error);
    }
  };

  public getUserPermissions = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const { userId } = req.body;
      const permissions = await this.permissionsService.getUserPermissions(userId);

      res.status(200).json(permissions);
    } catch (error) {
      next(error);
    }
  };

  public addUserPermissions = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const { userId, permissions } = req.body;
      const added = await this.permissionsService.addPermissions(userId, permissions);

      res.status(200).json({ message: 'Added new permissions', update: added });
    } catch (error) {
      next(error);
    }
  };

  public removeUserPermissions = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const { userId, permissions } = req.body;
      const removed = await this.permissionsService.removePermissions(userId, permissions);

      res.status(200).json({ message: 'Removed permissions', update: removed });
    } catch (error) {
      next(error);
    }
  };

  public getUserRoles = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const { userId } = req.body;
      const roles = await this.permissionsService.getUserRoles(userId);

      res.status(200).json(roles);
    } catch (error) {
      next(error);
    }
  };

  public addUserRoles = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const { userId, roles } = req.body;
      const added = await this.permissionsService.addUserRoles(userId, roles);

      res.status(200).json({ message: 'Added new roles', update: added });
    } catch (error) {
      next(error);
    }
  };

  public removeUserRoles = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const { userId, roles } = req.body;
      const removed = await this.permissionsService.removeUserRoles(userId, roles);

      res.status(200).json({ message: 'Removed roles', update: removed });
    } catch (error) {
      next(error);
    }
  };
}

export default UsersController;
