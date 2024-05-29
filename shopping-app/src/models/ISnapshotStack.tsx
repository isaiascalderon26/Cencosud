export enum SnapshotTypesEnum {
  'TASK_STATE_CHANGED',
  'GPS_LOCATION',
  'DEVICE_INFO',
  'SUBTASK_COMPLETED',
  'PRODUCT_PICKED',
  "NOTIFICATION_TOKEN"
}
export type SnapshotTypes = keyof typeof SnapshotTypesEnum;

export default interface ISnapshotStack {
  type: SnapshotTypes,
  executor: {
    id: string,
    name: string,
  },
  created_at: Date,
  data: any
}
