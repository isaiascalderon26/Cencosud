import IJwt from '../models/IJwt';
import IAppleUser from '../models/users/IAppleUser';
import RESTClient from './RESTClient';
import axios from "axios";

interface IConfig {
  baseURL: string
}


class AppleAuthenticationProviderClient extends RESTClient {
  constructor(config: IConfig) {
    super({ baseURL: config.baseURL });
  }



  async tryToRegisterWithApple(data: IAppleUser): Promise<IJwt> {
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_ENDPOINT}/register/apple/user`, data);
      return response.data as IJwt;
    } catch (ex) {
      console.error('An Error has ocurred register the user with apple id');
      console.debug('Apple data', data);
      throw new Error('An Error has ocurred trying to register an apple user into shopping app')
    }
  }

  async tryToLoginWithApple(md5AppleUserId: string, nonce:string): Promise<IJwt> {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_ENDPOINT}/register/apple/user/${md5AppleUserId}/${nonce}`);
      return response.data as IJwt;
    } catch (ex) {
      console.debug(ex);
      console.error('An Error has ocurred login the user with apple id');
      throw ex;
    }
  }


}

export default new AppleAuthenticationProviderClient({
  baseURL: process.env.REACT_APP_API_ENDPOINT!
});
