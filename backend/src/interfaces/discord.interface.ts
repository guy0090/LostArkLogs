/**
 * @interface DiscordOAuth
 * @property {string} access_token - The access token.
 * @property {number} expires_in - The time in seconds until the token expires.
 * @property {string} refresh_token - The refresh token to be used to refresh the access token.
 * @property {string} scope - The scopes the token has been granted.
 * @property {string} token_type - The token type.
 */
export interface DiscordOAuthGrant {
  /**
   * @type {string}
   * @description The access token.
   */
  access_token: string;

  /**
   * @type {number}
   * @description The time in seconds until the token expires.
   * */
  expires_in: number;

  /**
   * @type {string}
   * @description The refresh token to be used to refresh the access token.
   * */
  refresh_token: string;

  /**
   * @type {string}
   * @description The scopes the token has been granted.
   * */
  scope: string;

  /**
   * @type {string}
   * @description The token type.
   * */
  token_type: string;
}

export interface DiscordOAuth {
  /**
   * @type {string}
   * @description The associated user's id
   */
  _id: string;

  /**
   * @type {string}
   * @description The access token.
   */
  discordAccess: string;

  /**
   * @type {Date}
   * @description The date the token expires.
   * */
  expires: Date;

  /**
   * @type {string}
   * @description The refresh token to be used to refresh the access token.
   * */
  discordRefresh: string;

  /**
   * @type {string}
   * @description The scopes the token has been granted.
   * */
  scope: string;

  /**
   * @type {string}
   * @description The token type.
   * */
  tokenType: string;
}

export interface DiscordUser {
  id: string;
  username: string;
  avatar: string;
  avatar_decoration?: any;
  discriminator: string;
  public_flags: number;
  flags: number;
  banner: string;
  banner_color: number;
  accent_color: number;
  locale: string;
  mfa_enabled: boolean;
  premium_type: number;
}
