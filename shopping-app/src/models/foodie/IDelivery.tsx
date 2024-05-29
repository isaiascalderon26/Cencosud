export interface IScheduleInfo {
  type: 'ASAP' | 'SCHEDULED';
  date: Date;
  delivery_date?: Date;
}

export default interface IDelivery {
  type: string;
  schedule_info: IScheduleInfo;
}
