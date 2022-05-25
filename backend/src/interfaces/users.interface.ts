import { ObjectId } from 'mongoose';

/**
 * @interface User
 * @property {ObjectId} _id - User's ID
 * @property {string} salt - User's salt string for credential hashing
 * @property {string} discordId - User's Discord ID
 * @property {boolean} banned - If the user is banned
 * @property {string} banReason - Reason for the ban (if banned)
 * @property {Date} registered - Date the user was registered
 * @property {Date} lastSeen - User's last seen date
 * @property {string} username - User's Discord username
 * @property {string} discriminator - User's Discord discriminator
 * @property {string} avatar - User's Discord avatar hash
 * @description Interface for an app user
 */
export interface User {
  _id?: ObjectId;
  salt: string;
  uploadKey: string;
  discordId: string;
  banned?: boolean;
  banReason?: string;
  registered?: Date;
  lastSeen?: Date;
  username: string;
  discriminator: number;
  avatar: string;
}
