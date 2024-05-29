import RESTClient, { IArrayRestResponse, IListParams } from './RESTClient';
// models
import { IPromotion, IPromotionMetaData } from '../models/promotions/IPromotion';

interface IConfig {
  baseURL: string
}

/**
 * Client to manage widgets
 * 
 * @class PromotionsClient
 */
class PromotionsClient extends RESTClient {
  constructor(config: IConfig) {
    super({ baseURL: config.baseURL });
  }

  /**
   * List widgets using params
   * @param params List params
   * @returns {Promise<IArrayRestResponse<IPromotion>>}
   * @memberof WidgetsClient
   */
  async list(params: IListParams): Promise<IArrayRestResponse<IPromotion>> {
    const response = await this.axios.get(`/promotions`, { params });
    
    return response.data;
  }

 /**
   * List widgets using params
   * @param params List params
   * @returns {Promise<IArrayRestResponse<IPromotionMetaData>>}
   * @memberof WidgetsClient
   */
 async listMetadata(params: IListParams): Promise<IArrayRestResponse<IPromotionMetaData>> {
  const response = await this.axios.get(`/promotions-metadata`, { params });
  
  return response.data;
}


}

export default new PromotionsClient({
  baseURL: process.env.REACT_APP_API_ENDPOINT!
});
