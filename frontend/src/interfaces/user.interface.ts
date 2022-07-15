export interface User {
  id: string;
  username: string;
  discriminator: number;
  avatar: string;
  registered: Date;
  lastSeen: Date;
  banned?: boolean;
  banReason?: string;
}

export interface UnverifiedUser {
  id: string;
  username: string;
  discordId: string;
  discriminator: number;
  avatar: string;
  registered: string;
  banned: boolean;
  banReason: string;
}

export interface BannedUser {
  id: string;
  discordId: string;
  username: string;
  discriminator: number;
  avatar: string;
  registered: string;
  banReason: string;
}
