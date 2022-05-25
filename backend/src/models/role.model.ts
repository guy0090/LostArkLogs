import { model, Schema, Document } from 'mongoose';
import { Role } from '@interfaces/role.interface';

const roleSchema: Schema = new Schema({
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
  default: {
    type: Boolean,
    required: false,
    default: false,
  },
  builtIn: {
    type: Boolean,
    required: false,
    default: false,
  },
  inherits: {
    type: Array,
    required: false,
    default: [],
  },
  permissions: {
    type: Array,
    required: false,
    default: [],
  },
});

const roleModel = model<Role & Document>('Roles', roleSchema);

export default roleModel;
