import { Storage } from '@capacitor/storage';
import WithBootedClient from "../lib/WithBootedClient";
import EventStreamer from "../lib/EventStreamer";
import axios from 'axios';
import { App } from '@capacitor/app';
import Expr from '../lib/Expr';
import { Device } from '@capacitor/device';


const storageName = "@settings";
interface IState {
  [key: string]: any
}

enum SETTINGS_ENUM {
  "LANGUAGE",
  "FIRST_TIME",
  "SECURITY_PIN",
  "ALLOWED_TO_TRACK_IDFA",
  "SELECTED_MALL",
  "AUTOSCAN_TICKET_ID",
  "FOODIE_FIRST_TIME"
}
export type SettingTypes = keyof typeof SETTINGS_ENUM;

class SettingsClient extends WithBootedClient {
  state: IState = {};

  async boot() {
    const cached = await Storage.get({ key: storageName });
    if (cached && cached.value) {
      const newState = JSON.parse(cached.value);
      this.setState(newState);
    }
  }

  get(name: SettingTypes, defaultValue: any = null) {
    let setting = this.state[name];
    if (typeof setting == "undefined") {
      return defaultValue;
    }

    return setting;
  }

  async set(name: SettingTypes, value: any) {
    this.state[name] = value;

    await this.setState(this.state);

    await Storage.set({
      key: storageName,
      value: JSON.stringify(this.state)
    })

    EventStreamer.emit("SETTINGS_CHANGED", [name, value]);
    return value;
  }

  async remove(name: SettingTypes) {
    delete this.state[name];

    await this.setState(this.state);

    await Storage.set({
      key: storageName,
      value: JSON.stringify(this.state)
    })

    EventStreamer.emit("SETTINGS_REMOVED", [name]);
    return true;
  }

  private async setState(newState: IState): Promise<void> {
    this.state = newState;
  }

  async getDisplayGoogleSso(): Promise<boolean> {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_ENDPOINT}/settingsApp/google-sso`);
      return response?.data as boolean;
    } catch (Error) {
      throw Error;
    }
  }

  async getTermsAndConditions(): Promise<string> {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_ENDPOINT}/settingsApp/terms-conditions`);
      return response?.data as string;
    } catch (Error) {
      throw Error;
    }
  }

  async getTermsAndConditionsTopic(): Promise<string[]> {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_ENDPOINT}/settingsApp/terms-conditions-topic`);
      return response?.data as string[];
    } catch (Error) {
      throw Error;
    }
  }

  async getTermsAndConditionsDocUrl(): Promise<string> {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_ENDPOINT}/settingsApp/terms-conditions-doc-url`);
      return response?.data as string;
    } catch (Error) {
      throw Error;
    }
  }

  async getPrivacyPolicies(): Promise<string[]> {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_ENDPOINT}/settingsApp/privacy-policies`);
      return response?.data as string[];
    } catch (Error) {
      throw Error;
    }
  }

  async getPrivacyPoliciesDocUrl(): Promise<string> {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_ENDPOINT}/settingsApp/privacy-policies-doc-url`);
      return response?.data as string;
    } catch (Error) {
      throw Error;
    }
  }

  async getAllowUserDeleteAccount(): Promise<boolean> {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_ENDPOINT}/settingsApp/allow-delete-account`);
      return response?.data as boolean;
    } catch (Error) {
      throw Error;
    }
  }

  async getAccessibilityText(): Promise<any[]> {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_ENDPOINT}/settingsApp/accessibility-text`);
      return response?.data;
    } catch (Error) {
      throw Error;
    }
  }


  async displayUpdateCliente(): Promise<Record<any, any>> {

    let dataDevice = {}
    const deviceInfo = await Device.getInfo();

    await Expr.whenInNativePhone(async () => {
      const appInfo = await App.getInfo();

      const version = appInfo!.version;
      const build = appInfo!.build;

      dataDevice = { ...deviceInfo, appInfo, version, build }
    })

    Expr.whenNotInNativePhone(async () => {
      dataDevice = { ...deviceInfo }
    })

    try {
      const response = await axios.post(`${process.env.REACT_APP_API_ENDPOINT}/updateAPP`, { dataDevice });
      return response?.data;
    } catch (Error) {
      throw Error;
    }
  }

}

export default new SettingsClient();
