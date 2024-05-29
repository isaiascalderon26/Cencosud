import { IonContent, IonHeader, IonIcon, IonSearchbar } from '@ionic/react';
import React, { useState } from 'react';
import BackButton from './back_button';
import I18n, { i18nFactory } from '../i18n';
import localize from './locale';
import './index.less';
import { ISite } from '../../models/store-data-models/ISite';
import { IMerchant } from '../../models/merchants/IMerchant';
import { useSiteContext } from '../../stores/site';
import From, { isCustomItem } from './from';
import { CustomItem } from '../merchant-list/custom-merchant-list-item';
import { Leg } from '../lazarillo-map/types';
import ErrorHandler, { useErrorContext } from '../error-handler';
import destinationMarker from '../../assets/media/map/destination-marker.svg';
import originMarker from '../../assets/media/map/origin-marker.svg';
import { isFeatureOn } from '../../lib/RemoteConfig/isFefatureOn';
import { locate } from 'ionicons/icons';
import { useCurrentLocation } from '../lazarillo-map/useCurrentLocation';
import { IUser } from '../../models/users/IUser';
import EventClient from '../../clients/EventClient';
import IEvent from '../../models/events/IEvent';
import LazarilloMapRouting from '../lazarillo-map/routing/routing-component';
import { useHistory } from 'react-router';
import SettingsClient from '../../clients/SettingsClient';

interface Props {
  go_back: () => void;
  site: ISite;
  merchant: IMerchant;
  merchants?: IMerchant[];
  user?: IUser
}

const I18 = i18nFactory(localize);

type RoutingState = 'SelectOrigin';

const apiKey = process.env.REACT_APP_LAZARILLO_API_KEY;

function MerchantRoutingBody({ go_back, site, merchants, merchant, user }: Props) {
  const sitesStore = useSiteContext();
  const [origin, setOrigin] = useState<IMerchant | undefined>();
  const {
    location,
    update: updateLocation,
    setLocation,
  } = useCurrentLocation(apiKey!, site);
  const [leg, setLeg] = useState<Leg | undefined>();
  const [destroyComponent, setDestroyComponent] = useState(false);
  const { dispatch } = useErrorContext();
  const [destination, setDestination] = useState(merchant);
  const  history = useHistory();

  const onOriginSelected = async (origin: IMerchant | CustomItem) => {
    if (isCustomItem(origin as CustomItem)) {
      try {
        await updateLocation();
      } catch (error: any) {
        dispatch({
          type: 'setError',
          payload: {
            title: '¡Ups, lo sentimos!',
            message: error.message === 'bluetooth is disabled' ? 'Debe habilitar el bluetooth para poder acceder a esta acción.' : 'Debe habilitar la locación para poder acceder a esta acción.',
          },
        });
      }
    } else {
      setOrigin(origin as IMerchant)
    }

    EventClient.create({
      type: 'store.route',
      details: {
        start: (origin as CustomItem).__custom__ === true ? 'Posición actual' : (origin as IMerchant).name,
        end: merchant.name,
        user_id: user?.primarysid,
        mail: user?.email,
        created_at: new Date(),
      }
    } as IEvent);

  };

  const showGps = isFeatureOn({
    android: 'ENABLE_ANDROID_REALTIME_NAV_LAZARILLO_MAP',
    ios: 'ENABLE_IOS_REALTIME_NAV_LAZARILLO_MAP',
  }, false);

  const level = destination.level[0] ?? '';

  return (
    <div className="root merchant-how-to">
      <IonHeader
        style={{
          padding: 'max(var(--ion-safe-area-top), 24px) 24px 24px 24px',
        }}
      >
        <BackButton
          handler={() => {
            if (!origin || !location) {
              setDestroyComponent(true);
              history.push("/");
              // const selectedMall = SettingsClient.get("SELECTED_MALL",null);
              // if(selectedMall){
              //   history.push(`/mall-home/${selectedMall}`);
              // } else {
              //   history.replace("/")
              // }
            }
            else {
              setOrigin(undefined);
              setLocation(undefined);
            }
          }}
        />
        {(origin || location) && (
          <div
            style={{
              marginRight: "30px"
            }}
          >
            <span dangerouslySetInnerHTML={{ __html: "Ruta a " + destination.name }} />
            {level !== undefined && (
              <p>
                {level == 'PB' ? 'Planta Baja' : `Piso ${level}`}
                {leg
                  ? ` • ${leg.duration.value > 0
                    ? `${Math.ceil(+leg.duration.value / 60)} min • `
                    : ''
                  } ${Math.round(+leg.distance.value.toFixed(2))} mts`
                  : ''}
              </p>
            )}
          </div>
        )}
      </IonHeader>
      {sitesStore.state.merchants && sitesStore.state.site && (
        <div className="body">
          {!origin && !location && (
            <From
              merchant={destination}
              onSelect={onOriginSelected}
              customItems={
                showGps
                  ? [
                    {
                      id: 'gps',
                      title: localize('USE_CURRENT_POSITION'),
                      icon: <IonIcon icon={locate} />,
                      __custom__: true,
                    },
                  ]
                  : []
              }
            />
          )}
          {(origin || location) && (
            <LazarilloMapRouting
              id="merchantHow2"
              site={site}
              // header={<div className="map-header-mask"></div>}
              onError={() => {
                console.log("we got an error")
                dispatch({
                  type: 'setError',
                  payload: {
                    title: '¡Ups, lo sentimos!',
                    message: 'No se pudo encontrar una ruta por el momento.',
                    action: go_back
                  },
                });
              }}
              showGps={showGps}
              onRouteCalculated={(route) => {
                console.log('route:: ' + route);
                if (route) {
                  setLeg(route?.data?.legs?.[0]);
                }
              }}
              onEnd={() => {
                go_back();
              }}
              routing={{
                showInstructions: true,
                origin: origin || location!,
                destination,
                destinationMarker,
                originMarker,
              }}
              destroyMe={destroyComponent}
              merchants={merchants || []}
              onUpdatedRouteLocation={(newOrigin, newDestination) => {
                setOrigin(newOrigin)
                setDestination(newDestination)
                setLeg(undefined)
              }}
            />
          )}
        </div>
      )}
    </div>
  );
}

const MerchantRouting = (props: Props) => (
  <ErrorHandler>
    <MerchantRoutingBody {...props} />
  </ErrorHandler>
);

export default MerchantRouting;
