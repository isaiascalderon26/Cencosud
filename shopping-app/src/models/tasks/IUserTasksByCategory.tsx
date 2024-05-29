import { IArrayRestResponse } from "../../clients/RESTClient";
import { ICategory } from "./ICategory";
import { ITask } from "./ITask";
import { ITaskMetadata } from "./metadatas/ITaskMetadata";

export interface IUserTasksByCategory<T extends ITaskMetadata> {
  category: ICategory,
  items: IArrayRestResponse<ITask<T>>
}