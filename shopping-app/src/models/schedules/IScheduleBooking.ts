import { ISlot } from './ISlot';
import { IMall } from './ISchedulesContext';

export interface IScheduleBooking {
  id?: string;
  slot: ISlot;
  mall: IMall;
  state?: 'active' | 'cancelled' | 'rescheduled';
  user_id: string;
  email: string;
  name: string;
  created_at?: Date;
  updated_at?: Date;
  type?: 'inscription' | 'schedule';
}
