import { ILink } from '../ILink';

interface IMall {
  id: string;
  name: string;
}
export interface IUser {
  full_name: string;
  IMEI: string;
  device_token: string;
  primarysid: string;
  email: string;
  links?: Array<ILink>;
  interests?: Array<string>;
  avatar?: string;
  document_number?: string;
  phone?: string;
  birthday?: Date;
  vehicles?: Array<any>;
  currentParking?: Array<any>;
  parkingHistory?: Array<any>;
  meta_data?: Record<string, any>;
  permissions?: Record<string, unknown>;
  mall_selected?: IMall;
}
