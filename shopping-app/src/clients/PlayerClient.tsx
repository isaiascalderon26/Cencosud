import IPlayer from '../models/challenges/IPlayer';
import IReward from '../models/challenges/IReward';
import RESTClient, { IArrayRestResponse, IListParams } from './RESTClient';


interface IConfig {
  baseURL: string
}

/**
 * Client to manage player
 *
 * @class PlayerClient
 */
class PlayerClient extends RESTClient {
  constructor(config: IConfig) {
    super({ baseURL: config.baseURL });
  }

  /**
 * Create a new player
 * @param player
 * @returns {Promise<IPlayer>}
 * @memberof PlayerClient
 */

  async create(player: IPlayer): Promise<IPlayer> {
    const response = await this.axios.post('/players', player);
    return response.data;
  }

  /**
   * Get player by id
   * @param id
   * @returns {Promise<IPlayer>}
   * @memberof playerClient
   */
  async getById(id: string): Promise<IPlayer> {
    const response = await this.axios.get(`/players/${id}`);
    return response.data;
  }

  /**
   * Get player ranking position by id
   * @param id
   * @returns {Promise<number>}
   * @memberof playerClient
   */
   async getRankingPositionById(id: string): Promise<number> {
    const response = await this.axios.get(`/players/ranking-position/${id}`);
    return response.data;
  }

  /**
   * complete challenge
   * @param playerId
   * @param challengeId
   * @returns {Promise<void> | error }
   * @memberof PlayerClient
   */
  async complete(playerId: string, challengeId: string): Promise<{ player: IPlayer; reward: IReward }> {
    const response = await this.axios.post(`/players/${playerId}/challenges/${challengeId}/complete`);
    return response.data;
  }


  /**
   * rewards
   * @param playerId
   * @returns {Promise<IArrayRestResponse<IReward>> | error }
   * @memberof PlayerClient
   */
  async rewards(playerId: string): Promise<IArrayRestResponse<IReward>> {
    const response = await this.axios.get(`/players/${playerId}/rewards`);
    return response.data;
  }

  /**
   * list all players
   * @param params
   * @returns {Promise<IArrayRestResponse<IPlayer>> | error }
   * @memberof PlayerClient
   */
  async list(params: IListParams): Promise<IArrayRestResponse<IPlayer>> {
    const response = await this.axios.get('/players', { params });
    return response.data;
  }
}



export default new PlayerClient({
  baseURL: process.env.REACT_APP_API_ENDPOINT!
});
