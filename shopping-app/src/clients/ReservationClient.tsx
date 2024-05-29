import RESTClient from './RESTClient';
import { getAuthFromCache } from './AuthenticationClient';


interface IConfig {
  baseURL: string
}


class ReservationClient extends RESTClient {
  constructor(config: IConfig) {
    super({ baseURL: config.baseURL });
  }

  return_url = `${process.env.REACT_APP_DEEP_LINK_URL}/card_added_callback`;

  async getContext(): Promise<any> {
    const auth = await getAuthFromCache();
    const jwt = auth.user;
    const response = await this.axios.get(`${process.env.REACT_APP_API_ENDPOINT}/reservation-contexts/sky-costanera`, {
      headers: {
        'Authorization': `${jwt.token_type.toLowerCase()} ${jwt.access_token}`
      }
    });
    return response.data;
  }

  async getSlogs(): Promise<any> {
    const auth = await getAuthFromCache();
    const jwt = auth.user;
    const response = await this.axios.get(`${process.env.REACT_APP_API_ENDPOINT}/reservation-contexts/sky-costanera/slots?days=30`, {
      headers: {
        'Authorization': `${jwt.token_type.toLowerCase()} ${jwt.access_token}`
      }
    });
    return response.data;
  }

}

export default new ReservationClient({
  baseURL: process.env.REACT_APP_API_ENDPOINT!
});
