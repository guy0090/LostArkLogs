import { CLIENT_ID, CLIENT_SECRET, REDIRECT_URI } from '@/config';
import { HttpException } from '@/exceptions/HttpException';
import { DiscordOAuth, DiscordOAuthGrant, DiscordUser } from '@/interfaces/discord.interface';
import discordAuthModel from '@/models/discordAuth.model';
import axios from 'axios';
import { ObjectId } from 'mongoose';

/**
 * @class DiscordService
 * @description Discord helper service. Used to interact with the Discord API.
 */
class DiscordService {
  public grants = discordAuthModel;

  /**
   * Get the user's tokens during authorization code grant flow
   *
   * @param code Authorization code
   * @returns `DiscordOAuthGrand` object from Discord's API
   */
  public async getToken(code: string): Promise<DiscordOAuthGrant> {
    try {
      const response = await axios({
        url: 'https://discord.com/api/oauth2/token',
        method: 'POST',
        data: new URLSearchParams({
          client_id: CLIENT_ID,
          client_secret: CLIENT_SECRET,
          code,
          grant_type: 'authorization_code',
          redirect_uri: REDIRECT_URI,
          scope: 'identify',
        }),
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      const discordOauth: DiscordOAuthGrant = response.data;
      return discordOauth;
    } catch (error: any) {
      return undefined;
    }
  }

  /**
   * Refresh the user's Discord OAuth tokens
   *
   * @param {string} refreshToken The refresh token received during authorization
   * @returns {DiscordOAuthGrant} New `DiscordOAuthGrand` object from Discord's API
   */
  public async refreshToken(refreshToken: string): Promise<DiscordOAuthGrant> {
    try {
      const response = await axios({
        url: 'https://discord.com/api/oauth2/token',
        method: 'POST',
        data: new URLSearchParams({
          client_id: CLIENT_ID,
          client_secret: CLIENT_SECRET,
          grant_type: 'refresh_token',
          refresh_token: refreshToken,
        }),
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      const discordOauth: DiscordOAuthGrant = response.data;
      return discordOauth;
    } catch (error: any) {
      return undefined;
    }
  }

  /**
   * Get the user's Discord profile
   *
   * @param discordToken The user's Discord API access token
   * @returns {DiscordUser} User's profile from Discord's API
   */
  public async getUser(discordToken: string): Promise<DiscordUser> {
    try {
      const response = await axios('https://discord.com/api/users/@me', {
        headers: {
          authorization: `Bearer ${discordToken}`,
        },
      });

      const discordUser: DiscordUser = response.data;
      return discordUser;
    } catch (error: any) {
      return undefined;
    }
  }

  /**
   * Create the user's DiscordOAuthGrant object in MongoDB.
   * @param {ObjectId} id The user's ID
   * @param {DiscordOAuthGrant} grant The `DiscordOAuthGrant` object received from Discord
   * @returns The user's `DiscordOAuth` object
   */
  public async createGrant(id: ObjectId, grant: DiscordOAuthGrant): Promise<DiscordOAuth> {
    try {
      const createGrant = await this.grants.create({
        _id: id,
        discordAccess: grant.access_token,
        discordRefresh: grant.refresh_token,
        expires: new Date(Date.now() + grant.expires_in * 1000),
        scope: grant.scope,
        tokenType: grant.token_type,
      });

      return createGrant;
    } catch (err) {
      throw new HttpException(500, 'Error creating Discord auth');
    }
  }

  /**
   * Upade the user's DiscordOAuthGrant object in MongoDB.
   * @param {ObjectId} id The user's ID
   * @param {any} update The update object
   * @returns {Promise<DiscordOAuth>} The user's updated `DiscordOAuth` object
   */
  public async updateGrant(id: ObjectId, update: any): Promise<DiscordOAuth> {
    try {
      const updateGrant = await this.grants.findByIdAndUpdate(id, { $set: update }, { returnDocument: 'after' });
      return updateGrant;
    } catch (err) {
      throw new HttpException(500, 'Error updating Discord auth');
    }
  }
}

export default DiscordService;
