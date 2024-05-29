import WithBootedClient from '../lib/WithBootedClient';
import { IEmail } from '../models/email/IEmail';
import RESTClient, { IArrayRestResponse } from './RESTClient';

interface IConfig {
  baseURL: string
}

class EmailClient extends RESTClient implements WithBootedClient {
  constructor(config: IConfig) {
    super({ baseURL: config.baseURL });
  }

  async boot() { }
  

  async create(data: IEmail): Promise<void> {
    const response = await this.axios.post('/email', data);
    return response.data;
  }

}

export default new EmailClient({
  baseURL: process.env.REACT_APP_API_ENDPOINT!
});
