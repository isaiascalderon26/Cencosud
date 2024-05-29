import { GetPositionCallbackData, IdRoutePlace, LocationRoutePlace, LzLocation } from "@lzdevelopers/lazarillo-maps/dist/typings/definitions";
import { IMerchant } from "../../../models/merchants/IMerchant";
import { LazarilloRoute } from "../types";

export type AccesibilityOptions = 'fastest' | 'reducedMobility';

export type RoutingOptions = {
  origin: IMerchant | GetPositionCallbackData;
  destination: IMerchant;
  originMarker?: any;
  destinationMarker?: any;
  nextStepsRouteColor?: string;
  prevStepsRouteColor?: string;
  polylineWidth?: number;
};
export const toIdRoutePlace = (place: IMerchant): IdRoutePlace => {
  let location: IdRoutePlace = {
    type: 'ID',
    id: place.local || place.map,
  };
  return location;
};

export const toLocationRoutePlace = (location: LzLocation): LocationRoutePlace => ({
  type: 'LOCATION',
  ...location,
});


export type CurrentRoute = {
    args: RoutingOptions & { accesibilityOption: AccesibilityOptions };
    route: LazarilloRoute;
  };