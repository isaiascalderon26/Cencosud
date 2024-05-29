import WithBootedClient from '../lib/WithBootedClient';
import RESTClient, { IArrayRestResponse } from './RESTClient';
import IJwt from '../models/IJwt';
import axios from "axios";
import { IUser } from '../models/users/IUser';
import IAppleUser from '../models/users/IAppleUser';
import IGoogleUser from '../models/users/IGoogleUser';

interface IConfig {
  baseURL: string
}

class RegisterClient extends RESTClient implements WithBootedClient {
  constructor(config: IConfig) {
    super({ baseURL: config.baseURL });
  }

  async boot() { }

  async tryToRegisterWithGoogle(data: IGoogleUser): Promise<IJwt> {
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_ENDPOINT}/oauth/google/user`, data);
      return response.data as IJwt;
    } catch (ex) {
      console.error('An Error has ocurred register the user with google');
      console.debug('Apple data', data);
      throw new Error('An Error has ocurred trying to register an google user into shopping app')
    }
  }

  async register(data: any): Promise<any> {
    const response = await axios.post(`${this.baseUrl}/register`, data)
    return response.data;
  }

  async verifycode(data: any) : Promise<any> {
      const response = await axios.post(`${this.baseUrl}/register/check-code`, data);
      return response.data;
  }

  /**
   * Register a guest user
   * @returns {Promise<IJwt>}
   * @memberof RegisterClient
   */
  async registerGuest(): Promise<IJwt> {
    const response = await axios.get(`${this.baseUrl}/register/invite`);
    return response.data;
  }
}

export default new RegisterClient({
    baseURL: process.env.REACT_APP_API_ENDPOINT!
});