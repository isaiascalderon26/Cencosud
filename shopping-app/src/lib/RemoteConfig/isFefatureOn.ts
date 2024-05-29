import { isPlatform } from '@ionic/react';
import RemoteConfigClient from '../../clients/RemoteConfigClient';

const get = (key: string, defaultValue: boolean = false) => {
  const cfg = RemoteConfigClient.getBoolean(key, defaultValue);
  return typeof cfg === 'undefined' ? defaultValue : cfg;
};

type Platforms = 'android' | 'ios' | 'web';

export type PlatformRemoteConfigOptions = {
  [platform in Platforms]?: string;
};

export const isFeatureOn = (
  config: string | PlatformRemoteConfigOptions,
  defaultValue: boolean = false
): boolean => {
  if (typeof config == 'string') return get(config, defaultValue);

  const platform: Platforms = isPlatform('android')
    ? 'android'
    : isPlatform('ios')
    ? 'ios'
    : 'web';

  return platform in config
    ? get(config[platform]!, defaultValue)
    : defaultValue;
};
