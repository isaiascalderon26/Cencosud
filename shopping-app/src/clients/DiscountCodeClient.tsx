import RESTClient, { IArrayRestResponse, IListParams } from './RESTClient';
// models
import IDiscountCode from '../models/discount-codes/IDiscountCode';

interface IConfig {
  baseURL: string
}

export interface IAssignUser {
  id: string;
  email?: string;
  full_name?: string;
  document_number?: string;
}

export interface IAssign {
  user: IAssignUser;
  banner: string;
}

/**
 * Client to manage discount codes
 * 
 * @class DiscountCodeClient
 */
class DiscountCodeClient extends RESTClient {
  constructor(config: IConfig) {
    super({ baseURL: config.baseURL });
  }

  /**
   * List discount codes using params
   * @param params List params
   * @returns {Promise<IArrayRestResponse<IDiscountCode>>}
   * @memberof DiscountCodeClient
   */
  async list(params: IListParams): Promise<IArrayRestResponse<IDiscountCode>> {
    const response = await this.axios.get(`/discount-codes`, { params });
    console.log("response", response.data);
    return response.data;
  }

  /**
   * Assign a discount code to a user if available
   * @param data Assign request data
   * @returns {Promise<IDiscountCode | undefined>}
   * @memberof DiscountCodeClient
   */
  async asssign(data: IAssign): Promise<IDiscountCode | undefined> {
    const response = await this.axios.post(`/discount-codes/assign`, data);
    return response.data;
  }

}

export default new DiscountCodeClient({
  baseURL: process.env.REACT_APP_API_ENDPOINT!
});
