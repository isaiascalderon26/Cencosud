import ICoupon from '../models/coupons/ICoupon';
import { IDiscount } from '../models/discount/IDiscount';
import RESTClient, { IArrayRestResponse, IListParams } from './RESTClient';

interface IConfig {
    baseURL: string
}

/**
 * Client to manage coupons
 *
 * @class CouponClient
 */
class CouponClient extends RESTClient {
    constructor(config: IConfig) {
        super({ baseURL: config.baseURL });
    }

    /**
     * Get player by code
     * @param id
     * @returns {Promise<ICoupon>}
     * @memberof CouponClient
     */
    
    async getByCode(code: string): Promise<ICoupon> {
        const response = await this.axios.get(`/coupon/code/${code}`);
        return response.data;
    }

    /**
    * Activate Coupon
    * @param code
    * @returns {Promise<IDiscount>}
    */

    async activate(code: string): Promise<IDiscount> {
        const response = await this.axios.get(`/coupon/code/${code}/activate`);
        return response.data;
    }

    /**
    * list coupons using params
    * @param params
    * @returns {Promise<IArrayRestResponse<ICoupon>> | error }
    * @memberof CouponClient
    */
    async list(params: IListParams): Promise<IArrayRestResponse<ICoupon>> {
        const response = await this.axios.get('/coupon', { params });
        return response.data;
    }
}

export default new CouponClient({
    baseURL: process.env.REACT_APP_API_ENDPOINT!
});
