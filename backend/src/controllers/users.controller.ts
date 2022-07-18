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
   * @param req The passed request from express middleware with user object
   * @param res The passed response from express middleware
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

  /**
   * Get a user with secrets removed.
   *
   * @param req The passed request from express middleware with user ID
   * @param res The passed response from express middleware
   * @param next The next function to be called on fail to pass along to error middleware
   */
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

  /**
   * Delete a user and all associated data.
   * "Associated data" is only data the user themselves created.
   *
   * @param req The passed request from express middleware with user ID
   * @param res The passed response from express middleware
   * @param next The next function to be called on fail to pass along to error middleware
   */
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

  /**
   * Ban a user. Removes all user roles and permissions.
   * TODO: Decide on what a banned user is allowed to do
   *
   * @param req The passed request from express middleware with target user ID and ban reason
   * @param res The passed response from express middleware
   * @param next The next function to be called on fail to pass along to error middleware
   */
  public banUser = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const { userId, banReason } = req.body;

      const isTargetSuperAdmin = await this.permissionsService.userHasRole(userId, 3); // TODO: dont hard code this; set an enum when reworking permissions system
      if (isTargetSuperAdmin) {
        res.status(400).json({ message: 'This user cannot be banned' });
      } else {
        const banned = await this.userService.banUser(userId, banReason);
        res.status(200).json({ message: `User ${banned.username}#${banned.discriminator} (${userId}) banned for: ${banReason}` });
      }
    } catch (error) {
      next(error);
    }
  };

  /**
   * Unban a user.
   *
   * @param req The passed request from express middleware with target user ID
   * @param res The passed response from express middleware
   * @param next The next function to be called on fail to pass along to error middleware
   */
  public unbanUser = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const { userId } = req.body;
      const unbanned = await this.userService.unbanUser(userId);

      res.status(200).json({ message: `User ${unbanned.username}#${unbanned.discriminator} (${userId}) unbanned` });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get all banned users.
   *
   * @param req The passed request from express middleware
   * @param res The passed response from express middleware
   * @param next The next function to be called on fail to pass along to error middleware
   */
  public getBannedUsers = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const bannedUsers = await this.userService.getBannedUsers();
      res.status(200).json(bannedUsers);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get all permissions for a user.
   *
   * @param req The passed request from express middleware with user ID
   * @param res The passed response from express middleware
   * @param next The next function to be called on fail to pass along to error middleware
   */
  public getUserPermissions = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const { userId } = req.body;
      const permissions = await this.permissionsService.getUserPermissions(userId);

      res.status(200).json(permissions);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Set a users permissions.
   *
   * @param req The passed request from express middleware with user ID and permission ID
   * @param res The passed response from express middleware
   * @param next The next function to be called on fail to pass along to error middleware
   */
  public setUserPermissions = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const { userId, permissions } = req.body;
      const updatedPermissions = await this.permissionsService.setPermissions(userId, permissions);
      res.status(200).json({ message: 'Permissions updated', permissions: updatedPermissions });
    } catch (err) {
      next(err);
    }
  };

  /**
   * Add permissions to a user. Duplicates are ignored.
   *
   * @param req The passed request from express middleware with user ID and permissions
   * @param res The passed response from express middleware
   * @param next The next function to be called on fail to pass along to error middleware
   */
  public addUserPermissions = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const { userId, permissions } = req.body;
      const added = await this.permissionsService.addPermissions(userId, permissions);

      res.status(200).json({ message: 'Added new permissions', update: added });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Remove permissions from a user.
   *
   * @param req The passed request from express middleware with user ID and permissions
   * @param res The passed response from express middleware
   * @param next The next function to be called on fail to pass along to error middleware
   */
  public removeUserPermissions = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const { userId, permissions } = req.body;
      const removed = await this.permissionsService.removePermissions(userId, permissions);

      res.status(200).json({ message: 'Removed permissions', update: removed });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Set a users roles.
   *
   * @param req The passed request from express middleware with user ID and roles
   * @param res The passed response from express middleware
   * @param next The next function to be called on fail to pass along to error middleware
   */
  public setUserRoles = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const { userId, roles } = req.body;
      const updatedRoles = await this.permissionsService.setUserRoles(userId, roles);
      res.status(200).json({ message: 'Roles updated', permissions: updatedRoles });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get all roles for a user.
   *
   * @param req The passed request from express middleware with user ID
   * @param res The passed response from express middleware
   * @param next The next function to be called on fail to pass along to error middleware
   */
  public getUserRoles = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const { userId } = req.body;
      const roles = await this.permissionsService.getUserRoles(userId);

      res.status(200).json(roles);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Add roles to a user. Duplicates are ignored.
   *
   * @param req The passed request from express middleware with user ID and roles
   * @param res The passed response from express middleware
   * @param next The next function to be called on fail to pass along to error middleware
   */
  public addUserRoles = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const { userId, roles } = req.body;
      const added = await this.permissionsService.addUserRoles(userId, roles);

      res.status(200).json({ message: 'Added new roles', update: added });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Remove roles from a user.
   *
   * @param req The passed request from express middleware with user ID and roles
   * @param res The passed response from express middleware
   * @param next The next function to be called on fail to pass along to error middleware
   *
   */
  public removeUserRoles = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const { userId, roles } = req.body;
      const removed = await this.permissionsService.removeUserRoles(userId, roles);

      res.status(200).json({ message: 'Removed roles', update: removed });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get all unverified users.
   *
   * @param req The passed request from express middleware
   * @param res The passed response from express middleware
   * @param next The next function to be called on fail to pass along to error middleware
   */
  public getUnverifiedUsers = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const unverifiedUsers = await this.userService.getUnverifiedUsers();
      res.status(200).json(unverifiedUsers);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Verify a user.
   *
   * @param req The passed request from express middleware with user ID
   * @param res The passed response from express middleware
   * @param next The next function to be called on fail to pass along to error middleware
   */
  public verifyUser = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const { userId } = req.body;
      const userIsVerified = await this.permissionsService.userHasPermissions(userId, ['verified']);
      if (!userIsVerified) {
        await Promise.all([this.permissionsService.setPermissions(userId, []), this.permissionsService.setUserRoles(userId, [1])]);

        res.status(200).json({ message: 'User verified' });
      } else {
        next(new HttpException(400, 'User is already verified'));
      }
    } catch (error) {
      next(error);
    }
  };

  /**
   * Search for users by username or if an ID is provided, return that user.
   *
   * @param req The passed request from express middleware with user ID or username
   * @param res The passed response from express middleware
   * @param next The next function to be called on fail to pass along to error middleware
   */
  public searchUsers = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const id = req.body.id;
      const username = req.body.username;

      let result = [];
      if (id) result = [await this.userService.findUserById(id)];
      else result = await this.userService.searchUsernames(username);

      result = result.map(user => new UserObject(user, true));

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };
}

export default UsersController;
