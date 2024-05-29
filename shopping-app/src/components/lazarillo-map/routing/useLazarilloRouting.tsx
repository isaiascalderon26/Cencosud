import { LazarilloMap } from '@lzdevelopers/lazarillo-maps';
import {
  GetPositionCallbackData,
  LzLocation,
  RouteReadyCallbackData,
} from '@lzdevelopers/lazarillo-maps/dist/typings/definitions';
import { AddRouteArgs } from '@lzdevelopers/lazarillo-maps/dist/typings/implementation';
import React, { useEffect, useReducer, useRef, useState } from 'react';
import { useGetPlaces } from '../../../hooks/how-to/useGetMerchant';
import {
  IMerchantPlace,
  ISitePlace,
  MallFloor,
} from '../../../models/how-to/place';
import { ISite } from '../../../models/store-data-models/ISite';

import { LazarilloRoute, Step } from '../types';
import { useCurrentLocation } from '../useCurrentLocation';
import { getFloor } from '../utils';
import { IMerchant } from '../../../models/merchants/IMerchant';
import { AccesibilityOptions, CurrentRoute, RoutingOptions, toIdRoutePlace, toLocationRoutePlace } from './routing-model';
import { Capacitor } from '@capacitor/core';



const pos = (
  { place: { floor, id, lat, lng } }: IMerchantPlace,
  place: ISitePlace
): LzLocation => ({
  building: place.place.id,
  floor: floor[0],
  polygons: undefined,
  latitude: lat,
  longitude: lng,
});

const Maps: Record<string, LazarilloMap> = {};


interface IState {
  ready: boolean;
  mapLoaded: boolean;
  loadingRoute: boolean;
  map?: LazarilloMap;
  route?: CurrentRoute;
  place?: ISitePlace;
  accesibilityOption: AccesibilityOptions;
  currentStep?: {
    index: number;
    step: Step;
    end?: boolean;
  };
  onError?: () => void;
}

type DAction =
  | {
    type: 'setMap';
    payload: LazarilloMap;
  }
  | {
    type: 'setMapLoaded';
  }
  | { type: 'setLoadingRoute'; payload: boolean }
  | {
    type: 'setRoute';
    payload?: CurrentRoute;
  }
  | {
    type: 'setPlace';
    payload: ISitePlace;
  }
  | { type: 'setAccesibilityOption'; payload: AccesibilityOptions }
  | { type: 'setRouteStep'; payload: GetPositionCallbackData };

const reducer = (state: IState, action: DAction): IState => {
  switch (action.type) {
    case 'setPlace':
      return { ...state, place: action.payload };
    case 'setMap':
      return { ...state, map: action.payload, ready: state.mapLoaded };
    case 'setMapLoaded':
      return { ...state, mapLoaded: true, ready: !!state.map };
    case 'setLoadingRoute':
      return { ...state, loadingRoute: action.payload, route: undefined };
    case 'setAccesibilityOption':
      return state.accesibilityOption === action.payload
        ? state
        : { ...state, accesibilityOption: action.payload };
    case 'setRoute':
      return {
        ...state,
        loadingRoute: false,
        route: action.payload,
        currentStep: action.payload?.route
          ? {
            step: action.payload.route.data.legs[0].steps[0],
            index: 0,
          }
          : undefined,
      };
    case 'setRouteStep':
      return {
        ...state,
        currentStep: {
          step: state.route!.route.data.legs[0].steps[action.payload.routingStatus?.currentStep === undefined ? 0 : action.payload.routingStatus?.currentStep],
          index: action.payload.routingStatus?.currentStep === undefined ? 0 : action.payload.routingStatus?.currentStep,
          end:
            action.payload.routingStatus?.status === 'FINISHED',
        },
      };
    default:
      return state;
  }
};

export const useLazarilloMap = ({
  id,
  site,
  defaultAccesibilityOption = 'fastest',
  onReady,
  onCreated,
  onError,
  apiKey,
  zoom = 18,
  showGps = false,
}: {
  id: string;
  site: ISite;
  defaultAccesibilityOption?: AccesibilityOptions;
  onCreated?: () => void;
  onReady?: () => void;
  onError?: () => void;
  apiKey: string;
  zoom?: number;
  showGps?: boolean;
}) => {
  const [
    {
      loadingRoute,
      mapLoaded,
      ready,
      map,
      route,
      place,
      accesibilityOption,
      currentStep,
    },
    dispatch,
  ] = useReducer(reducer, {
    ready: false,
    mapLoaded: false,
    loadingRoute: false,
    accesibilityOption: defaultAccesibilityOption,
  });
  const { getSitePlace } = useGetPlaces();
  const [currentFloor, setCurrentFloor] = useState<MallFloor | undefined>();
  const { watch, unWatch, location, initialized, enableWatch } = useCurrentLocation(
    apiKey,
    site
  );
  const realTimeRoutingOrigin = useRef(false);
  const routingStarted = useRef(false);
  const recalculateRoute = useRef(false);
  const [markerId, setMarkerId] = useState<string | undefined>(undefined)

  const routeAnimationSpeed = 12
  const routeAnimationTimeOnFloorChange = 4 // seconds
  const startRealTime = async () => {
    if (!map) return;
    await initialized;
    await map.enableCurrentLocation(true);
  };
  function animateRoute(){
    if(map && route){
      const firstStep = route.route.data.legs[0].steps[0].start_inside_floor
      if(firstStep){
        setFloor(firstStep)
      }
      map?.animateRoute(
        route.route.routeId,
        routeAnimationSpeed,
        routeAnimationTimeOnFloorChange
        );
    }
  }

  async function initialize(element: HTMLElement) {
    const p = await getSitePlace(site);

    if (!p) return;

    dispatch({
      type: 'setPlace',
      payload: p,
    });

    const m = await LazarilloMap.create(
      {
        id,
        element,
        apiKey: apiKey!,
        config: {
          center: {
            lat: p!.place.lat,
            lng: p!.place.lng,
          },
          zoom,
          maxZoom: 20,
          minZoom: 15,
          boundRadius: 100,
          showCompass: false,
          parentPlaceId: p!.place.id,
        },
      },
      () => {
        dispatch({
          type: 'setMapLoaded',
        });
      }
    );

    dispatch({
      type: 'setMap',
      payload: m,
    });
  }

  async function drawRoute({
    destination,
    origin,
    nextStepsRouteColor = '#7000FF',
    polylineWidth = 5,
    prevStepsRouteColor = '#7000FF',
    destinationMarker,
    originMarker,
  }: RoutingOptions) {
    if (!ready) return;
    map?.stopAnimatedRoute()
    const previousRouteId = route?.route.routeId;
    if (previousRouteId){
      map?.destroyRouting({routeId: previousRouteId})
    }
    if(markerId){
      map!.removeMarker(markerId)
    }

    dispatch({
      type: 'setLoadingRoute',
      payload: true,
    });
    let placeIds = [destination.local ?? '']
    const isLzLocation = 'location' in origin;
    const lzLocation = isLzLocation
      ? toLocationRoutePlace((origin as GetPositionCallbackData).location)
      : toIdRoutePlace(origin as IMerchant);

    if (!isLzLocation){
      placeIds.push((origin as IMerchant).local ?? '')
    }
    const initialFloor = isLzLocation
      ? (origin as GetPositionCallbackData).location.floor
      : null;

    realTimeRoutingOrigin.current = isLzLocation;

    const routeParams: AddRouteArgs = {
      mapId: id,
      initialLocation: lzLocation,
      finalLocation: toIdRoutePlace(destination),
      preferAccessibleRoute: accesibilityOption === 'reducedMobility',
      nextStepsRouteColor,
      prevStepsRouteColor,
      polylineWidth,
    };
    console.info(`Calculando ruta ...`, routeParams);
    let routeResponse: RouteReadyCallbackData
    try {
      routeResponse = await map!.getRoute(routeParams);
    } catch (error) {
      console.error(`Ocurrió un error calculando la ruta!!!`);
      dispatch({
        type: 'setLoadingRoute',
        payload: false,
      });
      onError && onError();
      return;
    }

    console.info(`Ruta calculada!!!`, routeResponse);

    const legs = routeResponse.data.legs
    const initialStep = legs[0].steps[0]

    const finalLeg = legs[legs.length - 1];
    const finalStepsTemp = finalLeg.steps;
    const finalStep =
      finalLeg.last_step ?? finalStepsTemp[finalStepsTemp.length - 1];
    setFloor(initialStep.start_inside_floor!);

    try {
      const isAccessibleRoute = accesibilityOption === "reducedMobility";
      const iconMarker = isAccessibleRoute ? 'you_are_here_accesible' : 'you_are_here'
      if(markerId){
        map!.removeMarker(markerId)
      }
      const id = await map!.addMarker({
        coordinate: initialStep.start_location,
        floorId: initialStep.start_inside_floor!,
        icon: iconMarker,
      });
      setMarkerId(id);
      map?.colorPlaces(placeIds);
      map?.animateRoute(
        routeResponse.routeId,
        routeAnimationSpeed,
        routeAnimationTimeOnFloorChange);
    } catch (error) {
      console.error(":: " + error);
    }

    dispatch({
      type: 'setRoute',
      payload: {
        args: { destination, origin, accesibilityOption },
        route: routeResponse,
      },
    });
  }

  async function setFloor(floor: string) {
    if (!map) return;

    const f = getFloor(floor, place!.place);

    setCurrentFloor(f);

    try {
      map?.setFloor({
        floorId: f.id,
        mapId: id,
      });
    } catch (error) {
      console.log("Cannot set change floor");
    }
  }

  useEffect(() => {
    if (map) onCreated && onCreated();
  }, [map]);

  useEffect(() => {
    if (ready) {
      onReady && onReady();
      if (showGps) startRealTime();
    }
  }, [ready]);

  useEffect(() => {
    if (ready && route) {
      (async () => {

        console.log(":: useEffect accesibilityOption");
        await unWatch();
        await drawRoute({
          destination: route.args.destination,
          origin: route.args.origin,
        });
        enableWatch();
        console.log(":: useEffect accesibilityOption after drawRoute");

      })();


    }


  }, [accesibilityOption]);

  useEffect(() => {
    if (typeof location?.routingStatus?.currentStep !== 'undefined') {
      dispatch({
        type: 'setRouteStep',
        payload: location,
      });
    }
    if (location?.location?.floor)
      setFloor(location?.location?.floor);
  }, [location]);

  useEffect(() => {
    if (route && routingStarted.current) {
      startRouting();
    }
  }, [route]);

  useEffect(() => {
    (async () => {
      if (location && route && !recalculateRoute.current) {
        stopRouting();
        recalculateRoute.current = true;
        await drawRoute({
          destination: route.args.destination,
          origin: location,
        });
        recalculateRoute.current = false;
      }
    })();
  }, [location?.routingStatus?.status === 'OUT_OF_ROUTE']);

  const startRouting = async () => {
    if (routingStarted.current) await stopRouting();
    routingStarted.current = true;
    if (map && showGps && route) {
      await watch();
      await map.startRouting({
        routeId: route.route.routeId,
      });
    }
  };

  const stopRouting = async () => {
    routingStarted.current = false;
    if (map && showGps && route) {
      unWatch();
      await map.destroyRouting({
        routeId: route.route.routeId,
      });
      map.colorPlaces([]);
    }
  };

  return {
    map,
    mapLoaded,
    ready,
    currentFloor,
    place,
    route,
    accesibilityOption,
    currentStep,
    setAccesibilityOption(payload: AccesibilityOptions) {
      dispatch({
        type: 'setAccesibilityOption',
        payload,
      });
    },
    loadingRoute,
    setFloor,
    drawRoute,
    async destroy() {
      console.log('destroy from lazarillo hook');
      const v = '--app-background-color';
      const old = getComputedStyle(document.documentElement).getPropertyValue(v);
      document.documentElement.style.setProperty(v, `${old}00`);

      if (map) {
        console.log("LazarilloRouting:: got map on destroy")
        await stopRouting();
        map.removeAllMapListeners();
        map.destroy();
      }
    },
    initialize,
    animateRoute,
    setAnimationListener(callback: (data: {step: any, routeId: string}) => void){
      console.log("Adding route animation listener");
      return map?.addAnimateRouteListener(callback) ?? Promise.resolve(undefined);
    },
    stopRouting,
    startRouting,
    watch,
    unWatch,
  };
};
