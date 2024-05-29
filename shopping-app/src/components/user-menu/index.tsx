import React, { Fragment } from 'react';
import './index.less';
import { IonModal, IonContent, IonFooter, IonButton, IonHeader, IonIcon, IonAlert, withIonLifeCycle, IonImg } from '@ionic/react';
import { App } from '@capacitor/app';
import i18n from '../../lib/i18n';
import locales from './locales';
import Expr from '../../lib/Expr';
import AuthenticationClient from '../../clients/AuthenticationClient';
import DeveloperClient from '../../clients/DeveloperClient';
import { arrowBack, chevronForward, heartSharp, personSharp, card, ticket } from 'ionicons/icons';
import { IUser } from '../../models/users/IUser';
import iconUser from './../../assets/media/icon-user.svg';
import parking from './../../assets/media/user-parking-icon.svg';
import helpIcon from './../../assets/media/icons/ayuda.svg';
import iconNew from './../../assets/media/new.svg';
import foodieIcon from './../../assets/media/foodie/foodie-menu.svg';
import puntosCencosudIcon from './../../assets/media/icons/puntosCencosudIcon.svg'
import couponDiscountIcon from './../../assets/media/coupons-discounts/icon-coupon-discount.svg';
import scheduledEventsIcon from './../../assets/media/scheduled-events.svg';
import ProfileDetail from './../profile_detail_modal';
import InterestedDetail from '../interested_detail_modal';
import FAQDetailPage from '../faq-detail';
import CardsPatentsPage from '../cards-patents-modal';
import TicketsPage from '../../pages/sky-costanera-tickets-flow';
import UserClient from '../../clients/UserClient';
import ComponentAnimations from '../../lib/Animations/ComponentAnimations';
import SettingsClient from '../../clients/SettingsClient';
import { withRouter, RouteComponentProps } from 'react-router';
import EventStreamer from '../../lib/EventStreamer';
import RemoteConfigClient from '../../clients/RemoteConfigClient';
import FoodieClient from '../../clients/FoodieClient';
import Analytics from '../../lib/FirebaseAnalytics';

import myServicesIcon from './../../assets/media/svg/illustrated/movies-header-icon.svg';
import { checkIfMallContainsFoodie } from '../../pages/new-mall-home';


const localize = i18n(locales);

interface IProps extends RouteComponentProps {
  onClose: () => void;
  store: string
}
type Modes = "INITIAL_STATE" | "PAGE_LOADED" | "PROFILE_DETAIL" | "INTERESTED_DETAIL" | "FAQ_DETAIL" | "METHODS_PAYMENT_PATENTS" | "CARS_PATERNS" | "TICKETS_DETAIL";
interface IState {
  mode: Modes
  confirm?: {
    message: string,
    onConfirm: () => void
  },
  appVersion?: string
  user?: IUser
  foodieAvailable: boolean
}

export default withRouter(class UserMenu extends React.Component<IProps, IState> {
  state: IState = {
    mode: "INITIAL_STATE",
    foodieAvailable: false
  }

  onCloseModalHandler = async () => {
    this.props.onClose();
  }

  componentDidMount = async () => {
    Analytics.customLogEventName('screen_view', 'perfil', this.props.store, 'perfil home', 'perfil', 'registrado')
    await this.getInfo();
  }

  onSignOutClickHandler = async () => {
    Analytics.customLogEventName('button', 'cerrar sesion', this.props.store, 'perfil home', 'perfil', 'registrado')
    this.setState({
      confirm: {
        message: localize('ALERT_SIGN_OUT_LABEL'),
        onConfirm: async () => {
          SettingsClient.remove("SELECTED_MALL");
          await AuthenticationClient.signOut();
          window.location.reload();
        }
      },
      appVersion: '0.0'
    });
  }

  onLoginClickHandler = async () => {
    await AuthenticationClient.signOut();
    window.location.reload();
  }
  
  getInfo = async () => {
    const user = await UserClient.me();
    const isFoodieAvailable = checkIfMallContainsFoodie(user.mall_selected.name);
    
    Expr.whenInNativePhone(async () => {
      const appInfo = await App.getInfo();
      this.setState({
        appVersion: appInfo!.version,
        user,
        mode: "PAGE_LOADED",
        foodieAvailable: isFoodieAvailable
      })
    })
    Expr.whenNotInNativePhone(async () => {
      this.setState({
        appVersion: '0.0',
        user,
        mode: "PAGE_LOADED",
        foodieAvailable: isFoodieAvailable
      })
    })
  }

  // this method doesn't use because it replaces for the checkIfMallContainsFoodie method
  isFoodieAvailable = async (currentUser: IUser) => {
    const whiteList = await FoodieClient.listWhitelist()
    console.log('whiteList for foodie: ', whiteList)
    console.log('current user email: ', currentUser.email)
    if (whiteList.includes('*') || whiteList.includes(currentUser.email)) {
      return true;
    }
    return false;
  }

  render() {
    const { mode } = this.state;
    return <Fragment>
      {(() => {
        const customRender: Function = (this as any)[`render${mode}`];
        if (!customRender) {
          return <div>{mode}</div>;
        }
        return customRender();
      })()}
    </Fragment>
  }

  renderINITIAL_STATE = () => {
    return (
      <Fragment />
    )
  }

  renderPAGE_LOADED = () => {
    const { confirm, appVersion: version } = this.state;
    let nameStr = this.state.user!.full_name.split(' ');
    return (
      <IonModal enterAnimation={ComponentAnimations.enterAnimation} leaveAnimation={ComponentAnimations.leaveAnimation} swipeToClose={false} backdropDismiss={false} cssClass="user-full-menu" isOpen={true}>
        <IonHeader>
          <div>
            <IonIcon icon={arrowBack} onClick={() => this.onCloseModalHandler()}></IonIcon>
          </div>
        </IonHeader>
        <IonContent className="user-info">
          {AuthenticationClient.hasRole('app_user')
            ? <Fragment>
              <div>
                <h2 className="font-bold">Inicia sesión para poder personalizar tu perfil y disfrutar de muchos beneficios.</h2>
              </div>
            </Fragment>
            : <Fragment>
              <div>
                {/* USER INFO DATA */}
                <div className='user-data'>
                  <div className='user-avatar-wrapper'>
                    <img src={this.state.user?.avatar ? this.state.user.avatar : iconUser} alt="avatar" />
                  </div>
                  <div>
                    <h1>{`¡Hola, ${nameStr[0]}!`}</h1>
                    <p>{this.state.user?.email}</p>
                  </div>
                </div>

                {/* SHORTCUTS CARD */}
                <section className='shortcuts-card'>
                  <div className='shortcut' onClick={() => {
                    this.setState({ mode: 'PROFILE_DETAIL' });
                    Analytics.customLogEventName('button', 'informacion personal', this.props.store, 'perfil home', 'perfil', 'registrado');
                  }}>
                    <div className='icon-wrapper'>
                      <IonIcon icon={personSharp}></IonIcon>
                    </div>
                    <label>Información personal</label>
                  </div>
                  <div className='shortcut' onClick={() => {
                    this.setState({ mode: 'INTERESTED_DETAIL' });
                    Analytics.customLogEventName('button', 'intereses', this.props.store, 'perfil home', 'perfil', 'registrado');
                  }}>
                    <div className='icon-wrapper'>
                      <IonIcon icon={heartSharp}></IonIcon>
                    </div>
                    <label>Mis intereses</label>
                  </div>
                  <div className='shortcut' onClick={() => {
                    Analytics.customLogEventName('button', 'medios de pago', this.props.store, 'perfil home', 'perfil', 'registrado')
                    this.props.onClose();
                    this.props.history.push('/cards')
                  }}>
                    <div className='icon-wrapper'>
                      <IonIcon icon={card}></IonIcon>
                    </div>
                    <label>Medios de pago</label>
                  </div>
                  <div className='shortcut' onClick={() => {
                    this.setState({ mode: "FAQ_DETAIL" });
                    Analytics.customLogEventName('button', 'ayuda', this.props.store, 'perfil home', 'perfil', 'registrado');
                  }}>
                    <div className='icon-wrapper'>
                      <IonIcon icon={helpIcon}></IonIcon>
                    </div>
                    <label>Centro de ayuda</label>
                  </div>
                </section> 

              </div>

              {/* */}

              <div className='my-services-header'>
                <IonIcon src={myServicesIcon} className='my-services-icon' />
                <p>Mis servicios</p>
              </div>

              <div className='my-menus-options'>
                <div onClick={() => { this.setState({ mode: "TICKETS_DETAIL" }); Analytics.customLogEventName('button', 'tickets', this.props.store, 'perfil home', 'perfil', 'registrado') }}>
                  <div>
                    <IonIcon icon={ticket}></IonIcon>
                    <p>Tickets</p>
                  </div>
                  <IonIcon icon={chevronForward}></IonIcon>
                </div>

                {
                  RemoteConfigClient.getBoolean('SHOW_BUTTON_CENCOSUD_POINTS', false)
                  &&
                  <div onClick={() => {
                    Analytics.customLogEventName('button', 'puntos cencosud', this.props.store, 'perfil home', 'perfil', 'registrado')
                    this.props.onClose();
                    this.props.history.push(`/cencosud-points/`)
                  }}>
                    <div>
                      <IonIcon icon={puntosCencosudIcon}></IonIcon>
                      <p>Puntos Cencosud</p>
                    </div>
                    <div className="tag-new"><IonIcon icon={iconNew}></IonIcon></div>
                    <IonIcon icon={chevronForward}></IonIcon>
                  </div>
                }

                {
                  RemoteConfigClient.getBoolean('SHOW_BUTTON_AUTOPASS', true)
                  &&
                  <div onClick={() => {
                    Analytics.customLogEventName('button', 'puntos cencosud', this.props.store, 'perfil home', 'perfil', 'registrado')
                    this.props.onClose();
                    this.props.history.push(`/autopass/` + this.props.store)
                  }}>
                    <div>
                      <IonIcon icon={parking}></IonIcon>
                      <p>Registra tu patente</p>
                    </div>
                    <IonIcon icon={chevronForward}></IonIcon>
                  </div>
                }



                {
                  RemoteConfigClient.getBoolean('SHOW_BUTTON_SCHEDULED_EVENTS', false)
                  &&
                  <div onClick={() => {
                    Analytics.customLogEventName('button', 'eventos agendados', this.props.store, 'perfil home', 'perfil', 'registrado')
                    this.props.onClose();
                    this.props.history.push(`/scheduled-events/${this.props.store}`)
                  }}>
                    <div>
                      <IonIcon icon={scheduledEventsIcon}></IonIcon>
                      <p>Mis eventos y actividades</p>
                    </div>
                    <IonIcon icon={chevronForward}></IonIcon>
                  </div>
                }

                <div onClick={() => {
                  Analytics.customLogEventName('button', 'cupones y descuentos', this.props.store, 'perfil home', 'perfil', 'registrado')
                  this.props.onClose();
                  this.props.history.push(`/coupon`)
                }}>
                  <div>
                    <IonIcon icon={couponDiscountIcon}></IonIcon>
                    <p>Cupones y descuentos</p>
                  </div>
                  <IonIcon icon={chevronForward}></IonIcon>
                </div>

                
                {this.state.foodieAvailable &&
                  <div onClick={() => {
                    Analytics.customLogEventName('button', 'mis pedidos', this.props.store, 'perfil home', 'perfil', 'registrado')
                    this.props.onClose();
                    this.props.history.push(`/foodie-orders/${this.props.store}`)
                  }}>
                    <div>
                      <IonIcon icon={foodieIcon}></IonIcon>
                      <p>Mis pedidos</p>
                    </div>
                    <IonIcon icon={chevronForward}></IonIcon>
                  </div>
                }
                
              </div>
            </Fragment>
          }
          <ul>
            {Expr.whenHasElevatePrivileges(() => {
              const onWipeOutDataAndResetHandler = async () => {
                this.setState({
                  confirm: {
                    message: localize('ALERT_WIPE_OUT_LABEL'),
                    onConfirm: async () => {
                      // Clear All Databases
                      await DeveloperClient.wipeOutData();

                      // Clear User Data
                      await AuthenticationClient.signOut();
                      window.location.reload();

                    }
                  },
                  appVersion: this.state.appVersion
                });
              }

              return <Fragment>
                <li className="divider">
                  <h1>{localize('DEVELOPER_LABEL')}</h1>
                </li>
                <li onClick={onWipeOutDataAndResetHandler}>
                  <div>
                    {localize('DEVELOPER_WIPE_OUT')}
                  </div>
                </li>
              </Fragment>
            })}
          </ul>
          {confirm ?
            <IonAlert
              isOpen={true}
              header={confirm.message}
              buttons={[
                {
                  text: localize('ALERT_CANCEL_LABEL'),
                  role: 'cancel',
                  cssClass: 'secondary',
                  handler: () => {
                    this.setState({
                      confirm: undefined
                    });
                  }
                },
                {
                  text: localize('ALERT_CONFIRM_LABEL'),
                  handler: confirm!.onConfirm
                }
              ]}
            />
            : null}
        </IonContent>
        <IonFooter>
          <div className='pad-buttons'>
            <IonButton className='white-centered' onClick={this.onSignOutClickHandler}>
              {localize('SIGN_OUT')}
            </IonButton>
          </div> 
          <div className='version'>
            {version}
          </div>
        </IonFooter>
      </IonModal>
    )
  }

  renderPROFILE_DETAIL = () => {
    return (
      <IonModal enterAnimation={ComponentAnimations.enterAnimation} leaveAnimation={ComponentAnimations.leaveAnimation} swipeToClose={false} backdropDismiss={false} cssClass="user-profile-detail" isOpen={true}>
        <ProfileDetail onClose={() => this.getInfo()}></ProfileDetail>
      </IonModal>
    )
  }

  renderINTERESTED_DETAIL = () => {
    return (
      <IonModal enterAnimation={ComponentAnimations.enterAnimation} leaveAnimation={ComponentAnimations.leaveAnimation} swipeToClose={false} backdropDismiss={false} cssClass="user-profile-detail" isOpen={true}>
        <InterestedDetail onClose={() => this.setState({ mode: 'PAGE_LOADED' })}></InterestedDetail>
      </IonModal>
    )
  }

  renderFAQ_DETAIL = () => {
    return (
      <IonModal enterAnimation={ComponentAnimations.enterAnimation} leaveAnimation={ComponentAnimations.leaveAnimation} swipeToClose={false} backdropDismiss={false} cssClass="faq-details" isOpen={true}>
        <FAQDetailPage from_another_page={false} store={this.props.store} user={this.state.user} onClose={() => this.setState({ mode: 'PAGE_LOADED' })}></FAQDetailPage>
      </IonModal>
    )
  }

  renderCARS_PATERNS = () => {
    return (
      <IonModal enterAnimation={ComponentAnimations.enterAnimation} leaveAnimation={ComponentAnimations.leaveAnimation} swipeToClose={false} backdropDismiss={false} cssClass="faq-details" isOpen={true}>
        <CardsPatentsPage store={this.props.store} user={this.state.user} onClose={() => this.setState({ mode: 'PAGE_LOADED' })}></CardsPatentsPage>
      </IonModal>
    )
  }

  renderTICKETS_DETAIL = () => {
    return (
      <IonModal enterAnimation={ComponentAnimations.enterAnimation} leaveAnimation={ComponentAnimations.leaveAnimation} swipeToClose={false} backdropDismiss={false} cssClass="tickets-details" isOpen={true}>
        <TicketsPage store={this.props.store} user={this.state.user} onClose={() => this.setState({ mode: 'PAGE_LOADED' })}></TicketsPage>
      </IonModal>
    )
  }

});
