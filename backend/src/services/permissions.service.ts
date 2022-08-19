import { Exception } from '@/exceptions/Exception';
import { Permissions } from '@/interfaces/permission.interface';
import { Role } from '@/interfaces/role.interface';
import permissionModel from '@/models/permission.model';
import mongoose from 'mongoose';
import RedisService from './redis.service';
import ms from 'ms';
import RoleService from './roles.service';

class PermissionsService {
  public roles = new RoleService();
  public permissions = permissionModel;

  /**
   * Create an entry to the permissions database
   *
   * @param userId The user's database ID
   * @param permissions The user's permissions
   * @param roles The user's roles
   * @returns The created `Permissions` object
   */
  public async createPermissions(userId: mongoose.Types.ObjectId, permissions = [], roles = []): Promise<Permissions> {
    try {
      const createPermissions = await this.permissions.create({ _id: userId, permissions, roles });
      if (!createPermissions) throw new Error(`Could not create permissions for user: ${userId}`);

      return createPermissions;
    } catch (err) {
      throw new Exception(500, err.message);
    }
  }

  public async deletePermissions(userId: mongoose.Types.ObjectId): Promise<void> {
    try {
      await this.permissions.findByIdAndDelete(userId);
      const cached = await RedisService.get(`permissions:${userId}`);
      if (cached) await RedisService.del(`permissions:${userId}`);
    } catch (err) {
      throw new Exception(500, err.message);
    }
  }

  /**
   * Set permissions for a user.
   *
   * @param userId The user's database ID
   * @param setPermissions The new permissions to set
   * @returns The new `Permissions` object with set permissions
   */
  public async setPermissions(userId: mongoose.Types.ObjectId, setPermissions: string[]): Promise<Permissions> {
    try {
      const updatePermissions = await this.permissions.findByIdAndUpdate(userId, { permissions: setPermissions }, { new: true });
      if (!updatePermissions) throw new Error('Error setting permissions: update failed');

      const cached = await RedisService.get(`permissions:${userId}`);
      if (cached) await RedisService.del(`permissions:${userId}`);

      return updatePermissions;
    } catch (err) {
      throw new Exception(500, err.message);
    }
  }

  /**
   * Add permissions to the user.
   *
   * @param userId The user's database ID
   * @param newPermissions The new permissions to add. Duplicates are ignored.
   * @returns The updated `Permissions` object with new permissions
   */
  public async addPermissions(userId: mongoose.Types.ObjectId, newPermissions: string[]): Promise<Permissions> {
    try {
      const updatePermissions = await this.permissions.findByIdAndUpdate(
        userId,
        { $addToSet: { permissions: { $each: newPermissions } } },
        { new: true },
      );
      if (!updatePermissions) throw new Error('Error adding permissions: update failed');

      const cached = await RedisService.get(`permissions:${userId}`);
      if (cached) await RedisService.del(`permissions:${userId}`);

      return updatePermissions;
    } catch (err) {
      throw new Exception(500, err.message);
    }
  }

  /**
   * Remove permissions from a user.
   *
   * @param userId The user's database ID
   * @param removePermissions The permissions to remove
   * @returns The new `Permissions` object with removed permissions
   */
  public async removePermissions(userId: mongoose.Types.ObjectId, removePermissions: string[]): Promise<Permissions> {
    try {
      const updatePermissions = await this.permissions.findByIdAndUpdate(
        userId,
        { $pull: { permissions: { $in: removePermissions } } },
        { new: true },
      );
      if (!updatePermissions) throw new Error('Error removing permissions: update failed');

      const cached = await RedisService.get(`permissions:${userId}`);
      if (cached) await RedisService.del(`permissions:${userId}`);

      return updatePermissions;
    } catch (err) {
      throw new Exception(500, err.message);
    }
  }

  /**
   * Get permissions from a role and all inherited roles recursively.
   *
   * @param inherit ID of the inherited role
   * @returns All permissions from all roles
   */
  private async getInheritedPermissions(inherit: number): Promise<string[]> {
    try {
      const rolePermission: Role = await this.roles.getRole(inherit);
      if (!rolePermission) throw new Error(`Failed getting inherited permissions: role "${inherit}" not found`);

      let perms = rolePermission.permissions;
      const inherits = rolePermission.inherits;
      if (inherits.length > 0) {
        for (const role of inherits) {
          perms = [...perms, ...(await this.getInheritedPermissions(role))];
        }
      }

      const allPerms = new Set(perms);
      return Array.from(allPerms);
    } catch (err) {
      throw new Exception(500, err.message);
    }
  }

  /**
   * Get the user's permissions.
   *
   * @param userId The user's database ID
   * @returns The user's permissions
   */
  public async getUserPermissions(userId: mongoose.Types.ObjectId, byPassCache = false): Promise<string[]> {
    try {
      const cached = await RedisService.get(`permissions:${userId}`);
      if (cached && !byPassCache) {
        return JSON.parse(cached);
      } else {
        const findPermissions = await this.permissions.findOne({ _id: userId });
        if (!findPermissions) throw new Error(`Permissions document not found for user ${userId}`);

        const roles = await this.roles.getRoles(findPermissions.roles);
        if (!roles) throw new Error(`Error getting user's (${userId}) permissions: getting roles failed`);

        let inheritedPermissions = [];
        for (const role of roles) inheritedPermissions = [...inheritedPermissions, ...(await this.getInheritedPermissions(role._id))];

        const rolePermissions = roles.reduce((acc, role) => [...acc, ...role.permissions], []);
        const userPermissions: Set<string> = new Set([...findPermissions.permissions, ...rolePermissions, ...inheritedPermissions]);

        await RedisService.set(`permissions:${userId}`, JSON.stringify(Array.from(userPermissions)), 'PX', ms('10m'));
        return Array.from(userPermissions);
      }
    } catch (err) {
      throw new Exception(500, err.message);
    }
  }

  /**
   * Check if the user has the provided permission. Checks all user role permissions
   * as well as their own personal permissions.
   *
   * @param userId The user's database ID
   * @param checkPermissions The permissions to check for
   * @returns {boolean} If the user has the permission or not
   */
  public async userHasPermissions(userId: mongoose.Types.ObjectId, checkPermissions: string[], byPassCache = false): Promise<boolean> {
    try {
      const userPermissions = new Set(await this.getUserPermissions(userId, byPassCache));
      if (userPermissions.has('*')) return true;
      else return checkPermissions.every(permission => userPermissions.has(permission));
    } catch (err) {
      throw new Exception(500, err.message);
    }
  }

  /**
   * Get a list of all roles a user has.
   *
   * @param userId The ID of the user to get roles for
   * @returns The user's roles
   */
  public async getUserRoles(userId: mongoose.Types.ObjectId): Promise<Role[]> {
    try {
      const findPermissions = await this.permissions.findOne({ _id: userId });
      if (!findPermissions) throw new Error(`Permissions document not found for user ${userId}`);

      const roles = await this.roles.getRoles(findPermissions.roles);
      return roles;
    } catch (err) {
      throw new Exception(500, err.message);
    }
  }

  /**
   * Set a users roles, overwriting any currently set roles.
   *
   * @param userId The ID of the user to set roles for
   * @param roles The roles to set
   * @returns The user's roles
   */
  public async setUserRoles(userId: mongoose.Types.ObjectId, roles: number[]): Promise<number[]> {
    try {
      const update = await this.permissions.findByIdAndUpdate(userId, { $set: { roles } }, { new: true });
      if (!update) throw new Error('Error setting roles: update failed');

      const cached = await RedisService.get(`permissions:${userId}`);
      if (cached) await RedisService.del(`permissions:${userId}`);

      return roles;
    } catch (err) {
      throw new Exception(500, err.message);
    }
  }

  /**
   * Add a role to a user. If the user already has the role, it will not be added again.
   *
   * @param userId The ID of the user to add the role to
   * @param roles The IDs of the roles to add
   * @returns The user's roles
   */
  public async addUserRoles(userId: mongoose.Types.ObjectId, roles: number[]): Promise<number[]> {
    try {
      const update = await this.permissions.findByIdAndUpdate(userId, { $addToSet: { roles: { $each: roles } } }, { new: true });
      if (!update) throw new Error('Error adding roles: update failed');

      const cached = await RedisService.get(`permissions:${userId}`);
      if (cached) await RedisService.del(`permissions:${userId}`);

      return update.roles;
    } catch (err) {
      throw new Exception(500, err.message);
    }
  }

  /**
   * Remove roles from a user. If the user does not have the role, it will not be removed.
   *
   * @param userId The ID of the user to remove the role from
   * @param roles The IDs of the roles to remove
   * @returns The user's roles
   */
  public async removeUserRoles(userId: mongoose.Types.ObjectId, roles: number[]): Promise<number[]> {
    try {
      const update = await this.permissions.findByIdAndUpdate(userId, { $pull: { roles: { $in: roles } } }, { new: true });
      if (!update) throw new Error('Error removing roles: update failed');

      const cached = await RedisService.get(`permissions:${userId}`);
      if (cached) await RedisService.del(`permissions:${userId}`);

      return update.roles;
    } catch (err) {
      throw new Exception(500, err.message);
    }
  }

  public async userHasRole(userId: mongoose.Types.ObjectId, roleId: number): Promise<boolean> {
    try {
      const userRoles = await this.getUserRoles(userId);
      return userRoles.some(role => role._id === roleId);
    } catch (err) {
      throw new Exception(500, err.message);
    }
  }

  /**
   * Get a list of all unverified users.
   * TODO: Currently done under the assumption that role `id:0` will always be the unverified role
   * and that role `id:1` will always be the verified role and that all other roles inherit from it.
   *
   * @returns A list of objects with a single key `_id` that are unverified users
   */
  public async getUnverifiedUserIds(): Promise<{ _id: mongoose.Types.ObjectId }[]> {
    try {
      const unverified = await this.permissions.aggregate([
        {
          $match: {
            roles: {
              $in: [0],
            },
          },
        },
        {
          $project: {
            _id: '$_id',
          },
        },
      ]);
      return unverified.map(res => res._id);
    } catch (err) {
      throw new Exception(500, err.message);
    }
  }
}

export default PermissionsService;
