import React, { RefObject, useEffect, useRef, useState } from 'react';
import {
  IonSearchbar,
  IonContent,
  IonIcon,
  IonLoading,
} from '@ionic/react';

/**
 * Styles
 */
import './index.less';

/**
 * Libs
 */
import Expr from '../../lib/Expr';

/**
 * Models
 */
import { IMerchant } from '../../models/merchants/IMerchant';
import { ISite } from '../../models/store-data-models/ISite';

/**
 * Clients
 */
import MerchantClient from '../../clients/MerchantClient';

/**
 * Components
 */
import CategoryList from '../category_list';
import SearchModal from '../search-store-modal';
import MerchantDetailModal from '../merchant_detail_modal';

/**
 * Assets
 */
import mas from '../../assets/media/icons/mas.svg';
import comida from '../../assets/media/icons/comida.svg';
import pharmacyIcon from '../../assets/media/icons/salud.svg';
import storeIcon from '../../assets/media/icons/tiendas.svg';
import foodCourt from '../../assets/media/icons/patio.svg';

import { SiteContext, useSiteContext } from '../../stores/site';
import UserClient from '../../clients/UserClient';
import { IUser } from '../../models/users/IUser';
import EventClient from '../../clients/EventClient';
import IEvent from '../../models/events/IEvent';
import CustomMap from '../lazarillo-map';
import { LazarilloMap } from '@lzdevelopers/lazarillo-maps';
import {Capacitor} from "@capacitor/core";

interface IProps {
  store: string;
  minLevels: number;
  maxLevels: number;
  onMenuClose: (action: boolean) => void;
  site: ISite;
  merchants?: IMerchant[];
  mapLoaded?: boolean;
  search_to_show: boolean;
  merchant?: IMerchant;
  onMerchantDetailModalClose: () => void;
  onSearchModalClose: () => void;
}

interface IState {
  mode: 'INITIAL_STATE' | 'MAP_LOADED';
  popover: boolean;
  data?: IMerchant;
  merchant?: IMerchant;
  // merchants?: Array<IMerchant>;
  levels?: string;
  merchant_to_show: boolean;
  search_to_show: boolean;
  loading: boolean;
  urlMapSvg?: string;
  searchText?: string;
  displayCategories?: boolean;
  subCategory?: string;
  user?: IUser;
  map?: LazarilloMap;
  isPropsLoaded: boolean;
}

class StoreMapDetailBody extends React.Component<IProps, IState> {
  _isMounted = false;
  state: IState = {
    mode: 'MAP_LOADED',
    popover: false,
    levels: '0',
    merchant_to_show: false,
    search_to_show: false,
    loading: true,
    displayCategories: false,
    isPropsLoaded: false
  };

  componentDidMount = async () => {
    this.setState({
      search_to_show: this.props.search_to_show,
      merchant_to_show: this.props.merchant !== undefined,
      data: this.props.merchant
    });

    this._isMounted = true;
    this.loadUserData();
  };

  componentDidUpdate(prevProps: Readonly<IProps>, prevState: Readonly<IState>) {
    if(!prevProps.search_to_show && this.props.search_to_show)
      this.setState({
        search_to_show: true,
        searchText: ""
      });
  }

  componentWillUnmount() {
    this._isMounted = false;
    this.destroy()
  }
  loadUserData = async () => {
    try {
      const user = await UserClient.me();
      this.setState({ ...this.state, user });
    } catch (e) {
        // todo!
    }
  }



  getSelectedMerchant = async (merchant: IMerchant) => {
    this.setState({
      search_to_show: false,
      displayCategories: false,
      popover: true,
      merchant,
      data: merchant,
    });
  };
  onHideMap() {
    console.log("Store-map-detail:: onHideMap")
    const {map} = this.state;
    map?.stopUpdatingTappedPlace()
    map?.destroy()
    this.setState({map: undefined})
  }

  merchantHandlerClose = () => {
    this.setState({ popover: false, merchant: undefined });
    this.state.map?.clearSelectedPlace();
  };

  onMerchantDetailClickHandler = async (merchant: IMerchant) => {

    EventClient.create({
      type : 'store.selection',
      details: {
        user_id: this.state.user?.primarysid,
        mail: this.state.user?.email,
        store: merchant.name,
        created_at: new Date(),
      }
    } as IEvent);

    this.setState({
      search_to_show: false,
      merchant_to_show: true,
      data: merchant,
    });
    this.onHideMap()
  };

  onMerchantDetailModalCloseHandler = () => {
    this.props.onMerchantDetailModalClose();
    this.props.onSearchModalClose();
    this.setState({
      mode: 'MAP_LOADED',
      merchant_to_show: false,
      search_to_show: false
    });
  };

  onCloseSearchModalHandler = () => {
    this.props.onSearchModalClose();

    this.setState({
      search_to_show: false,
      displayCategories: false,
    });
  };

  enableTap(lzMap: LazarilloMap | undefined = undefined){
    console.log("Store-map-detail:: enableTap")
    const map = lzMap || this.state.map;
    if(map) {
      console.log("Store-map-detail:: enableTap got map on state")
      const callback = (data: {placeId: string | undefined}) => {
        console.log(`callback:: ${data.placeId}`)
        const merchant = this.props.merchants?.find(m=> m.local === data.placeId)
        if (data.placeId && merchant) {
          console.log(`callback:: merchant found!!`)
          this.getSelectedMerchant(merchant)
        }else {
          map.clearSelectedPlace();
        }
      }
      map.startUpdatingTappedPlace(callback);
    }
  }

  prepareApp(map: LazarilloMap) {
    console.log("Store-map-detail:: prepareApp")
    const v = '--app-background-color';
    const old = getComputedStyle(document.documentElement).getPropertyValue(v);
    document.documentElement.style.setProperty(v, `${old}00`);
    this.enableTap(map);
  };
  destroy(){
    console.log("Store-map-detail:: destroy")
    const v = '--app-background-color';
    document.documentElement.style.removeProperty(v);
    const {map} = this.state;
    if (map){
      map.stopUpdatingTappedPlace()
      map.destroy()
    }
  }


  render() {
    const {
      mode,
      merchant_to_show,
      merchant,
      data,
      search_to_show,
      // merchants,
      displayCategories,
    } = this.state;
    const { site, } = this.props;

    const loading = this.state.loading;

    return (
      <SiteContext.Consumer>
        {({ state }) => (
          <>
            <IonContent
              forceOverscroll={false}
              className={`store-map-detail ${mode
                .replaceAll('_', '-')
                .toLocaleLowerCase()}`}
            >
              <div className="map">
                {
                  Capacitor.isNativePlatform() && !merchant_to_show && !search_to_show &&
                  <IonLoading
                    cssClass="my-custom-class mini-loading-text"
                    isOpen={loading}
                    message={'Cargando...'}
                  />
                }
                <div style={{width: "100%", paddingTop: "2px"}}>

                </div>
                <div>
                  {
                    Capacitor.isNativePlatform() && !merchant_to_show &&
                    <CustomMap
                      id="store-map-detail"
                      site={site}
                      showGps={false}
                      onError={ () => {
                        console.log("we got an error")
                      } }
                      onMapReady={
                        (map)=> {
                          console.log("map ready!")
                          this.setState({loading : false, map})
                          this.prepareApp(map)
                        }
                      }
                    />
                  }
                </div>

                {/* HACER DINÁMICO LA CARGA DE CATEGORÍAS EN EL MAPA */}

                {Expr.whenConditionRender(!search_to_show, () => {
                  return (
                    <div className="merchant-categories">
                      <div
                        onClick={() =>
                          this.setState({
                            search_to_show: true,
                            searchText: "Grandes Tiendas"
                          })
                        }
                      >
                        <IonIcon src={storeIcon}></IonIcon>
                        <br />
                        <span>
                          Grandes tiendas
                        </span>
                      </div>

                      <div
                        onClick={() =>
                          this.setState({
                            search_to_show: true,
                            searchText: "Gastronomía"
                          })
                        }
                      >
                        <IonIcon src={comida}></IonIcon>
                        <br />
                        <span>Gastronomía</span>
                      </div>

                      <div
                        onClick={() =>
                          this.setState({
                            search_to_show: true,
                            searchText: "Patio de comidas"
                          })
                        }
                      >
                        <IonIcon src={foodCourt}></IonIcon>
                        <br />
                        <span>Patio de comidas</span>
                      </div>

                      <div
                        onClick={() =>
                          this.setState({
                            search_to_show: true,
                            searchText: "Farmacias"
                          })
                        }
                      >
                        <IonIcon src={pharmacyIcon}></IonIcon>
                        <br />
                        <span>Farmacias</span>
                      </div>

                      <div
                        onClick={() =>
                          this.setState({
                            search_to_show: false,
                            searchText: "",
                            displayCategories: true,
                            subCategory: '',
                          })
                        }
                      >
                        <IonIcon src={mas}></IonIcon>
                        <br />
                        <span>Más</span>
                      </div>
                    </div>
                  );
                })}
              </div>
              {merchant_to_show ? (
                <MerchantDetailModal
                  merchant={data!}
                  merchants={state.merchants}
                  store={this.props.store}
                  onClose={this.onMerchantDetailModalCloseHandler}
                  user={this.state.user}
                />
              ) : null}
            </IonContent>
            <div
              className="popover-custom"
              style={{ display: this.state.popover ? '' : 'none' }}
              onClick={() =>
                this.merchantHandlerClose()
              }
            >
              <div
                className="merchant-popover"
              >
                <div>
                  <div>
                    <div
                      className="image-logo"
                      style={{ background: `url(${site.web}${merchant?.logo}` }}
                    />
                  </div>
                  <h1
                    dangerouslySetInnerHTML={{ __html: merchant?.name! }}
                  ></h1>
                  <p>{merchant?.category}</p>
                </div>
                <div>
                  <button
                    onClick={() => {
                      this.onMerchantDetailClickHandler(merchant!);
                    }}
                  >
                    Ver más
                  </button>
                </div>
              </div>
            </div>
            {/* MODAL TO SHOW FILTERED SEARCH */}

            {search_to_show && !displayCategories && !this.state.popover ? (
              <SearchModal
                site={this.props.site}
                autofocus={true}
                searchText={this.state.searchText}
                merchants={state.merchants ?? []}
                onClose={this.onCloseSearchModalHandler}
                onMerchantDetail={(e) => {
                  this.onMerchantDetailClickHandler(e);
                }}
                title={"¿A qué tienda deseas ir?"}
                paragraph={"Selecciona la tienda donde te gustaría ir como punto de destino"}
              ></SearchModal>
            ) : null}
            {displayCategories ? (
              <CategoryList
                site={this.props.site}
                onClose={this.onCloseSearchModalHandler}
                merchants={state.merchants ?? []}
                store={this.props.store}
                subCategory={this.state.subCategory}
                onMerchantDetail={(e) => {
                  this.onMerchantDetailClickHandler(e);
                }}
              ></CategoryList>
            ) : null}
          </>
        )}
      </SiteContext.Consumer>
    );
  }
}

const StoreMapDetail = (props: Omit<IProps, 'loading'>) => {
  const store = useSiteContext();

  const loadMerchants = async () => {
    try {
      const merchants = await MerchantClient.list(props.site.id);

      if (!merchants.data || merchants.data.length === 0) {
        return;
      }

      store.dispatch({
        type: 'setMerchants',
        payload: merchants.data.map(({ local, ...m }) => ({
          local:
            local || local?.trim() !== ''
              ? local
              : m.map.match(/^([A-Z0-9]+\_[A-Z0-9]+\_[A-Z0-9]+)\_*/)?.[1],
          ...m,
        })),
      });
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    loadMerchants();
    store.dispatch({
      type: 'setSite',
      payload: props.site,
    });
  }, [props.store]);

  return (
    <StoreMapDetailBody
      {...props}
      merchants={store.state.merchants}
    />
  );
};

export default StoreMapDetail;
