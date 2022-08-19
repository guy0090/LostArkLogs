import { Exception } from '@exceptions/Exception';
import { User } from '@interfaces/users.interface';
import userModel from '@/models/user.model';
import mongoose from 'mongoose';
import { getRandomString } from '@/utils/crypto';
import { DiscordUser } from '@/interfaces/discord.interface';
import RedisService from '@/services/redis.service';
import PermissionsService from '@/services/permissions.service';
import ms from 'ms';

/**
 * @class UserService
 * @description User helper service. Used to manage user profiles.
 */
class UserService {
  public users = userModel;
  public permissionsService = new PermissionsService();

  /**
   * Find all users in the database. Defaults to 50 results per request.
   *
   * @param skip The number of users to skip
   * @param limit The number of users to return
   * @returns Users found in database
   */
  public async findAllUsers(skip = 0, limit = 50): Promise<User[]> {
    const aggregate = await this.users.aggregate([
      {
        $project: {
          username: '$username',
          discrim: '$discriminator',
          discordId: '$discordId',
          banned: '$banned',
          banReason: '$banReason',
          registered: '$registered',
        },
      },
      {
        $sort: {
          registered: -1,
        },
      },
      {
        $skip: skip,
      },
      {
        $limit: limit,
      },
    ]);
    return aggregate;
  }

  /**
   * Find a user by their ID.
   *
   * @param userId The id of the user to find
   * @returns The found user
   */
  public async findUserById(userId: mongoose.Types.ObjectId | string, byPassCache = false): Promise<User> {
    try {
      let user: User = undefined;
      const cached = await RedisService.get(`user:${userId}`);
      if (cached && !byPassCache) {
        user = JSON.parse(cached);
      } else {
        user = await this.users.findById(userId);
        if (!user) throw new Exception(404, 'Error finding user');

        await RedisService.set(`user:${userId}`, JSON.stringify(user), 'PX', ms('10m'));
      }

      return user;
    } catch (err) {
      throw new Exception(400, err.message);
    }
  }

  /**
   * Find a list of users.
   *
   * @param userIds The IDs of the users to find
   * @returns The found users
   */
  public async findUsers(userIds: mongoose.Types.ObjectId[]): Promise<User[]> {
    try {
      const cached = await RedisService.mget(userIds.map(id => `user:${id}`));
      const missing = [];
      const users = [];
      cached.forEach((user, index) => {
        if (!user) missing.push(userIds[index]);
        else users.push(JSON.parse(user));
      });

      const found = await this.users.find({ _id: { $in: missing } });
      for (const f of found) RedisService.set(`user:${f._id}`, JSON.stringify(f), 'PX', ms('10m'));

      return [...users, ...found];
    } catch (err) {
      throw new Exception(400, err.message);
    }
  }

  /**
   * Find a user by their Discord ID.
   *
   * @param discordId The Discord ID of the user to find
   * @param byPassCache Whether to bypass the cache
   * @returns The found user
   */
  public async findUserByDiscordId(discordId: string, byPassCache = false): Promise<User> {
    try {
      let user: User = undefined;
      const cached = await RedisService.get(`user:${discordId}`);
      if (cached && !byPassCache) {
        user = JSON.parse(cached);
      } else {
        user = await this.users.findOne({ discordId });
        if (!user) throw new Exception(404, 'Error finding user');

        await RedisService.set(`user:${discordId}`, JSON.stringify(user), 'PX', ms('10m'));
      }
      return user;
    } catch (err) {
      throw new Exception(400, err.message);
    }
  }

  /**
   * Find a user by their Discord ID.
   *
   * @param username The Discord username of the user to find
   * @param discriminator The Discord discriminator of the user to find
   * @param byPassCache Whether to bypass the cache
   * @returns The found user
   */
  public async findUserByDiscordName(username: string, discriminator: number, byPassCache = false): Promise<User> {
    try {
      let user: User = undefined;
      const cached = await RedisService.get(`user:${username}#${discriminator}`);
      if (cached && !byPassCache) {
        user = JSON.parse(cached);
      } else {
        user = await this.users.findOne({ username, discriminator });
        if (!user) throw new Exception(404, 'Error finding user');

        await RedisService.set(`user:${username}#${discriminator}`, JSON.stringify(user), 'PX', ms('10m'));
      }
      return user;
    } catch (err) {
      throw new Exception(400, err.message);
    }
  }

  /**
   * Find a user by their API key.
   *
   * @param apiKey The API key of the user to find
   * @param byPassCache Whether to bypass the cache
   * @returns The found user
   */
  public async findByApiKey(apiKey: string, byPassCache = false): Promise<User> {
    try {
      let user: User = undefined;
      const cached = await RedisService.get(`user:${apiKey}`);
      if (cached && !byPassCache) {
        user = JSON.parse(cached);
      } else {
        user = await this.users.findOne({ uploadKey: apiKey });
        if (!user) throw new Exception(404, 'Error finding user');

        await RedisService.set(`user:${apiKey}`, JSON.stringify(user), 'PX', ms('10m'));
      }
      return user;
    } catch (err) {
      throw new Exception(400, err.message);
    }
  }

  /**
   * Search for users that match a username. Optionally case sensitive.
   *
   * @param {string} username The username to match for
   * @returns The found users
   */
  public async searchUsernames(username: string, caseSensitive = false): Promise<User[]> {
    try {
      const regex = new RegExp(username, caseSensitive ? '' : 'i');
      const users = await this.users.find({ username: { $regex: regex } });

      return users;
    } catch (err) {
      throw new Exception(400, 'Error searching usernames');
    }
  }

  /**
   * Create a new user in MongoDB from their received Discord information.
   *
   * @param {DiscordUser} user The `DiscordUser` object
   * @returns {Promise<User>} The new `User` object
   */
  public async createUser(user: DiscordUser): Promise<User> {
    try {
      // Generate this differently? More secure? #TODO
      const salt = getRandomString(32);
      const apiKey = getRandomString(32);

      const newUser: User = await this.users.create({
        salt: salt,
        uploadKey: apiKey,
        discordId: user.id,
        registered: new Date(),
        username: user.username,
        discriminator: parseInt(user.discriminator),
        avatar: user.avatar,
      });

      RedisService.set(`user:${newUser._id}`, JSON.stringify(newUser), 'PX', ms('10m'));
      return newUser;
    } catch (err) {
      throw new Exception(500, 'Error creating user');
    }
  }

  /**
   * Update a user's information.
   *
   * @param userId The user id of the user to update
   * @param update The update object
   * @returns The updated user
   */
  public async updateUser(userId: mongoose.Types.ObjectId, update: any): Promise<User> {
    try {
      if (update._id) delete update._id;

      const updateUserById: User = await this.users.findByIdAndUpdate(userId, { $set: update }, { new: true });
      if (!updateUserById) throw new Exception(400, 'Error updating user');

      const cached = await RedisService.get(`user:${userId}`);
      if (cached) await RedisService.set(`user:${userId}`, JSON.stringify(updateUserById), 'PX', ms('10m'));

      return updateUserById;
    } catch (err) {
      throw new Exception(400, err.message);
    }
  }

  /**
   * Delete a user from the database.
   *
   * @param userId The id of the user to delete
   * @returns Nothing
   */
  public async deleteUser(userId: string): Promise<void> {
    try {
      await this.users.findByIdAndDelete(userId);

      const cached = await RedisService.get(`user:${userId}`);
      if (cached) await RedisService.del(`user:${userId}`);

      return;
    } catch (err) {
      throw new Exception(400, err.message);
    }
  }

  /**
   * Ban a user. Removes all permissions and roles the user has.
   *
   * @param userId The ID of the user to ban
   * @param reason The reason for the ban
   * @returns Nothing
   */
  public async banUser(userId: mongoose.Types.ObjectId, reason = 'No Reason Specified'): Promise<User> {
    try {
      if (reason === '') reason = 'No Reason Specified';
      // Remove permissions
      await this.permissionsService.setPermissions(userId, []);
      // Reset roles to default
      await this.permissionsService.setUserRoles(userId, [0]);
      // Ban user
      const update = await this.updateUser(userId, { banned: true, banReason: reason });

      return update;
    } catch (err) {
      throw new Exception(400, err.message);
    }
  }

  /**
   * Unban a user.
   *
   * @param userId The id of the user to unban
   * @returns The unbanned user
   */
  public async unbanUser(userId: mongoose.Types.ObjectId): Promise<User> {
    try {
      // Remove permissions
      await this.permissionsService.setPermissions(userId, []);
      // Reset roles to default
      await this.permissionsService.setUserRoles(userId, [0]);
      // Remove ban
      const update = await this.updateUser(userId, { banned: false, banReason: '' });

      return update;
    } catch (err) {
      throw new Exception(400, err.message);
    }
  }

  /**
   * Get a list of all users in the database who are banned.
   *
   * @returns A list of banned users
   */
  public async getBannedUsers() {
    try {
      const aggregate = await this.users.aggregate([
        {
          $match: {
            banned: true,
          },
        },
        {
          $project: {
            _id: false,
            id: '$_id',
            username: '$username',
            discordId: '$discordId',
            discriminator: '$discriminator',
            avatar: '$avatar',
            registered: '$registered',
            banReason: '$banReason',
          },
        },
      ]);
      return aggregate;
    } catch (err) {
      throw new Exception(400, err.message);
    }
  }

  /**
   * Get a list of all users in the database who are not verified.
   *
   * @returns `UserObject[]` of all users that are not verified.
   */
  public async getUnverifiedUsers() {
    try {
      const unverifiedIds = await this.permissionsService.getUnverifiedUserIds();
      const unverifiedUsers = await this.users.aggregate([
        {
          $match: {
            _id: { $in: unverifiedIds },
            banned: false,
          },
        },
        {
          $project: {
            _id: false,
            id: '$_id',
            discordId: '$discordId',
            username: '$username',
            discriminator: '$discriminator',
            avatar: '$avatar',
            registered: '$registered',
            banned: '$banned',
            banReason: '$banReason',
          },
        },
      ]);

      return unverifiedUsers;
    } catch (err) {
      throw new Exception(400, err.message);
    }
  }
}

export default UserService;
