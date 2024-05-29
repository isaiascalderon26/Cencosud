import { ISite } from "../store-data-models/ISite";
import { ICalificationFlow } from "./ICalificationFlow";

export interface ICalificator {
  id: string;
  name: string;
  email: string;
}

export interface IQuestion {
  id: string;
  question: string;
  flow: ICalificationFlow;
  max: number;
  availability: number; // days that the question is going to be alive for a single payment 
}

export interface ICalificationUnsaved extends Omit<ICalification, "id" | "created_at" | "updated_at"> { }

export default interface ICalification {
  id: string;
  calification_question: IQuestion;
  calificator: ICalificator;
  payment_intention_id: string;
  comment?: string;
  calification: number;
  created_at: Date;
  updated_at: Date;
  metadata?: Record<string, unknown>;
  mall_info?: ISite
}
