import IChallenge from '../models/challenges/IChallenge';
import RESTClient, { IListParams } from './RESTClient';


interface IConfig {
  baseURL: string
}

/**
 * Client to manage rewards
 *
 * @class RewardClient
 */
class RewardClient extends RESTClient {
  constructor(config: IConfig) {
    super({ baseURL: config.baseURL });
  }

  /**
   * list rewards by challenge completed
   * @param playerId
   * @returns {Promise<IChallenge>}
   * @memberof PlayerClient
   */
  async rewardsComplete(params: IListParams): Promise<IChallenge[]> {
    const response = await this.axios.get('/rewards/completes/', { params });
    return response.data;
  }

}

export default new RewardClient({
  baseURL: process.env.REACT_APP_API_ENDPOINT!
});
