import WithBootedClient from '../lib/WithBootedClient';
import RESTClient from './RESTClient';

interface IConfig {
  baseURL: string
}

class LocationsClient extends RESTClient implements WithBootedClient {
  constructor(config: IConfig) {
    super({ baseURL: config.baseURL });
  }

  async boot() { }

  async getLocation(mall:string):Promise<any> {
    const response = await this.axios.get(`/locations/${mall}`);
    return response.data;
  }
}

export default new LocationsClient({
  baseURL: process.env.REACT_APP_API_ENDPOINT as string
});
