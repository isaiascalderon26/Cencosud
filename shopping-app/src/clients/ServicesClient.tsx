import RESTClient, { IArrayRestResponse, IListParams } from './RESTClient';
// models
import { IService } from '../models/services/IService';

interface IConfig {
  baseURL: string
}

/**
 * Client to manage widgets
 * 
 * @class ServicesClient
 */
class ServicesClient extends RESTClient {
  constructor(config: IConfig) {
    super({ baseURL: config.baseURL });
  }

  /**
   * List widgets using params
   * @param params List params
   * @returns {Promise<IArrayRestResponse<IService>>}
   * @memberof WidgetsClient
   */
  async list(params: IListParams): Promise<IArrayRestResponse<IService>> {
    const response = await this.axios.get(`/services`, { params });
    
    return response.data;
  }

}

export default new ServicesClient({
  baseURL: process.env.REACT_APP_API_ENDPOINT!
});
