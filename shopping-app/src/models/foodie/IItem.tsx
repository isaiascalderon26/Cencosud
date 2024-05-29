import IProduct from "./IProduct";
import IModifier from "./IModifier";

export function isIItem(object: any): object is IItem {
  return 'selected_modifiers' in object && 'quantity' in object;
}

export default interface IItem extends IProduct {
  product_id: string;
  quantity: number;
  comment?: string;
  selected_modifiers: IModifier[];
}