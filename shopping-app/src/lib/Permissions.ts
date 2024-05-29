import { Geolocation } from '@capacitor/geolocation';
import { Camera } from '@capacitor/camera';
import { PushNotifications } from '@capacitor/push-notifications';

export enum PERMISSIONS {
  Geolocation = 'geolocation',
  Camera = 'camera',
  Notifications = 'notifications',
}

export const checkPermissions = async (): Promise<
  Record<PERMISSIONS, unknown>
> => {
  const [{ location: geolocation }, { camera }, { receive }] =
    await Promise.all([
      Geolocation.checkPermissions(),
      Camera.checkPermissions(),
      PushNotifications.checkPermissions(),
    ]);

  return {
    [PERMISSIONS.Camera]: camera,
    [PERMISSIONS.Geolocation]: geolocation,
    [PERMISSIONS.Notifications]: receive,
  };
};
