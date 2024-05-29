import React from 'react';
import { IonApp, IonRouterOutlet, setupConfig } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { Route } from 'react-router';
import { PushNotifications, Token } from '@capacitor/push-notifications';

/* Components */
import BootLoader from './components/boot-loader';
import VersionChecker from './components/version-checker';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/* Theme variables */
import './theme/variables.css';
import './theme/fonts.css';
import './theme/ion-overrides.less';

/* Clients */
import EventClient from './clients/EventClient';
import SettingsClient from './clients/SettingsClient';
import AnalyticsClient from './clients/AnalyticsClient';
import HistoryManager from './components/history-manager';
import AuthenticationClient from './clients/AuthenticationClient';

/* Core Pages */
import SignInPage, { onSignInCallbackHandler } from './pages/sign-in';
import ApplyFlowPage from './pages/apply-flow';
import OnBoardingPage from './pages/onboarding';
import RootPage from './pages/root-home';
//import MallHomePage from './pages/mall-home';
import NewMallHomePage from './pages/new-mall-home';
import ActivitiesPage from './pages/activities-flow';
import MoviesPage from './pages/movies-flow';
import PromotionPage from './pages/promotions-flow';
import ParkingPage from './pages/parking-flow';
import AutopassPage from './pages/autopass-flow';
import AutoscanPage from './pages/autoscan-flow';
import AutopassResolutionPage from './pages/autopass-resolution-flow';
import AutopassNotificationPage from './pages/autopass-notification';
import NotificationsPage from './pages/notifications';
import NotificationPage from './pages/notification';
import SkyCostaneraPage from './pages/sky-costanera-flow';
import HelpInformationPage from './pages/help-information';
import CardManagementPage from './pages/card-management';
import ChallengePage from './pages/challenges-flow';
import FoodiePage from './pages/foodie-flow';
import FoodieOrdersPage from './pages/foodie-orders';
import CouponsPage from './pages/coupons-flow';
import SchedulesPage from './pages/schedules-flow';
import ScheduledEventsPage from './pages/scheduled-events';

/* Models */
import IJwt from './models/IJwt';
import { IUser } from './models/users/IUser';
import { ICustomer } from './models/users/ICustomer';

/* Plugins */
import {
  ScreenOrientation,
  OrientationType,
} from '@robingenz/capacitor-screen-orientation';
import Expr from './lib/Expr';
import EventStreamer from './lib/EventStreamer';
import RemoteConfigClient from './clients/RemoteConfigClient';
import { App as AppInfo } from '@capacitor/app';
import CencosudPointsPage from './pages/cencosud-points-flow';
import { FCM } from '@capacitor-community/fcm';
import { checkPermissions, PERMISSIONS } from './lib/Permissions';
import UserClient from './clients/UserClient';
import NotificationLogClient from './clients/NotificationLogClient';
import { EventListPage } from './pages/events-list';
import EventInscriptionPage from './pages/event-inscription-flow';
import HomeLayout from './components/v2/layout/HomeLayout';
// import BottomNavigationBar from './components/v2/navigation/bottom-navigation-bar';
import profile from './components/v2/pages/profile';
import { Capacitor } from '@capacitor/core';
import EurekaConsole from './lib/EurekaConsole';

declare var QueueIt: any;
const eureka = EurekaConsole({ label: 'App' });

interface PageState {
  booting: boolean;
  authenticated: boolean;
  is_first_time: boolean;
  need_to_apply: boolean;
  app_booting: boolean;
  checking_version: boolean;
  registration_data?: {
    jwt: IJwt;
    onRegistrationCompleted: onSignInCallbackHandler;
    customer: ICustomer;
  };
  device_token: string;
  permissions: Record<PERMISSIONS, unknown>; // Agrega esta línea
}

export default class App extends React.Component<{}, PageState> {
  state: PageState = {
    booting: false,
    authenticated: false,
    // If the user doesnt have any accepted job type
    // we need to apply to set the name and other user info
    need_to_apply: false,
    // If is the first time, we need to launch the onboarding page
    is_first_time: false,
    // Just for pre-boot SettingsClient that we really need
    // before other clients
    app_booting: true,
    // Just check the version to check if the client must be updated
    checking_version: false,
    // Registration Data
    registration_data: undefined,
    device_token: '',
    permissions: {} as Record<PERMISSIONS, unknown>,
  };

  /**
   * Ejecuta el evento configurado en la plataforma de Queue-it, para la gestión de filas virtuales.
   */
  runQueueIt() {
    const listener = {
      // onQueuePassed: () => alert('Queue passed'),
      // onQueueViewWillOpen: () => alert('In app browser is opening'),
      // onQueueDisabled: () => alert('Queue disabled'),
      // onQueueItUnavailable: () => alert('Queue-it not in service'),
      onError: (error: any, message: any) => {
        console.warn(error, message);
      },
    };

    const customerId = 'cencosudsa';
    const eventId = 'shoppingapp';
    const engine = new QueueIt.Javascript.QueueITEngine(
      customerId,
      eventId,
      null,
      null,
      listener
    );
    engine.run();
  }

  componentDidMount = async () => {
    eureka.debug('Paso por aqui Incio');

    const notification = PushNotifications.checkPermissions();

    eureka.debug('Verificar PERMISO:', notification);

    eureka.debug('Paso por FIN ');

    this.runQueueIt();

    setupConfig({
      mode: 'ios',
      swipeBackEnabled: false,
      hardwareBackButton: false,
    });
    this.startHandler();

    // Verifica y solicita permisos
    const permissions = await checkPermissions();
    eureka.debug('Verificar PERMISO:', permissions);

    // Actualiza el estado con los permisos si es necesario
    this.setState({
      // ... otros estados ...
      permissions: permissions,
    });

    EventStreamer.on('DEEPLINK:AUTOSCAN', (data) => {
      const { ticket_id } = data;
      const selectedMall = SettingsClient.get('SELECTED_MALL', null);

      EventStreamer.emit(
        'NAVIGATE_TO',
        `/autoscan/${selectedMall}/${ticket_id}`
      );
      SettingsClient.set('AUTOSCAN_TICKET_ID', ticket_id);
    });

    Expr.whenInNativePhone(async () => {
      await PushNotifications.addListener(
        'pushNotificationActionPerformed',
        (notification) => {
          eureka.debug('Push notification action performed:', notification);
          const metadataParsed = JSON.parse(
            notification.notification.data.metadata
          );
          let url = '';
          if (metadataParsed.notification_log_id) {
            NotificationLogClient.updateNotificationLog({
              id: metadataParsed.notification_log_id,
              status: 'READ',
            }).catch((error) => console.log(JSON.stringify(error)));
          }
          if (metadataParsed.foodie_payment_id) {
            //FOODIE
            eureka.debug(
              'Handling Foodie payment notification:',
              metadataParsed
            );

            url = `/foodie/voucher/payment:${metadataParsed.foodie_payment_id}`;
            if (metadataParsed.foodie_rate) {
              url += `:rate`;
            }
            setTimeout(() => {
              EventStreamer.emit('NAVIGATE_TO', `${url}`);
            }, 3000);
          }
          if (metadataParsed.autopass_intention_id) {
            //AUTOPASS
            eureka.debug(
              'Handling Autopass intention notification:',
              metadataParsed
            );

            url = `/autopass-notification/${metadataParsed.autopass_intention_id}`;
            setTimeout(() => {
              EventStreamer.emit('NAVIGATE_TO', `${url}`);
            }, 3000);
          }

          if (metadataParsed.url_redirect) {
            url = metadataParsed.url_redirect;
            if (metadataParsed.is_notication_intentions) {
              //url sent from notifications module
              url = url + '/' + SettingsClient.get('SELECTED_MALL', null);
              console.log(url);
            }
            setTimeout(() => {
              EventStreamer.emit('NAVIGATE_TO', `${url}`);
            }, 3000);
          }
        }
      );
    });
  };

  startHandler = async () => {
    // We need this clients booted before the main boot loader
    await RemoteConfigClient.boot();
    await SettingsClient.boot();
    await AnalyticsClient.boot();
    Expr.whenInNativePhone(async () => {
      await ScreenOrientation.lock({ type: OrientationType.PORTRAIT });
    });

    this.setState({
      app_booting: false,
      checking_version: true,
      is_first_time: SettingsClient.get('FIRST_TIME', true),
    });
  };

  onCheckVersionComplete = async () => {
    // hide version checker and continue to booting
    this.setState({
      checking_version: false,
      booting: true,
    });
  };

  async deviceRegister() {
    Expr.whenInNativePhone(async () => {
      PushNotifications.addListener('registration', async ({ value }) => {
        let token = value;

        if (Capacitor.getPlatform() === 'ios') {
          const { token: fcm_token } = await FCM.getToken();
          eureka.debug(`ushNotifications.addListener ~ tokenDevice: ${token}`);
          token = fcm_token;
        }

        this.setState({ device_token: token });
        eureka.debug(`Device Token: ${this.state.device_token}`);

        //const { token: device_token } = await FCM.getToken();
        const permissions = await checkPermissions();
        const appInfo = await AppInfo.getInfo();
        const { primarysid, email } = AuthenticationClient.getInfo();

        await UserClient.updatePartial({
          primarysid,
          device_token: this.state.device_token,
          permissions,
        });
      });
    });
  }

  emitSessionCreated() {
    Expr.whenInNativePhone(async () => {
      const appInfo = await AppInfo.getInfo();
      const { primarysid, email } = AuthenticationClient.getInfo();
      const version = appInfo!.version;
      const build = appInfo!.build;

      // Agrega una declaración de depuración antes de enviar el evento al backend
      eureka.debug('Sending event to backend:', {
        primarysid,
        email,
        version,
        build,
      });

      // send event to backend
      await EventClient.create({
        type: 'app.sessions.created',
        details: {
          primarysid,
          email,
          version,
          build,
        },
      });
    });

    Expr.whenNotInNativePhone(async () => {
      const { primarysid, email } = AuthenticationClient.getInfo();

      // send event to backend
      await EventClient.create({
        type: 'app.sessions.created',
        details: {
          primarysid,
          email,
          version: '0.0.0',
          build: '0',
        },
      });
    });
  }

  onBootCompleteHandler = () => {
    this.setState({
      booting: false,
      authenticated: AuthenticationClient.isAuthenticated(),
      is_first_time: SettingsClient.get('FIRST_TIME', true),
      need_to_apply: false,
    });

    // emit session created event if user already authenticated
    if (AuthenticationClient.isAuthenticated()) {
      this.emitSessionCreated();

      //Set Analytics userID with user primarysid
      const { primarysid } = AuthenticationClient.getInfo();
      if (primarysid) {
        AnalyticsClient.setUserId(primarysid);
        AnalyticsClient.setUserProperty(primarysid);
      }
    }
  };

  onAuthenticatedHandler = async (
    needRegistration: boolean,
    jwt?: IJwt,
    callback?: onSignInCallbackHandler,
    customer?: ICustomer
  ) => {
    this.setState({
      authenticated: true,
      need_to_apply: needRegistration,
      registration_data: needRegistration
        ? {
            jwt: jwt!,
            onRegistrationCompleted: callback!,
            customer: customer!,
          }
        : undefined,
    });

    // when user is logged
    // we emit sessions created event
    if (AuthenticationClient.isAuthenticated()) {
      this.emitSessionCreated();
      this.deviceRegister();

      //Set Analytics userID with user primarysid
      const { primarysid } = AuthenticationClient.getInfo();
      if (primarysid) {
        await AnalyticsClient.setUserId(primarysid);
        await AnalyticsClient.setUserProperty(primarysid);
      }
    }
  };

  onBoardingCompletedHandler = () => {
    this.setState({
      is_first_time: SettingsClient.get('FIRST_TIME', true),
    });
  };

  onRegistrationCompleteHandler = (user: IUser): void => {
    this.setState({
      need_to_apply: false,
    });
    this.state.registration_data?.onRegistrationCompleted(user);
  };

  render() {
    const {
      app_booting,
      checking_version,
      booting,
      authenticated,
      need_to_apply,
      is_first_time,
      registration_data,
    } = this.state;

    if (app_booting) {
      return <div></div>;
    }

    if (checking_version) {
      return <VersionChecker onCheckComplete={this.onCheckVersionComplete} />;
    }

    if (is_first_time) {
      return (
        <OnBoardingPage onBoardingCompleted={this.onBoardingCompletedHandler} />
      );
    }

    if (booting) {
      return <BootLoader onLoadComplete={this.onBootCompleteHandler} />;
    }

    if (!authenticated) {
      return <SignInPage onAuthenticated={this.onAuthenticatedHandler} />;
    }

    if (need_to_apply) {
      // Apply Flow
      return (
        <ApplyFlowPage
          data={registration_data!}
          onRegistrationCompleted={this.onRegistrationCompleteHandler}
        />
      );
    }

    return (
      <IonApp>
        <IonReactRouter keyLength={1}>
          <HistoryManager />
          <IonRouterOutlet>
            {/* CORE PATHS */}
            <Route path="/" component={RootPage} exact={true} />
            <Route
              path="/notifications"
              component={NotificationsPage}
              exact={true}
            />
            <Route
              path="/notifications/:id"
              component={NotificationPage}
              exact={true}
            />
            <Route
              path="/mall-home/:id"
              component={NewMallHomePage}
              exact={true}
            />
            {/*<Route path="/new-mall-home/:id" component={NewMallHomePage} exact={true} />*/}
            <Route
              path="/activities/:id"
              component={ActivitiesPage}
              exact={true}
            />
            <Route path="/movies/:id" component={MoviesPage} exact={true} />
            <Route
              path="/promotions/:id"
              component={PromotionPage}
              exact={true}
            />
            <Route path="/parking/:id" component={ParkingPage} exact={true} />
            <Route
              path="/autoscan/:id/:ticket_id?"
              component={AutoscanPage}
              exact={true}
            />
            <Route path="/autopass/:id" component={AutopassPage} exact={true} />
            <Route
              path="/autopass-resolution/:id"
              component={AutopassResolutionPage}
              exact={true}
            />
            <Route
              path="/autopass-notification/:id"
              component={AutopassNotificationPage}
              exact={true}
            />
            <Route
              path="/sky-costanera/:id"
              component={SkyCostaneraPage}
              exact={true}
            />
            <Route
              path="/help-information/:id"
              component={HelpInformationPage}
              exact={true}
            />
            <Route path="/cards" component={CardManagementPage} exact={true} />
            <Route
              path="/challenge/:id"
              component={ChallengePage}
              exact={true}
            />
            <Route
              path="/foodie/:id/:param?"
              component={FoodiePage}
              exact={true}
            />
            <Route
              path="/foodie-orders/:id"
              component={FoodieOrdersPage}
              exact={true}
            />
            <Route path="/coupon" component={CouponsPage} exact={true} />
            <Route
              path="/cencosud-points"
              component={CencosudPointsPage}
              exact={true}
            />
            <Route
              path="/schedules/:id/:param?"
              component={SchedulesPage}
              exact={true}
            />
            <Route
              path="/scheduled-events/:id"
              component={ScheduledEventsPage}
              exact={true}
            />
            <Route path="/events-list" component={EventListPage} exact={true} />
            <Route
              path="/event-inscription/:id"
              component={EventInscriptionPage}
              exact={true}
            />
            <Route path="/profile" component={profile} exact={true} />
            {/* <Route
              path="/home-layout"
              component={() => (
                <HomeLayout
                  bottomMenuItems={[
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
                      text: 'Parking',
                    },
                    {
                      icon: 'services',
                      text: 'Servicios',
                    },
                    {
                      icon: 'user',
                      text: 'Perfil',
                    },
                  ]}
                  rightOptions={[]}
                />
              )}
              exact={true}
            /> */}
          </IonRouterOutlet>
        </IonReactRouter>
      </IonApp>
    );
  }
}
