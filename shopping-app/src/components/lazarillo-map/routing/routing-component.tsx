import React, { HTMLProps, useEffect, useMemo, useRef, useState } from 'react';
import { ISite } from '../../../models/store-data-models/ISite';
import sc from 'styled-components';
import {  MallFloor } from '../../../models/how-to/place';
import { LazarilloMap as Map } from '@lzdevelopers/lazarillo-maps';
import './style.less';
import { i18nFactory } from '../../i18n';
import localize from '../locale';
import InstructionsModal from '../instructions/instructions-modal';
import { LazarilloRoute } from '../types';
import ButtonsRadioSelector from '../../buttons-radio-selector';
import {
  useLazarilloMap,
} from './useLazarilloRouting';
import MapSkeleton from '../map-skeleton';
import LoadingSheetModal from '../loading-sheet-modal';
import MallFloors from '../mall-floors';
import { getRoutingFloors } from '../utils';
import ArriveModal from '../arrive-modal';
import {IonButton, IonCard, IonCardContent, IonCol, IonContent, IonHeader, IonIcon, IonModal, IonRow, IonSearchbar, IonText, IonTitle, IonToolbar} from '@ionic/react';
import WalkingIcon from '../../../assets/media/map/walking.svg';
import WheelChair from '../../../assets/media/map/wheelchair.svg';
import RunIcon from '../../../assets/media/map/run.svg';
import PauseIcon from '../../../assets/media/map/pause.svg';
import RoutingStart from '../../../assets/media/routing/start.svg';
import RoutingEnd from '../../../assets/media/routing/end.svg';
import RoutingSwitch from '../../../assets/media/routing/switch.svg';
import RoutingDots from '../../../assets/media/routing/dots.svg';
import ScalatorUpIcon from '../../../assets/media/routing/scalator-up.svg';
import ScalatorDownIcon from '../../../assets/media/routing/scalator-down.svg';
import ElevatorIcon from '../../../assets/media/routing/elevator.svg';
import RoutingSteepsCarrousel from '../routing-steps-carrousel';
import { AccesibilityOptions, RoutingOptions } from './routing-model';

import { getFloor } from '../utils';
import {Capacitor, PluginListenerHandle} from "@capacitor/core";
import { IMerchant } from '../../../models/merchants/IMerchant';
import SearchModal from '../../search-store-modal';
import MerchantClient from '../../../clients/MerchantClient';
import { SdkStepRoute } from '@lzdevelopers/lazarillo-maps/dist/typings/definitions';

const I18 = i18nFactory(localize);

export type MapRoutingOptions = RoutingOptions & {
  showInstructions?: boolean;
  showAccesibilityOptions?: boolean;
  defaultAccesibilityOption?: AccesibilityOptions;
  showLevels?: boolean;
};
interface Props extends HTMLProps<HTMLDivElement> {
  id?: string;
  site: ISite;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  onMapReady?: () => void | Promise<void>;
  loading?: boolean;
  routing?: MapRoutingOptions;
  onRouteCalculated?: (route?: LazarilloRoute) => void;
  onEnd?: () => void;
  onError: () => void;
  destroyMe: boolean;
  showGps?: boolean;
  merchants: IMerchant[];
  onUpdatedRouteLocation: (origin: IMerchant, destination: IMerchant) => void;
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

  .accesibilitySelector {
    position: absolute;
    bottom: 525px;
    right: -2px;
    visibility: visible;
    z-index: 4;
  }
`;

const apiKey = process.env.REACT_APP_LAZARILLO_API_KEY;

function LazarilloMapRouting({
  id = `map-${Math.random()}`,
  site,
  onMapReady,
  children,
  header,
  footer,
  loading: showLoading,
  routing,
  onRouteCalculated,
  onEnd,
  showGps = false,
  onError,
  destroyMe,
  onUpdatedRouteLocation,
  merchants,
  ...htmlProps
}: Props) {
  const [showRouteInstructions, setShowRouteInstructions] = useState(
    routing?.showInstructions ?? true
  );
  const [showAccesibilityOptions, setShowAccesibilityOptions] = useState(
    routing?.showAccesibilityOptions ?? true
  );
  const [showRoutingLevels, setShowRoutingLevels] = useState(
    routing?.showLevels ?? true
  );
  const [routingFloors, setRoutingFloors] = useState<MallFloor[]>([]);
  const [floors, setFloors] = useState<MallFloor[]>([]);
  const [arrived, setArrived] = useState(false);
  const [started, setStarted] = useState(false);
  const [play, setPlay] = useState(false);
  const [map, setMap] = useState<Map>();
  const [searchToShow, setSearchToShow] = useState(false);
  const [searchFromOrigin, setSearchFromOrigin] = useState(false);
  const [merchantList, setMerchantList] = useState(merchants);

  const mapRef = useRef<HTMLElement>();
  const initRoute = useRef(true);
  const [animationlistener, setListener] = useState<PluginListenerHandle | undefined>();
  const [showChangeFloorModal, setChangeFloorModal] = useState(false);
  const [currentStepAnimation, setCurrentStep] = useState<SdkStepRoute | undefined>();
  const [animationInProgress, setAnimationInProgress] = useState(false);


  const {
    place,
    currentFloor,
    mapLoaded,
    ready,
    setFloor,
    drawRoute,
    accesibilityOption,
    route,
    setAccesibilityOption,
    loadingRoute,
    currentStep,
    initialize,
    destroy,
    watch,
    unWatch,
    animateRoute,
    startRouting,
    setAnimationListener,
    stopRouting,
  } = useLazarilloMap({
    id,
    site,
    onReady() {
      updateRoute();
    },
    apiKey: apiKey!,
    showGps,
    onError,
  });

  function prepareApp() {
    const v = '--app-background-color';
    const old = getComputedStyle(document.documentElement).getPropertyValue(v);

    document.documentElement.style.setProperty(v, `${old}00`);
    document.documentElement.style.visibility = 'hidden';

    return () => {
      document.documentElement.style.removeProperty(v);
      document.documentElement.style.visibility = 'visible';
    };
  }

  async function destroyComponent() {
    console.log('useEffect destroy');
    const id = route?.route.routeId;
    if(id) {
      map?.destroyRouting({routeId: id});
    }
    animationlistener?.remove();
    map?.destroy();
    destroy();
    onEnd && onEnd()
  }

  async function updateRoute() {
    if (routing && ready){
      drawRoute({
        destination: routing.destination,
        origin: routing.origin,
      });
    }
  }

  useEffect(() => {
    const undo = prepareApp();
    if(merchantList.length === 0){
      MerchantClient.list(site.id).then(list => {
        if(list.data && list.data.length > 0){
          setMerchantList(list.data.map(({ local, ...m }) => ({
            local:
              local || local?.trim() != ''
                ? local
                : m.map.match(/^([A-Z0-9]+\_[A-Z0-9]+\_[A-Z0-9]+)\_*/)?.[1],
            ...m,
          })));
        }
      });
    }

    return () => {
      undo();
    };
  }, []);

  useEffect(() => {
    if (mapRef.current) initialize(mapRef.current);
  }, [mapRef]);


  useEffect(() => {
    if (destroyMe) {
      destroyComponent();
    }
  }, [destroyMe]);

  useEffect(() => {
    onRouteCalculated && onRouteCalculated(route?.route);
    if (route) {
      const mallPlace = place!.place
      const floorsRaw = mallPlace.innerFloors ?? []
      const floors = Object.keys(floorsRaw)
        .filter(key => key !== '-ND-DotO0jGRTA5-D-Jv' && key !== '-ND-DoTPPnqUT_dWjW3e')
        .map(key => getFloor(key, mallPlace))
        .sort((a,b) => {
          return b.level - a.level;
        })
      setFloors(floors);

      const routingFloors = getRoutingFloors(route.route, place!.place).sort((a,b) => {
        return b.level - a.level;
      });
      setRoutingFloors(routingFloors);
      if(initRoute.current){
        startRouting();
        initRoute.current = false;
      }

      animationlistener?.remove();
      const callback = (data: {step: SdkStepRoute, routeId: string}) => {
        const step = data.step;
        console.log("new step:: "+ step);
        if (data.routeId === route.route.routeId){
          const stepLoc = step.start_location;

          const legs = route.route.data.legs;
          const lastLeg = legs[legs.length - 1]
          const steps = lastLeg.steps;
          const lastStep = lastLeg.last_step ?? steps[steps.length -1];
          const lastStepLoc = lastStep.start_location;
          if(stepLoc.lat === lastStepLoc.lat
             && stepLoc.lng === lastStepLoc.lng
             && step.start_inside_floor === lastStep.start_inside_floor ){
              setAnimationInProgress(false);
             } else if(!animationInProgress) {
              setAnimationInProgress(true);
             }
        }
        setChangeFloorModal(step.start_inside_floor !== step.end_inside_floor);
        setCurrentStep(step);
        if (step.end_inside_floor &&
          (step.start_inside_floor !== step.end_inside_floor
            || step.end_inside_floor !== currentFloor?.id)){
              setFloor(step.end_inside_floor)
            }
      }

      setAnimationListener(callback).then(listener => {
        setListener(listener);
      })
    }
  }, [route]);

  const onRouteDone = () => {
    if (showGps) {
      setStarted(true);
      setPlay(true);
    } else destroyComponent();
  };

  const changeOriginDestination = () => {
    const origin = routing?.origin as IMerchant;
    const destination = routing?.destination;
    const id = route?.route.routeId;
    if(id) {
      map?.destroyRouting({routeId: id});
      setAnimationInProgress(false)
    }
    if (origin && destination){
      onUpdatedRouteLocation && onUpdatedRouteLocation(
        destination, origin);
      drawRoute({
        destination: origin,
        origin: destination,
      });
    }
  }
  const merchantFromSearch = (e: IMerchant) => {
    const origin = searchFromOrigin ? e : routing?.origin as IMerchant;
    const destination = !searchFromOrigin ? e :routing?.destination;
    const id = route?.route.routeId;
    if(id) {
      map?.destroyRouting({routeId: id});
      setAnimationInProgress(false);
    }
    if (origin && destination){
      onUpdatedRouteLocation && onUpdatedRouteLocation(
        origin, destination);
      drawRoute({
        destination,
        origin,
      });
    }
    setSearchToShow(false);
  }

  useEffect(() => {
    if (currentStep?.end) {
      setArrived(true);
    }
  }, [currentStep]);


  return (
    <Root>
      <IonModal  isOpen={showChangeFloorModal} cssClass="change-floor-modal" backdropDismiss={false}>
      {/* <IonModal  isOpen={true} cssClass="change-floor-modal" backdropDismiss={false}> */}
        <IonContent className="ion-padding">
        <IonCard className='change-floor-card'>
          <IonCardContent>
          <IonText>{currentStepAnimation?.plain_instructions}</IonText>
          </IonCardContent>
          <img
            alt=''
            className='change-floor-img'
            width={150}
            src={
              currentStepAnimation?.elevator_step
                ? ElevatorIcon
                : (() => {
                  try {
                    if(routing === undefined)
                      return ScalatorUpIcon;

                    const origin = routing.origin as IMerchant;
                    const destination = routing.destination as IMerchant;
                    const originLevel = origin.level[0] === "PB" ? 0 : Number(origin.level[0]);
                    const destinationLevel = destination.level[0] === "PB" ? 0 :  Number(destination.level[0]);

                    if(originLevel < destinationLevel)
                      return ScalatorUpIcon;
                    else
                      return ScalatorDownIcon;
                  } catch (error) {
                    console.error("error getting routing data, return ScalatorUpIcon by default: ", error);
                    return ScalatorUpIcon;
                  }
                })()
            }
          />
        </IonCard>
        </IonContent>
      </IonModal>
      {!ready && <MapSkeleton />}
      {header}
      {showAccesibilityOptions && !loadingRoute && ((Capacitor.isNativePlatform() && mapLoaded) || !Capacitor.isNativePlatform()) && (
        <>
          <div className='place-selector-box'>
            <IonButton
              type='button'
              key="search-origin"
              className="place-selector-item margin-top"
              onClick={() => {
                setSearchFromOrigin(true)
                setSearchToShow(true)
              }}
            >
              <IonIcon
                icon={RoutingStart}
                slot='start'
              />
              {(routing?.origin as IMerchant)?.name.replace(/&amp;/g, '&') }
              <span className='spacer'></span>
            </IonButton>
            <IonButton
              type='button'
              key="search-destination"
              className="place-selector-item"
              onClick={() => {
                setSearchFromOrigin(false)
                setSearchToShow(true)
              }}
            >
              <IonIcon
              icon={RoutingEnd}
              slot='start'
            />
              {routing?.destination?.name.replace(/&amp;/g, '&')}
              <span className='spacer'></span>
            </IonButton>
          </div>
          <IonIcon className='btn-switch'
            onClick={()=>{
              changeOriginDestination()
            }}
                  icon={RoutingSwitch}/>
          <IonIcon
            class='place-selector-dots'
            icon={RoutingDots}>
          </IonIcon>
        </>
      )}
      {
        route &&
        mapLoaded &&
        !loadingRoute &&
        <div id="accesibility-switch-layer" style={{width: "100%"}}>
          <ButtonsRadioSelector<AccesibilityOptions>
            value={accesibilityOption}
            onChange={(id) => {
              if (id && !loadingRoute) {
                setAccesibilityOption(id);
              }
            }}
            options={[
              {
                id: 'fastest',
                // body: localize('ACCESIBILITY.STRAIGHT'),
                body: "",
                icon: WalkingIcon,
              },
              {
                id: 'reducedMobility',
                // body: localize('ACCESIBILITY.ACCESIBILITY'),
                body: "",
                icon: WheelChair,
              },
            ]}
          />
        </div>
      }
      { Capacitor.isNativePlatform() && <capacitor-lazarillo-map ref={mapRef} id={id}></capacitor-lazarillo-map> }
      {arrived && routing && (
        <ArriveModal
          currentLocation={routing.destination}
          onClose={() => {
            destroyComponent()
          }}
          site={site}
        />
      )}
      {showRoutingLevels &&
        route &&
        mapLoaded &&
        !loadingRoute &&
        floors.length > 1 && (
          <MallFloors
            key={currentFloor!.id}
            floors={floors}
            routingFloors={routingFloors}
            value={currentFloor!.id}
            onChange={(id: string) => {
              setFloor(id);
            }}
          />
        )}
      {footer}
      {ready &&
        (loadingRoute && !searchToShow ? (
          <LoadingSheetModal text={localize('ROUTING')} />
        ) : (
          route &&
          showRouteInstructions &&
          !currentStep?.end &&
          (started ? (
            <div className="realtime-routing">
              <RoutingSteepsCarrousel
                steps={route.route.data.legs[0].steps}
                currentStep={currentStep!.index}
                key={currentStep!.index}
              />
              <div className="routing-controls">
                <IonIcon
                  icon={play ? PauseIcon : RunIcon}
                  onClick={() => {
                    setPlay(!play);
                  }}
                />
                <IonButton
                  onClick={() => {
                    destroyComponent()
                  }}
                >
                  {localize('END')}
                </IonButton>
              </div>
            </div>
          ) : (
            <InstructionsModal
              route={route!.route}
              start={!('location' in routing!.origin) ? routing!.origin : false}
              end={routing!.destination}
              site={place!}
              onEnd={() => {
                destroyComponent();
              }}
              animationInProgress={animationInProgress}
              animateRoute={ ()=> {
                animateRoute()
              }}
            />
          ))
        ))}
        {searchToShow ? (
              <SearchModal
                key="search-place-selector"
                className="search-place-selector"
                site={site}
                autofocus={true}
                merchants={merchantList}
                onClose={() => {
                  setSearchToShow(false)
                }}
                onMerchantDetail={merchantFromSearch}
                title={searchFromOrigin ? "¿En qué tienda estás?" : "¿A qué tienda deseas ir?"}
                paragraph={searchFromOrigin ? "Selecciona la tienda donde te encuentras como punto de inicio" : "Selecciona la tienda donde te gustaría ir como punto de destino"}
              ></SearchModal>
            ) : null}
    </Root>
  );
}

export default LazarilloMapRouting;
