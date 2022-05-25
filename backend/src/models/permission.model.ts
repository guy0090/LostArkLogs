import { model, Schema, Document } from 'mongoose';
import { Permissions } from '@interfaces/permission.interface';

const permissionSchema: Schema = new Schema({
  _id: {
    type: Schema.Types.ObjectId,
    required: true,
  },
  roles: {
    type: [Number],
    default: [0],
  },
  permissions: {
    type: [String],
    default: [],
  },
});

const permissionModel = model<Permissions & Document>('Permissions', permissionSchema);

export default permissionModel;
