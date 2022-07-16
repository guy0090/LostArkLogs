import { Request } from 'express';
import { User } from '@interfaces/users.interface';
import { DataStoredInToken } from '@/objects/auth.object';

export interface RequestWithUser extends Request {
  user: User;
  rt?: DataStoredInToken;
  at?: DataStoredInToken;
}
