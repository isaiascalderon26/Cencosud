import IChallenge from '../models/challenges/IChallenge';
import RESTClient, { IArrayRestResponse, IListParams } from './RESTClient';


interface IConfig {
  baseURL: string
}

/**
 * Client to manage player
 *
 * @class ChallengesClient
 */
class ChallengesClient extends RESTClient {
  constructor(config: IConfig) {
    super({ baseURL: config.baseURL });
  }

  /**
   * list all challenges
   * @param params
   * @returns {Promise<IArrayRestResponse<IChallenge>> | error }
   * @memberof ChallengesClient
   */
  async list(params: IListParams): Promise<IArrayRestResponse<IChallenge>> {
    try {
      const response = await this.axios.get('/challenges', { params });
      return response?.data;
    } catch (Error) {
      throw Error;
    }

  }

  /**
   * list challenges filter by player id
   * @returns {Promise<IChallenge[]>}
   * @memberof ChallengesClient
   * @param playerId
   * @param mall
   */
   async filter(playerId: string, mall?: string): Promise<IChallenge[]> {
    try {
      const params = {
        mall: mall
      }
      const response = await this.axios.get(`/challenges/filter/${playerId}`, {params});
      return response?.data;
    } catch (Error) {
      throw Error;
    }

  }

}

export default new ChallengesClient({
  baseURL: process.env.REACT_APP_API_ENDPOINT!
});
