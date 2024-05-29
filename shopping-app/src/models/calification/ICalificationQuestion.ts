import { ICalificationFlow } from "./ICalificationFlow";

export default interface ICalificationQuestion {
  id: string;
  flow: ICalificationFlow
  question: string;
  enabled: boolean;
  priority: number;
  max: number;
  created_at: Date;
  updated_at: Date;
  availability: number; // days that the question is going to be alive for a single payment 
}
