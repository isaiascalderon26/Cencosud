export default interface ILocal {
  id: string;
  provider_id: string;
  location_id: string;
  restaurant_id: string;
  state: 'OPEN' | 'CLOSED';
  name: string;
  logo: string;
  cooking_time?: number;
  created_at: string;
  updated_at: string;
  map_url: string;
  image: ImageInfo[];
  opening_hours: IOpeningHours[];
  order_delivery_methods: IOrderDeliveryMethod[];
  plugin_id: string;
  categories?: any[]
}
export interface IOpeningHours {
  /**
   * 0 - Sunday
   * ...
   * 6 - Saturday
   */
  day: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  hours: IHours[];
}

interface IHours {
  // 0 - 2399
  open: number;
  // 0 - 2399
  close: number;
}

export interface ILocalSlot {
  start: Date;
  end: Date;
}

export interface IOrderDeliveryMethod {
  id: string;

  name: string;

  disabled: boolean;
}

interface ImageInfo {
  src: string;
  name: string;
  id: string;
}
