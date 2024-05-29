import IProduct from "./IProduct";
import ICategory from "./ICategory";

export default interface ISection {
    category: ICategory;
    products: IProduct[];
  }