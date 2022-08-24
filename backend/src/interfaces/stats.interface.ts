import mongoose from 'mongoose';
import { LogEntity } from './logs.interface';

export interface ClassDistribution {
  _id: number;
  count: number;
}

export interface ClassDpsRanking {
  _id: mongoose.Types.ObjectId;
  region: 'Unknown' | 'korea' | 'steam';
  entity: LogEntity;
  dps: number;
}
