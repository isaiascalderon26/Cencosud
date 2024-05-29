import WithBootedClient from '../lib/WithBootedClient';
import RESTClient from './RESTClient';
import UserClient from './UserClient';

interface IConfig {
  baseURL: string
}

class LoyaltyClient extends RESTClient implements WithBootedClient {
  constructor(config: IConfig) {
    super({ baseURL: config.baseURL });
  }

  async boot() { }

  async getLoyalty() : Promise<any>{
    const myLoyalty = await this.axios.get('loyalty/me/info');
    return myLoyalty;
  }
  
}

export default new LoyaltyClient({
  baseURL: process.env.REACT_APP_API_ENDPOINT!
});
