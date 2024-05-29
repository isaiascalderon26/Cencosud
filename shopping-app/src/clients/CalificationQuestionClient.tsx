import RESTClient, { IArrayRestResponse, IListParams } from './RESTClient';
// models
import ICalificationQuestion from '../models/calification/ICalificationQuestion';

interface IConfig {
  baseURL: string
}

/**
 * Client to manage questios for calification
 * 
 * @class CalificationQuestionClient
 */
class CalificationQuestionClient extends RESTClient {
  constructor(config: IConfig) {
    super({ baseURL: config.baseURL });
  }

  /**
   * List calification questions using params
   * @param params List params
   * @returns {Promise<IArrayRestResponse<ICalificationQuestion>>}
   * @memberof CalificationQuestionClient
   */
  async list(params: IListParams): Promise<IArrayRestResponse<ICalificationQuestion>> {
    const response = await this.axios.get(`/calification-questions`, { params });
    return response.data;
  }

}

export default new CalificationQuestionClient({
  baseURL: process.env.REACT_APP_API_ENDPOINT!
});
