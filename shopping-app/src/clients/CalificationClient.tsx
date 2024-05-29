import RESTClient, { IArrayRestResponse, IListParams } from './RESTClient';
// models
import ICalification, { ICalificationUnsaved } from '../models/calification/ICalification';


interface IConfig {
  baseURL: string
}

/**
 * Client to manage user califications
 * 
 * @class CalificationClient
 */
class CalificationClient extends RESTClient {
  constructor(config: IConfig) {
    super({ baseURL: config.baseURL });
  }

  /**
   * Create a new user calification
   * @param ICalificationUnsaved 
   * @returns {Promise<ICalification>}
   * @memberof CalificationClient
   */
  async create(calification: ICalificationUnsaved): Promise<ICalification> {
    const response = await this.axios.post('/califications', calification);
    return response.data;
  }

  /**
   * Create a bulk new user califications
   * @param ICalificationUnsaved[] 
   * @returns {Promise<IArrayRestResponse<ICalification>>}
   * @memberof CalificationClient
   */
  async bulkCreate(califications: ICalificationUnsaved[]): Promise<IArrayRestResponse<ICalification>> {
    const response = await this.axios.post('/califications', califications);
    return response.data;
  }

  /**
   * List califications using params
   * @param params List params
   * @returns {Promise<IArrayRestResponse<ICalification>>}
   * @memberof CalificationClient
   */
   async list(params: IListParams): Promise<IArrayRestResponse<ICalification>> {
    const response = await this.axios.get(`/califications`, { params });
    return response.data;
  }

}

export default new CalificationClient({
  baseURL: process.env.REACT_APP_API_ENDPOINT!
});
