import { model, Document, Schema } from 'mongoose';

import { RawLog } from '@interfaces/logs.interface';

const rawLogsSchema: Schema = new Schema({
  creator: {
    type: Schema.Types.ObjectId,
    required: true,
  },
  unlisted: {
    type: Boolean,
    required: true,
    default: true,
  },
  // duration: {
  //   type: Number,
  //   required: true,
  // },
  createdAt: {
    type: Number,
    required: false,
    default: +new Date(),
  },
  logLines: {
    type: [String],
    required: true,
    default: [],
  },
});

const rawLogsModel = model<RawLog & Document>('RawLogs', rawLogsSchema);
export default rawLogsModel;
