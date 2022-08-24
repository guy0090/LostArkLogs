import { model, Document, Schema } from 'mongoose';

import { Service } from '@/interfaces/service.interface';
import { bosses } from '@/config/supported-bosses';
import { zones } from '@/config/zones';

const serviceSchema: Schema = new Schema({
  _id: {
    type: Number,
    required: true,
    default: 0,
  },
  defaultRole: {
    type: Number,
    required: true,
    default: 1,
  },
  allowUploads: {
    type: Boolean,
    required: true,
    default: true,
  },
  locked: {
    type: Boolean,
    required: true,
    default: false,
  },
  supportedBosses: {
    type: [Number],
    required: true,
    default: bosses,
  },
  zones: {
    type: [Object],
    required: true,
    default: zones,
  },
});

const serviceModel = model<Service & Document>('Service', serviceSchema);
export default serviceModel;
