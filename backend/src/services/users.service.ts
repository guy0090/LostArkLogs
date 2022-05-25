import { HttpException } from '@exceptions/HttpException';
import { User } from '@interfaces/users.interface';
import userModel from '@/models/user.model';
import { ObjectId } from 'mongoose';
import { getRandomString } from '@/utils/crypto';
import { DiscordUser } from '@/interfaces/discord.interface';

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
  public async findUserById(userId: string | ObjectId): Promise<User> {
    try {
      const findUser: User = await this.users.findOne({ _id: userId });
      if (!findUser) throw new HttpException(404, 'Error finding user');

      return findUser;
    } catch (err) {
      throw new HttpException(400, err.message);
    }
  }

  public async findUserByDiscordId(discordId: string): Promise<User> {
    try {
      const findUser: User = await this.users.findOne({ discordId });
      if (!findUser) throw new HttpException(404, 'Error finding user');

      return findUser;
    } catch (err) {
      throw new HttpException(400, err.message);
    }
  }

  public async findByApiKey(apiKey: string): Promise<User> {
    try {
      const user = await this.users.findOne({ uploadKey: apiKey });
      if (!user) throw new HttpException(404, 'Error finding user');

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
  public async updateUser(userId: ObjectId, update: any): Promise<User> {
    try {
      if (update._id) delete update._id;

      const updateUserById: User = await this.users.findByIdAndUpdate(userId, { $set: update }, { returnDocument: 'after' });
      if (!updateUserById) throw new HttpException(400, 'Error updating user');

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
      await this.users.findByIdAndDelete(userId);

      return;
    } catch (err) {
      throw new HttpException(400, err.message);
    }
  }
}

export default UserService;
