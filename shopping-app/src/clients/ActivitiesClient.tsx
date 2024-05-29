import RESTClient, { IArrayRestResponse, IListParams } from './RESTClient';
// models
import { IActivity } from '../models/activities/IActivity';

interface IConfig {
  baseURL: string
}

/**
 * Client to manage widgets
 * 
 * @class ActivitiesClient
 */
class ActivitiesClient extends RESTClient {
  constructor(config: IConfig) {
    super({ baseURL: config.baseURL });
  }

  /**
   * List widgets using params
   * @param params List params
   * @returns {Promise<IArrayRestResponse<IActivity>>}
   * @memberof WidgetsClient
   */
  async list(params: IListParams): Promise<IArrayRestResponse<IActivity>> {
    const response = await this.axios.get(`/activities`, { params });
    
    return response.data;
}

}

export default new ActivitiesClient({
  baseURL: process.env.REACT_APP_API_ENDPOINT!
});
