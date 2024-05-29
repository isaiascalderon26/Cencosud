import RESTClient, { IArrayRestResponse, IListParams } from './RESTClient';
// components
import { IReason } from '../pages/autopass-flow/components/cancel-modal';
// models
import ISubscription, { ICreateSubscription } from '../models/subscriptions/ISubscription';

interface IConfig {
  baseURL: string
}

/**
 * Client to manage subscriptions
 * 
 * @class SubscriptionClient
 */
class SubscriptionClient extends RESTClient {
  constructor(config: IConfig) {
    super({ baseURL: config.baseURL });
  }

  /**
   * Get subscription by id
   * @param id 
   * @returns {Promise<ISubscription>}
   * @memberof SubscriptionClient
   */
  async getById(id: string): Promise<ISubscription> {
    const response = await this.axios.get(`/subscriptions/${id}`);
    return response.data;
  }

  /**
   * List subscriptions using params
   * @param params List params
   * @returns {Promise<IArrayRestResponse<ISubscription>>}
   * @memberof SubscriptionClient
   */
  async list(params: IListParams): Promise<IArrayRestResponse<ISubscription>> {
    const response = await this.axios.get(`/subscriptions`, { params });
    return response.data;
  }

  /**
   * Create a new subscription
   * @param data 
   * @returns {Promise<ISubscription>}
   * @memberof SubscriptionClient
   */
  async create(data: ICreateSubscription): Promise<ISubscription> {
    const response = await this.axios.post('/subscriptions', data);
    return response.data;
  }

  /**
   * Pause a subscription
   * @param data 
   * @returns {Promise<ISubscription>}
   * @memberof SubscriptionClient
   */
  async pause(id: string): Promise<Partial<ISubscription>> {
    const response = await this.axios.post(`/subscriptions/${id}/pause`);
    return response.data;
  }

  /**
   * Reanude a subscription
   * @param data 
   * @returns {Promise<ISubscription>}
   * @memberof SubscriptionClient
   */
  async reanude(id: string): Promise<Partial<ISubscription>> {
    const response = await this.axios.post(`/subscriptions/${id}/reanude`);
    return response.data;
  }

  /**
   * Remove a subscription
   * @param data 
   * @param payload 
   * @returns {Promise<ISubscription>}
   * @memberof SubscriptionClient
   */
  async remove(id: string, payload: { remove_reason?: IReason }): Promise<Partial<ISubscription>> {
    const response = await this.axios.post(`/subscriptions/${id}/remove`, payload);
    return response.data;
  }

}

export default new SubscriptionClient({
  baseURL: process.env.REACT_APP_API_ENDPOINT!
});
