import RESTClient, { IArrayRestResponse, IListParams } from './RESTClient';
// models
import IPaymentIntention, { ICreatePaymentIntention } from '../models/payments/IPaymentIntention';
// lib
import IPaymentIntentionStatus from '../models/payments/IPaymentIntentionStatus';

interface IConfig {
  baseURL: string
}

/**
 * Client to manage payment intentions
 * 
 * @class PaymentIntentionClient
 */
class PaymentIntentionClient extends RESTClient {
  constructor(config: IConfig) {
    super({ baseURL: config.baseURL });
  }

  /**
   * Create a new payment intention
   * @param intention 
   * @returns {Promise<IPaymentIntention>}
   * @memberof PaymentIntentionClient
   */
  async create(intention: ICreatePaymentIntention): Promise<IPaymentIntention> {
    const response = await this.axios.post('/payment-intentions', intention);
    return response.data;
  }
  
  /**
   * Create a new payment intention
   * @param intentions
   * @returns {Promise<IPaymentIntention>}
   * @memberof PaymentIntentionClient
   */
  async bulkCreate(intentions: ICreatePaymentIntention[]): Promise<IPaymentIntention[]> {
    const response = await this.axios.post('/payment-intentions', intentions);
    return response.data;
  }



  /**
   * Get payment intention by id
   * @param id 
   * @returns {Promise<IPaymentIntention>}
   * @memberof PaymentIntentionClient
   */
  async getById(id: string): Promise<IPaymentIntention> {
    const response = await this.axios.get(`/payment-intentions/${id}`);
    return response.data;
  }

  /**
   * Get the payment intention status
   * @param id 
   * @returns {Promise<IPaymentIntentionStatus>}
   * @memberof PaymentIntentionClient
   */
  async getStatus(id: string): Promise<IPaymentIntentionStatus> {
    const response = await this.axios.get(`/payment-intentions/${id}/status`);
    return response.data;
  }

  /**
   * List payment intention using params
   * @param params List params
   * @returns {Promise<IArrayRestResponse<IPaymentIntention>>}
   * @memberof PaymentIntentionClient
   */
  async list(params: IListParams): Promise<IArrayRestResponse<IPaymentIntention>> {
    const response = await this.axios.get(`/payment-intentions`, { params });
    return response.data;
  }

}

export default new PaymentIntentionClient({
  baseURL: process.env.REACT_APP_API_ENDPOINT!
});
