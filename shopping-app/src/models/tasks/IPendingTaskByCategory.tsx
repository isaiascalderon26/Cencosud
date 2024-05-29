import { ICategory } from "./ICategory";

export interface IPendingTaskByCategory {
  category: ICategory,
  type: string,
  pendings: number
}