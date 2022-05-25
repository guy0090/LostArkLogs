export interface User {
  id: string;
  username: string;
  discriminator: number;
  avatar: string;
  registered: Date;
  lastSeen: Date;
}
