import { Exception } from '@/exceptions/Exception';
import { Permissions } from '@/interfaces/permission.interface';
import { Role } from '@/interfaces/role.interface';
import permissionModel from '@/models/permission.model';
import roleModel from '@/models/role.model';
import mongoose from 'mongoose';

class PermissionsService {
  public roles = roleModel;
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
      if (!createPermissions) throw new Error('Error creating permissions');

      return createPermissions;
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
      const findPermissions = await this.permissions.findOne({ _id: userId });
      if (!findPermissions) throw new Error('Permissions not found');

      const update = new Set([...findPermissions.permissions, ...newPermissions]);

      const updatePermissions = await this.permissions.findByIdAndUpdate(userId, { $set: { permissions: Array.from(update) } });
      if (!updatePermissions) throw new Error('Error adding permissions');

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
      const findPermissions = await this.permissions.findOne({ _id: userId });
      if (!findPermissions) throw new Error('Permissions not found');

      // Filter out all permissions not included in `removePermissions`
      const update = findPermissions.permissions.filter(permission => !removePermissions.includes(permission));

      // Set the new permissions to the previously filtered
      const updatePermissions = await this.permissions.findByIdAndUpdate(userId, { $set: { permissions: Array.from(update) } });
      if (!updatePermissions) throw new Error('Error removing permissions');

      return updatePermissions;
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
  public async userHasPermissions(userId: mongoose.Types.ObjectId, checkPermissions: string[]): Promise<boolean> {
    try {
      const findPermissions = await this.permissions.findOne({ _id: userId });
      if (!findPermissions) throw new Error('Permissions not found');

      const roles = await this.roles.find({ _id: { $in: findPermissions.roles } });
      if (!roles) throw new Error('Roles not found');

      let inheritedPermissions = [];
      for (const role of roles) inheritedPermissions = [...inheritedPermissions, ...(await this.getInheritedPermissions(role._id))];

      const rolePermissions = roles.reduce((acc, role) => [...acc, ...role.permissions], []);
      const userPermissions = new Set([...findPermissions.permissions, ...rolePermissions, ...inheritedPermissions]);

      return checkPermissions.every(permission => userPermissions.has(permission));
    } catch (err) {
      throw new Exception(500, err.message);
    }
  }

  /**
   * Get the user's permissions.
   * @param userId The user's database ID
   * @returns The user's permissions
   */
  public async getPermissions(userId: mongoose.Types.ObjectId): Promise<string[]> {
    try {
      const findPermissions = await this.permissions.findOne({ _id: userId });
      if (!findPermissions) throw new Error('Permissions not found');

      const roles = await this.roles.find({ _id: { $in: findPermissions.roles } });
      if (!roles) throw new Error('Roles not found');

      let inheritedPermissions = [];
      for (const role of roles) inheritedPermissions = [...inheritedPermissions, ...(await this.getInheritedPermissions(role._id))];

      const rolePermissions = roles.reduce((acc, role) => [...acc, ...role.permissions], []);
      const userPermissions: Set<string> = new Set([...findPermissions.permissions, ...rolePermissions, ...inheritedPermissions]);

      return Array.from(userPermissions);
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
      const rolePermission: Role = await this.roles.findOne({ _id: inherit });
      if (!rolePermission) throw new Error('Role not found');

      let perms = rolePermission.permissions;
      const inherits = rolePermission.inherits;
      if (inherits.length > 0) {
        for (const role of inherits) {
          perms = [...perms, ...(await this.getInheritedPermissions(role))];
        }
      }

      const allPerms = new Set([...perms]);
      return Array.from(allPerms);
    } catch (err) {
      throw new Exception(500, err.message);
    }
  }
}

export default PermissionsService;
