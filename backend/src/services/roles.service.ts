import { roles as rolesPreset } from '@/config/roles';
import { Role } from '@/interfaces/role.interface';
import roleModel from '@/models/role.model';
import { logger } from '@/utils/logger';

class RoleService {
  public roles = roleModel;

  /**
   * Create the default roles provided in `config/roles.ts` if they don't exist.
   * @returns The created roles if any
   */
  public static async initializeRoles(): Promise<Role[]> {
    try {
      const rolesExist = await roleModel.find({ _id: { $in: rolesPreset.map(role => role._id) } });
      if (rolesExist.length > 0) {
        logger.info('Skipping roles initialization because roles already exist');
        return [];
      } else {
        const roles = await roleModel.create(rolesPreset);
        if (!roles) throw new Error('Error creating roles');

        return roles;
      }
    } catch (err) {
      throw err;
    }
  }

  /**
   * Create a new role
   * @param role The role to add
   * @returns The created `Role`
   */
  public async createRole(role: Role): Promise<Role> {
    try {
      const createRole = await this.roles.create(role);
      if (!createRole) throw new Error('Error creating role');

      return createRole;
    } catch (err) {
      throw new Error(err.message);
    }
  }

  /**
   * Update an existing role
   * @param id The id of the role to update
   * @param update The update to apply
   * @returns The updated `Role`
   */
  public async updateRole(id: number | string, update: any): Promise<Role> {
    try {
      const updateRole = await this.roles.findByIdAndUpdate(id, { $set: update });
      if (!updateRole) throw new Error('Error updating role');

      return updateRole;
    } catch (err) {
      throw new Error(err.message);
    }
  }

  /**
   * Delete an existing role
   * @param id The id of the role to delete
   * @returns Nothing
   */
  public async deleteRole(id: number): Promise<void> {
    try {
      await this.roles.findByIdAndDelete(id);

      return;
    } catch (err) {
      throw new Error(err.message);
    }
  }

  public async getRole(id: number): Promise<Role> {
    try {
      const findRole = await this.roles.findOne({ _id: id });
      if (!findRole) throw new Error('Role not found');

      return findRole;
    } catch (err) {
      throw new Error(err.message);
    }
  }
}

export default RoleService;
