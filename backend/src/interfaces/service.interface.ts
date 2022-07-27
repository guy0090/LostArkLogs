/**
 * @interface Service
 * @property {number} _id The document id
 * @property {number} defaultRole - The default role for new users
 * @property {boolean} allowUploads - If uploads are allowed
 * @property {boolean} locked - If the service is locked aka maintenance mode or similar
 * @property {number[]} supportedBosses - The list of IDs of bosses that are supported
 * @description Interface for the service configuration
 */
export interface Service {
  _id: number;
  defaultRole: number;
  allowUploads: boolean;
  locked: boolean;
  supportedBosses: number[];
}
