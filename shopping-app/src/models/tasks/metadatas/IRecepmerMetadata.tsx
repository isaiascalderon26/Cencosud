import { ITaskMetadata } from "./ITaskMetadata";

export interface IRecepmerMetadata extends ITaskMetadata{
  reception_code: string
  business_unit: string;
  country: string;
  product: {
    section_code: string,
    code: string,
    quantity: number,
    measure_unit: string,
    short_description: string,
    flags: {
      zero_stock: boolean,
      catalog: boolean,
      campaign: boolean,
      promotion: boolean
    }
  }
}