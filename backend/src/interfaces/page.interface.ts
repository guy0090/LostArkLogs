import { ObjectId } from 'mongoose';

export interface Page {
  _id: ObjectId;
  id: number;
  name: string;
  permissions: string[];
}
