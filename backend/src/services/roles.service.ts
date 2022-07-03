import { roles as rolesPreset } from '@/config/roles';
import { Role } from '@/interfaces/role.interface';
import roleModel from '@/models/role.model';
import { logger } from '@/utils/logger';
import RedisService from '@/services/redis.service';
import ms from 'ms';

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
      if (!createRole) throw new Error(`Error creating role: ${role}`);

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
      if (!updateRole) throw new Error(`Error updating role with id ${id}`);

      const cached = await RedisService.get(`role:${id}`);
      if (cached) await RedisService.del(`role:${id}`);

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

      const cached = await RedisService.get(`role:${id}`);
      if (cached) await RedisService.del(`role:${id}`);

      return;
    } catch (err) {
      throw new Error(err.message);
    }
  }

  public async getRole(id: number, byPassCache = false): Promise<Role> {
    try {
      const cached = await RedisService.get(`role:${id}`);
      if (cached && !byPassCache) {
        return JSON.parse(cached);
      } else {
        const role = await this.roles.findById(id);
        if (!role) throw new Error(`Role with id ${id} not found`);

        await RedisService.set(`role:${id}`, JSON.stringify(role), 'PX', ms('1hr'));
        return role;
      }
    } catch (err) {
      throw new Error(err.message);
    }
  }

  public async getRoles(roles: number[], byPassCache = false): Promise<Role[]> {
    try {
      if (byPassCache) {
        const rolesFound = await this.roles.find({ _id: { $in: roles } });
        if (!rolesFound) throw new Error(`Roles with ids ${roles.join(',')} not found`);

        return rolesFound;
      }

      const remapped = roles.map(id => `role:${id}`);
      const cached = await RedisService.mget(remapped);
      const result = [];
      const uncached = [];
      cached.forEach((role, index) => {
        if (!role) uncached.push(roles[index]);
        else result.push(role);
      });

      if (result.length === roles.length) return result;

      const rolesFound = await this.roles.find({ _id: { $in: uncached } });
      if (!rolesFound) throw new Error(`Roles with ids ${roles.join(',')} not found`);

      for (const role of rolesFound) {
        await RedisService.set(`role:${role._id}`, JSON.stringify(role), 'PX', ms('1hr'));
        result.push(role);
      }
      return result;
    } catch (err) {
      throw new Error(err.message);
    }
  }
}

export default RoleService;
