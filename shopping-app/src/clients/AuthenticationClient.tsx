import jwt from "jsonwebtoken";
import { Storage } from '@capacitor/storage';
import WithBootedClient from "../lib/WithBootedClient";
import IJwt from "../models/IJwt";
import IJwtEntity from "../models/IJwtEntity";

export async function getAuthFromCache() {
  const cacheAuth = await Storage.get({ key: storageName });
  if (cacheAuth && cacheAuth.value) {
    return JSON.parse(cacheAuth.value!);
  }
  return null;
}

const storageName: string = "@user";
let decodedJwt: any;
let rawJwt: IJwt;

interface IState {
  isAuthenticated: boolean,
  user?: IJwt,
  provider: string
}

class AuthenticationClient extends WithBootedClient {
  state: IState = {
    isAuthenticated: false,
    provider: ""
  };

  async boot() {
    const newState = await getAuthFromCache();
    if (newState) {
      this.setState(newState);
      rawJwt = newState.user;
      decodedJwt = jwt.decode(rawJwt.access_token);
    }
  }

  isAuthenticated(): boolean {
    return this.state.isAuthenticated;
  }

  getInfo(): IJwtEntity {
    return decodedJwt;
  }

  async getAuth(): Promise<IJwt> {
    return rawJwt;
  }
  
  async authenticate(provider: string, rawJwt: IJwt) {
    // Set User Login OK!
    await this.setState({
      isAuthenticated: true,
      user: rawJwt,
      provider: provider
    });

    decodedJwt = jwt.decode(rawJwt.access_token);
    Storage.set({
      key: storageName,
      value: JSON.stringify(this.state)
    });
  }

  hasRole(rolesToFind: Array<String> | String) {
    const rolesForCheck = Array.isArray(rolesToFind) ? rolesToFind : [rolesToFind];
    for (let index = 0; index < rolesForCheck.length; index++) {
      const roleToCheck = rolesForCheck[index];
      if (decodedJwt.scope.indexOf(roleToCheck) >= 0) {
        return true;
      }
    }
    return false;
  }

  async signOut() {
    await this.setState({
      isAuthenticated: false,
      user: undefined,
      provider: ""
    });

    await Storage.remove({ key: "SECURITY_PIN" }) // User Security PIN
    await Storage.remove({
      key: storageName
    })
  }

  async setState(newState: IState): Promise<void> {
    this.state = newState;
  }
}

export default new AuthenticationClient();
