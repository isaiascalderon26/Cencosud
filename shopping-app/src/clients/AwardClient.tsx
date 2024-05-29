import IAward from '../models/challenges/IAward';
import IAwardExchangeInformation from '../models/challenges/IAwardExchangeInformation';
import IReward from '../models/challenges/IReward';
import RESTClient, { IArrayRestResponse, IListParams } from './RESTClient';


interface IConfig {
  baseURL: string
}

/**
 * Client to manage award
 *
 * @class AwardClient
 */
class AwardClient extends RESTClient {
  constructor(config: IConfig) {
    super({ baseURL: config.baseURL });
  }


  /**
   * Get award by id
   * @param id
   * @returns {Promise<IAward>}
   * @memberof awardClient
   */
  async getById(id: string): Promise<IAward> {
    const response = await this.axios.get(`/awards/${id}`);
    return response.data;
  }

  /**
   * list all awards
   * @param params
   * @param mall
   * @returns {Promise<IArrayRestResponse<IAward>> | error }
   * @memberof AwardClient
   */
  async list(params: IListParams, mall?: string): Promise<IArrayRestResponse<IAward>> {
    try {
      const params = {
        mall: mall
      }
      const response = await this.axios.get('/awards', { params });
      return response?.data;
    } catch (Error) {
      throw Error;
    }

  }

  /**
   * Get information about exchange award
   * @returns {Promise<IAwardExchangeInformation>}
   * @memberof AwardClient
   **/
  async getAwardsExchangeInformation(): Promise<IAwardExchangeInformation> {
    const response = await this.axios.get('/award-exchange-info');
    return response.data;
  }
}



export default new AwardClient({
  baseURL: process.env.REACT_APP_API_ENDPOINT!
});
