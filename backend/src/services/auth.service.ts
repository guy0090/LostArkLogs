import { sign } from 'jsonwebtoken';
import { SECRET_KEY } from '@config';
import { HttpException } from '@exceptions/HttpException';
import { DataStoredInToken, TokenData } from '@interfaces/auth.interface';
import { User } from '@interfaces/users.interface';
import { DiscordOAuthGrant, DiscordOAuth, DiscordUser } from '@interfaces/discord.interface';
import DiscordService from './discord.service';
import userModel from '@/models/user.model';
import discordAuthModel from '@/models/discordAuth.model';
import { logger } from '@/utils/logger';
import { sha512 } from '@/utils/crypto';
import mongoose from 'mongoose';
import UserService from './users.service';
import { Permissions } from '@/interfaces/permission.interface';
import PermissionsService from './permissions.service';

/**
 * @class AuthService
 * @description Authentication helper service. Used to manage user authentication
 * via JSON Web Tokens (JWT).
 */
class AuthService {
  public users = userModel;
  public discordGrants = discordAuthModel;
  public Discord = new DiscordService();
  public UserService = new UserService();
  public Permissions = new PermissionsService();

  /**
   * Register the user or log the user in if they already exist.
   *
   * @param {string} oAuthCode The Discord code provided by the client during OAuth
   * @returns The user object and the authorization cookie
   */
  public async register(oAuthCode: string): Promise<{ refresh: TokenData; access: TokenData; user: User }> {
    // Get Discord Access Tokens
    const grant: DiscordOAuthGrant = await this.Discord.getToken(oAuthCode);
    if (!grant) throw new HttpException(409, 'Invalid Code Grant');

    // Get Associated Discord User
    const discordUser: DiscordUser = await this.Discord.getUser(grant.access_token);
    if (!discordUser) throw new HttpException(409, 'Invalid Discord Auth');

    /**
     * If a user is already registered but is logging in from a new location
     * they will not have an auth cookie. If this is the case, we update their
     * Discord tokens and their Discord information as well.
     *
     * If the user is new, this process is skipped and the standard registration
     * process is used.
     */
    let user: User = await this.users.findOne({ discordId: discordUser.id });
    let discordOAuth: DiscordOAuth;

    if (user) {
      user = await this.updateUser(user._id, discordUser);
      if (!user) throw new HttpException(500, 'Error Updating User');

      discordOAuth = await this.updateGrant(user._id, grant);
      if (!discordOAuth) throw new HttpException(500, 'Error Updating Discord Auth');
    } else {
      const createdUser = await this.UserService.createUser(discordUser);
      if (!createdUser) throw new HttpException(500, 'Error Creating User');
      user = createdUser;

      const newPermissions: Permissions = await this.Permissions.createPermissions(createdUser._id, [], [0]);
      if (!newPermissions) throw new HttpException(500, 'Error creating permissions');

      discordOAuth = await this.Discord.createGrant(user._id, grant);
    }

    if (!user || !discordOAuth) throw new HttpException(500, 'Error Registering');

    /**
     * Create the user refresh and access tokens.
     *
     * The refresh token has a lifespan of half a year.
     * The access token has a lifespan of 1 hour.
     * */
    const refresh: TokenData = this.createJWT(user, 'refresh');
    const access: TokenData = this.createJWT(user, 'access', 3600);

    return { refresh, access, user };
  }

  /**
   * Log the user in if their session and Discord tokens are valid.
   *
   * @param {DataStoredInToken} refreshJWT The refresh authorization cookie
   * @returns The user object and the authorization cookie
   */
  public async login(refreshJWT: DataStoredInToken): Promise<{ refresh: TokenData; access: TokenData; user: User }> {
    const userId = refreshJWT.i;

    // Check if the user exists
    let user: User = await this.users.findOne({ _id: userId });
    if (!user || `${user._id}` !== `${userId}`) throw new HttpException(409, `Invalid ID: ${userId}`);

    // Generate new tokens
    const refresh: TokenData = this.createJWT(user, 'refresh');
    const access: TokenData = this.createJWT(user, 'access', 3600);

    // Make sure the user has stored Discord auth tokens
    const discordAuth: DiscordOAuth = await this.discordGrants.findOne({ _id: user._id });
    if (!discordAuth) throw new HttpException(409, `Missing Discord Auth: ${userId}`);

    // eslint-disable-next-line prefer-const
    const { discordRefresh, expires } = discordAuth;
    let discordAccess: string = discordAuth.discordAccess;

    // If the user's Discord token is close to expiring (<=24hrs) we refresh it.
    if (expires.getTime() <= Date.now() - 86400000) {
      // Refresh Discord tokens if they're expired
      const grant: DiscordOAuthGrant = await this.Discord.refreshToken(discordRefresh);
      if (!grant) throw new HttpException(409, 'Invalid Token Refresh');

      const discordAuthUpdate: DiscordOAuth = await this.updateGrant(user._id, grant);
      if (!discordAuthUpdate) throw new HttpException(500, 'Error Updating Discord Auth');

      discordAccess = grant.access_token;
    }

    // Try to refresh the user's Discord information
    const discordUser: DiscordUser = await this.Discord.getUser(discordAccess);
    if (!discordUser) throw new HttpException(409, 'Invalid Discord Auth');

    const updateUser: User = await this.updateUser(user._id, discordUser);
    if (!updateUser) throw new HttpException(500, 'Error Updating User');
    user = updateUser;

    return { refresh, access, user };
  }

  /**
   * Upade the user's DiscordOAuthGrant object in MongoDB.
   *
   * @param {ObjectId} id The user's ID
   * @param {DiscordOAuthGrant} grant The `DiscordOAuthGrant` object received from Discord
   * @returns {Promise<DiscordOAuth>} The user's updated `DiscordOAuth` object
   */
  private async updateGrant(id: mongoose.Types.ObjectId, grant: DiscordOAuthGrant): Promise<DiscordOAuth> {
    try {
      const update = {
        discordAccess: grant.access_token,
        discordRefresh: grant.refresh_token,
        expires: new Date(Date.now() + grant.expires_in * 1000),
        scope: grant.scope,
        tokenType: grant.token_type,
      };

      const updateGrant = await this.Discord.updateGrant(id, update);

      return updateGrant;
    } catch (err) {
      throw new HttpException(500, 'Error updating Discord auth');
    }
  }

  /**
   *
   * @param {ObjectId} id The user ID
   * @param {DiscordUser} user The `DiscordUser` object from Discord's API
   * @returns {Promise<User>} The updated `User` object
   */
  private async updateUser(id: mongoose.Types.ObjectId, user: DiscordUser): Promise<User> {
    try {
      const updateUser = await this.UserService.updateUser(id, {
        discordId: user.id,
        username: user.username,
        discriminator: parseInt(user.discriminator),
        avatar: user.avatar,
        lastSeen: new Date(),
      });

      return updateUser;
    } catch (err) {
      logger.error(err.message);
      throw new HttpException(500, 'Error updating user');
    }
  }

  /**
   * Create a new JSON Web Token (JWT) for the provided user signed by `SECRET_KEY`.
   *
   * Refresh defaults to half a year expire time.
   * Access should be 1 hour. (Shorter? Longer?) #TODO
   *
   * @param {User} user The user to create a JWT for
   * @returns The authorization token and expiration time in seconds
   */
  public createJWT(user: User, type: string, expiresIn = (60 * 60 * 24 * 365) / 2): TokenData {
    const dataStoredInToken: DataStoredInToken = type === 'refresh' ? { i: `${user._id}` } : { h: sha512(`${user._id}`, user.salt).hash };
    const secretKey: string = SECRET_KEY;

    return { expiresIn, token: sign(dataStoredInToken, secretKey, { expiresIn }) };
  }

  /**
   * Create a cookie for the provided token.
   *
   * @param tokenData The JSON Web Token (JWT) to create a cookie from
   * @returns The created cookie
   */
  public createCookie(tokenData: TokenData): string {
    return `Authorization=${tokenData.token}; HttpOnly; Max-Age=${tokenData.expiresIn}; path=/;`;
  }
}

export default AuthService;
