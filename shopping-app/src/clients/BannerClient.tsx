import WithBootedClient from '../lib/WithBootedClient';
import RESTClient from './RESTClient';

interface IConfig {
  baseURL: string
}
export interface IBanner {
  id: string;
  flag: boolean;
  image: string;
  url: string;
  title: string;
};

export interface IMallBanners {
  id: string;
  name: string;
  banners: IBanner[];
}

class BannerClient extends RESTClient implements WithBootedClient {
  constructor(config: IConfig) {
    super({ baseURL: config.baseURL });
  }

  async boot() { }

  async get():Promise<IBanner> {
    const response = await this.axios.get('/banner');
    return response.data;
  }

  async getBannersHome():Promise<IBanner> {
    const response = await this.axios.get('/banner/home');
    return response.data;
  }
}

export default new BannerClient({
  baseURL: process.env.REACT_APP_API_ENDPOINT as string
});
