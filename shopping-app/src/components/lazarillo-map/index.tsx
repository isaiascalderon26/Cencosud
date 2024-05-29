import React, { HTMLProps, useEffect, useMemo, useRef, useState } from 'react';
import { ISite } from '../../models/store-data-models/ISite';
import sc from 'styled-components';
import { ISitePlace, MallFloor } from '../../models/how-to/place';
import { LazarilloMap as Map } from '@lzdevelopers/lazarillo-maps';
import './index.less';
import { i18nFactory } from '../i18n';
import localize from './locale';
import {
  useLazarilloMap,
} from './useLazarilloMap';
import MapSkeleton from './map-skeleton';
import MallFloors from './mall-floors';
import { getFloor } from './utils';
import {Capacitor} from "@capacitor/core";

const I18 = i18nFactory(localize);

interface Props extends HTMLProps<HTMLDivElement> {
  id?: string;
  site: ISite;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  onMapReady?: (map: Map) => void | Promise<void>;
  loading?: boolean;
  onError: () => void;
  showGps?: boolean;
}

const Root = sc.div`
  height: 100%;
  width: 100%;

  visibility: visible;
  position:relative;

  .map-loading-mask {
    visibility: visible;
    background-color:white;
    position:absolute;
    height: 100%;
    width:100%;
    left: 0;
    top:0;
    z-index: 2;
  }

  capacitor-lazarillo-map {
    height: 100%;
    width: 100%;
    display: inline-block;
  }

`;

const apiKey = process.env.REACT_APP_LAZARILLO_API_KEY;

function CustomMap({
  id = `map-${Math.random()}`,
  site,
  onMapReady,
  children,
  header,
  footer,
  loading: showLoading,
  showGps = false,
  onError,
  ...htmlProps
}: Props) {
  const [floors, setFloors] = useState<MallFloor[]>([]);

  const mapRef = useRef<HTMLElement>();

  const {
    place,
    currentFloor,
    mapLoaded,
    map: mapFromHook,
    ready,
    setFloor,
    initialize,
    destroy,
  } = useLazarilloMap({
    id,
    site,
    apiKey: apiKey!,
    showGps,
    onError,
  });


  useEffect(() => {
    return () => {
      destroy();
    };
  }, []);

  useEffect(() => {
    if (mapRef.current) initialize(mapRef.current);
  }, [mapRef]);

  useEffect(() => {
    if (mapLoaded){
      onMapReady && mapFromHook && onMapReady(mapFromHook);
      if (place){
        console.log("Got parent place so loading floors")
        const mallPlace = place.place
        const floorsRaw = mallPlace.innerFloors ?? []
        const floors = Object.keys(floorsRaw)
        .filter(key => key !== '-ND-DotO0jGRTA5-D-Jv' && key !== '-ND-DoTPPnqUT_dWjW3e')
        .map(key => getFloor(key, mallPlace))
        .sort((a,b) => {
          return b.level - a.level;
        })
        if (floors.length > 0 ){
          setFloor(floors[floors.length - 1].id)
          setFloors(floors)
        }
      }
    }
  }, [mapLoaded]);

  return (
    <Root>
      {!ready && <MapSkeleton />}
      <capacitor-lazarillo-map ref={mapRef} id={id}></capacitor-lazarillo-map>
      { mapLoaded &&
        floors.length > 1 && (
          <MallFloors
            key={currentFloor!.id}
            floors={floors}
            value={currentFloor!.id}
            onChange={(id: string) => {
              setFloor(id);
            }}
          />
        )}
    </Root>
  );
}

export default CustomMap;
