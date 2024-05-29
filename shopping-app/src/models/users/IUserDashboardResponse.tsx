import { IArrayRestResponse } from "../../clients/RESTClient";
import { ILink } from "../ILink";

import { IPendingTaskByCategory } from "../tasks/IPendingTaskByCategory";

export interface IUserDashboardResponse {
  statistics: {
    totals: number,
    pendings: number
  },
  links: Array<ILink>
  tasks: IArrayRestResponse<IPendingTaskByCategory>
}