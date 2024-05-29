import RESTClient from './RESTClient';
import ICard from '../models/cards/ICard';
import { getAuthFromCache } from './AuthenticationClient';

interface IConfig {
  baseURL: string
}

class CardClient extends RESTClient {
  return_url = `${process.env.REACT_APP_DEEP_LINK_URL}/card_added_callback`;

  constructor(config: IConfig) {
    super({ baseURL: config.baseURL });
  }


  async register(): Promise<any> {
    try {
      console.log(this.return_url);
      const auth = await getAuthFromCache();
      const jwt = auth.user;
      /*const response = await this.axios.get(`/wallet/cards?return_url=${this.return_url}&provider=janus`, {
        headers: {
          'Authorization': `${jwt.token_type.toLowerCase()} ${jwt.access_token}`
        }
      });*/
      const response = await this.axios.post('/wallet/cards', { return_url: this.return_url }, {
        headers: {
          'Authorization': `${jwt.token_type.toLowerCase()} ${jwt.access_token}`
        }
      });

      return response.data.links;
    } catch (Error) {
      console.log(Error);
    }
  }

  async getList(): Promise<ICard[]> {
    const auth = await getAuthFromCache();
    const jwt = auth.user;
    const response = await this.axios.get(`${process.env.REACT_APP_API_ENDPOINT}/wallet/cards?return_url=${this.return_url}&provider=janus`, {
      headers: {
        'Authorization': `${jwt.token_type.toLowerCase()} ${jwt.access_token}`
      }
    });
    return response.data.data;
  }

  async setDefault(idCard: string): Promise<any> {

    if(!idCard || idCard === '') {
      return;
    }

    const auth = await getAuthFromCache();
    const jwt = auth.user;
    const response = await this.axios.put(`${process.env.REACT_APP_API_ENDPOINT}/wallet/cards/${idCard}/default`, {
      headers: {
        'Authorization': `${jwt.token_type.toLowerCase()} ${jwt.access_token}`
      }
    });
    return response.data.data;
  }

  async removeCard(provider:string, id:string): Promise<any> {
    const response = await this.axios.delete(`wallet/cards/${provider}/${id}`);
    return response
  }
}

export default new CardClient({
  baseURL: process.env.REACT_APP_API_ENDPOINT!
});
