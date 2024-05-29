import { AxiosResponse } from 'axios';
import IExchange from '../models/cencosud-points/IExchange';
import IInfoParner from '../models/cencosud-points/IInfoPartner';
import IPartner from '../models/cencosud-points/IPartner';
import RESTClient, { IArrayRestResponse, IListParams } from './RESTClient';

interface IConfig {
    baseURL: string
}

/**
 * Client to manage Cencosud Points 
 *
 * @class CencosudPointsClient
 */
class CencosudPointsClient extends RESTClient {
    constructor(config: IConfig) {
        super({ baseURL: config.baseURL });
    }

    /**
     * Get me info
     * @returns {Promise<AxiosResponse>}
     * @memberof CencosudPointsClient
     */
    async getMeInfo(): Promise<IInfoParner> {
        try {
            const response = await this.axios.get(`/cencosud-points/me/info`);
            return response.data;
        }
        catch (error) {
            throw error;
        }
    }

    /**
    * Create User in Cencosud Points
    * @returns {Promise<AxiosResponse>}
    * @memberof CencosudPointsClient
    */
    async create(partner: IPartner): Promise<AxiosResponse> {
        try {
            const response = await this.axios.post('/cencosud-points/register', partner);
            return response.data;
        }
        catch (error) {
            throw error;
        }
    }

    /**
     * link partner
     * @param void
     * @returns {Promise<void>}
     * @memberof CencosudPointsClient
     */
    async linkPartner(): Promise<void> {
        try {
            await this.axios.get(`/cencosud-points/me/linked`);
        }
        catch (error) {
            throw error;
        }
    }

    /**
     * Get terms and conditions
     * @returns {Promise<string>}
     * 
     */
     async getTermsAndConditions(): Promise<string[]> {
        try {
          const response = await this.axios.get(`/cencosud-points/terms-conditions`);
          return response?.data as string[];
        } catch (Error) {
          throw Error;
        }
      } 

    /**
     * List exchanged
     * @param params
    *  @returns {Promise<IArrayRestResponse<IExchange>> | error }
    *  @memberof CencosudPointsClient
    */
    async listExchanged(params: IListParams): Promise<IArrayRestResponse<IExchange>> {
        try {
            const response = await this.axios.get(`/cencosud-points/exchanged`, { params });
            return response.data;
        } catch (error) {
            throw error;
        }
    }


    /**
     * List exchanged
     * @param params
    *  @returns {Promise<IArrayRestResponse<IExchange>> | error }
    *  @memberof CencosudPointsClient
    */
        async exchange(params: IListParams): Promise<IArrayRestResponse<IExchange>> {
        try {
            const response = await this.axios.get(`/exchange`, { params });
            return response.data;
        } catch (error) {
            throw error;
        }
    }
    
}

export default new CencosudPointsClient({
    baseURL: process.env.REACT_APP_API_ENDPOINT!
});
