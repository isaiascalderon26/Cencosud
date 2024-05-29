import moment from 'moment';
import React, { Fragment } from 'react';
import { arrowBack } from 'ionicons/icons';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import {
  IonModal,
  IonContent,
  IonIcon,
  IonItem,
  IonLabel,
  isPlatform,
} from '@ionic/react';

/**
 * Styles
 */
import './index.less';

/**
 * Locales
 */
import locales from './locales';

/**
 * Libs
 */
import i18n from '../../lib/i18n';
import Menus from '../../lib/restaurantsMenu.json';
// import AlgoliaSearch from '../../lib/AlgoliaSearch';
import ComponentAnimations from '../../lib/Animations/ComponentAnimations';
import Analytics from '../../lib/FirebaseAnalytics';

/**
 * Models
 */
import { IMenus } from '../../models/merchants/IMenus';
import { IMerchant } from '../../models/merchants/IMerchant';
import { ISite } from '../../models/store-data-models/ISite';

/**
 * Clients
 */
import UserClient from '../../clients/UserClient';
import RemoteConfigClient from '../../clients/RemoteConfigClient';

/**
 * Components
 */
import BackdropLoading from '../backdrop-loading';

/**
 * Assets
 */
import verCarta from '../../assets/media/ver-carta.svg';
import DummyHeader from '../../assets/media/dummy/dummy-header.png';
import ComoLlegar from '../../assets/media/comollegar.png';

import MerchantRouting from '../merchant-how-to/index';
import MerchantOptionsBtn from './merchant-options-btn';
import { getPlaces } from '../../hooks/how-to/useGetMerchant';
import { IStorePlace, IMerchantPlace } from '../../models/how-to/place';
import EmptyModal from '../empty-modal';
import ErrorIcon from '../../assets/media/error-icon.svg';
import MissingPlaceError from '../merchant-how-to/missing-place-error';
import { isFeatureOn } from '../../lib/RemoteConfig/isFefatureOn';
import ErrorHandler from '../error-handler';
import { IUser } from '../../models/users/IUser';

const localize = i18n(locales);

interface IProps {
  onClose: (action: 'close') => void;
  merchant: IMerchant;
  store: string;
  merchants?: IMerchant[];
  user?: IUser
}

type Mode = 'INITIAL_STATE' | 'PAGE_LOADED' | 'HOW_TO';

type IError = 'missingPlace';

interface IState {
  mode: Mode;
  menus: Array<IMenus>;
  site?: ISite;
  retries: number;
  place?: IMerchant;
  error?: IError;
  loadingMerchantLocation?: boolean;
}

const { getMerchantPlace: getPlace } = getPlaces();

interface MerchantModeComponentProps {
  go_back: () => void;
  site: ISite;
  merchants?: IMerchant[];
}

type ModeHandler = {
  [key in Mode]?: (
    go_back: () => void,
    state: IState,
    props: IProps
  ) => React.ReactNode;
};

const modeHandler: ModeHandler = {
  HOW_TO: (go_back, state, props) =>
    state.site && state.place ? (
      <MerchantRouting
        go_back={go_back}
        site={state.site}
        merchant={state.place}
        merchants={props.merchants ?? []}
        user={props.user}
      />
    ) : (
      <></>
    ),
};

export default class MerchantDetailModal extends React.Component<
  IProps,
  IState
> {
  state: IState = {
    mode: 'INITIAL_STATE',
    menus: [],
    retries: 0,
  };


  componentDidMount = async () => {
    Analytics.customLogEvent("ionic_app", "lazarillo");

    await this.getSitesData();
    window.history.pushState(
      '',
      '',
      `/merchant-detail/${this.props.store}/${this.props.merchant.name}`
    );
  };

  getSitesData = async () => {
    const { merchant, store } = this.props;
    //let promotions : Array<any> = []
    let name = this.props.store;

    const menu = Menus.filter(
      (item) =>
        item.store.toLocaleLowerCase().trim() ===
          store.toLocaleLowerCase().trim() &&
        item.name.toLocaleLowerCase().trim() ===
          merchant.name.toLocaleLowerCase().trim()
    );

    try {
      const sites = await UserClient.getSites();
      // const index = RemoteConfigClient.get('ALGOLIA_INDEX_SHOPPING_PROMOTION_INFO', process.env.REACT_APP_ALGOLIA_INDEX_SHOPPING_PROMOTION_INFO);
      // promotions = await AlgoliaSearch.searchExact(`store:${this.props.store}`,[], 10,index) || [];
      const site = sites.data.find((site: ISite) => {
        return site.name === name;
      });

      this.setState({ menus: menu, mode: 'PAGE_LOADED', site });
    } catch (error) {
      console.log(error);
    }
  };

  onCloseModalHandler = async () => {
    this.props.onClose('close');
    window.history.pushState('', '', `/mall-home/${this.props.store}`);
  };

  onOpenHandler = (e: any, link?: string) => {
    e.preventDefault();
    window.open(link, '_blank');
  };

  /*  imageMapDecorator = (store: any, merchant: any) => {
    let path = '';
    switch(store.name) {
      case 'costanera center': path = 'https://mall.costaneracenter.cl/sites/ccenter/files/mapas_tiendas/'; break;
      case 'alto las condes': path = 'https://www.altolascondes.cl/sites/altolascondes/files/mapas_tiendas/'; break;
      case 'portal florida': path = 'https://www.floridacenter.cl/sites/floridacenter/files/mapas_tiendas/'; break;
      case 'portal el llano': path = 'https://www.portalelllano.cl/sites/pllano/files/mapas_tiendas/'; break;
      case 'portal temuco': path = 'https://www.portaltemuco.cl/sites/ptemuco/files/mapas_tiendas/'; break;
      case 'portal osorno': path = 'https://www.portalosorno.cl/sites/posorno/files/mapas_tiendas/'; break;
      case 'portal nunoa': path = 'https://www.portalnunoa.cl/sites/pnunoa/files/mapas_tiendas/'; break;
      case 'portal dehesa': path = 'https://www.portalladehesa.cl/sites/pladehesa/files/mapas_tiendas/'; break;
      case 'portal rancagua': path = 'https://www.portalrancagua.cl/sites/prancagua/files/mapas_tiendas/'; break;
      case 'portal la reina': path = 'https://www.portallareina.cl/sites/plareina/files/mapas_tiendas/'; break;
      case 'portal belloto': path = 'https://www.portalbelloto.cl/sites/pbelloto/files/mapas_tiendas/'; break;
    }

    return path + merchant.map + '.jpg';
  } */

  async getMerchantSpatialInfo(merchant: IMerchant) {
    try {
      // const place = await getPlace(merchant);
      const place = merchant
      if (place) this.setState({ place });
      else this.setState({ error: 'missingPlace' });
    } catch {
      this.setState({
        error: 'missingPlace',
      });
    }
  }

  async onHowToHandler() {
    const { merchant } = this.props;
    const { site } = this.state;

    //Analytics for button start indoor navigation
    Analytics.customLogEventName(
      'store_location',
      'Como llegar',
      site?.name ? site?.name : '',
      'PDP',
      'tiendas'
    );

    this.setState({
      loadingMerchantLocation: true,
    });

    await this.getMerchantSpatialInfo(merchant);

    if (this.state.site) {
      this.setState({
        mode: 'HOW_TO',
        loadingMerchantLocation: false,
      });
    } else {
      this.setState({
        loadingMerchantLocation: false,
      });
    }
  }

  go2Home() {
    this.setState({
      mode: 'PAGE_LOADED',
    });
  }

  render() {
    const { mode, error } = this.state;

    const body = modeHandler[mode];

    return (
      <IonModal
        enterAnimation={ComponentAnimations.enterAnimation}
        leaveAnimation={ComponentAnimations.leaveAnimation}
        swipeToClose={false}
        backdropDismiss={false}
        cssClass={`merchant-detail-modal ${mode
          .replaceAll('_', '-')
          .toLocaleLowerCase()}`}
        isOpen={true}
      >
        {body && this.state.site
          ? body(
              () => {
                this.go2Home();
              },
              this.state,
              this.props
            )
          : (() => {
              const customRender: Function = (this as any)[`render${mode}`];
              if (!customRender) {
                return <div>{mode}</div>;
              }
              return customRender();
            })()}
        {error == 'missingPlace' && (
          <MissingPlaceError
            onBack={() => {
              this.setState({
                error: undefined,
              });
              this.go2Home();
            }}
          />
        )}
      </IonModal>
    );
  }

  renderINITIAL_STATE = () => {
    return (
      <Fragment>
        <BackdropLoading message="Cargando..."></BackdropLoading>
      </Fragment>
    );
  };

  renderPAGE_LOADED = () => {
    const { merchant } = this.props;
    const { menus, site, error } = this.state;
    let image = merchant.photo.split(',');

    // Implement logic to show local open hours
    let IsOpen = false;
    let daysOpened = undefined;
    let oursOpened = undefined;

    const showMerchantBtn = isFeatureOn({
      android: 'ENABLE_ANDROID_LAZARILLO_MAP',
      ios: 'ENABLE_IOS_LAZARILLO_MAP',
    }, true);

    const opensTime =
      this.props.merchant.market_schedules &&
      this.props.merchant.market_schedules.length > 0
        ? this.props.merchant.market_schedules
        : undefined;

    if (opensTime && opensTime.length === 1) {
      daysOpened = opensTime[0].dias_txhorarios;
      oursOpened = opensTime[0].horas_txhorarios;
      const splitOursOpened = oursOpened.split(' ');
      const ourInit = moment(splitOursOpened[0], 'HH:mm');
      const ourEnd = moment(splitOursOpened[2], 'HH:mm');
      const ourNow = moment();
      IsOpen = ourNow.isBetween(ourInit, ourEnd);
    }

    return (
      <Fragment>
        <IonContent>
          <div
            className="merchant-photo"
            style={{
              background: image[0]
                ? `url(${site?.web}${image[0]})`
                : `url(${DummyHeader})`,
            }}
          ></div>
          <div
            onClick={() => { 
              this.onCloseModalHandler();
            }}
          >
            <IonIcon icon={arrowBack}></IonIcon>
          </div>
          <div>
            <div>
              <img src={`${site?.web}${this.props.merchant.logo}`} />
            </div>
          </div>
          <div>
            <div className="name-is-open">
              <h1 dangerouslySetInnerHTML={{ __html: merchant.name }} />
              {opensTime &&
              opensTime.length === 1 &&
              daysOpened &&
              oursOpened ? (
                IsOpen ? (
                  <p>
                    <span className="open">Abierto</span>
                  </p>
                ) : (
                  <p>
                    <span className="close">Cerrado</span>
                  </p>
                )
              ) : (
                ''
              )}
            </div>
            {opensTime &&
              opensTime.length > 0 &&
              opensTime.map((item) => {
                if (item.dias_txhorarios && item.horas_txhorarios) {
                  return (
                    <div className="days-ours-opened" key={""}>
                      <span>{item.dias_txhorarios}</span>
                      <span>{item.horas_txhorarios}</span>
                    </div>
                  );
                }
                return <></>;
              })}
          </div>
          <IonItem>
            <IonLabel>
              <div>Ubicación</div>
              <p>{`Nivel ${merchant.level}`}</p>
            </IonLabel>
          </IonItem>
          <IonItem>
            <IonLabel>
              <div>Categoría</div>
              <p>{merchant.category.join(', ') /*merchant.category*/}</p>
            </IonLabel>
          </IonItem>
          <IonItem>
            <IonLabel>
              <div>Web</div>
              <a
                href={merchant.web}
                target="_blank"
                style={{ color: '#0093CB', textDecoration: 'none' }} rel="noreferrer"
              >
                {merchant.web}
              </a>
            </IonLabel>
          </IonItem>
          {merchant.phone ? (
            <IonItem>
              <IonLabel>
                <div>Teléfono</div>
                <a
                  className=""
                  href={'tel:+' + merchant.phone.replace(/\D+/g, '')}
                  style={{ color: '#0093CB', textDecoration: 'none' }}
                >
                  {merchant.phone}
                </a>
              </IonLabel>
            </IonItem>
          ) : (
            ''
          )}
          {<div style={{ padding: 10 }}></div>}
          {menus[0] != undefined && menus[0].link_1 != '' ? (
            <MerchantOptionsBtn
              text="Ver carta"
              onClick={(e) => {
                this.onOpenHandler(e, menus[0].link_1);
              }}
              icon={<IonIcon src={verCarta} />}
            />
          ) : null}
          {showMerchantBtn && (
            <MerchantOptionsBtn
              text="Cómo llegar"
              loading={this.state.loadingMerchantLocation}
              icon={<img src={ComoLlegar} />}
              onClick={() => {
                this.onHowToHandler();
              }}
            />
          )}
        </IonContent>
      </Fragment>
    );
  };
}
