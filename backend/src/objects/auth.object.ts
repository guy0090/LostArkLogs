import { IsDefined, IsNumber, IsOptional, IsString, Length, Min } from 'class-validator';

/**
 * @class DataStoredInToken
 * @property {string} i - The user's id in the database.
 * @property {string} h - The hashed user ID.
 * @property {number} iat - The date when the token was issued (Unix epoch in seconds).
 * @property {number} exp - The date when the token will expire (Unix epoch in seconds).
 * @description Data stored in a JSON Web Token
 */
export class DataStoredInToken {
  /**
   * @description The user's id in the database.
   */
  @IsOptional()
  @IsString()
  @Length(24, 24)
  public i?: string;

  /**
   * @description The hashed user ID.
   */
  @IsOptional()
  @IsString()
  public h?: string;

  /**
   * @description The date when the token was issued (Unix epoch in seconds).
   * */
  @IsOptional()
  @IsNumber()
  @Min(0)
  public iat?: number;

  /**
   * @description The date when the token will expire (Unix epoch in seconds).
   * */
  @IsOptional()
  @IsNumber()
  @Min(0)
  public exp?: number;

  constructor(data: { i?: string; h?: string; iat?: number; exp?: number }) {
    this.i = data.i;
    this.h = data.h;
    this.iat = data.iat;
    this.exp = data.exp;
  }
}

/**
 * @class TokenData
 * @property {string} token - The JSON Web Token.
 * @property {string} expiresIn - The time in seconds until the token expires.
 * @description Interface to store JSON Web Token and its expiration time.
 * */
export class TokenData {
  /**
   * @description The JSON Web Token.
   */
  @IsDefined()
  @IsString()
  public token: string;

  /**
   * @description The time in seconds until the token expires.
   */
  @IsDefined()
  @IsNumber()
  public expiresIn: number;

  constructor(data: { token: string; expiresIn: number }) {
    this.token = data.token;
    this.expiresIn = data.expiresIn;
  }
}
