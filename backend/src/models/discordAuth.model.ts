import { model, Schema, Document } from 'mongoose';
import { DiscordOAuth } from '@interfaces/discord.interface';

const discordAuthSchema: Schema = new Schema({
  _id: {
    type: Schema.Types.ObjectId,
    required: true,
    unique: true,
  },
  discordAccess: {
    type: String,
    required: true,
    unique: true,
  },
  discordRefresh: {
    type: String,
    required: true,
    unique: true,
  },
  expires: {
    type: Date,
    required: true,
  },
  scope: {
    type: String,
    required: true,
  },
  tokenType: {
    type: String,
    required: true,
  },
});

const discordAuthModel = model<DiscordOAuth & Document>('DiscordOAuth', discordAuthSchema);

export default discordAuthModel;
