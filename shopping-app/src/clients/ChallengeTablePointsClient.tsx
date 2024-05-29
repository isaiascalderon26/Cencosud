import IChallengeTablePoints from '../models/challenges/IChallengeTablePoints';
import RESTClient, { IArrayRestResponse, IListParams } from './RESTClient';

interface IConfig {
    baseURL: string
}

/**
 * Client to manage challenge table points 
 *
 * @class ChallengeTablePointsClient
 */
class ChallengeTablePointsClient extends RESTClient {
    constructor(config: IConfig) {
        super({ baseURL: config.baseURL });
    }

    /**
     * Get info by quantity of points
     * @param points
     * @returns {Promise<IChallengeTablePoints>}
     * @memberof ChallengeTablePointsClient
     */
    
    async getByPoints(points: string): Promise<IChallengeTablePoints> {
        const response = await this.axios.get(`/challenge-table-points/points/${points}`);
        return response.data;
    }

    /**
    * list info using params
    * @param params
    * @returns {Promise<IArrayRestResponse<IChallengeTablePoints>> | error }
    * @memberof ChallengeTablePointsClient
    */
    async list(params: IListParams): Promise<IArrayRestResponse<IChallengeTablePoints>> {
        const response = await this.axios.get('/challenge-table-points', { params });
        return response.data;
    }
}

export default new ChallengeTablePointsClient({
    baseURL: process.env.REACT_APP_API_ENDPOINT!
});
