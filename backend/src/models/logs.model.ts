import { model, Document, Schema } from 'mongoose';

import { Log } from '@interfaces/logs.interface';

const logsSchema: Schema = new Schema({
  parent: {
    type: Schema.Types.ObjectId,
    required: false,
  },
  creator: {
    type: Schema.Types.ObjectId,
    required: true,
  },
  unlisted: {
    type: Boolean,
    required: true,
    default: true,
  },
  duration: {
    type: Number,
    required: true,
  },
  server: {
    type: String,
    required: false,
    default: 'Unknown',
  },
  region: {
    type: String,
    required: false,
    default: 'Unknown',
  },
  createdAt: {
    type: Number,
    required: false,
    default: +new Date(),
  },
  entities: {
    type: Array,
    required: true,
  },
  damageStatistics: {
    type: Object,
    required: true,
  },
});

const logsModel = model<Log & Document>('Logs', logsSchema);
export default logsModel;
