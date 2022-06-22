import { User } from '@/interfaces/users.interface';
import mongoose from 'mongoose';

export class UserObject {
  public id: mongoose.Types.ObjectId;
  public discordId: string;
  public username: string;
  public discriminator: number;
  public avatar: string;
  public registered: Date;

  constructor(user: User) {
    this.id = user._id;
    this.discordId = user.discordId;
    this.username = user.username;
    this.discriminator = user.discriminator;
    this.avatar = user.avatar;
    this.registered = user.registered;
  }
}
