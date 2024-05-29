import { IDiscount } from '../models/discount/IDiscount';
import RESTClient, { IArrayRestResponse, IListParams } from './RESTClient';

interface IConfig {
    baseURL: string
}

/**
 * Client to manage discounts
 *
 * @class DiscountClient
 */
class DiscountClient extends RESTClient {
    constructor(config: IConfig) {
        super({ baseURL: config.baseURL });
    }

    /**
    * list discount using params
    * @param params
    * @returns {Promise<IArrayRestResponse<IDiscount>> | error }
    * @memberof DiscountClient
    */
    async list(params: IListParams): Promise<IArrayRestResponse<IDiscount>> {
        const response = await this.axios.get('/discount', { params } );
        return response.data;
    }
    /**
     * list discount using context
     * @param context
     * @returns {Promise<IArrayRestResponse<IDiscount>> | error }   
     * @memberof DiscountClient
     */
    async listContext(params: Record<string, any>): Promise<IArrayRestResponse<IDiscount>> {
        
        const response = await this.axios.get('discount/context/q/', { params } );
        return response.data;
    }


    /**
    * list discounts most convenient using params
    * @param params
    * @returns {Promise<IDiscount> | error }
    * @memberof DiscountClient
    */
     async list_convenient(params: IListParams, value: string): Promise<IDiscount> {
        const response = await this.axios.get(`/discount/convenient/${value}`, { params } );
        return response.data;
    }
}

export default new DiscountClient({
    baseURL: process.env.REACT_APP_API_ENDPOINT!
});
