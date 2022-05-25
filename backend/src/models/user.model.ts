import { model, Schema, Document } from 'mongoose';
import { User } from '@interfaces/users.interface';

const userSchema: Schema = new Schema({
  salt: {
    type: String,
    required: true,
    unique: true,
  },
  uploadKey: {
    type: String,
    required: true,
    unique: true,
  },
  discordId: {
    type: String,
    required: true,
    unique: true,
  },
  banned: {
    type: Boolean,
    default: false,
  },
  banReason: {
    type: String,
    default: '',
  },
  registered: {
    type: Date,
    default: new Date(),
  },
  lastSeen: {
    type: Date,
    default: new Date(),
  },
  username: {
    type: String,
    default: '',
  },
  discriminator: {
    type: Number,
    default: 0,
  },
  avatar: {
    type: String,
    default: '',
  },
});

const userModel = model<User & Document>('User', userSchema);

export default userModel;
