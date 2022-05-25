import { Request } from 'express';
import { User } from '@interfaces/users.interface';

/**
 * @interface DataStoredInToken
 * @property {string} i - The user's id in the database.
 * @property {number} iat - The date when the token was issued (Unix epoch in seconds).
 * @property {number} exp - The date when the token will expire (Unix epoch in seconds).
 * @description Data stored in a JSON Web Token
 */
export interface DataStoredInToken {
  /**
   * @type {string}
   * @description The user's id in the database.
   */
  i?: string;

  /**
   * @type {string}
   * @description The hashed user ID.
   */
  h?: string;

  /**
   * @type {number}
   * @description The date when the token was issued (Unix epoch in seconds).
   * */
  iat?: number; // Issued at

  /**
   * @type {number}
   * @description The date when the token will expire (Unix epoch in seconds).
   * */
  exp?: number; // Expiration time
}

/**
 * @interface TokenData
 * @property {string} token - The JSON Web Token.
 * @property {string} expiresIn - The time in seconds until the token expires.
 * @description Interface to store JSON Web Token and its expiration time.
 * */
export interface TokenData {
  /**
   * @type {string}
   * @description The JSON Web Token.
   */
  token: string;

  /**
   * @type {number}
   * @description The time in seconds until the token expires.
   */
  expiresIn: number;
}

export interface RequestWithUser extends Request {
  user: User;
  rt?: DataStoredInToken;
  at?: DataStoredInToken;
}
