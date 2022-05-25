import { User } from '@/interfaces/users.interface';

export class UserObject {
  public id: string;
  public username: string;
  public discriminator: number;
  public avatar: string;
  public registered: Date;
  public lastSeen: Date;

  constructor(user: User) {
    this.id = user.discordId;
    this.username = user.username;
    this.discriminator = user.discriminator;
    this.avatar = user.avatar;
    this.registered = user.registered;
    this.lastSeen = user.lastSeen ?? new Date();
  }
}
