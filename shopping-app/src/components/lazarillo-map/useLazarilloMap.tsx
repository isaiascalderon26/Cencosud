import { LazarilloMap } from '@lzdevelopers/lazarillo-maps';
import React, { useEffect, useReducer, useState } from 'react';
import { useGetPlaces } from '../../hooks/how-to/useGetMerchant';
import {
  ISitePlace,
  MallFloor,
} from '../../models/how-to/place';
import { ISite } from '../../models/store-data-models/ISite';

import { getFloor } from './utils';


interface IState {
  ready: boolean;
  mapLoaded: boolean;
  map?: LazarilloMap;
  place?: ISitePlace;
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
  | {
    type: 'setPlace';
    payload: ISitePlace;
  }

const reducer = (state: IState, action: DAction): IState => {
  switch (action.type) {
    case 'setPlace':
      return { ...state, place: action.payload };
    case 'setMap':
      return { ...state, map: action.payload, ready: state.mapLoaded };
    case 'setMapLoaded':
      return { ...state, mapLoaded: true, ready: !!state.map };
    default:
      return state;
  }
};

export const useLazarilloMap = ({
  id,
  site,
  onReady,
  onCreated,
  onError,
  apiKey,
  zoom = 18,
}: {
  id: string;
  site: ISite;
  onCreated?: () => void;
  onReady?: () => void;
  onError?: () => void;
  apiKey: string;
  zoom?: number;
  showGps?: boolean;
}) => {
  const [
    {
      mapLoaded,
      ready,
      map,
      place,
    },
    dispatch,
  ] = useReducer(reducer, {
    ready: false,
    mapLoaded: false,
  });
  const { getSitePlace } = useGetPlaces();
  const [currentFloor, setCurrentFloor] = useState<MallFloor | undefined>();

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
        console.log("map loaded on hook")
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
    }
  }, [ready]);


  return {
    map,
    mapLoaded,
    ready,
    currentFloor,
    place,
    setFloor,
    async destroy() {
      if (map) {
        map.destroy();
      }
    },
    initialize,
  };
};
