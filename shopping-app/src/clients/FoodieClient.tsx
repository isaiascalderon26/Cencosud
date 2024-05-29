import RESTClient, { IArrayRestResponse, IListParams } from "./RESTClient";

/**
 * Models
 */
import ILocal, { ILocalSlot } from "../models/foodie/ILocal";
import IProduct from "../models/foodie/IProduct";
import { ISupportEmail } from "../models/foodie/ISupportEmail";
import { IFoodieCategory } from "../models/foodie/IFoodieCategory";

interface IConfig {
  baseURL: string;
}

class FoodieClient extends RESTClient {
  constructor(config: IConfig) {
    super({ baseURL: config.baseURL });
  }

  /**
   * List locals
   * @param params
   * @returns {Promise<IArrayRestResponse<ILocal>>}
   * @memberof FoodieClient
   */
  async listLocals(params: IListParams): Promise<IArrayRestResponse<ILocal>> {
    const response = await this.axios.get("/foodie/locals", { params });
    return response.data;
  }

  /**
   * Get local by id
   * @param params
   * @returns {Promise<ILocal>}
   * @memberof FoodieClient
   */
  async getLocalById(id: string): Promise<ILocal> {
    const response = await this.axios.get(`/foodie/locals/${id}`);
    return response.data;
  }

  /**
   * Get foodie categories
   * @returns {Promise<ILocal>}
   * @memberof FoodieClient
   */
  async getListOfCategories(): Promise<IFoodieCategory[]> {
    const response = await this.axios.get('/local-categories');
    return response.data;
  }

  /**
   * Get local slots by local id
   * @param id
   * @returns
   */
  async getLocalSlots(id: string): Promise<ILocalSlot[]> {
    const response = await this.axios.get(`/foodie/locals/${id}/slots`);
    return response.data;
  }

  /**
   * List products
   * @param params
   * @returns {Promise<IArrayRestResponse<IProduct>>}
   * @memberof FoodieClient
   */
  async listProducts(
    params: IListParams
  ): Promise<IArrayRestResponse<IProduct>> {
    const response = await this.axios.get("/foodie/products", { params });
    return response.data;
  }

  /**
   * List Whitelist
   * @returns {Promise<string[]>}
   * @memberof FoodieClient
   */
  async listWhitelist(): Promise<string[]> {
    const response = await this.axios.get("/foodie/whitelist");
    return response.data;
  }

  /**
   * Send support request
   */

  async sendSupportEmail(data: ISupportEmail): Promise<void> {
    const response = await this.axios.post("/foodie/request-support", data);
    return response.data;
  }

  async sendValidationCode(orderId: string, code: string): Promise<any> {
    const response = await this.axios.put(`/foodie/orders/${orderId}/deliver`, {
      delivery_code: code,
    });
    return response;
  }
}

export default new FoodieClient({
  baseURL: process.env.REACT_APP_API_ENDPOINT!,
});
