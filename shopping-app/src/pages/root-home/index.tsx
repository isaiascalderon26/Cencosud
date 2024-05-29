import React, { Fragment } from 'react';
import './index.less';
import iconCheck from './../../assets/media/icon-check.svg';
import { arrowBack } from 'ionicons/icons'
import { IonPage, IonContent, IonIcon, withIonLifeCycle, IonHeader, IonButton, IonFooter, IonGrid, IonRow, IonCol } from '@ionic/react';
import { RouteComponentProps } from 'react-router';
import { SplashScreen } from '@capacitor/splash-screen';
import EurekaConsole from "../../lib/EurekaConsole";
import UserClient from '../../clients/UserClient';
import { IUserDashboardResponse } from '../../models/users/IUserDashboardResponse';
import Portales from '../../assets/media/portal.png';
import _ from "lodash";

import i18n from '../../lib/i18n';
import locales from './locales';
import BackdropLoading from '../../components/backdrop-loading';
import SettingsClient from '../../clients/SettingsClient';
import EventClient from '../../clients/EventClient';
import Analytics from '../../lib/FirebaseAnalytics';
import { IUser } from '../../models/users/IUser';
import ShoppingCartClient from '../../clients/ShoppingCartClient';


const eureka = EurekaConsole({ label: "root-home" });
const localize = i18n(locales);

interface IState {
  mode: "INITIAL_STATE" | "HOME_LOADED" | "PORTAL_SELECTION",
  task_to_show?: string,
  dashboard?: IUserDashboardResponse,
  slideIndex: number,
  mallSelected?: string,
  sites?: Array<any>,
  user? : IUser
}

interface IMall {
  id: string;
  name: string;
}
interface IEvent {
  type: string,
  details: {
    primarysid: string,
    mall: IMall
  }
}
interface IProps extends RouteComponentProps<{
  id: any
}> { }

export default withIonLifeCycle(class RootPage extends React.Component<IProps, IState> {
  private swiper: any;
  state: IState = {
    mode: "INITIAL_STATE",
    slideIndex: 1,
  }

  ionViewWillEnter = async ()=>{
    SplashScreen.hide();
    const selectedMall = SettingsClient.get("SELECTED_MALL",null);
    const ticket_id  =  SettingsClient.get("AUTOSCAN_TICKET_ID",null);

    if(selectedMall && !ticket_id){
      this.props.history.push(`/mall-home/${selectedMall}`);
      return;
    }


    if(ticket_id){
      this.props.history.push(`/autoscan/${selectedMall}/${ticket_id}`);
      await SettingsClient.remove("AUTOSCAN_TICKET_ID");
      return;
    }


    setTimeout(async () => {
      await this.getUserDashboard();
    }, 300)
  }

  getUserDashboard = async () => {
    try {
      const myInfo = await UserClient.me();
      const sites = await UserClient.getSites();

      this.setState({
        mode: "HOME_LOADED",
        sites: sites.data,
        user : myInfo
      });

      let isPortal = this.state.mallSelected && this.state.mallSelected.includes('portal');
      let isFlorida = this.state.mallSelected && this.state.mallSelected.includes('florida');

      if(isPortal && !isFlorida) {
        this.setState({
          mode: 'PORTAL_SELECTION',
        });
      }

    } catch (error: any) {
      eureka.error('An error has occurred trying to get dashboard ', error)
      eureka.debug(error);
    }
  }

  onGetSwiperHandler = async (e: any) => {
    this.swiper = e.target.swiper;
    this.swiper.on('slideChangeTransitionEnd', () => {
      this.setState({
        slideIndex: this.swiper.activeIndex + 1
      });
    });
  }

  goToNotificationsClickHandler = async () => {
    //this.props.history.push(`/notifications`);
  }


  onNotificationReceivedCallbackHandler = async () => {
    this.setState({
      mode: "INITIAL_STATE"
    })
    setTimeout(() => this.getUserDashboard(), 250);
  }


  onTaskDetailClickHandler = async (taskId: string) => {
    this.setState({
      task_to_show: taskId
    })
  }

  onTaskDetailModalCloseHandler = async () => {
    this.setState({
      task_to_show: undefined
    })
  }

  onMallChange = async (mallName: string) => {
    window.localStorage.setItem("mall-selected", mallName);
   await ShoppingCartClient.clearCart()
    this.setState({
      mallSelected: mallName
    })
  }

  onEventToAnalytics = async (data: IEvent) => {
    await EventClient.create({
      type: 'app.mall.selected',
      details: {
        primarysid: data.details.primarysid,
        mall: {
          id: data.details.mall.id,
          name: data.details.mall.name
        }
      },
    } as IEvent);
  }

  render() {
    const { mode } = this.state;

    return <IonPage className={`root-page ${mode.replace(/_/ig, '-').toLowerCase()}`}>
      {(() => {
        const customRender: Function = (this as any)[`render${mode}`];
        if (!customRender) {
          return <div>{mode}</div>;
        }
        return customRender();
      })()}
      <IonFooter>
        <div className='pad-buttons'>
          <IonButton className='white-centered' disabled={!this.state.mallSelected ? true : false} onClick={async () => {
            Analytics.customLogEventName('button', 'cambio de mall', this.state.mallSelected!, 'home', 'perfil', this.state.user?.email === 'invited' ? 'invitado' : 'registrado');
            // Save for future entries
            SettingsClient.set("SELECTED_MALL", this.state.mallSelected);

            try {
              this.props.history.replace(`/mall-home/${this.state.mallSelected}`);
            } catch(error) {
              throw error
            }
          }}>Continuar</IonButton>
        </div>
      </IonFooter>
    </IonPage>
  }

  /**
   * Waiting Initial State
   *
   * @memberof RootPage
   */
  renderINITIAL_STATE = () => {
    return <Fragment>
      <BackdropLoading message='Cargando...'></BackdropLoading>
    </Fragment>
  }

  /**
   * User Dashboard state
   * This state show when the user has at least one card registered
   */
  renderHOME_LOADED = () => {
    const { sites } = this.state
    return <Fragment>
      <IonContent>
        <div className='mall-selection'>
          <div>
            <h2 className="font-bold">{localize('SELECT_TITLE')}</h2>
            <h1 className="font-bold">{localize('SELECT_SUBTITLE')}</h1>
          </div>
          <div>
            <IonGrid>
              <IonRow>
                {
                  _.sortBy(sites, "meta_data.sort").map(site => {
                    if (site.meta_data.type === "mall") {
                      let storeName = site.name.replace(/\s/g, '')
                      return (
                        <IonCol size="6" size-sm key={`${site.id}-${site.name}`}>
                          <div className="mall-button">
                            {this.state.mallSelected == site.name ? <IonIcon src={iconCheck}></IonIcon> : null}
                            <button
                              className={site.name == this.state.mallSelected ? 'button-selected' : ''}
                              onClick={async () => {
                                await this.onEventToAnalytics({
                                  type: 'app.mall.selected',
                                  details: {
                                    primarysid: this.state.user?.primarysid,
                                    mall: {
                                      id: site.id,
                                      name: site.name
                                    }
                                  },
                                } as IEvent);
                                await this.onMallChange(site.name);
                               }}
                            >
                              <img src={`${process.env.REACT_APP_BUCKET_URL}/logo/vertical/${storeName}.png`} loading='lazy'></img>
                            </button></div>
                        </IonCol>
                      )
                    }
                    return null
                  }).sort()
                }
                <IonCol>
                  <div className="mall-button">
                    <span className="qty-illusion"></span>
                    <span className="qty-illusion last"></span>
                    {this.state.mallSelected == "portales" ? <IonIcon src={iconCheck}></IonIcon> : null}
                    <button onClick={() => this.setState({ mode: "PORTAL_SELECTION", mallSelected: '' })}>
                      <img src={Portales} loading='lazy'></img>
                    </button>
                  </div>
                </IonCol>
              </IonRow>
            </IonGrid>
          </div>
        </div>
      </IonContent>
    </Fragment >;
  }
  renderPORTAL_SELECTION = () => {
    const { sites } = this.state
    return (
      <Fragment>
        <IonHeader>
          <div onClick={() => this.setState({ mode: "HOME_LOADED", mallSelected: '' })}>
            <IonIcon icon={arrowBack}></IonIcon>
          </div>
        </IonHeader>
        <IonContent>
          <div>
            <h2 className="font-bold">{localize('SELECT_TITLE')}</h2>
            <h1 className="font-bold">{localize('SELECT_PORTAL_SUBTITLE')}</h1>
          </div>
          <div>
            <IonGrid>
              <IonRow>
                {
                  sites?.map(site => {
                    let storeName = site.name.replace(/\s/g, '')
                    if (site.meta_data.type === "portal") {
                      return (
                        <IonCol size="6" size-sm key={site.name}>
                          <div className="portal-button">
                            {this.state.mallSelected == site.name ? <IonIcon src={iconCheck}></IonIcon> : null}
                            <button
                              className={site.name == this.state.mallSelected ? 'button-selected' : ''}
                              onClick={async () => {
                                await this.onEventToAnalytics({
                                  type: 'app.mall.selected',
                                  details: {
                                    primarysid: this.state.user?.primarysid,
                                    mall: {
                                      id: site.id,
                                      name: site.name
                                    }
                                  },
                                } as IEvent);
                                await this.onMallChange(site.name);
                              }}>
                              <img src={`${process.env.REACT_APP_BUCKET_URL}/logo/vertical/${storeName}.png`}></img>
                            </button></div>
                        </IonCol>
                      )
                    }
                    return null
                  })
                }
              </IonRow>
            </IonGrid>
          </div>
        </IonContent>
      </Fragment>
    )
  }
});
