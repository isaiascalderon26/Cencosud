import Job from '../lib/Job';
import EurekaConsole from '../lib/EurekaConsole';
import { Geolocation, Position } from '@capacitor/geolocation';
import SnapshotClient from '../clients/SnapshotClient';
import ISnapshotData from '../models/ISnapshotData';
//import ISnapshotData from '../models/ISnapshotData';
const eureka = EurekaConsole({ label: "gps-job" });
let lastCoordinates: IGeoSnapshot;

class GpsTrackerJob extends Job {
  constructor() {
    super({
      runEveryInSeconds: 60,
      waitBeforeFirstRunInSeconds: 5
    });
  }

  getLastObtainedCoordinates(): IGeoSnapshot {
    return lastCoordinates;
  }

  /**
   * Obtain the GPS Location, and add via snapshot for async upload
   * @memberof GpsTrackerJob
   */
  async doTheJob() {
    /* const geo = await Geolocation.getCurrentPosition();
    const { accuracy, latitude, longitude, heading, speed, altitudeAccuracy, altitude } = geo.coords;
    lastCoordinates = {
      coords: {
        accuracy,
        latitude,
        altitude,
        altitudeAccuracy,
        longitude,
        heading,
        speed,
      },
      timestamp: geo.timestamp
    };
    SnapshotClient.takeSnapshot("GPS_LOCATION", lastCoordinates);

    eureka.debug(`coordinates obtained [lat:${geo.coords.latitude},lng:${geo.coords.longitude}]`) */
  }
}
export default new GpsTrackerJob();

interface IGeoSnapshot extends Position, ISnapshotData {
  timestamp: number;
  coords: {
    latitude: number;
    longitude: number;
    altitude: number | null;
    altitudeAccuracy: number | null | undefined;
    accuracy: number;
    speed: number | null;
    heading: number | null;
  };
}