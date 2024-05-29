import RESTClient, { IArrayRestResponse, IListParams } from './RESTClient';
// models
import { IMovie } from '../models/store-data-models/IMovie';

interface IConfig {
  baseURL: string
}

/**
 * Client to manage widgets
 * 
 * @class MovieClient
 */
class MovieClient extends RESTClient {
  constructor(config: IConfig) {
    super({ baseURL: config.baseURL });
  }

  /**
   * List widgets using params
   * @param params List params
   * @returns {Promise<IArrayRestResponse<IMovie>>}
   * @memberof WidgetsClient
   */
  async list(params: IListParams): Promise<IArrayRestResponse<IMovie>> {
    const response = await this.axios.get(`/movies`, { params });
    
    return response.data;
}

}

export default new MovieClient({
  baseURL: process.env.REACT_APP_API_ENDPOINT!
});
