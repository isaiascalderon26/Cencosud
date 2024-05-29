import { LazarilloMap } from '@lzdevelopers/lazarillo-maps';
import { GetPositionCallbackData } from '@lzdevelopers/lazarillo-maps/dist/typings/definitions';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useGetPlaces } from '../../hooks/how-to/useGetMerchant';
import { ISitePlace } from '../../models/how-to/place';
import { ISite } from '../../models/store-data-models/ISite';
import DocumentNumber from '../../pages/foodie-flow/components/document-number-view';
import { Location } from './types';

const SIMULATE_BEACONS = false;

export enum GpsError {
  MISSING_LOCATION = 'No se pudo obtener su ubicación, debe habilitar los permisos al gps y bluetooth para poder obtener su ubicación en tiempo real',
  OUTSIDE_MALL = 'Debe entrar al centro comercial para poder obtener su ubicación.',
}

export const useCurrentLocation = (apiKey: string, site: ISite) => {
  const [location, setLocation] = useState<GetPositionCallbackData>();
  const { getSitePlace } = useGetPlaces();
  const watching = useRef(false);
  //todo esto quitarlo cuando Lazarillo agregue unwatch
  const watchingStarted = useRef(false);
  const initialized = useMemo<Promise<ISitePlace>>(
    () =>
      getSitePlace(site).then(async (sitePlace) => {

        return sitePlace!;
      }),
    [apiKey, site]
  );
  const simulateInterval = useRef<NodeJS.Timeout>();

  const update = async () => {
    await initialized;

    if (SIMULATE_BEACONS) {
      await LazarilloMap.simulateBeacons({
        simulateBeacons: simulateBeaconsList[0],
      });
    }

     const loc = await LazarilloMap.getCurrentPosition({
       enableHighAccuracy: true,
     });

    /*const loc: GetPositionCallbackData = {
      location: {
        longitude: mock.lng,
        latitude: mock.lat,
        floor: ((p: number) => {
          const floors = Object.values(mock.innerFloors);
          return (floors.find(({ index }) => index === p) ?? floors[0]).key;
        })(0), //replace this argument to mock the floor: example: PB=0, 1=1
        building: mock.id,
        polygons: null,
      },
      routingStatus: {
        currentStep: 0,
      },
    };*/

    if (!loc) throw new Error(GpsError.MISSING_LOCATION);

    if (
      !loc.location.building ||
      loc.location.building !== (await initialized).place.id
    )
      throw new Error(GpsError.OUTSIDE_MALL);

    setLocation(loc);
  };

  useEffect(() => {
    return () => {
      if (SIMULATE_BEACONS && simulateInterval.current) {
        clearInterval(simulateInterval.current);
        simulateInterval.current = undefined;
      }
    };
  }, []);

  const watch = async () => {
    await initialized;
    watching.current = true;
    if (SIMULATE_BEACONS) {
      let idx = -1;
      simulateInterval.current = setInterval(async () => {
        await LazarilloMap.simulateBeacons({
          simulateBeacons: simulateBeaconsList[idx++],
        });
        // setLocation({
        //   location: {
        //     longitude: mock.lng,
        //     latitude: mock.lat,
        //     floor: ((p: number) => {
        //       const floors = Object.values(mock.innerFloors);
        //       return (floors.find(({ index }) => index === p) ?? floors[0]).key;
        //     })(0), //replace this argument to mock the floor: example: PB=0, 1=1
        //     building: mock.id,
        //     polygons: null,
        //   },
        //   routingStatus: {
        //     currentStep: idx++,
        //   },
        // });
      }, 4000);
    }

    await LazarilloMap.watchPosition(
      { enableHighAccuracy: true },
      (location) => {
        if (watching.current) {
          setLocation(location);
        }
      }
    );
  };

  const unWatch = () => {
    watching.current = false;
  };

  const enableWatch = () => {
    if (!watchingStarted.current) {
      watching.current = true;
    }
  };

  return {
    location,
    setLocation,
    update,
    watch,
    unWatch,
    initialized,
    enableWatch
  };
};

const mock = {
  innerFloors: {
    '-N1OJ6FIVBV6dpjCXEFM': {
      floor: 'Planta baja',
      index: 0,
      key: '-N1OJ6FIVBV6dpjCXEFM',
      level: -1,
      name: {
        default: 'Planta baja',
        es: 'Planta baja',
      },
      title: 'Planta baja',
      vectorTile: true,
    },
    '-NCtxDrJbDWE3gMkZ_45': {
      floor: 'Primer piso',
      index: 1,
      key: '-NCtxDrJbDWE3gMkZ_45',
      level: 1,
      name: {
        default: 'Primer piso',
        es: 'Primer piso',
      },
      title: 'Primer piso',
      vectorTile: true,
    },
    '-NCtxOT4E4n3XlW_-hzL': {
      floor: 'Segundo piso',
      index: 2,
      key: '-NCtxOT4E4n3XlW_-hzL',
      level: 2,
      name: {
        default: 'Segundo piso',
        es: 'Segundo piso',
      },
      title: 'Segundo piso',
      vectorTile: true,
    },
    '-NCtxUY6bYLXOEndcqMl': {
      floor: 'Tercer piso',
      index: 3,
      key: '-NCtxUY6bYLXOEndcqMl',
      level: 3,
      name: {
        default: 'Tercer piso',
        es: 'Tercer piso',
      },
      title: 'Tercer piso',
      vectorTile: true,
    },
    '-NCtxd01xaDOjDQSOPCT': {
      floor: 'Cuarto piso',
      index: 4,
      key: '-NCtxd01xaDOjDQSOPCT',
      level: 4,
      name: {
        default: 'Cuarto piso',
        es: 'Cuarto piso',
      },
      title: 'Cuarto piso',
      vectorTile: true,
    },
    '-NCtxg_OxCuCfGVevdck': {
      floor: 'Quinto piso',
      index: 5,
      key: '-NCtxg_OxCuCfGVevdck',
      level: 5,
      name: {
        default: 'Quinto piso',
        es: 'Quinto piso',
      },
      title: 'Quinto piso',
      vectorTile: true,
    },
    '-NCtxjm9HZsty9D0i-or': {
      floor: 'Sexto piso',
      index: 6,
      key: '-NCtxjm9HZsty9D0i-or',
      level: 6,
      name: {
        default: 'Sexto piso',
        es: 'Sexto piso',
      },
      title: 'Sexto piso',
      vectorTile: true,
    },
    '-ND-DoTPPnqUT_dWjW3e': {
      floor: 'Piso 61',
      index: 7,
      key: '-ND-DoTPPnqUT_dWjW3e',
      level: 7,
      name: {
        default: 'Piso 61',
        es: 'Piso 61',
      },
      title: 'Piso 61',
      vectorTile: true,
    },
    '-ND-DotO0jGRTA5-D-Jv': {
      floor: 'Piso 62',
      index: 8,
      key: '-ND-DotO0jGRTA5-D-Jv',
      level: 8,
      name: {
        default: 'Piso 62',
        es: 'Piso 62',
      },
      title: 'Piso 62',
      vectorTile: true,
    },
  },
  lat: -33.417733,
  lng: -70.606573,
  id: '-N19VjzEVIj2RDKu7i4r',
};

const simulateBeaconsList = [
  'e2d63382fb9a6ea46c7482668802430c',
  'a31ef62afe2084f9687391009a129b0e',
  //'82bba5ec1cb4459ef2b45e1fa0771b09',
  //'b460f5101315f98145c1d27b8200cb11',
  //'9f9dd2b1b26fb24c4c043d506a522e36',
  //'768e38b09842dba13304a8b8c91c3536',
  'f1a166c12ae08075dc5f40fc2eed832b',
  'c2f88d6fc12c645bc443ea3f1837301a',
  'a4c8f860cee20daa0c1cb0724a109218',
  'b8617a25013260f55ac8d8483bba4136',
  '576d4cf8b412f1c5a8a4d9ee3773d22e',
  '1c282d6cdd25587b33019ed2e17b6914',
  '576d4cf8b412f1c5a8a4d9ee3773d22e',
  'b8617a25013260f55ac8d8483bba4136',
  'a4c8f860cee20daa0c1cb0724a109218',
  'c2f88d6fc12c645bc443ea3f1837301a',
  /*'e2d63382fb9a6ea46c7482668802430c',
  '6bc50ba6ceab308d91b1a0346f524333',
  'bc97a29cd304d72f86d862a968499b3f',
  'cc72d3d19950a89dda8e46eded9b431d',
  '28fe7cecd610802a7dff5820a3e2d622',
  '51fda3eb2105aed0b7a1fbc311a3301f',
  'a44aaf37bbfe1af86b1630ddabe40a09',
  '32fff23361cd48c7b4ab53c568f64d0a',
  'f579f7e66186dd6c731ce16df830f611'*/
];
