import { model, Schema, Document } from 'mongoose';
import { Page } from '@interfaces/page.interface';

const pageSchema: Schema = new Schema({
  _id: {
    type: Number,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
    unique: true,
  },
  permissions: {
    type: [String],
    default: [],
  },
});

const pageModel = model<Page & Document>('Pages', pageSchema);

export default pageModel;
