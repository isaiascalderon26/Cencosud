import { Storage } from '@capacitor/storage';
import React, { Fragment, Suspense } from 'react';
import { RouteComponentProps } from 'react-router';
import { addCircleOutline, notifications, arrowBack, chevronDown } from 'ionicons/icons';
import { withIonLifeCycle, IonPage, IonContent, IonIcon, IonSkeletonText, IonSlides, IonSlide, IonFooter, IonHeader, IonLoading, IonBadge, IonButton } from '@ionic/react';

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
import EurekaConsole from "../../lib/EurekaConsole";
import AlgoliaSearch from '../../lib/AlgoliaSearch';
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
import BannerClient, { IBanner, IMallBanners } from '../../clients/BannerClient';

/**
 * Components
 */
import UserMenu from '../../components/user-menu';
import ModalMapDetail from './components/modal-map';
import LocationMap from './components/location-map';
import Activities from './components/activity-section';
import Promotions from './components/promotion-section';
import RegisterModal from '../../components/register_modal';
import StoreMapDetail from '../../components/store-map-detail';
import MovieDetailModal from '../../components/movie_detail_modal';
import WidgetWrapper from './components/widget-wrapper';
import MerchantDetailModal from '../../components/merchant_detail_modal';
import StoreServicesDetail from '../../components/store-services-detail';

/**
 * Assets
 */
import iconUser from './../../assets/media/icon-user.svg';
import iconTwitter from './../../assets/media/icons/icon-twitter.svg';
import iconYoutube from './../../assets/media/icons/icon-youtube.svg';
import iconFacebook from './../../assets/media/icons/icon-facebook.svg';
import iconInstagram from './../../assets/media/icons/icon-instagram.svg';
import RestaurantDummy from './../../assets/media/dummy/rest-background.png'




const eureka = EurekaConsole({ label: "mall-home" });

const localize = i18n(locales);

interface IProps extends RouteComponentProps<{
  id: any
}> { }

export async function getStatusFromCache() {
  const cacheState = await Storage.get({ key: '@registerState' });
  if (cacheState && cacheState.value) {
    return JSON.parse(cacheState.value!);
  }
  return null;
}

interface IState {
  mode: "INITIAL_STATE" | "HOME_ACTIVITIES" | "HOME_MAP" | "HOME_SERVICES" | "EDIT_RUT" | "SAVED",
  buttonAct: string,
  menu_is_open: boolean,
  movie_is_open: boolean,
  rest_is_open: boolean,
  footer_show: boolean,
  location_map: boolean,
  restaurants: Array<any>
  restaurant?: any,
  movies: Array<IMovie>
  movie?: IMovie;
  user?: IUser;
  levels?: Array<number>,
  showLoyalty: boolean,
  document_number: string,
  show_store_image: boolean,
  isValidStatesInputs: {
    document_number: boolean
  },
  site?: ISite
  social_networks?: Record<string, string>,
  modal_is_open: boolean,
  icons_share_location?: Array<{type:string,state:boolean,url:string}>,
  dni_is_valid: boolean,
  banners: Array<IBanner>,
  widgets: Array<IWidget>
}

export default withIonLifeCycle(class MallPage extends React.Component<IProps, IState> {
  state: IState = {
    mode: "INITIAL_STATE",
    buttonAct: 'one',
    menu_is_open: false,
    location_map: false,
    footer_show: false,
    movie_is_open: false,
    rest_is_open: false,
    movies: [],
    restaurants: [],
    showLoyalty: false,
    document_number: "",
    show_store_image: true,
    isValidStatesInputs: {
      document_number: false,
    },
    modal_is_open: false,
    dni_is_valid: false,
    banners: [],
    widgets: []
  }

  ionViewWillEnter = () => {
    this.setState({
      mode: "INITIAL_STATE",
      buttonAct: 'one',
    })
  }

  ionViewDidEnter = async () => {

    await this.getAllActivities();

    await this.getIconsShareLocation();

    await this.getBanners();

  }

  goToParkingPage = () => {
    EventStreamer.emit('NAVIGATE_TO', `/parking/${this.props.match.params.id}`)
  }

  getIconsShareLocation = async () => {

    const data  = await LocationsClient.getLocation(this.props.match.params.id);

    this.setState({
      icons_share_location: data
    })
  }

  getAllActivities = async () => {
    const name = this.props.match.params.id;
    let cineId;
    let movies: Array<IMovie> = [];
    let levels: any = [];

    try {
      const myInfo = await UserClient.me();
      const sites = await UserClient.getSites();
      const site = sites.data.find((site: ISite) => { return site.name === name });

      if (site) {
        cineId = site.meta_data.cineId;
        levels = site.meta_data.levels;
      }

      const { social_networks, footerMenuShow } = site.meta_data;

      if (cineId) {
        const index = RemoteConfigClient.get('ALGOLIA_INDEX_SHOPPING_MOVIES_INFO', process.env.REACT_APP_ALGOLIA_INDEX_SHOPPING_MOVIES_INFO);
        movies = await AlgoliaSearch.searchExact(cineId, [`code_store:${cineId}`], 8, index) || [];
      }
      const index = RemoteConfigClient.get('ALGOLIA_INDEX_SHOPPING_MERCHANTS_INFO', process.env.REACT_APP_ALGOLIA_INDEX_SHOPPING_MERCHANTS_INFO);
      let restaurants: Array<any> = await AlgoliaSearch.search(name, 'Restaurant', 12, index) || [];
      if(!this.state.menu_is_open){
        this.getLoyalty();
      }

      restaurants = restaurants.filter((restaurant: any) => { return restaurant.photo !== '' });
      restaurants.sort(function () { return Math.random() - 0.5 });

      let length = restaurants.length;
      let difference = restaurants.length % 8;

      if(length < 8) {
        length = 4;
      } else {
        length = length - difference;
      }

      restaurants = restaurants.slice(0, length);

      //flag to show footer menu to load page
      const flag = !!(footerMenuShow === undefined || footerMenuShow);

      this.setState({
        mode: 'HOME_ACTIVITIES',
        restaurants,
        movies,
        user: myInfo,
        footer_show: flag,
        levels,
        social_networks,
        site
      })
    } catch (error) {
      console.log(error)
    }
  }
  onLoading() {
    return (<IonLoading
      cssClass='my-custom-class'
      isOpen
      message={'Cargando...'}
    />)
  }
  onGoBackToStores() {
    SettingsClient.remove("SELECTED_MALL");
    this.props.history.push('/');
  }

  onMenuButtonsHiddeHandler = (e: boolean) => {
    this.setState({
      footer_show: e
    })
  }
  onCloseModalHandler = () => {
    this.setState({
      menu_is_open: false,
      movie_is_open: false,
      rest_is_open: false,
      location_map: false,
      modal_is_open: false
    })
  }
  onCloseRegisterModalHandler = async () => {
    Storage.set({
      key: '@registerState',
      value: JSON.stringify({register: false, date: new Date().getDate() + 2})
    });
    getStatusFromCache();
    this.setState({
      showLoyalty: false
    })
  }

  onClick = () => {
    this.setState({
      showLoyalty: false,
      mode: "EDIT_RUT"
    });
  }
  onOpenNotifications() {
    const isInvited = this.state.user?.email === 'invited'
    if (isInvited) {
      this.setState({
        menu_is_open: true,
      })
      return;
    }
    this.showNotificationsPage();
  }
  showNotificationsPage = async () => {
    console.log("please show notifications page");
    this.props.history.push(`/notifications`);
  }
  onMenuOpenHandler() {
    this.setState({
      menu_is_open: true,
    })
  }
  onOpenMovieHandler = (movie: any) => {
    this.setState({
      movie,
      movie_is_open: true
    })
  }

  onOpenRestMerchantHandler = (merchant: any) => {
    this.setState({
      restaurant: merchant,
      rest_is_open: true
    })
  }

  getLoyalty = async () => {
    const loyaltyUser = await LoyaltyClient.getLoyalty();
    const loyaltyReg = await getStatusFromCache();
    let date = new Date();
    if(loyaltyReg) {
      this.setState({
        showLoyalty: !loyaltyUser.data.loyaltyDocumentNumber && (loyaltyReg.date == date.getDate())
      });
      return
    }
    this.setState({
      showLoyalty: !loyaltyUser.data.loyaltyDocumentNumber
    })
  }
  onLoginClickHandler = async () => {
    await AuthenticationClient.signOut();
    window.location.reload();
  }

  onChangePostHandler = async (name: keyof IState, value: string) => {
    try {
      await UserClient.update(name, DniFormatter.clean(value).toUpperCase());

      this.setState({
        mode: "HOME_ACTIVITIES",
        showLoyalty: false,
        show_store_image: true,
        buttonAct: 'one',
        footer_show: true,
        dni_is_valid: true
      });
    } catch (error) {
      console.log(error);
    }
  }

  onBackToHome = async () => {

      this.setState({
        mode: "HOME_ACTIVITIES",
        showLoyalty: false,
        show_store_image: true,
        buttonAct: 'one',
        footer_show: true,

      });
  }

  onInputChangeHandler = (key: string, value: string) => {
    const newState: any = {};
    newState[key] = value;
    this.setState(newState)
  }

  getBanners = async () => {
    const { site } =  this.state;
    let data = await BannerClient.getBannersHome() as any;
    let mallBanners: IMallBanners = data?.filter((item:IMallBanners) => item?.id === site?.id)[0];
    this.setState({ banners: mallBanners.banners });
  }

  onGetBannerByIdHandler = (id: string): IBanner => {
    const { banners } = this.state;
    return banners.filter((banner: IBanner) => banner.id === id)[0];
  }

  onInputRUTChangeHandler = async (name: keyof IState, value: any) => {
    // Validate according to the field
    const isValids = Object.assign(this.state.isValidStatesInputs, {});
    if (value !== undefined) {
      switch (name) {
        case "document_number":
          isValids.document_number = DniFormatter.isRutValid(value);
          break;
        default:
          return;
      }
    }
    const newState: any = {
      isValidStatesInputs: isValids
    };
    newState[name] = value;
    this.setState(newState);
  }

  decorate = (id: string) => {
    switch(id) {
      case 'portal florida': return 'florida center';
      case 'portal dehesa': return 'portal la dehesa';
      case 'portal nunoa': return 'portal ñuñoa';
    }
    return id;
  }

  onBannerhandler = (dni?:string) => {
    const { site } = this.state;
    const banner = this.onGetBannerByIdHandler('BANNER-DAY-MOM');
    if(this.state.user?.email != 'invited'){
      if((dni && dni != '') || this.state.dni_is_valid ) {
        const url = banner.url;
        Expr.whenInNativePhone(async () => {
          Analytics.customLogEventName("banner", banner.title, site?.name ? site?.name : "", "home", "activaciones");


          window.open(url, "_blank")


        });
        Expr.whenNotInNativePhone(() => {
          window.open(url, "_blank")
        })
      }else{
        this.setState({
          mode: "EDIT_RUT"
        });
      }
    }else{
      this.setState({
        menu_is_open: true
      });
    }
  }

  onUpdateRut = (rut:string) => {
    this.setState((prev: any) => ({ ...prev, user: { ...prev.user, document_number: rut } }));
  }

  render() {
    console.log(this.props.history)
    const { user, restaurant, rest_is_open, footer_show, mode, menu_is_open, movie_is_open, movie, location_map, modal_is_open } = this.state;
    let storeName = this.props.match.params.id.replace(/\s/g, '')
    let headerBrand;
    try{
      headerBrand = [RemoteConfigClient.get('MALL_BRAND')] as Record<string,any>;
    }
    catch(error){
      headerBrand = undefined;
    }
    const idSite = this.state.site?.id;
    const headerBrandName = headerBrand ? headerBrand[0][`${idSite}`]?.URL : undefined;

    return <IonPage className={`mall-page ${mode.replace(/_/ig, '-').toLowerCase()}`}>
      {headerBrandName ? <div className="logo-brand-mall"><img src={headerBrandName} /></div> : null}
      {this.state.show_store_image ?
        <IonHeader>
          <div>
            <div onClick={() => { this.onGoBackToStores() }}>
            <img className="day" src={`${process.env.REACT_APP_BUCKET_URL}/logo/${storeName}-light.png`}></img>
            <IonIcon className="chevron" src={chevronDown} />
            </div>
            {footer_show || this.state.site?.meta_data.footerMenuShow != undefined ? <div>
              <IonIcon src={notifications} onClick={() => {
                this.onOpenNotifications();
              }} />
              <IonIcon src={iconUser} onClick={() => {
                this.onMenuOpenHandler();
              }} />
            </div> : null}
          </div>
        </IonHeader>
        : null}
      {(() => {
        const customRender: Function = (this as any)[`render${mode}`];
        if (!customRender) {
          return <div>{mode}</div>;
        }
        return customRender();
      })()}
      {footer_show ? <IonFooter>
        <div>
          <button className={this.state.buttonAct == 'one' ? 'button-act' : ''} onClick={() => {
            this.setState({ buttonAct: 'one', mode: "HOME_ACTIVITIES" })
          }}>Explorar</button>
          <button className={this.state.buttonAct == 'two' ? 'button-act' : ''} onClick={() => {
            this.setState({ buttonAct: 'two', mode: "HOME_MAP" })
          }}>Tiendas</button>
          <button className={this.state.buttonAct == 'three' ? 'button-act' : ''} onClick={() => {
            this.setState({ buttonAct: 'three', mode: "HOME_SERVICES" })
          }}>Servicios</button>
        </div>
        <div className={`indicator ${this.state.buttonAct}`}></div>
        <div className='background-footer'></div>
      </IonFooter> : null}
      {rest_is_open ? <MerchantDetailModal onClose={this.onCloseModalHandler} merchant={restaurant} store={this.props.match.params.id}></MerchantDetailModal> : null}
      {menu_is_open ? <>
        {user?.email == 'invited' ?
          <RegisterModal type="NEW" userInfo={this.state.user} onClose={this.onCloseModalHandler} onClick={this.onLoginClickHandler} />
          : <UserMenu store={this.props.match.params.id} onClose={this.onCloseModalHandler} />}
      </> : null}


      {user?.email !== 'invited' ? <>
        {this.state.showLoyalty ?
          <RegisterModal type="CI" userInfo={this.state.user} onClose={this.onCloseRegisterModalHandler}
            onClick={this.onClick} />
          : null}
      </> : null
      }
      {movie_is_open ? <MovieDetailModal onClose={this.onCloseModalHandler} movie={movie}></MovieDetailModal> : null}
      {location_map ? <LocationMap onClose={this.onCloseModalHandler} store={this.props.match.params.id}></LocationMap> : null}
      {modal_is_open ? <ModalMapDetail onClose={this.onCloseModalHandler} modal_is_open={modal_is_open} site={this.state.site} icons_share_location={this.state.icons_share_location} /> : null}
    </IonPage>
  }
  renderINITIAL_STATE = () => {
    return <Fragment>
      <IonContent>
        <div style={{ padding: '0 24px', width: '100%' }}>
          <IonSkeletonText style={{ height: "18px", width: "40%", borderRadius: "12px", marginTop: "19px" }} animated={true}></IonSkeletonText>
          <IonSkeletonText style={{ height: "128px", width: "100%", borderRadius: "12px", marginTop: "19px" }} animated={true}></IonSkeletonText>
          <IonSkeletonText style={{ height: "18px", width: "40%", borderRadius: "12px", marginTop: "19px" }} animated={true}></IonSkeletonText>
          <IonSkeletonText style={{ height: "184px", width: "100%", borderRadius: "12px", marginTop: "19px" }} animated={true}></IonSkeletonText>
          <IonSkeletonText style={{ height: "18px", width: "40%", borderRadius: "12px", marginTop: "19px" }} animated={true}></IonSkeletonText>
          <IonSkeletonText style={{ height: "128px", width: "100%", borderRadius: "12px", marginTop: "19px" }} animated={true}></IonSkeletonText>
        </div>
      </IonContent>
    </Fragment>
  }
  renderHOME_ACTIVITIES = () => {
    const { movies, restaurants, social_networks, site } = this.state
    let storeName = this.props.match.params.id.replace(/\s/g, '')
    let mapa = `${process.env.REACT_APP_BUCKET_URL}/drive-map/${storeName}.jpg`
    let url = 'http://www.skycostanera.cl/es/inicio/'
    const slideOpts = {
      slidesPerView: 'auto',
      zoom: false,
      grabCursor: true
    };

    return <Fragment>
      <IonContent>
        {/* Banner Autopass */}
        <div>
          {Expr.whenConditionRender(site?.meta_data.parking, () => {
            return (
              <Fragment>
                <div onClick={() => { this.goToParkingPage() }}>
                  <h3 className="font-bold">{localize('AUTOPASS')}</h3>
                  <div className="banner-box">
                    <img className="banner-autopass" src={`${process.env.REACT_APP_BUCKET_URL}/banners/banner_pago_parking.jpeg`} />
                    </div>
                </div>
              </Fragment>
            )
          })}
        </div>

        {/* Actividades */}
        <Activities {...this.props}></Activities>

        {/* Banner mall games */}
        {<div>
          {Expr.whenConditionRender(this.onGetBannerByIdHandler('BANNER-GAMES') && this.onGetBannerByIdHandler('BANNER-GAMES').flag, () => {
            const banner = this.onGetBannerByIdHandler('BANNER-GAMES');
            return (
              <Fragment>
                <div onClick={() => this.props.history.push(`/challenge/${this.props.match.params.id}`)}>
                  <h3 className="font-bold">{banner.title}</h3>
                  <div className="banner-box-promotions">
                    <img className="banner-promotions" src={banner.image} />
                  </div>
                </div>
              </Fragment>
            )
          })}
        </div>}

        {/* Banner day of mom */}
        {<div>
          {Expr.whenConditionRender(this.onGetBannerByIdHandler('BANNER-DAY-MOM') && this.onGetBannerByIdHandler('BANNER-DAY-MOM').flag, () => {
            const banner = this.onGetBannerByIdHandler('BANNER-DAY-MOM');
            return (
              <Fragment>
                <div onClick={() => { this.onBannerhandler(this.state.user?.document_number) }}>
                  <h3 className="font-bold">{banner.title}</h3>
                  <div className="banner-box-promotions">
                    <img className="banner-promotions" src={banner.image} />
                  </div>
                </div>
              </Fragment>
            )
          })}
        </div>}

        {/* Banner Costanera Sky */}
        <div>
          {Expr.whenConditionRender(this.props.match.params.id === 'costanera center', () => {
            return (
              <Fragment>
                <div onClick={() => {
                    /**
                     * if the SkyCostanera property is defined as true in the site metadata
                     */
                    if(site?.meta_data.skyCostanera?.app){
                      this.props.history.push(`/sky-costanera/${this.props.match.params.id}`)
                    }else{
                      window.open(url, "_blank");
                    }
                  }}>
                  <h3 className="font-bold">{localize('SKY_COSTANERA')}</h3>
                  <img src={`${process.env.REACT_APP_BUCKET_URL}/banners/costanera-sky.jpeg`} />
                </div>
              </Fragment>
            )
          })}
        </div>

        {/* Promociones */}
        <Promotions {...this.props } site={site!}  onUpdateRut={this.onUpdateRut} ></Promotions>

        {/* Cartelera Cines */}
        <div>
          {Expr.whenConditionRender(movies!.length > 0, () => {
            return (
              <Fragment>
                <h3 className="font-bold">{localize('CINE')}</h3>
                <IonSlides options={slideOpts}>
                  {movies?.map((movie: IMovie) => {
                    return (
                      <IonSlide key={movie.objectID} onClick={() => { this.onOpenMovieHandler(movie); console.log(movie) }}>
                        <img src={movie.posterUrl}></img>
                      </IonSlide>
                    )
                  })}
                  <IonSlide className='extend-info' onClick={() => this.props.history.push(`/movies/${this.props.match.params.id}`)}>
                    <div>
                      <IonIcon icon={addCircleOutline}></IonIcon>
                      <h3 className='font-bold'>Ver más</h3>
                    </div>
                  </IonSlide>
                </IonSlides>
              </Fragment>
            )
          })}
        </div>
        <div>
          {Expr.whenConditionRender(restaurants!.length > 0, () => {
            return (
              <Fragment>
                <div>
                  <h3 className="font-bold">
                    {localize('VISIT')}
                  </h3>
                </div>
                <div>
                  <div style={{width: 320*restaurants.length/2}}>
                    {
                      restaurants?.map((restaurant) => {
                        let image = restaurant.photo.split(',')
                        const img = image.length ? site?.web + image[0] : restaurant.photoAlt
                        return (
                          image[0] ? <div onClick={() => { this.onOpenRestMerchantHandler(restaurant) }} key={restaurant.objectID}>
                            <div className="restaurant-box">
                              {img}
                              <img className="restaurant-dummy" src={RestaurantDummy}/>
                              <img className="restaurant-bg" src={img} onError={(event) => event.currentTarget.style.display = 'none'} />
                              <div className="restaurant-shadow"></div>
                              <IonBadge color="dark">Nivel {restaurant.level}</IonBadge>
                              <p dangerouslySetInnerHTML={{ __html: restaurant.name }}></p>
                            </div>
                          </div> : null
                        )
                      })}
                  </div>
                </div>
              </Fragment>
            )
          })}
        </div>
        <Suspense fallback={this.onLoading()}>
          <div onClick={() => this.setState({ modal_is_open: true })}>
            <h3 className="font-bold map-title">
              <span>{`${localize('SITE_MAP')}`}</span>
              <span>{this.decorate(this.props.match.params.id)}</span>
            </h3>
            <div className="map-box">
              <div className="mapa-home" style={{backgroundImage: `url(${mapa})`}}>
              <div className="trigger">Más información</div>
            </div>
            </div>
          </div>
        </Suspense>

        <div>
          {social_networks?.instagram && social_networks?.instagram !== '' ? <IonIcon onClick={() => window.open(social_networks?.instagram, "_blank")} icon={iconInstagram}></IonIcon> : null}
          {social_networks?.facebook && social_networks?.facebook !== '' ? <IonIcon onClick={() => window.open(social_networks?.facebook, "_blank")} icon={iconFacebook}></IonIcon> : null}
          {social_networks?.twitter && social_networks?.twitter !== '' ? <IonIcon onClick={() => window.open(social_networks?.twitter, "_blank")} icon={iconTwitter}></IonIcon> : null}
          {social_networks?.youtube && social_networks?.youtube !== '' ? <IonIcon onClick={() => window.open(social_networks?.youtube, "_blank")} icon={iconYoutube}></IonIcon> : null}
        </div>

      </IonContent>
    </Fragment >;
  }

  renderHOME_MAP = () => {
    return <Fragment>
      <StoreMapDetail
        search_to_show={false}
        site={this.state.site!}
        store={this.props.match.params.id}
        minLevels={this.state.levels![0]}
        maxLevels={this.state.levels![1]}
        onMenuClose={this.onMenuButtonsHiddeHandler}
        onMerchantDetailModalClose={() => {}}
        onSearchModalClose={() => {}}
      />
    </Fragment>
  }

  renderHOME_SERVICES = () => {
    return <Fragment>
      <StoreServicesDetail  site={this.state.site!} store={this.props.match.params.id}></StoreServicesDetail>
    </Fragment>
  }

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
            <input value={this.state.document_number} placeholder={'12345678-9'} onChange={e => {
              this.onInputRUTChangeHandler('document_number', e.currentTarget.value?.toString()!)
            }} />
            {!this.state.isValidStatesInputs.document_number ? <p>Debes ingresar un RUT válido.</p> : null}
          </div>
        </IonContent>
        <IonFooter className="over-modal">
          <div className='pad-buttons'>
            <IonButton disabled={!(this.state.isValidStatesInputs.document_number)}
              className='white-centered'
              onClick={() => { this.onChangePostHandler('document_number', this.state.document_number) }}>
              Continuar
            </IonButton>
          </div>
        </IonFooter>
      </Fragment>

    )
  }
}
)
