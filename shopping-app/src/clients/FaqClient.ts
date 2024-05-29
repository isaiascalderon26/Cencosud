import WithBootedClient from '../lib/WithBootedClient';
import RESTClient from './RESTClient';

interface IConfig {
  baseURL: string
}

class FaqClient extends RESTClient implements WithBootedClient {
  constructor(config: IConfig) {
    super({ baseURL: config.baseURL });
  }

  async boot() { }

  async getFaq():Promise<any> {
    const response = await this.axios.get('/faq');
    console.log(response.data)
    return response.data;
  }
}

export default new FaqClient({
  baseURL: process.env.REACT_APP_API_ENDPOINT as string
});
