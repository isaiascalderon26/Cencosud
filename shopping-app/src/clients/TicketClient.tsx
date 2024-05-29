import RESTClient from './RESTClient';
// models
import ITicketQuote from '../models/tickets/ITicketQuote';

interface IConfig {
  baseURL: string
}

/**
 * Client to manage tickets
 * 
 * @class TicketClient
 */
class TicketClient extends RESTClient {
  constructor(config: IConfig) {
    super({ baseURL: config.baseURL });
  }

  /**
   * Create ticket quote
   * @param id Ticket id 
   * @returns {Promise<ITicketQuote>}
   * @memberof TicketClient
   */
  async quote(id: string): Promise<ITicketQuote> {
    const response = await this.axios.post(`/tickets/${id}/quote`);
    return response.data;
  }

}

export default new TicketClient({
  baseURL: process.env.REACT_APP_API_ENDPOINT!
});
