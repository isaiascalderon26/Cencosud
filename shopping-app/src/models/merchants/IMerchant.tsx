type MarketSchedules = {
  id: string;
  dias_txhorarios: string;
  horas_txhorarios: string;
}

type MetaData = {
  provider: string
}

export type IMerchant = {
  category: string[];
  control: string;
  created_at: string;
  description: string;
  email: string;
  floor: string[];
  id: string;
  instagram: string;
  keywords: string[];
  latLng: {
    lat: number,
    lng: number
  }
  lazarilloID: string;
  lazarilloStore: string;
  level: string[];
  local?: string;
  logo: string;
  map: string;
  market_schedules: MarketSchedules[];
  meta_data: MetaData;
  name: string;
  objectID: string;
  phone: string;
  photo: string;
  photoAlt: string;
  store: string;
  store_id: string;
  updated_at: string;
  url_logo: string;
  url_map: string;
  url_photo: string;
  web: string;
  whatsapp: string;
}

// interface IOpenTime {
//   dias_txhorarios: string;
//   horas_txhorarios: string;
// }
//
// export interface IMerchant {
//   objectID: string;
//   tags: string;
//   name: string;
//   description: string;
//   stores: Array<string>;
//   level: string;
//   map: string;
//   url_map: string;
//   //category: string,
//   category: string[];
//   meta_data: Object;
//   phone: string;
//   web: string;
//   photo: string;
//   logo: string;
//   market_schedules: Array<IOpenTime>;
//   id: string;
//   local?: string;
// }
