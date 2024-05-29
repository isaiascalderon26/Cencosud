import ICategory from "./ICategory";
import IModifierCategory from "./IModifierCategory";

export default interface IProduct {
  id: string;
  provider_id: string;
  local_id: string;
  category: ICategory;
  name: string;
  description?: string;
  images?: string[];
  price: number;
  discountPercentage?: number;
  reference_price?: number;
  is_modifier: boolean;
  modifiers: IModifierCategory[];
  created_at: string;
  updated_at: string;
  enable?: boolean;
}

export const resolveImage = (images?: string[]): string | undefined => {
  if (!images || !images.length) {
      return undefined;
  }

  return images[0];
}
