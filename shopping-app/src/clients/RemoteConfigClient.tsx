import { initializeApp, getApps, FirebaseApp, getApp } from 'firebase/app';
import { fetchAndActivate,  getRemoteConfig, getValue, RemoteConfig } from "firebase/remote-config";

// lib
import EurekaConsole from '../lib/EurekaConsole';
import WithBootedClient from "../lib/WithBootedClient";

const eureka = EurekaConsole({ label: "remote-config" });

/**
 * Remote Config Client (Firebase)
 * @class RemoteConfigClient
 */
class RemoteConfigClient extends WithBootedClient {
  private remoteConfig!: RemoteConfig;

  async boot(): Promise<void> {
    const app = this.initializeApp();

    this.remoteConfig = getRemoteConfig(app);

    // fetch every minute
    this.remoteConfig.settings.minimumFetchIntervalMillis = 60 * 1000;

    await fetchAndActivate(this.remoteConfig);

    eureka.info('firebase remote config initialized');
  }

  /**
   * Get value as string
   * @param key 
   * @param defaultValue 
   * @returns {string}
   * @memberof RemoteConfigClient
   */
  get(key: string, defaultValue?: string): string {
    let raw: string | undefined;
    try {
      raw = this.getRaw(key);
    } catch (error) {
      raw = defaultValue?.toString();
    }

    if (raw) {
      return raw;
    }

    if (typeof defaultValue !== 'undefined') {
      return defaultValue;
    }

    throw new Error(`Remote Config: key ${key} not found`);

  }

  /**
   * Get value as boolean
   * @param key 
   * @param defaultValue 
   * @returns {boolean}
   * @memberof RemoteConfigClient
   */
  getBoolean(key: string, defaultValue?: boolean): boolean {
    let raw: string | undefined;
    try {
      raw = this.getRaw(key);
    } catch (error) {
      raw = defaultValue?.toString();
    }

    if (raw && ['true', 'false'].indexOf(raw) !== -1) {
      return raw === 'true';
    }

    if (typeof defaultValue !== 'undefined') {
      return defaultValue;
    }

    throw new Error(`Remote Config: key ${key} not found`);
  }

  /**
   * Get value as number
   * @param key 
   * @param defaultValue 
   * @returns {number}
   * @memberof RemoteConfigClient
   */
  getNumber(key: string, defaultValue?: number): number {
    let raw: string | undefined;
    try {
      raw = this.getRaw(key);
    } catch (error) {
      raw = defaultValue?.toString();
    }

    if (raw) {
      return Number(raw);
    }

    if (typeof defaultValue !== 'undefined') {
      return defaultValue;
    }

    throw new Error(`Remote Config: key ${key} not found`);
  }

  private getRaw(key: string): string | undefined {
    // not initalized yet
    if (!this.remoteConfig) {
      throw new Error('Error trying to acces a value when Remote Config not initialized');
    }

    const value = getValue(this.remoteConfig, process.env.REACT_APP_ENVIRONMENT!);
    const envSettings = JSON.parse(value.asString());
    return envSettings[key];
  }

  private initializeApp(): FirebaseApp {
    if (!getApps().length) {
      return initializeApp({
        apiKey: process.env.REACT_APP_FIREBASE_ANALYTICS_APIKEY!,
        authDomain: process.env.REACT_APP_FIREBASE_ANALYTICS_AUTH_DOMAIN!,
        projectId: process.env.REACT_APP_FIREBASE_ANALYTICS_PROJECT_ID!,
        storageBucket: process.env.REACT_APP_FIREBASE_ANALYTICS_STORAGE_BUCKET!,
        messagingSenderId: process.env.REACT_APP_FIREBASE_ANALYTICS_MESSAGGING_SENDER_ID!,
        appId: process.env.REACT_APP_FIREBASE_ANALYTICS_APP_ID!,
        measurementId: process.env.REACT_APP_FIREBASE_ANALYTICS_MEASUREMENT_ID!,
      });
    }

    return getApp();
  }

}

export default new RemoteConfigClient();

