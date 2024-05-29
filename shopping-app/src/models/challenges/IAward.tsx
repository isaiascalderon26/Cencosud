export interface IDescription {
  title: string;
  description: string;
}
export default interface IAward {
  id: string;
  title: string;
  description: Array<IDescription>;
  points_from: number;
  points_to: number;
  created_at?: Date;
  updated_at?: Date;
}
