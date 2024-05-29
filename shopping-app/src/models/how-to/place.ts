import { IMerchant } from '../merchants/IMerchant';
import { ISite } from '../store-data-models/ISite';

interface GPlace {
  lat: number;
  lng: number;
  id: string;
}

export interface IStorePlace extends GPlace {
  floor: string[];
}

export interface GPlaceFloor {
  floor: string;
  index: number;
  level: number;
  key: string;
  name: {
    default: string;
  };
  title: string;
  vectorTile: string;
}

export interface IMallPlace extends GPlace {
  innerFloors: Record<string, GPlaceFloor>;
  hasBeacons: boolean;
}

export type IMerchantPlace = {
  merchant: IMerchant;
  place: IStorePlace;
};

export type ISitePlace = {
  site: ISite;
  place: IMallPlace;
};

export interface MallFloor {
  id: string;
  name: string;
  level: number;
}
