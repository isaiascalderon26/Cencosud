import { LazarilloMap } from '@lzdevelopers/lazarillo-maps';

import {
  IStorePlace,
  IMerchantPlace,
  ISitePlace,
  MallFloor,
  IMallPlace,
} from '../../models/how-to/place';
import { IMerchant } from '../../models/merchants/IMerchant';
import { ISite } from '../../models/store-data-models/ISite';

export type NearMerchantPlace = {
  from: IMerchantPlace;
  merchant: IMerchant;
  distance?: number;
  time?: number;
};

export const useGetPlaces = () => {
  // const { state } = useSiteContext();

  return {
    async getMerchantPlace(
      merchant: IMerchant
    ): Promise<IMerchantPlace | void> {
      const placeId = merchant.local;

      if (!placeId)
        throw new Error(
          `Missing "place_id" on merchant: "${JSON.stringify(merchant)}"`
        );

      try {
        const methodName = "CACHE_PUBLICPLACEID_" + placeId;
        const cachedPlace = localStorage.getItem(methodName);
        let place;
        if (cachedPlace) {
          place = JSON.parse(cachedPlace);
        } else {
          const apiKey = process.env.REACT_APP_LAZARILLO_API_KEY;
          place = await LazarilloMap.getPublicPlace(placeId, apiKey);
          if (place) {
            localStorage.setItem(methodName, JSON.stringify(place));
          }
        }

        if (place) {
          return { merchant, place };
        }
      } catch (err) {}
    },
    async getSitePlace(site: ISite): Promise<ISitePlace | void> {
      const placeId = site.id;

      try {
        const methodName = "CACHE_PUBLICPLACEID_" + placeId;
        const cachePlace = localStorage.getItem(methodName);
        let place
        if (cachePlace) {
          place = JSON.parse(cachePlace)
        } else {
          const apiKey = process.env.REACT_APP_LAZARILLO_API_KEY;
          place = await LazarilloMap.getPublicPlace(placeId, apiKey);
          if (place) {
            localStorage.setItem(methodName, JSON.stringify(place));
          }
        }

        if (place) return { site, place };
      } catch (err) {}
    },
    async getNearPlaces(
      site: ISite,
      current: IMerchant
    ): Promise<NearMerchantPlace[] | void> {
      //todo solucion temporal hasta que lazarillo provea listado de tiendas mas cercanas
      return [];

      // if (!sitesStore.state.merchants) return [];

      // const floorMerchants = sitesStore.state.merchants.filter(
      //   ({ level }) =>
      //     !!(current.merchant.level as any).find((f: string) => level == f)
      // );

      // return floorMerchants.map((merchant) => ({
      //   from: current,
      //   merchant,
      // }));
    },
  };
};

export { useGetPlaces as getPlaces };
