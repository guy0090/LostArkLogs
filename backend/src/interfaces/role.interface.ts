export interface Role {
  _id: number;
  name: string;
  default?: boolean;
  builtIn?: boolean;
  inherits?: number[];
  permissions?: string[];
}
