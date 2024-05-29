import Job from '../lib/Job';
import EurekaConsole from '../lib/EurekaConsole';
import { Device, DeviceInfo, OperatingSystem } from '@capacitor/device';
import SnapshotClient from '../clients/SnapshotClient';
import ISnapshotData from '../models/ISnapshotData';
import { App } from '@capacitor/app';
import Expr from '../lib/Expr';

const eureka = EurekaConsole({ label: "device-job" });

class DeviceInfoJob extends Job {
  constructor() {
    super({
      runEveryInSeconds: 14400, /* Each 4 hours */
      waitBeforeFirstRunInSeconds: 7
    });
  }

  /**
   * Obtain the Device info for analitycs
   * @memberof DeviceInfoJob
   */
  async doTheJob() {
    const deviceInfo = await Device.getInfo();

    Expr.whenInNativePhone(async () => {
      const appInfo = await App.getInfo();
      console.log('appInfo');
      console.log(appInfo);
      const version = appInfo!.version;
      const build = appInfo!.build;

      SnapshotClient.takeSnapshot("DEVICE_INFO", { ...deviceInfo, appVersion: version, appBuild: build } as IDeviceInfoSnapShot);
    })

    Expr.whenNotInNativePhone(async () => {
      SnapshotClient.takeSnapshot("DEVICE_INFO", { ...deviceInfo } as IDeviceInfoSnapShot);

    })

    eureka.debug(`device info obtained [${deviceInfo.model} / ${deviceInfo.platform}]`)
  }
}

export default new DeviceInfoJob();


interface IDeviceInfoSnapShot extends DeviceInfo, ISnapshotData {
  /**
     * The device model. For example, "iPhone"
     */
  model: string;
  /**
   * The device platform (lowercase).
   */
  platform: 'ios' | 'android' | 'web';
  /**
   * The UUID of the device as available to the app. This identifier may change
   * on modern mobile platforms that only allow per-app install UUIDs.
   */
  uuid: string;
  /**
   * The current bundle verison of the app
   */
  appVersion: string;
  /**
   * The current bundle build of the app
   */
  appBuild: string;
  /**
   * The operating system of the device
   */
  operatingSystem: OperatingSystem;
  /**
   * The version of the device OS
   */
  osVersion: string;
  /**
   * The manufacturer of the device
   */
  manufacturer: string;
  /**
   * Whether the app is running in a simulator/emulator
   */
  isVirtual: boolean;
  /**
   * Approximate memory used by the current app, in bytes. Divide by
   * 1048576 to get the number of MBs used.
   */
  memUsed?: number;
  /**
   * How much free disk space is available on the the normal data storage
   * path for the os, in bytes
   */
  diskFree?: number;
  /**
   * The total size of the normal data storage path for the OS, in bytes
   */
  diskTotal?: number;
  /**
   * A percentage (0 to 1) indicating how much the battery is charged
   */
  batteryLevel?: number;
  /**
   * Whether the device is charging
   */
  isCharging?: boolean;
}
