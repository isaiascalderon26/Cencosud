import { ITaskMetadata } from "./metadatas/ITaskMetadata";

export interface ITask<T extends ITaskMetadata>{
  id: string;
  task_number: string,
  category: {
    name: string,
    id: string
  },
  type: string;
  country: string;
  state: 'PENDING' | 'COMPLETED';
  created_at: Date
  updated_at: Date
  meta_data: T;
}
