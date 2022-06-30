import { HttpException } from '@exceptions/HttpException';
import { User } from '@interfaces/users.interface';
import userModel from '@/models/user.model';
import mongoose from 'mongoose';
import { getRandomString } from '@/utils/crypto';
import { DiscordUser } from '@/interfaces/discord.interface';
import RedisService from '@/services/redis.service';
import ms from 'ms';

/**
 * @class UserService
 * @description User helper service. Used to manage user profiles.
 */
class UserService {
  public users = userModel;

  /**
   * Find all users in the database. Defaults to 50.
   * @param limit The limit of users to return
   * @returns All users found in database
   */
  public async findAllUser(limit = 50): Promise<User[]> {
    const users: User[] = await this.users.find().limit(limit);
    return users;
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
      const cached = await RedisService.get(`${userId}`);
      if (cached && !byPassCache) {
        user = JSON.parse(cached);
      } else {
        user = await this.users.findById(userId);
        if (!user) throw new HttpException(404, 'Error finding user');

        await RedisService.set(`user:${userId}`, JSON.stringify(user), 'PX', ms('10m'));
      }

      return user;
    } catch (err) {
      throw new HttpException(400, err.message);
    }
  }

  // TODO: Caching by discord ID AND user ID will lead to duplicates
  public async findUserByDiscordId(discordId: string, byPassCache = false): Promise<User> {
    try {
      let user: User = undefined;
      const cached = await RedisService.get(discordId);
      if (cached && !byPassCache) {
        user = JSON.parse(cached);
      } else {
        user = await this.users.findOne({ discordId });
        if (!user) throw new HttpException(404, 'Error finding user');

        await RedisService.set(`user:${discordId}`, JSON.stringify(user), 'PX', ms('10m'));
      }
      return user;
    } catch (err) {
      throw new HttpException(400, err.message);
    }
  }

  public async findByApiKey(uploadKey: string, byPassCache = false): Promise<User> {
    try {
      let user: User = undefined;
      const cached = await RedisService.get(uploadKey);
      if (cached && !byPassCache) {
        user = JSON.parse(cached);
      } else {
        user = await this.users.findOne({ uploadKey });
        if (!user) throw new HttpException(404, 'Error finding user');

        await RedisService.set(`user:${uploadKey}`, JSON.stringify(user), 'PX', ms('10m'));
      }
      return user;
    } catch (err) {
      throw new HttpException(400, err.message);
    }
  }

  /**
   * Create a new user in MongoDB from their received Discord information.
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
      throw new HttpException(500, 'Error creating user');
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

      const updateUserById: User = await this.users.findByIdAndUpdate(userId, { $set: update }, { returnDocument: 'after' });
      if (!updateUserById) throw new HttpException(400, 'Error updating user');

      const cached = await RedisService.get(`user:${userId}`);
      if (cached) await RedisService.set(`user:${userId}`, JSON.stringify(updateUserById), 'PX', ms('10m'));

      return updateUserById;
    } catch (err) {
      throw new HttpException(400, err.message);
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
      const cached = await RedisService.get(`user:${userId}`);
      if (cached) RedisService.del(`user:${userId}`);

      await this.users.findByIdAndDelete(userId);

      return;
    } catch (err) {
      throw new HttpException(400, err.message);
    }
  }
}

export default UserService;
