import { Storage } from '@capacitor/storage';
import React, { Fragment } from 'react';
import { RouteComponentProps } from 'react-router';
import ParkingLogo from '../../assets/media/parking-home.png';

import {
  notifications,
  arrowBack,
  chevronDown,
  chevronForward,
} from 'ionicons/icons';
import {
  withIonLifeCycle,
  IonPage,
  IonContent,
  IonIcon,
  IonSkeletonText,
  IonFooter,
  IonHeader,
  IonLoading,
  IonButton,
  IonRefresher,
  IonRefresherContent,
  IonSearchbar,
} from '@ionic/react';
import { RefresherEventDetail } from '@ionic/core';
import { ellipsisHorizontalOutline } from 'ionicons/icons';

/**
 * Styles and Locales
 */
import './index.less';
import locales from './locales';

/**
 * Libs
 */
import i18n from '../../lib/i18n';
import Expr from '../../lib/Expr';
import EventStreamer from '../../lib/EventStreamer';
import EurekaConsole from '../../lib/EurekaConsole';
import Analytics from '../../lib/FirebaseAnalytics';
import DniFormatter from '../../lib/formatters/DniFormatter';

/**
 * Models
 */
import { IUser } from '../../models/users/IUser';
import IWidget from '../../models/widgets/IWidget';
import { ISite } from '../../models/store-data-models/ISite';
import { IMovie } from '../../models/store-data-models/IMovie';

/**
 * Clients
 */
import UserClient from '../../clients/UserClient';
import WidgetsClient from '../../clients/WidgetsClient';
import LoyaltyClient from '../../clients/LoyaltyClient';
import SettingsClient from '../../clients/SettingsClient';
import LocationsClient from '../../clients/LocationsClient';
import RemoteConfigClient from '../../clients/RemoteConfigClient';
import AuthenticationClient from '../../clients/AuthenticationClient';
import BannerClient, {
  IBanner,
  IMallBanners,
} from '../../clients/BannerClient';

/**
 * Components
 */
import UserMenu from '../../components/user-menu';
import ModalMapDetail from './components/modal-map';
import LocationMap from './components/location-map';
import RegisterModal from '../../components/register_modal';
import StoreMapDetail from '../../components/store-map-detail';
import MovieDetailModal from '../../components/movie_detail_modal';
import WidgetWrapper from './components/widget-wrapper';
import MerchantDetailModal from '../../components/merchant_detail_modal';
import StoreServicesDetail from '../../components/store-services-detail';
import RutScreen from '../../components/rut-screen';

/**
 * Assets
 */
import iconUser from './../../assets/media/icon-user-2.svg';
import { SiteProvider } from '../../stores/site';
import sc from 'styled-components';
import DockedRightButton from './components/docked-right-buttons';
import BottomNavigationBar from '../../components/v2/navigation/bottom-navigation-bar';

import StoreList from './widgets/store-list';
import { PushNotifications } from '@capacitor/push-notifications';
import EventList from './widgets/event-list';
import { Capacitor } from "@capacitor/core";
import { LazarilloMap } from '@lzdevelopers/lazarillo-maps';
import { IMerchant } from '../../models/merchants/IMerchant';
import pointsIcon from "../../assets/media/parking-points.png";
import autoMoneyIcon from "../../assets/media/parking-auto-money.png";
import qrIcon from "../../assets/media/parking-qr.png";

const eureka = EurekaConsole({ label: 'mall-home' });

const localize = i18n(locales);

//   Comida solo está en: [conversación con Juan 26-02-24]
// - Costanera Center

const mallsThatContainsFoodie = [
  'costanera_center',
];

export function checkIfMallContainsFoodie(siteName?: string): boolean {
  if (typeof siteName !== 'string') return false;
  const formattedName = siteName.toLowerCase().replace(/\s+/g, '_').trim() ?? ''

  return mallsThatContainsFoodie.indexOf(formattedName) !== -1;
}

const indexMapHavingFoodie = [
  'HOME_ACTIVITIES',
  'HOME_MAP',
  'HOME_PARKING',
  'HOME_FOOD',
  'HOME_SERVICES',
];

const indexMapBased = [
  'HOME_ACTIVITIES',
  'HOME_MAP',
  'HOME_PARKING',
  'HOME_SERVICES',
];


function _getIndexMap(index: number, siteName: string): IStateMode {
  const indexMap = checkIfMallContainsFoodie(siteName) ? indexMapHavingFoodie : indexMapBased;

  return indexMap[index] as IStateMode;
}

const MallIonPage = sc(IonPage)`
  ion-header {
    &:nth-child(1) {
      padding: max(var(--ion-safe-area-top), 32px) 24px 8px;
    }
  }
`;

interface IProps
  extends RouteComponentProps<{
    id: any;
  }> { }

export async function getStatusFromCache() {
  const cacheState = await Storage.get({ key: '@registerState' });
  if (cacheState && cacheState.value) {
    return JSON.parse(cacheState.value!);
  }
  return null;
}

type IStateMode =
  | 'INITIAL_STATE'
  | 'HOME_ACTIVITIES' // home page
  | 'HOME_MAP'
  | 'HOME_SERVICES'
  | 'HOME_FOOD'
  | 'HOME_PARKING'
  | 'EDIT_RUT'
  | 'RUT_SCREEN'
  | 'SAVED';

interface IState {
  mode: IStateMode;
  buttonAct: string;
  bottomMenuCurrentIndex: number;
  menu_is_open: boolean;
  movie_is_open: boolean;
  rest_is_open: boolean;
  footer_show: boolean;
  location_map: boolean;
  restaurants: Array<any>;
  restaurant?: any;
  movies: Array<IMovie>;
  movie?: IMovie;
  user?: IUser;
  levels?: Array<number>;
  showLoyalty: boolean;
  document_number: string;
  show_store_image: boolean;
  isValidStatesInputs: {
    document_number: boolean;
  };
  site?: ISite;
  social_networks?: Record<string, string>;
  modal_is_open: boolean;
  icons_share_location?: Array<{ type: string; state: boolean; url: string }>;
  dni_is_valid: boolean;
  banners: Array<IBanner>;
  widgets: Array<IWidget>;
  search_to_show: boolean;
  lzInitialized: boolean;
  merchant?: IMerchant;
}

export default withIonLifeCycle(
  class MallPage extends React.Component<IProps, IState> {
    state: IState = {
      mode: 'INITIAL_STATE',
      /**
       * @deprecated
       */
      buttonAct: 'one',
      menu_is_open: false,
      bottomMenuCurrentIndex: 0,
      location_map: false,
      footer_show: false,
      movie_is_open: false,
      rest_is_open: false,
      movies: [],
      restaurants: [],
      showLoyalty: false,
      document_number: '',
      show_store_image: true,
      isValidStatesInputs: {
        document_number: false,
      },
      modal_is_open: false,
      dni_is_valid: false,
      banners: [],
      widgets: [],
      search_to_show: false,
      lzInitialized: false
    };

    ionViewWillEnter = () => {

      const initTab: string = new URLSearchParams(window.location.search).get("activeTab") ?? "0";

      this.setState({
        mode: 'INITIAL_STATE',
        bottomMenuCurrentIndex: parseInt(initTab)
      });
    };

    ionViewDidEnter = async () => {
      await this.getAllActivities();

      await this.getWidgets();

      const currentTime = Date.now();
      const storedTimestampForMall = localStorage.getItem("CACHE_TIMESTAMP");
      const prevSiteId = localStorage.getItem("MALL_SITE");
      const apiKey = process.env.REACT_APP_LAZARILLO_API_KEY || "";
      const siteId = this.state.site?.id || "";
      const place = await LazarilloMap.getPublicPlace(siteId, apiKey);
      if (!this.state.lzInitialized) {
        await LazarilloMap.initializeLazarilloPlugin({ apiKey, place: place.id });
        this.setState({ lzInitialized: true });
      } else {
        await LazarilloMap.setParentPlace(place.id);
      }
      if (storedTimestampForMall && prevSiteId) {
        const lastTimestamp = parseInt(storedTimestampForMall, 10);
        const twentyFourHoursInMilliseconds = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

        if (currentTime - lastTimestamp >= twentyFourHoursInMilliseconds
          || siteId !== prevSiteId) {
          // 24 hours have passed
          this.updateCacheOfStore(this.state.site).then();
        } else {
          // 24 hours have not passed
          // Is not necessary to update cache, all data related to Lazarillo is in cache
        }
      } else {
        this.updateCacheOfStore(this.state.site).then();
      }
    };

    updateCacheOfStore = async (site: ISite | undefined) => {
      if (!site) return
      const cacheList: string[] = []
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith("CACHE_")) {
          cacheList.push(key)
        }
      }
      cacheList.forEach(key => localStorage.removeItem(key));

      localStorage.setItem("MALL_SITE", site.id);
      localStorage.setItem("CACHE_TIMESTAMP", Date.now().toString());

    };

    goToParkingPage = () => {
      EventStreamer.emit(
        'NAVIGATE_TO',
        `/parking/${this.props.match.params.id}`
      );
    };

    getIconsShareLocation = async () => {
      const data = await LocationsClient.getLocation(
        this.props.match.params.id
      );

      this.setState({
        icons_share_location: data,
      });
    };

    getAllActivities = async () => {
      const name = this.props.match.params.id;
      let levels: any = [];

      try {
        const myInfo = await UserClient.me();
        const sites = await UserClient.getSites();
        const site = sites.data.find((site: ISite) => {
          return site.name === name;
        });

        if (site) {
          levels = site.meta_data.levels;
        }

        const { social_networks, footerMenuShow } = site.meta_data;

        if (!this.state.menu_is_open) {
          this.getLoyalty().then();
        }

        //flag to show footer menu to load page
        const flag =
          footerMenuShow === undefined || footerMenuShow ? true : false;

        const mode = _getIndexMap(this.state.bottomMenuCurrentIndex, site?.name)

        this.setState({
          mode,
          user: myInfo,
          footer_show: flag,
          levels,
          social_networks,
          site,
        });
      } catch (error) {
        console.log(error);
      }
    };
    onLoading() {
      return (
        <IonLoading cssClass="my-custom-class" isOpen message={'Cargando...'} />
      );
    }
    onGoBackToStores() {
      SettingsClient.remove('SELECTED_MALL').then();
      this.setState({
        search_to_show: false
      });

      this.props.history.replace("/")
    }

    onMenuButtonsHiddeHandler = (e: boolean) => {
      this.setState({
        footer_show: e,
      });
    };
    onCloseModalHandler = () => {
      this.setState({
        menu_is_open: false,
        movie_is_open: false,
        rest_is_open: false,
        location_map: false,
        modal_is_open: false,
      });
    };
    onCloseRegisterModalHandler = async () => {
      Storage.set({
        key: '@registerState',
        value: JSON.stringify({
          register: false,
          date: new Date().getDate() + 2,
        }),
      }).then();
      getStatusFromCache().then();
      this.setState({
        showLoyalty: false,
      });
    };

    onClick = () => {
      this.setState({
        showLoyalty: false,
        mode: 'EDIT_RUT',
      });
    };
    onOpenNotifications() {
      Analytics.customLogEventName(
        'button',
        'notificaciones',
        this.state.site?.name!,
        'home',
        'notificaciones',
        this.state.user?.email === 'invited' ? 'invitado' : 'registrado'
      ).then();
      const isInvited = this.state.user?.email === 'invited';
      if (isInvited) {
        this.setState({
          menu_is_open: true,
        });
        return;
      }
      this.showNotificationsPage().then();
    }
    showNotificationsPage = async () => {
      console.log('please show notifications page');
      this.props.history.push(`/notifications`);
    };
    onMenuOpenHandler() {
      Analytics.customLogEventName(
        'button',
        'perfil',
        this.state.site?.name!,
        'home',
        'perfil',
        this.state.user?.email === 'invited' ? 'invitado' : 'registrado'
      ).then();
      this.setState({
        search_to_show: false,
        menu_is_open: true,
      });
    }
    onOpenMovieHandler = (movie: any) => {
      this.setState({
        movie,
        movie_is_open: true,
      });
    };

    onOpenRestMerchantHandler = (merchant: any) => {
      this.setState({
        restaurant: merchant,
        rest_is_open: true,
      });
    };

    getLoyalty = async () => {
      const loyaltyUser = await LoyaltyClient.getLoyalty();
      const loyaltyReg = await getStatusFromCache();
      let date = new Date();
      if (loyaltyReg) {
        this.setState({
          showLoyalty:
            !loyaltyUser.data.loyaltyDocumentNumber &&
            loyaltyReg.date === date.getDate(),
        });
        return;
      }
      this.setState({
        showLoyalty: !loyaltyUser.data.loyaltyDocumentNumber,
      });
    };
    onLoginClickHandler = async () => {
      await AuthenticationClient.signOut();
      window.location.reload();
    };

    onChangePostHandler = async (name: keyof IState, value: string) => {
      try {
        await UserClient.update(name, DniFormatter.clean(value).toUpperCase());

        this.setState({
          mode: 'HOME_ACTIVITIES',
          showLoyalty: false,
          show_store_image: true,
          buttonAct: 'one',
          footer_show: true,
          dni_is_valid: true,
        });
      } catch (error) {
        console.log(error);
      }
    };

    onBackToHome = async () => {
      this.setState({
        mode: 'HOME_ACTIVITIES',
        showLoyalty: false,
        show_store_image: true,
        buttonAct: 'one',
        footer_show: true,
      });
    };

    onInputChangeHandler = (key: string, value: string) => {
      const newState: any = {};
      newState[key] = value;
      this.setState(newState);
    };

    getWidgets = async () => {
      try {
        const store = this.props.match.params.id
          .toUpperCase()
          .replaceAll(' ', '_');

        const userId = AuthenticationClient.getInfo().primarysid;
        const widgets = await WidgetsClient.list({
          offset: 0,
          limit: 10,
          query: {
            enabled_is: true,
            tags_is_one_of: [store, userId],
          },
          sort: {
            priority: 'asc',
          },
        });

        const _widgetsSorted: IWidget[] = widgets.sort((w1, w2) =>
          w1.priority > w2.priority ? 1 : -1
        );

        this.setState({
          widgets: _widgetsSorted,
        });
      } catch (error) {
        // TODO handle error
      }
    };

    getBanners = async () => {
      const { site } = this.state;
      let data = (await BannerClient.getBannersHome()) as any;
      let mallBanners: IMallBanners = data?.filter(
        (item: IMallBanners) => item?.id === site?.id
      )[0];
      this.setState({ banners: mallBanners.banners });
    };

    onGetBannerByIdHandler = (id: string): IBanner => {
      const { banners } = this.state;
      return banners.filter((banner: IBanner) => banner.id === id)[0];
    };

    onInputRUTChangeHandler = async (name: keyof IState, value: any) => {
      // Validate according to the field
      const isValid = Object.assign(this.state.isValidStatesInputs, {});
      if (value !== undefined) {
        switch (name) {
          case 'document_number':
            isValid.document_number = DniFormatter.isRutValid(value);
            break;
          default:
            return;
        }
      }
      const newState: any = {
        isValidStatesInputs: isValid,
      };
      newState[name] = value;
      this.setState(newState);
    };

    decorate = (id: string) => {
      switch (id) {
        case 'portal florida':
          return 'florida center';
        case 'portal dehesa':
          return 'portal la dehesa';
        case 'portal nunoa':
          return 'portal ñuñoa';
      }
      return id;
    };

    onBannerhandler = (dni?: string) => {
      const { site } = this.state;
      const banner = this.onGetBannerByIdHandler('BANNER-DAY-MOM');
      if (this.state.user?.email !== 'invited') {
        if ((dni && dni !== '') || this.state.dni_is_valid) {
          const url = banner.url;
          Expr.whenInNativePhone(async () => {
            Analytics.customLogEventName(
              'banner',
              banner.title,
              site?.name ? site?.name : '',
              'home',
              'activaciones'
            ).then();

            window.open(url, '_blank');
          });
          Expr.whenNotInNativePhone(() => {
            window.open(url, '_blank');
          });
        } else {
          this.setState({
            mode: 'EDIT_RUT',
          });
        }
      } else {
        this.setState({
          menu_is_open: true,
        });
      }
    };

    onUpdateRut = (rut: string) => {
      this.setState((prev: any) => ({
        ...prev,
        user: { ...prev.user, document_number: rut },
      }));
    };

    registerNotifications = async () => {
      let permStatus = await PushNotifications.checkPermissions();

      if (permStatus.receive === 'prompt') {
        permStatus = await PushNotifications.requestPermissions();
      }

      if (permStatus.receive !== 'granted') {
        throw new Error('User denied permissions!');
      }

      await PushNotifications.register();
    };

    onRefreshHandler = async (event: CustomEvent<RefresherEventDetail>) => {
      try {
        await this.getAllActivities();
        await this.getWidgets();
      } catch (error) {
        eureka.error(
          'An error has occurred trying to refresh mall home',
          error
        );
        eureka.debug((error as Error).message);
      } finally {
        event.detail.complete();
      }
    };

    goToGastronomicoPage = () => {
      // this.props.history.replace(
      //   `/foodie/${this.props.match.params.id}`
      // );
      window.location.href = `/foodie/${this.props.match.params.id}`;
    };

    render() {
      const {
        user,
        restaurant,
        rest_is_open,
        footer_show,
        mode,
        menu_is_open,
        movie_is_open,
        movie,
        location_map,
        modal_is_open,
      } = this.state;
      let storeName = this.props.match.params.id.replace(/\s/g, '');
      let headerBrand;


      try {
        headerBrand = [RemoteConfigClient.get('MALL_BRAND')] as Record<
          string,
          any
        >;
      } catch (error) {
        headerBrand = undefined;
      }
      const idSite = this.state.site?.id;
      const headerBrandName = headerBrand
        ? headerBrand[0][`${idSite}`]?.URL
        : undefined;

      return (
        <MallIonPage
          className={`new-mall-page ${mode.replace(/_/gi, '-').toLowerCase()}`}
        >
          <SiteProvider
            initialState={{
              site: this.state.site,
            }}
          >
            {headerBrandName ? (
              <div className="logo-brand-mall">
                <img src={headerBrandName} alt="" />
              </div>
            ) : null}
            {this.state.show_store_image ? (
              <IonHeader>
                <div
                  style={{ paddingTop: Capacitor.getPlatform() === "ios" ? "20px" : "0" }}
                >
                  {/* User profile btn */}
                  <div>
                    <IonIcon
                      size="12"
                      className="icon-user-btn icon-user-btn2"
                      src={iconUser}
                      onClick={() => {
                        this.onMenuOpenHandler();
                      }}
                    />
                  </div>

                  {/* Mall selector btn */}
                  <div
                    onClick={() => {
                      this.onGoBackToStores();
                    }}
                  >
                    <img
                      alt=""
                      className="day"
                      src={`${process.env.REACT_APP_BUCKET_URL}/logo/${storeName}-light.png`}
                    ></img>
                    <IonIcon className="chevron" src={chevronDown} />
                  </div>

                  {/* Notifications btn */}
                  <div>
                    <IonIcon
                      src={notifications}
                      onClick={() => {
                        this.onOpenNotifications();
                      }}
                    />
                  </div>
                </div>
                {/*  */}
                <div>
                  {[0, 1].indexOf(this.state.bottomMenuCurrentIndex) !== -1 && (
                    <div>
                      <IonSearchbar
                        className="searchbar-index-stores"
                        placeholder="¿Qué buscas hoy?"
                        onClick={() => {
                          this.setState({
                            buttonAct: 'two',
                            mode: 'HOME_MAP',
                            search_to_show: true,
                            bottomMenuCurrentIndex: 1
                          });
                        }}
                      />{' '}
                    </div>
                  )}
                </div>
              </IonHeader>
            ) : null}
            {(() => {
              const customRender: Function = (this as any)[`render${mode}`];
              if (!customRender) {
                return <div>{mode}</div>;
              }
              return customRender();
            })()}
            {footer_show ? (
              <IonFooter>
                <BottomNavigationBar
                  onIndexChanged={(newIndex) => {
                    if (_getIndexMap(newIndex, this.state.site?.name as string) !== 'HOME_MAP') {
                      this.setState({
                        search_to_show: false,
                      });
                    }

                    if (_getIndexMap(newIndex, this.state.site?.name as string) === 'HOME_FOOD') {
                      this.goToGastronomicoPage();
                    } else {
                      this.setState({
                        bottomMenuCurrentIndex: newIndex,
                        mode: _getIndexMap(newIndex, this.state.site?.name as string),
                      });
                    }
                  }}
                  initialIndex={this.state.bottomMenuCurrentIndex}
                  items={[
                    {
                      icon: 'home',
                      text: 'Home',
                    },
                    {
                      icon: 'discovery',
                      text: 'Tiendas',
                    },
                    {
                      icon: 'parking',
                      text: 'Parking'
                    },
                    ...(checkIfMallContainsFoodie(this.state.site?.name as string) ? [{
                      icon: 'food',
                      text: 'Comida',
                    }] : []),
                    {
                      icon: 'services',
                      text: 'Servicios',
                    },
                  ]}
                />
              </IonFooter>
            ) : null}
            {rest_is_open ? (
              <MerchantDetailModal
                onClose={this.onCloseModalHandler}
                merchant={restaurant}
                store={this.props.match.params.id}
              ></MerchantDetailModal>
            ) : null}
            {menu_is_open ? (
              <>
                {user?.email === 'invited' ? (
                  <RegisterModal
                    type="NEW"
                    userInfo={this.state.user}
                    onClose={this.onCloseModalHandler}
                    onClick={this.onLoginClickHandler}
                  />
                ) : (
                  <UserMenu
                    store={this.props.match.params.id}
                    onClose={this.onCloseModalHandler}
                  />
                )}
              </>
            ) : null}

            {user?.email !== 'invited' ? (
              <>
                {this.state.showLoyalty ? (
                  <RegisterModal
                    type="CI"
                    userInfo={this.state.user}
                    onClose={this.onCloseRegisterModalHandler}
                    onClick={this.onClick}
                  />
                ) : null}
              </>
            ) : null}
            {movie_is_open ? (
              <MovieDetailModal
                onClose={this.onCloseModalHandler}
                movie={movie}
              ></MovieDetailModal>
            ) : null}
            {location_map ? (
              <LocationMap
                onClose={this.onCloseModalHandler}
                store={this.props.match.params.id}
              ></LocationMap>
            ) : null}
            {modal_is_open ? (
              <ModalMapDetail
                onClose={this.onCloseModalHandler}
                modal_is_open={modal_is_open}
                site={this.state.site}
                icons_share_location={this.state.icons_share_location}
              />
            ) : null}
          </SiteProvider>
        </MallIonPage>
      );
    }
    renderINITIAL_STATE = () => {
      return (
        <Fragment>
          <IonContent>
            <div style={{ padding: '0 24px', width: '100%' }}>
              <IonSkeletonText
                style={{
                  height: '18px',
                  width: '40%',
                  borderRadius: '12px',
                  marginTop: '19px',
                }}
                animated={true}
              ></IonSkeletonText>
              <IonSkeletonText
                style={{
                  height: '128px',
                  width: '100%',
                  borderRadius: '12px',
                  marginTop: '19px',
                }}
                animated={true}
              ></IonSkeletonText>
              <IonSkeletonText
                style={{
                  height: '18px',
                  width: '40%',
                  borderRadius: '12px',
                  marginTop: '19px',
                }}
                animated={true}
              ></IonSkeletonText>
              <IonSkeletonText
                style={{
                  height: '184px',
                  width: '100%',
                  borderRadius: '12px',
                  marginTop: '19px',
                }}
                animated={true}
              ></IonSkeletonText>
              <IonSkeletonText
                style={{
                  height: '18px',
                  width: '40%',
                  borderRadius: '12px',
                  marginTop: '19px',
                }}
                animated={true}
              ></IonSkeletonText>
              <IonSkeletonText
                style={{
                  height: '128px',
                  width: '100%',
                  borderRadius: '12px',
                  marginTop: '19px',
                }}
                animated={true}
              ></IonSkeletonText>
            </div>
          </IonContent>
        </Fragment>
      );
    };

    renderHOME_ACTIVITIES = () => {
      return (
        <IonContent>
          <div
            style={{
              paddingLeft: '12px',
              paddingRight: '12px',
            }}
          ></div>
          <IonRefresher slot="fixed" onIonRefresh={this.onRefreshHandler}>
            <IonRefresherContent
              pullingIcon={ellipsisHorizontalOutline}
              refreshingSpinner="dots"
            ></IonRefresherContent>
          </IonRefresher>
          {this.state.widgets.map((widget: IWidget, index: number) => {

            // if index 1 append event list + current widget
            if (index == 1) {
              return (
                <React.Fragment>
                  <EventList />
                  <WidgetWrapper
                    store={this.props.match.params.id}
                    key={widget.id}
                    widget={widget}
                    homeState={this.state}
                    setHomeState={(params) => this.setState(params)}
                  />
                </React.Fragment>
              )
            }

            return (
              <WidgetWrapper
                store={this.props.match.params.id}
                key={widget.id}
                widget={widget}
                homeState={this.state}
                setHomeState={(params) => this.setState(params)}
              />
            );
          })}
          {
            this.state.site &&
            <StoreList
              web={this.state.site.web}
              id={this.state.site.id}
              onSelected={merchant => {
                this.setState({
                  merchant,
                  bottomMenuCurrentIndex: 1
                })
              }}
            />
          }
          <div style={{ paddingBottom: '140px' }}></div>
          <DockedRightButton />
        </IonContent>
      );
    };

    renderHOME_MAP = () => {
      return (
        <Fragment>
          <StoreMapDetail
            site={this.state.site!}
            store={this.props.match.params.id}
            minLevels={this.state.levels![0]}
            maxLevels={this.state.levels![1]}
            onMenuClose={this.onMenuButtonsHiddeHandler}
            search_to_show={this.state.search_to_show}
            merchant={this.state.merchant}
            onMerchantDetailModalClose={() => {
              this.setState({
                merchant: undefined
              })
            }}
            onSearchModalClose={() => {
              this.setState({
                search_to_show: false
              });
            }}
          />
        </Fragment>
      );
    };

    renderHOME_SERVICES = () => {
      return (
        <Fragment>
          <StoreServicesDetail
            site={this.state.site!}
            store={this.props.match.params.id}
          ></StoreServicesDetail>
        </Fragment>
      );
    };

    onRegisterUserOpenHandler() {
      const isInvited = this.state.user?.email === 'invited';
      if (isInvited) {
        this.setState({
          menu_is_open: true,
        });
        return;
      }
    }

    onSelectAutoPass = async () => {
      this.props.history.push(
        `/autopass/${this.props.match?.params?.id ?? localStorage.getItem('mall-selected')
        }`
      );
    };

    onSelectAutoScan = async () => {
      //return;
      // TODO: uncomment when ready
      this.props.history.push(
        `/autoscan/${this.props.match?.params?.id ?? localStorage.getItem('mall-selected')
        }`
      );
    };

    renderHOME_PARKING = () => {
      const { user } = this.state;

      return (
        <Fragment>
          <IonHeader></IonHeader>
          <IonContent className="parking-init">
            <div>
              <div className="parking-title">
                <img src={ParkingLogo} alt="parking logo" />
                <h2 className="font-bold">Selecciona uno de los servicios de Parking</h2>
              </div>
              <div>
                <div
                  onClick={() => {
                    user?.email !== 'invited'
                      ? this.onSelectAutoPass()
                      : this.onRegisterUserOpenHandler();
                  }}
                >
                  {' '}
                  {/*invited validation*/}
                  <img src={autoMoneyIcon} alt="icon-points"/>
                  <div>
                    <h3 className="font-bold">Registra tu patente</h3>
                    <p
                      dangerouslySetInnerHTML={{
                        __html: localize('MSJ_AUTOPASS'),
                      }}
                    />
                  </div>
                  <div>
                    <IonIcon icon={chevronForward}/>
                  </div>
                </div>

                <div
                  /* style={{opacity: 0.5}} */ onClick={() => {
                  user?.email !== 'invited'
                    ? this.onSelectAutoScan()
                    : this.onRegisterUserOpenHandler();
                }}
                >
                  <img src={qrIcon} alt="icon-points"/>
                  <div>
                    <h3 className="font-bold">Escanea tu ticket</h3>
                    <p
                      dangerouslySetInnerHTML={{
                        __html: localize('MSJ_AUTOSCAN'),
                      }}
                    />
                  </div>
                  {/* TODO: uncomment when ready */}
                  <div>
                    <IonIcon icon={chevronForward}/>
                  </div>
                </div>

                {
                  RemoteConfigClient.getBoolean(
                    'SHOW_BUTTON_CENCOSUD_POINTS',
                    false
                  ) &&
                  <div
                    onClick={() => {
                      this.props.history.push(`/cencosud-points`);
                    }}
                  >
                    <img src={pointsIcon} alt="icon-points"/>
                    <div>
                      <h3 className="font-bold">Paga con Puntos Cencosud</h3>
                      <p>Canjea tus puntos por minutos de estacionamiento libre.</p>
                    </div>
                    {/* TODO: uncomment when ready */}
                    <div>
                      <IonIcon icon={chevronForward}/>
                    </div>
                  </div>
                }
              </div>
            </div>

            {/*{RemoteConfigClient.getBoolean(*/}
            {/*  'SHOW_BUTTON_CENCOSUD_POINTS',*/}
            {/*  false*/}
            {/*) && (*/}
            {/*  <div className="cencosud-points">*/}
            {/*    <ButtonPoints*/}
            {/*      title="Paga con Puntos Cencosud"*/}
            {/*      subtitle="Canjea tus puntos por minutos de estacionamiento"*/}
            {/*      onClick={() => {*/}
            {/*        this.props.history.push(`/cencosud-points`);*/}
            {/*      }}*/}
            {/*    />*/}
            {/*  </div>*/}
            {/*)}*/}

            {/* {user?.email !== 'invited' ? <>
            {this.state.pointsModal ?
              <RegisterModal type="PLATE" userInfo={user} onClose={() => this.closeModalLoyalty()}
                onClick={() => { this.goToRegistry() }} />
              : null}
          </> : null} */}

            {/* {this.state.register_is_open ?
            <RegisterModal type="NEW" userInfo={user} onClose={() => this.onCloseRegisterUserModalHandler()}
              onClick={() => { this.onLoginClickHandler() }} />
            : null} */}
          </IonContent>
        </Fragment>
      );
    };


    renderHOME_FOOD = () => {
      return <Fragment></Fragment>;
    };

    renderEDIT_RUT = () => {
      return (
        <Fragment>
          <IonHeader className="over-modal">
            <div onClick={() => this.onBackToHome()}>
              <IonIcon icon={arrowBack} size="large" />
            </div>
          </IonHeader>
          <IonContent>
            <div>
              <h1>{localize('RUT_TITLE')}</h1>
              <p>{localize('RUT_DESCRIPTION')}</p>
            </div>
            <div>
              <input
                value={this.state.document_number}
                placeholder={'12345678-9'}
                onChange={(e) => {
                  this.onInputRUTChangeHandler(
                    'document_number',
                    e.currentTarget.value?.toString()!
                  ).then();
                }}
              />
              {!this.state.isValidStatesInputs.document_number ? (
                <p>Debes ingresar un RUT válido.</p>
              ) : null}
            </div>
          </IonContent>
          <IonFooter className="over-modal">
            <div className="pad-buttons">
              <IonButton
                disabled={!this.state.isValidStatesInputs.document_number}
                className="white-centered"
                onClick={() => {
                  this.onChangePostHandler(
                    'document_number',
                    this.state.document_number
                  ).then();
                }}
              >
                Continuar
              </IonButton>
            </div>
          </IonFooter>
        </Fragment>
      );
    };

    renderRUT_SCREEN = () => {
      return (
        <RutScreen
          title={'Necesitamos que ingreses tu RUT'}
          subtitle={'Esto es necesario para seguir con el proceso'}
          onBack={() => {
            this.setState({
              mode: 'HOME_ACTIVITIES',
            });
          }}
          onContinue={() => {
            this.setState({
              mode: 'HOME_ACTIVITIES',
              dni_is_valid: true,
            });
          }}
          onValue={(rut: string) => {
            eureka.info('Update rut', rut);
            this.setState((prev: any) => ({
              ...prev,
              user: { ...prev.user, document_number: rut },
            }));
            this.setState((prev: any) => ({
              ...prev,
              isValidStatesInputs: {
                ...prev.isValidStatesInputs,
                document_number: true,
              },
            }));
          }}
        />
      );
    };
  }
);
