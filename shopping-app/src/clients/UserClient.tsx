import WithBootedClient from '../lib/WithBootedClient';
import RESTClient, { IArrayRestResponse } from './RESTClient';
import IJwt from '../models/IJwt';
import axios, { AxiosResponse } from "axios";
import { IUser } from '../models/users/IUser';
import { IUserDashboardResponse } from '../models/users/IUserDashboardResponse';
import { INotification } from '../models/notifications/INotification';

//const eureka = EurekaConsole({ label: "user-client" });

interface IConfig {
  baseURL: string
}

class UserClient extends RESTClient implements WithBootedClient {
  constructor(config: IConfig) {
    super({ baseURL: config.baseURL });
  }

  async boot() { }

  async meWithJwt(jwt: IJwt): Promise<IUser> {
    const response = await axios.get(`${this.baseUrl}/users/me/info`, {
      headers: {
        "Authorization": `${jwt.token_type.toLowerCase()} ${jwt.access_token}`
      }
    })

    if (response.status !== 200) {
      throw {
        data: response.data,
        response: { status: response.status }
      };
    }
    return response.data;
  }

  async register(data: IUser, jwt: IJwt): Promise<IUser> {
    const response = await axios.post(`${this.baseUrl}/users`, data, {
      headers: {
        "Authorization": `${jwt.token_type.toLowerCase()} ${jwt.access_token}`
      }
    })
    return response.data;
  }

  update = async (key: string, value: any): Promise<any> => {
    const data: any = {}
    data[key] = value
    const response = await this.axios.patch(`/users/me`, data)
    return response.data;
  }

  async updatePartial(data: Partial<IUser>): Promise<AxiosResponse> {
    console.log(data);
    
    const response = await this.axios.patch('/users/me', data);
    return response.data;
  }

  async updateNotificationTokenWithJwt(device_token: string, jwt: IJwt): Promise<void> {
    console.debug(jwt)
    const response = await axios.patch(`${process.env.REACT_APP_API_ENDPOINT}/users/me`, { device_token }, {
      headers: {
        "Authorization": `${jwt.token_type.toLowerCase()} ${jwt.access_token}`
      }
    });
    return response.data;
  }

  async me(): Promise<any> {
    const response = await this.axios.get('/users/me/info');
    return response.data;
  }

  async getAllCategories():Promise<any> {
    
    const response = await this.axios.get('/categories');
    return response.data;
  }

  async getSites(): Promise<any> {
    const response = await this.axios.get('/sites');
    return response
  }

  async getDashboard(): Promise<IUserDashboardResponse> {
    const response = await this.axios.get('/users/me/dashboard');
    return response.data;
  }

  genRandomId() {
    return Math.floor(Math.random() * (99999 - 10000 + 1)) + 10000;
  }

  async delete(): Promise<void> {
    await this.axios.delete(`/users/me`);
  }

}

export default new UserClient({
  baseURL: process.env.REACT_APP_API_ENDPOINT!
});
