import { AxiosError } from 'axios';
import React, { Fragment } from 'react';
import { RouteComponentProps } from 'react-router';
import { car, checkmarkCircleOutline, closeOutline } from 'ionicons/icons';
import { InAppBrowser, InAppBrowserEvent } from '@ionic-native/in-app-browser';
import {
  IonPage,
  IonIcon,
  withIonLifeCycle,
  IonSlides,
  IonSlide,
  IonHeader,
  IonButton,
  IonRefresher,
  IonRefresherContent,
} from '@ionic/react';
import { RefresherEventDetail } from '@ionic/core';
import { ellipsisHorizontalOutline } from 'ionicons/icons';

/* styles */
import './index.less';

/* components */
import BackdropLoading from '../../components/backdrop-loading';
import Page, { DefaultFooter, DefaultHeader } from '../../components/page';
import HelpRegisterModal from '../../components/help-register-modal';
import MultipleEntries from './components/multiple-entries';
import Alert from '../sky-costanera-flow/components/alert';
import SeparationLine from '../sky-costanera-flow/components/separation-line';
import ListCards from './components/list-cards';
import ButtonToggle from './components/button-toggle';
import ButtonAdd from './components/button-add';
import FancyTicket from '../../components/parking-ticket';
import ListHistory from './components/list-history';
import Info from './components/info';
import RemoveModal, { IReason } from './components/cancel-modal';
import ErrorModal, { IErrorModalProps } from '../../components/error-modal';
import ListPlates from './components/list-plates';
import CalificationModal from '../../components/califications';
import RutScreen from '../../components/rut-screen';

/* libs */
import Expr from '../../lib/Expr';
import HelpModal from './lib/HelpModal';
import EurekaConsole from '../../lib/EurekaConsole';
import EventStreamer from '../../lib/EventStreamer';
import DniFormatter from '../../lib/formatters/DniFormatter';
import Analytics from '../../lib/FirebaseAnalytics';

/* clients */
import CardClient from '../../clients/CardClient';
import UserClient from '../../clients/UserClient';
import SubscriptionClient from '../../clients/SubscriptionClient';
import AuthenticationClient from '../../clients/AuthenticationClient';
import PaymentIntentionClient from '../../clients/PaymentIntentionClient';
import VehicleClient from '../../clients/VehiclesClient';
import CalificationClient from '../../clients/CalificationClient';

/* models */
import ICard from '../../models/cards/ICard';
import { IUser } from '../../models/users/IUser';
import ISubscription from '../../models/subscriptions/ISubscription';
import IPaymentIntention from '../../models/payments/IPaymentIntention';
import IVehicle from '../../models/vehicles/IVehicles';

/* assets */
import ParkingLogo from './../../assets/media/parkingx3.png';
import plateRegisterImage from './../../assets/media/plate-register.svg';
// import StartRegisterParkingDark from './../../assets/media/autopass-dark.svg';
import oneClickImg from '../../assets/media/oneclick.svg';
import checkedImg from '../../assets/media/atom/icon/checked.png';
import processingImg from '../../assets/media/atom/icon/timing-process.svg';
import emptyImg from '../../assets/media/empty-info.svg';
import assignCard from '../../assets/media/assing-card.svg';
import flowQualificationImg from '../../assets/media/icon-flow-qualification.svg';
import ContactFormScreen from '../../components/contact-form-screen';
import ModalBottomSheet from '../../components/modal-bottom-sheet';

const ANIMATION_TIME = 200;
const eureka = EurekaConsole({ label: 'autopass-flow' });
interface IProps
  extends RouteComponentProps<{
    id: string;
  }> {}

type IMode =
  | 'LOADING'
  | 'LANDING'
  | 'ON_BOARDING_RUT'
  | 'ON_BOARDING_CARD'
  | 'ON_BOARDING_CARD_SUCCESS'
  | 'ON_BOARDING_PLATE'
  | 'ON_BOARDING_PLATE_SUCCESS'
  | 'HOME'
  | 'PARKING_DETAIL_SUCCESS'
  | 'PARKING_DETAIL_PROCESS'
  | 'AUTOPASS_HISTORY_DETAILS'
  | 'AUTOPASS_REMOVED'
  | 'CONTACT_FORM_SCREEN';

type IModal = 'REGISTER' | 'AUTOPASS';

interface IPlateChanged {
  plate: string;
  valid: boolean;
}

interface IState {
  mode: IMode;
  loading_message?: string;
  type_modal?: IModal;
  modal_is_open: boolean;
  slideIndex: number;
  document_number: string;
  isValidStatesInputs: {
    document_number: boolean;
  };
  user?: IUser;
  payments?: IPaymentIntention[];
  vehicles?: IVehicle[];
  selectedHistory: Record<string, any>;
  subscription?: ISubscription;
  card?: ICard;
  error_modal?: IErrorModalProps;
  modal_bottom_sheet?: IErrorModalProps; // allowing new modal
  service_enabled?: boolean;
  remove_modal?: boolean;
  plate_changed?: IPlateChanged;
  document_number_actived: boolean;
  is_visible_califications: boolean;
  payment_selected?: IPaymentIntention;
  has_questions: boolean;
  is_qualificable: boolean;
}
export default withIonLifeCycle(
  class AutopassPage extends React.Component<IProps, IState> {
    private swiper: any;
    private rollback: boolean = false;
    navHistory: IMode[] = [];
    state: IState = {
      mode: 'LOADING',
      loading_message: 'Cargando...',
      modal_is_open: false,
      slideIndex: 1,
      document_number: '',
      isValidStatesInputs: {
        document_number: false,
      },
      selectedHistory: {},
      document_number_actived: true,
      is_visible_califications: false,
      has_questions: false,
      is_qualificable: false,
    };

    async componentDidMount() {
      await this.fetchAll();

      EventStreamer.on('CARD_SELECTED', this.onCardChangeHandler);
      EventStreamer.on('AUTOPASS_RESOLUTION', this.onAutopassResolutionHandler);

      const paymentPending = this.state.payments?.filter(
        (payment: IPaymentIntention) => payment.state === 'REJECTED'
      )[0];

      if (paymentPending) {
        setTimeout(() => {
          const shortName = this.state.user?.full_name
            .split(' ')
            .filter(Boolean)
            .slice(0, 2)
            .join(' ');

          this.setState({
            error_modal: {
              cssClass: 'autopass-flow-onboarding-home',
              title: `${shortName}, tienes un pago pendiente`,
              message:
                'En tu última visita no pudimos efectuar el débito en tu tarjeta registrada. Por favor actualiza el medio de pago, de lo contrario no podrás contar con el servicio.',
              retryMessage: 'Resolver',
              onRetry: () => {
                this.setState({ error_modal: undefined });

                setTimeout(() => {
                  this.props.history.push(
                    `/autopass-resolution/${paymentPending.id}`
                  );
                }, ANIMATION_TIME);
              },
              onCancel: () => {
                this.setState({ error_modal: undefined });
              },
            },
          });
        }, ANIMATION_TIME);
        return;
      }

      Analytics.customLogEvent('ionic_app', 'autopass');
    }

    async componentWillUnmount() {
      EventStreamer.off('CARD_SELECTED', this.onCardChangeHandler);
      EventStreamer.off(
        'AUTOPASS_RESOLUTION',
        this.onAutopassResolutionHandler
      );
    }

    /* arrow functions */
    goTo = (mode: IMode): void => {
      this.setState({ mode });
    };

    pauseSubscription = async (): Promise<void> => {
      try {
        if (!this.state.subscription) {
          throw new Error('Subscription must be defined');
        }

        const updated = await SubscriptionClient.pause(
          this.state.subscription.id
        );

        this.setState((prevState) => ({
          ...prevState,
          subscription: {
            ...prevState.subscription!,
            ...updated,
          },
        }));
      } catch (error) {
        eureka.error('Unexpected error pausing subscription', error);

        this.setState({
          error_modal: {
            title: 'Hubo un problema',
            message: `No pudimos desabilitar el servicio. ¿Deseas reintentar?`,
            onRetry: () => {
              this.setState({ error_modal: undefined });

              setTimeout(() => {
                this.pauseSubscription();
              }, ANIMATION_TIME);
            },
            onCancel: () => {
              this.rollback = true;
              this.setState({ error_modal: undefined, service_enabled: true });
            },
          },
        });
      }
    };

    reanudeSubscription = async (): Promise<void> => {
      try {
        if (!this.state.subscription) {
          throw new Error('Subscription must be defined');
        }

        const updated = await SubscriptionClient.reanude(
          this.state.subscription.id
        );

        this.setState((prevState) => ({
          ...prevState,
          subscription: {
            ...prevState.subscription!,
            ...updated,
          },
        }));
      } catch (error) {
        eureka.error('Unexpected error resuming subscription', error);

        this.setState({
          error_modal: {
            title: 'Hubo un problema',
            message: `No pudimos habilitar el servicio. ¿Deseas reintentar?`,
            onRetry: () => {
              this.setState({ error_modal: undefined });

              setTimeout(() => {
                this.reanudeSubscription();
              }, ANIMATION_TIME);
            },
            onCancel: () => {
              this.rollback = true;
              this.setState({ error_modal: undefined, service_enabled: false });
            },
          },
        });
      }
    };

    fetchUser = async (): Promise<IUser> => {
      const user = await UserClient.me();
      return user;
    };

    fetchSubscription = async () => {
      const response = await SubscriptionClient.list({
        offset: 0,
        limit: 1,
        query: {
          'user_id.keyword_is': AuthenticationClient.getInfo().primarysid,
          'state.keyword_is_not': 'REMOVED',
        },
        sort: {
          created_at: 'desc',
        },
      });

      // subscription not found
      if (!response.data.length) {
        return undefined;
      }

      return response.data.pop();
    };

    fetchCard = async (): Promise<ICard | undefined> => {
      const cards = await CardClient.getList();
      const defaults = cards.filter((card: ICard) => card.default === true);

      if (!defaults.length) {
        return undefined;
      }

      return defaults.pop();
    };

    fetchPayments = async (): Promise<IPaymentIntention[]> => {
      const response = await PaymentIntentionClient.list({
        query: {
          'payment_flow.keyword_is': 'AUTOPASS',
          'state.keyword_is_one_of': ['CREATED', 'APPROVED', 'REJECTED'],
          'payment_method.details.user_id.keyword_is':
            AuthenticationClient.getInfo().primarysid,
        },
        sort: {
          created_at: 'desc',
        },
        offset: 0,
        limit: 10,
      });
      return response.data;
    };

    fetchAll = async (hiddenLoading?: boolean) => {
      try {
        if (!hiddenLoading) {
          this.setState({ mode: 'LOADING', loading_message: 'Cargando...' });
        }

        const [user, subscription, card, payments] = await Promise.all([
          this.fetchUser(),
          this.fetchSubscription(),
          this.fetchCard(),
          this.fetchPayments(),
        ]);

        let mode: IMode = 'HOME';
        if (!subscription) {
          mode = 'LANDING';
        }
        const order_payments = await this.orderPaymentIntention(payments);
        const serviceEnabled = subscription?.state !== 'PAUSED';
        this.setState({
          mode,
          user,
          subscription,
          card,
          vehicles: user.vehicles,
          payments: order_payments,
          service_enabled: serviceEnabled,
        });
      } catch (error) {
        eureka.error('Unexpected error fetching all', error);

        this.setState({
          error_modal: {
            title: 'Hubo un problema',
            message:
              'No pudimos cargar toda la información. ¿Deseas reintentar?',
            onRetry: () => {
              this.setState({ error_modal: undefined });

              setTimeout(() => {
                this.fetchAll();
              }, ANIMATION_TIME);
            },
            onCancel: () => {
              this.setState({ error_modal: undefined });

              setTimeout(() => {
                this.goBack();
              }, ANIMATION_TIME);
            },
          },
        });
      }
    };

    orderPaymentIntention = async (
      paymentIntention: IPaymentIntention[]
    ): Promise<IPaymentIntention[]> => {
      let paymentIntentionOrder: Record<string, any>[] = [];
      paymentIntention.forEach((payment: IPaymentIntention) => {
        let order: Number = 0;
        if (payment.state === 'CREATED') {
          order = 1;
        }
        if (payment.state === 'REJECTED') {
          order = 2;
        }
        if (payment.state === 'APPROVED') {
          order = 3;
        }

        paymentIntentionOrder = [...paymentIntentionOrder, { payment, order }];
      });

      paymentIntentionOrder.sort(
        (a: Record<string, any>, b: Record<string, any>) => {
          if (a.order > b.order) {
            return 1;
          }
          if (a.order < b.order) {
            return -1;
          }
          return 0;
        }
      );

      paymentIntentionOrder.forEach((payment: Record<string, any>) => {
        delete payment.order;
      });

      let arrayPayments: IPaymentIntention[] = [];
      paymentIntentionOrder.forEach((payment) => {
        arrayPayments.push(payment.payment);
      });

      return arrayPayments as IPaymentIntention[];
    };

    startCardRegistration = async () => {
      const showErrorModal = () => {
        this.setState({
          error_modal: {
            title: 'Hubo un problema',
            message: 'No pudimos registrar tu tarjeta. ¿Deseas reintentar?',
            onRetry: () => {
              this.setState({ error_modal: undefined });

              // start again card registration
              setTimeout(() => {
                this.startCardRegistration();
              }, ANIMATION_TIME);
            },
            onCancel: () => {
              this.setState({ error_modal: undefined, mode: 'LANDING' });
            },
          },
        });
      };

      try {
        this.setState({ mode: 'ON_BOARDING_CARD' });

        // subscribe to deep link
        EventStreamer.on(
          'DEEPLINK:CARD_ADDED_CALLBACK',
          this.onDeepLinkAddCardHandler
        );
        const links = await CardClient.register();
        const inscriptionUrl = links.find((l: any) => l.rel === 'inscription');
        if (!inscriptionUrl) {
          throw new Error('No inscription url found');
        }

        let response_code: string | null = 'exit';

        Expr.whenInNativePhone(async () => {
          let inAppBrowserRef = InAppBrowser.create(
            inscriptionUrl.href,
            '_blank',
            { location: 'no' }
          );

          inAppBrowserRef.show();

          inAppBrowserRef.on('exit').subscribe((evt: InAppBrowserEvent) => {
            if (response_code !== '0')
              EventStreamer.emit('DEEPLINK:CARD_ADDED_CALLBACK', {
                response_code: 'exit',
              });
          });

          inAppBrowserRef.on('loadstop').subscribe((evt: InAppBrowserEvent) => {
            if (evt.url && evt.url.includes('response_code')) {
              //url interceptor
              const queryString = evt.url.split('#')[1];
              const urlParams = new URLSearchParams(queryString);
              const code = urlParams.get('response_code');
              response_code = code;
              EventStreamer.emit('DEEPLINK:CARD_ADDED_CALLBACK', {
                response_code: code,
              });
              inAppBrowserRef.close();
            }
          });
        });

        Expr.whenNotInNativePhone(() => {
          let addCard = false;
          const onPopupMessage = async (e: any) => {
            // TODO: change validation to allow localhost
            // e.origin === e.data.origin
            if (!addCard) {
              // Simulate the deeplink process if we were in a mobile
              EventStreamer.emit('DEEPLINK:CARD_ADDED_CALLBACK', e.data);
              addCard = true;
            } else if (!addCard) {
              eureka.error('FATAL ADD CARD ERROR:: Origin missmatch');
            }
          };

          window.addEventListener('message', onPopupMessage);
          const loginPopUp = window.open(
            inscriptionUrl.href,
            '_blank',
            'toolbar=yes,scrollbars=yes,resizable=yes,top=100,left=500,width=500,height=600'
          );

          // Only in web
          const timer = setInterval(function () {
            if (loginPopUp && loginPopUp.closed) {
              clearInterval(timer);
              window.removeEventListener('message', onPopupMessage);
            }
          }, 500);
        });
      } catch (error) {
        eureka.error('An error has ocurred starting card registration', error);

        showErrorModal();
      }
    };

    updateCard = async () => {
      try {
        this.setState({ mode: 'LOADING', loading_message: 'Cargando...' });

        const cards = await CardClient.getList();
        if (!cards.length) {
          throw new Error('No cards registered');
        }

        const card = cards[0];
        await CardClient.setDefault(cards[0].id);

        this.setState({
          mode: 'ON_BOARDING_CARD_SUCCESS',
          card: { ...card, default: true },
        });
      } catch (error) {
        eureka.error('Unexpected error updating card', error);

        this.setState({
          error_modal: {
            title: 'Hubo un problema',
            message:
              'No pudimos cargar registrar la información. ¿Deseas reintentar?',
            onRetry: () => {
              this.setState({ error_modal: undefined });

              setTimeout(() => {
                this.updateCard();
              }, ANIMATION_TIME);
            },
            onCancel: () => {
              this.setState({ error_modal: undefined, mode: 'LANDING' });
            },
          },
        });
      }
    };

    goBack = () => {
      this.props.history.goBack();
    };

    onAddPlate = async (): Promise<void> => {
      this.goTo('ON_BOARDING_PLATE');
    };

    onRemovePlateHandler = async (plate: string): Promise<void> => {
      const removeRequest = async () => {
        try {
          this.setState({ mode: 'LOADING', loading_message: 'Eliminando...' });

          await VehicleClient.remove(plate);

          this.setState((prevState) => ({
            mode: 'HOME',
            vehicles: (prevState.vehicles || []).filter(
              (vehicle) => vehicle.plate !== plate
            ),
          }));
        } catch (error) {
          eureka.error('Unexpected error in removing plate handler', error);

          this.setState({
            error_modal: {
              title: 'Ocurrió un problema',
              message: `No pudimos eliminar la patente. ¿Deseas reintentar?`,
              onRetry: () => {
                this.setState({ error_modal: undefined });

                setTimeout(async () => {
                  removeRequest();
                }, ANIMATION_TIME);
              },
              onCancel: () => {
                this.setState({ error_modal: undefined, mode: 'HOME' });
              },
            },
          });
        }
      };

      this.setState({
        error_modal: {
          title: 'Eliminar Patente',
          message: `¿Estás seguro que quieres eliminar esta patente?`,
          retryMessage: 'Eliminar',
          onRetry: () => {
            this.setState({ error_modal: undefined });

            setTimeout(async () => {
              removeRequest();
            }, ANIMATION_TIME);
          },
          onCancel: () => {
            this.setState({ error_modal: undefined, mode: 'HOME' });
          },
        },
      });
    };

    onCloseModalHandler = (): void => {
      this.setState({
        modal_is_open: false,
      });
    };

    onAutopassResolutionHandler = async (
      paymentIntention: IPaymentIntention
    ): Promise<void> => {
      const payments = this.state.payments?.filter(
        (payment: IPaymentIntention) => payment.id !== paymentIntention.id
      ) as IPaymentIntention[];
      const update_payment = [paymentIntention, ...payments];
      const order_payments = await this.orderPaymentIntention(update_payment);
      this.setState({ payments: order_payments });
    };

    onGetSwiperHandler = async (e: any): Promise<void> => {
      this.swiper = e.target.swiper;
      this.swiper.on('slideChangeTransitionEnd', () => {
        this.setState({
          slideIndex: this.swiper.activeIndex + 1,
        });
      });
    };

    onSelectHistoryHandler = async (id: string): Promise<void> => {
      const paymentIntention: IPaymentIntention = this.state.payments!.filter(
        (payment) => payment.id === id
      )[0];
      const { state } = paymentIntention;

      if (state != 'REJECTED') {
        //is qualificable payment survey
        const questions = await CalificationClient.list({
          offset: 0,
          limit: 5,
          query: {
            'calification_question.flow.keyword_is': 'AUTOPASS',
            'payment_intention_id.keyword_is': id,
          },
        });

        this.setState({
          mode: 'AUTOPASS_HISTORY_DETAILS',
          selectedHistory: {
            state: paymentIntention.state,
            userId: paymentIntention.payment_method.details.user_id,
            location: paymentIntention.metadata.facility_id,
            locationName: paymentIntention.metadata.facility_name,
            plate: paymentIntention.metadata.plate,
            entranceDateTime: new Date(
              paymentIntention.metadata.entrance_date_time as string
            ),
            exitDateTime: new Date(
              paymentIntention.metadata.exit_date_time as string
            ),
            payment: {
              fee: {
                amount: paymentIntention.transaction.amount.total,
                discount: paymentIntention.transaction.amount.discount,
                currencyCode: paymentIntention.transaction.currency,
              },
            },
            discounts: paymentIntention.discounts,
          },
          payment_selected: paymentIntention,
          is_qualificable: questions.data.length === 0 ? true : false,
        });
        return;
      }

      if (paymentIntention.state === 'REJECTED') {
        this.props.history.push(`/autopass-resolution/${paymentIntention.id}`);
        return;
      }
    };

    onToogleAutopassServiceHandler = async (value: boolean) => {
      this.setState({ service_enabled: value });

      // if rollback dont call actions
      if (this.rollback) {
        this.rollback = false;
        return;
      }

      if (value) {
        this.reanudeSubscription();
        return;
      }

      this.pauseSubscription();
    };

    onLeaveServiceHandler = async () => {
      if (this.onVerifyExistPaymentsCreated()) {
        this.setState({
          error_modal: {
            title: 'No es posible dar de baja el servicio',
            message: `Actualmente te encuentras estacionado. Es necesario salir primero del estacionamiento para poder darlo de baja.`,
            onRetry: () => {
              this.setState({ error_modal: undefined, mode: 'HOME' });
            },
            retryMessage: 'Entiendo',
          },
        });
        return;
      }

      if (this.onVerifyExistPaymentsRejected()) {
        this.setState({
          error_modal: {
            title: 'No es posible dar de baja el servicio',
            message: `Actualmente tienes un pago pendiente. `,
            onRetry: () => {
              this.setState({ error_modal: undefined, mode: 'HOME' });
            },
            retryMessage: 'Entiendo',
          },
        });
        return;
      }

      this.setState({ remove_modal: true });
    };

    onRemoveModalContinueHandler = async (reason?: IReason) => {
      try {
        if (!this.state.subscription) {
          throw new Error('Subscription must be defined');
        }

        this.setState({
          remove_modal: false,
          mode: 'LOADING',
          loading_message: 'Actualizando...',
        });

        const updated = await SubscriptionClient.remove(
          this.state.subscription.id,
          { remove_reason: reason }
        );

        this.setState((prevState) => ({
          ...prevState,
          mode: 'AUTOPASS_REMOVED',
          subscription: {
            ...prevState.subscription!,
            ...updated,
          },
        }));
      } catch (error) {
        eureka.error(
          'Unexcepted error in on cancel modal continue handler',
          error
        );

        this.setState({
          error_modal: {
            title: 'Hubo un problema',
            message: `No pudimos dar de baja el servicio. ¿Deseas reintentar?`,
            onRetry: () => {
              this.setState({ error_modal: undefined });

              setTimeout(() => {
                this.onRemoveModalContinueHandler();
              }, ANIMATION_TIME);
            },
            onCancel: () => {
              this.setState({ error_modal: undefined, mode: 'HOME' });
            },
          },
        });
      }
    };

    onRemoveModalCancelHandler = async () => {
      this.setState({ remove_modal: false });
    };

    onServiceRemovedFinalizeHandler = async () => {
      this.props.history.replace(`/mall-home/${this.props.match.params.id}`);
    };

    onBoardingNextHandler = async () => {
      try {
        const { user, subscription, card, vehicles } = this.state;
        if (!user?.document_number) {
          this.setState({ mode: 'ON_BOARDING_RUT' });
          return;
        }

        if (!card) {
          this.startCardRegistration();
          return;
        }

        if (!vehicles?.length) {
          this.setState({ mode: 'ON_BOARDING_PLATE' });
          return;
        }

        if (!subscription) {
          this.setState({ mode: 'LOADING', loading_message: 'Creando...' });

          const created = await SubscriptionClient.create({
            user_id: user.primarysid,
            service: 'AUTOPASS',
          });
          const site = this.props.match.params.id;
          Analytics.customLogEventName(
            'first_subscription',
            'autopass',
            site ? site : '',
            'parking',
            'autopass'
          );
          this.setState({ mode: 'HOME', subscription: created });
          return;
        }

        this.setState({ mode: 'HOME' });
      } catch (error) {
        eureka.error('Unexcepted error in onboarding next handler', error);

        this.setState({
          error_modal: {
            title: 'Hubo un problema',
            message: 'No pudimos registrar la información. ¿Deseas reintentar?',
            onRetry: () => {
              this.setState({ error_modal: undefined });

              setTimeout(() => {
                this.onBoardingNextHandler();
              }, ANIMATION_TIME);
            },
            onCancel: () => {
              this.setState({ error_modal: undefined, mode: 'LANDING' });
            },
          },
        });
      }
    };

    onCreatePlateHandler = async () => {
      try {
        this.setState({ mode: 'LOADING', loading_message: 'Creando...' });

        const created = await VehicleClient.create({
          plate: this.state.plate_changed!.plate,
          user_id: this.state.user!.primarysid,
        });

        this.setState((prevState) => ({
          mode: 'ON_BOARDING_PLATE_SUCCESS',
          vehicles: [created, ...(prevState.vehicles || [])],
        }));

        // call next step
        this.onBoardingNextHandler();
      } catch (error) {
        eureka.error('Unexpected error in create plate handler', error);
        this.setState({ mode: 'ON_BOARDING_PLATE' });

        // plate already exist
        if ((error as AxiosError).response?.status === 409) {
          this.setState({
            modal_bottom_sheet: {
              title: '¡Uf! Tu patente ya está registrada',
              altText: 'O también puedes',
              message:
                'Hemos detectado que la patente ya existe en nuestro registro, ingresa una distinta.',
              cancelMessage: 'Comunicarte con soporte',
              displayButtonClose: false, // navigate when click times icon
              onCancel: () => {
                this.setState({
                  modal_bottom_sheet: undefined,
                  mode: 'CONTACT_FORM_SCREEN',
                });
              },
            },
          });
          return;
        }

        this.setState({
          error_modal: {
            title: 'Hubo un problema',
            message: 'No pudimos registrar la patente. ¿Deseas reintentar?',
            onRetry: () => {
              this.setState({ error_modal: undefined });

              setTimeout(() => {
                this.onCreatePlateHandler();
              }, ANIMATION_TIME);
            },
            onCancel: () => {
              this.setState({
                error_modal: undefined,
                mode: 'ON_BOARDING_PLATE',
              });
            },
          },
        });
      }
    };

    onChangePlateHandler = (plateChanged: IPlateChanged) => {
      this.setState({ plate_changed: plateChanged });
    };

    onDeepLinkAddCardHandler = (data: any) => {
      // start unsubscribing
      EventStreamer.off(
        'DEEPLINK:CARD_ADDED_CALLBACK',
        this.onDeepLinkAddCardHandler
      );

      Expr.whenInNativePhone(() => {
        const { response_code } = data;
        if (response_code === '0') {
          this.updateCard();
        }
      });

      Expr.whenNotInNativePhone(() => {
        eureka.debug('onDeepLinkAddCardHandler', data);
        if (data.response_code === 0) {
          this.updateCard();
        }
      });
    };

    onGoBackFromRegisterinCardHandler = () => {
      this.setState({ mode: 'LANDING' });

      // unsubscribe from card added callback
      EventStreamer.off(
        'DEEPLINK:CARD_ADDED_CALLBACK',
        this.onDeepLinkAddCardHandler
      );
    };

    onVerifyPaymentsCreatedOrRejected = (): boolean => {
      const { payments } = this.state;
      const paymentsCreatedReyected = payments?.filter(
        (element) => element.state === 'CREATED' || element.state === 'REJECTED'
      );
      return paymentsCreatedReyected && paymentsCreatedReyected?.length > 0
        ? true
        : false;
    };

    onVerifyExistPaymentsCreated = (): boolean => {
      const { payments } = this.state;
      const paymentsCreated = payments?.filter(
        (element) => element.state === 'CREATED'
      );
      return paymentsCreated && paymentsCreated?.length > 0 ? true : false;
    };

    onVerifyExistPaymentsCreatedWithPlate = (plate: string): boolean => {
      const { payments } = this.state;
      const paymentsCreated = payments?.filter(
        (element) =>
          element.state === 'CREATED' && element.metadata.plate === plate
      );
      return paymentsCreated && paymentsCreated?.length > 0 ? true : false;
    };

    onVerifyExistPaymentsRejected = (): boolean => {
      const { payments } = this.state;
      const paymentsRejected = payments?.filter(
        (element) => element.state === 'REJECTED'
      );
      return paymentsRejected && paymentsRejected?.length > 0 ? true : false;
    };

    onVerifyExistPaymentsRejectedWithPlate = (plate: string): boolean => {
      const { payments } = this.state;
      const paymentsRejected = payments?.filter(
        (element) =>
          element.state === 'REJECTED' && element.metadata.plate === plate
      );
      return paymentsRejected && paymentsRejected?.length > 0 ? true : false;
    };

    onVerifyAlertHandler = (): string | undefined => {
      const { subscription, card, vehicles } = this.state;

      if (!card)
        return 'El servicio de registro de patente ha sido deshabilitado. Para volver a utilizarlo por favor asigna una tarjeta.';

      if (!vehicles || vehicles.length === 0)
        return 'El servicio de registro de patente ha sido deshabilitado. Para volver a utilizarlo por favor agrega una patente.';

      if (subscription && subscription.state === 'PAUSED') {
        if (this.onVerifyPaymentsCreatedOrRejected() === true)
          return 'El servicio de Autopass estará deshabilitado desde tu próxima visita. Habilítalo en la opción inferior.';

        return 'El servicio de registro de patente ha sido deshabilitado. Para volver a utilizarlo por favor agrega una patente';
      }

      return undefined;
    };

    onDisabledSubscriptionHandler = (): boolean => {
      const { card, vehicles } = this.state;
      if (!card || !vehicles || vehicles.length === 0) return true;

      return false;
    };

    onGoBackFromRegisterPlateHandler = () => {
      const { subscription } = this.state;
      if (!subscription) {
        this.setState({ mode: 'LANDING' });
        return;
      }

      this.setState({ mode: 'HOME' });
    };

    onCardChangeHandler = (card?: ICard) => {
      this.setState({ card });
    };

    onClickCard = () => {
      this.props.history.push('/cards');
    };

    onbackHistory = (navigate = true) => {
      this.navHistory.pop();

      if (navigate) {
        if (!this.navHistory.length) {
          this.props.history.goBack();
          return;
        }

        this.setState({ mode: this.navHistory[this.navHistory.length - 1] });
      }
    };

    onSaveCalification = () => {
      this.setState({
        is_visible_califications: false,
        has_questions: false,
        is_qualificable: false,
      });
    };

    onCloseCalification = () => {
      this.setState({ is_visible_califications: false });
    };

    onRefreshHandler = async (event: CustomEvent<RefresherEventDetail>) => {
      try {
        await this.fetchAll(true);
      } catch (error) {
        eureka.error(
          'An error has occurred trying to refresh autopass data',
          error
        );
        eureka.debug((error as Error).message);
      } finally {
        event.detail.complete();
      }
    };

    /*
     * Main Render
     */
    render() {
      const { mode, error_modal, modal_bottom_sheet } = this.state;

      return (
        <IonPage
          className={`autopass-flow ${mode.replace(/_/gi, '-').toLowerCase()}`}
        >
          {(() => {
            const customRender: Function = (this as any)[`render${mode}`];
            if (!customRender) {
              return <div>{mode}</div>;
            }
            return customRender();
          })()}
          {/* if new modal bottom sheet state */}
          {modal_bottom_sheet && (
            <ModalBottomSheet
              show={Object.keys(modal_bottom_sheet).length > 0}
              headLine={modal_bottom_sheet.title}
              caption={modal_bottom_sheet.message}
              showButtonSeparator={modal_bottom_sheet.altText !== ''}
              buttonSeparatorText={modal_bottom_sheet.altText}
              cancelButtonText={modal_bottom_sheet.cancelMessage}
              onClose={() => {
                this.setState({ ...this.state, modal_bottom_sheet: undefined });
              }}
              onCancel={modal_bottom_sheet.onCancel}
            />
          )}

          {/* Keep legacy modal */}
          {error_modal && (
            <ErrorModal
              cssClass={error_modal.cssClass}
              title={error_modal.title}
              message={error_modal.message}
              cancelMessage={error_modal.cancelMessage}
              retryMessage={error_modal.retryMessage}
              onRetry={error_modal.onRetry}
              onCancel={error_modal.onCancel}
            />
          )}
        </IonPage>
      );
    }

    /**
     * Render the Custom Service Form localy
     * on Back callback will show the Home View
     * @returns
     */
    renderCONTACT_FORM_SCREEN = () => {
      return (
        <ContactFormScreen
          onBack={() => this.setState({ mode: 'ON_BOARDING_PLATE' })}
          onEmailSent={() => this.setState({ mode: 'HOME' })}
          phone_enable={true}
          user_email={this.state.user?.email}
          user_phone={this.state.user?.phone}
          user_fullname={this.state.user?.full_name}
        />
      );
    };

    renderLOADING = () => {
      const { loading_message } = this.state;

      return (
        <Fragment>
          <BackdropLoading message={loading_message!} />
        </Fragment>
      );
    };

    renderLANDING = () => {
      const { modal_is_open, type_modal } = this.state;
      const header = <DefaultHeader onBack={() => this.onbackHistory(true)} />;
      const content = (
        <div className="body-landing">
          <div>
            <img
              src={plateRegisterImage}
              alt="parking logo"
              className="plate-register-image"
            />
            {/*<img*/}
            {/*  src={StartRegisterParkingDark}*/}
            {/*  alt="parking logo"*/}
            {/*  className="night"*/}
            {/*/>*/}
            <h2 className="font-bold title">Registra tu patente</h2>
            <p
              className="subtitle description"
              // dangerouslySetInnerHTML={{
              //   __html:
              //     'Con Autopass olvídate de sacar ticket de estacionamiento en todos los malls Cencosud. La barrera se abrirá automáticamente al ingreso y salida.' +
              //     '</br></br>Tu ingreso y salida del parking será de manera automática.',
              // }}
            >
              Con el registro de patente entras y sales libremente de nuestros estacionamientos.
              <br />
              <br />
              Registra a continuación tus patentes y un medio de pago para empezar a disfrutar de este servicio.
            </p>
            <button
              className="more-info"
              onClick={() =>
                this.setState({ type_modal: 'REGISTER', modal_is_open: true })
              }
            >
              <div className="more-info-logo">
                <img src={ParkingLogo} alt="parking logo" />
              </div>
              <div
                className="more-info-text"
                dangerouslySetInnerHTML={{ __html: 'Revisa cómo funciona' }}
              ></div>
            </button>
          </div>
          {modal_is_open && type_modal === 'REGISTER' ? (
            <Fragment>
              <HelpRegisterModal
                onClose={this.onCloseModalHandler}
                modal_is_open={modal_is_open}
                content={HelpModal.modalDataContent('register')}
              />
            </Fragment>
          ) : null}
        </div>
      );

      return (
        <Page
          header={header}
          content={content}
          footer={
            <DefaultFooter
              mainActionText="Continuar"
              onClickMainAction={this.onBoardingNextHandler}
            />
          }
        />
      );
    };

    renderON_BOARDING_RUT = () => {
      return (
        <Fragment>
          <RutScreen
            title={'Necesitamos que ingreses tu RUT'}
            subtitle={'Esto es necesario para seguir con el proceso'}
            onBack={() => {
              this.goTo('LANDING');
            }}
            onContinue={() => {
              this.setState({
                mode: 'LOADING',
                loading_message: 'Actualizando...',
              });
            }}
            onValue={(rut: string) => {
              eureka.info('Update rut', rut);
              this.setState((prev: any) => ({
                ...prev,
                user: { ...prev.user, document_number: rut },
              }));
              this.onBoardingNextHandler();
            }}
          />
        </Fragment>
      );
    };

    renderON_BOARDING_CARD = () => {
      const header = (
        <DefaultHeader onBack={this.onGoBackFromRegisterinCardHandler} />
      );
      const content = (
        <div className="body-onboarding-card">
          <div className="content">
            <h1>Conectando con...</h1>
            <img src={oneClickImg} alt="oneclick" />
            <BackdropLoading message="" />
          </div>
        </div>
      );

      return <Page header={header} content={content} />;
    };

    renderON_BOARDING_CARD_SUCCESS = () => {
      const header = <DefaultHeader onBack={() => this.goTo('LANDING')} />;
      const content = (
        <div className="body-onboarding-card-success">
          <div className="content-card-success">
            <div className="added-card">
              <IonIcon icon={checkmarkCircleOutline} />
              <h1 className="font-bold">
                {' '}
                ¡Todo listo! <br />
                Tarjeta agregada.
              </h1>
            </div>
            <h3 className="feature-disclaimer">
              Ahora el cobro del ticket de parking se realizará de forma
              automática en la tarjeta que agregaste.
            </h3>
          </div>
        </div>
      );

      return (
        <Page
          header={header}
          content={content}
          footer={
            <DefaultFooter
              mainActionText="Continuar"
              onClickMainAction={this.onBoardingNextHandler}
            />
          }
        />
      );
    };

    renderON_BOARDING_PLATE = () => {
      const header = (
        <DefaultHeader onBack={this.onGoBackFromRegisterPlateHandler} />
      );
      const content = (
        <div className="body-onboarding-plate">
          <IonSlides
            onIonSlidesDidLoad={this.onGetSwiperHandler}
            pager={false}
            options={{ initialSlide: this.state.slideIndex, speed: 400 }}
          >
            <IonSlide className="swiper-no-swiping">
              <div className="slide-content">
                <img src={ParkingLogo} alt="parking logo" />
                <h2 className="font-bold">
                  Ingresa la patente
                  <br />
                  de tu vehículo
                </h2>
                <div className="register-plates-form fine-print">
                  {
                    //alreadyRegistered &&
                    <div className="error-message">
                      La patente ya fue agregada anteriormente, ingresa una
                      distinta.
                    </div>
                  }
                  <MultipleEntries onChange={this.onChangePlateHandler} />
                </div>
              </div>
            </IonSlide>
          </IonSlides>
        </div>
      );

      return (
        <Page
          header={header}
          content={content}
          footer={
            <DefaultFooter
              mainActionText="Continuar"
              mainActionIsDisabled={!this.state.plate_changed?.valid}
              onClickMainAction={this.onCreatePlateHandler}
            />
          }
        />
      );
    };

    renderON_BOARDING_PLATE_SUCCESS = () => {
      const header = <DefaultHeader onBack={() => this.goTo('LANDING')} />;
      const content = (
        <div className="body-onboarding-plate-success">
          <div className="content-plate-success">
            <div className="added-card">
              <IonIcon icon={checkmarkCircleOutline} />
              <h1 className="font-bold">
                {' '}
                ¡Todo listo! <br />
                Patente agregada.
              </h1>
            </div>
            <h3 className="feature-plate-disclaimer">
              Ahora puedes ingresar y salir del Parking sin ticket. Recuerda que
              el cobro se realizará de manera automática al salir del Parking.
            </h3>
          </div>
        </div>
      );

      return (
        <Page
          header={header}
          content={content}
          footer={
            <DefaultFooter
              mainActionText="Continuar"
              onClickMainAction={this.onBoardingNextHandler}
            />
          }
        />
      );
    };

    renderHOME = () => {
      const {
        modal_is_open,
        type_modal,
        card,
        payments,
        service_enabled,
        remove_modal,
        vehicles,
      } = this.state;

      // please use just default card
      const cards = card ? [card] : [];
      const header = <DefaultHeader onBack={() => this.onbackHistory(true)} />;
      const content = (
        <>
          <IonRefresher slot="fixed" onIonRefresh={this.onRefreshHandler}>
            <IonRefresherContent
              pullingIcon={ellipsisHorizontalOutline}
              refreshingSpinner="dots"
            ></IonRefresherContent>
          </IonRefresher>
          <div className="body-onboarding-home">
            <IonSlides
              onIonSlidesDidLoad={this.onGetSwiperHandler}
              pager={false}
              options={{ initialSlide: this.state.slideIndex, speed: 400 }}
            >
              <IonSlide>
                <div className="slide-content-onboarding-home">
                  <h2 className="font-bold">Registra tu patente</h2>
                  <h3 className="feature-disclaimer-onboarding-home">
                    Gestiona aquí todas tus patentes y medios de pago.
                  </h3>
                  <button
                    className="more-info-onboarding-home listing-onboarding-home"
                    onClick={() =>
                      this.setState({
                        modal_is_open: true,
                        type_modal: 'AUTOPASS',
                      })
                    }
                  >
                    <div className="logo-onboarding-home">
                      <img src={ParkingLogo} alt="parking logo" />
                    </div>
                    <div
                      className="text-onboarding-home"
                      dangerouslySetInnerHTML={{
                        __html: 'Revisa cómo funciona',
                      }}
                    ></div>
                  </button>
                  {this.onVerifyAlertHandler() && (
                    <Alert
                      type={'alert-expired'}
                      text={this.onVerifyAlertHandler()!}
                    />
                  )}
                </div>
                <SeparationLine
                  marginTop="20px"
                  marginBottom="20px"
                  darkBackground="rgba(255, 255, 255, 0.1)"
                  background="#FAFAFA"
                  height="8px"
                />

                <ButtonToggle
                  disabled={this.onDisabledSubscriptionHandler()}
                  label="Habilitar servicio"
                  value={!!service_enabled}
                  onChange={this.onToogleAutopassServiceHandler}
                />

                <SeparationLine
                  marginTop="20px"
                  marginBottom="20px"
                  darkBackground="rgba(255, 255, 255, 0.1)"
                  background="#FAFAFA"
                  height="8px"
                />
                <ListCards cards={cards} onClick={this.onClickCard} />
                <div>
                  {cards.length === 0 ? (
                    <div className="add-card-onboarding-home">
                      {' '}
                      <ButtonAdd
                        text={'Asignar Tarjeta'}
                        onOnClick={this.onClickCard}
                        icon={assignCard}
                      />
                    </div>
                  ) : null}
                  <h3 className="subtitle-card-onboarding-home">
                    Gestiona tus tarjetas presionando el botón a la derecha.
                  </h3>
                </div>
                <SeparationLine
                  marginTop="20px"
                  marginBottom="20px"
                  darkBackground="rgba(255, 255, 255, 0.1)"
                  background="#FAFAFA"
                  height="8px"
                />
                <div className="plates-onboarding-home">
                  <h2 className="font-bold">Patentes</h2>
                  {vehicles && vehicles.length >= 1 ? (
                    <ListPlates
                      vehicles={vehicles}
                      onRemovePlate={this.onRemovePlateHandler}
                    />
                  ) : null}
                </div>
                <div className="button-add-onboarding-home">
                  {vehicles?.length === 0 ? (
                    <div className="plates-button-add-onboarding-home"></div>
                  ) : null}
                  <ButtonAdd
                    text={'Agregar Patente'}
                    onOnClick={this.onAddPlate}
                  />
                </div>
                <SeparationLine
                  marginTop="20px"
                  marginBottom="20px"
                  darkBackground="rgba(255, 255, 255, 0.1)"
                  background="#FAFAFA"
                  height="8px"
                />
                <div className="history-onboarding-home">
                  <h2 className="font-bold">Historial</h2>
                  {payments && payments.length >= 1 ? (
                    <ListHistory
                      paymentIntention={payments}
                      onSelectHistory={this.onSelectHistoryHandler}
                    />
                  ) : (
                    <Info
                      title={'Nada que mostrarte'}
                      subtitle={'no tienes historial de parking'}
                      image={emptyImg}
                    />
                  )}
                </div>
                <SeparationLine
                  marginTop="20px"
                  marginBottom="20px"
                  darkBackground="rgba(255, 255, 255, 0.1)"
                  background="#FAFAFA"
                  height="8px"
                />
                <br />
                <br />
                <br />
                <div className="leave-service-onboarding-home">
                  <IonButton
                    className="white"
                    onClick={this.onLeaveServiceHandler}
                  >
                    Dar de baja el servicio
                  </IonButton>
                </div>
                <br />
                <br />
              </IonSlide>
            </IonSlides>
            {modal_is_open && type_modal === 'AUTOPASS' ? (
              <Fragment>
                <HelpRegisterModal
                  onClose={this.onCloseModalHandler}
                  modal_is_open={modal_is_open}
                  content={HelpModal.modalDataContent('autopass')}
                />
              </Fragment>
            ) : null}

            {remove_modal && (
              <RemoveModal
                onContinue={this.onRemoveModalContinueHandler}
                onCancel={this.onRemoveModalCancelHandler}
              />
            )}
          </div>
        </>
      );

      return <Page header={header} content={content} />;
    };

    renderAUTOPASS_HISTORY_DETAILS = () => {
      const payment = this.state.selectedHistory.payment;
      const {
        selectedHistory,
        is_visible_califications,
        user,
        payment_selected,
        is_qualificable,
        has_questions,
      } = this.state;
      const header = (
        <IonHeader>
          <div
            onClick={() => {
              this.goTo('HOME');
              this.setState({ has_questions: false, is_qualificable: false });
            }}
          >
            <IonIcon icon={closeOutline} />
          </div>
        </IonHeader>
      );
      const content = (
        <div className="autopass-history">
          <FancyTicket selectedHistory={selectedHistory!} />
          <div className="history-item status-section">
            {selectedHistory.state === 'APPROVED' && (
              <>
                <div className="status-big-icon">
                  <img src={checkedImg} alt="Todo listo y pagado..." />
                </div>
                <h2>¡Todo listo!</h2>
                <div className="process-status">Ticket pagado</div>
                {has_questions && is_qualificable && (
                  <div className="button-califications">
                    <IonButton
                      className="white-centered"
                      onClick={() => {
                        this.setState({ is_visible_califications: true });
                      }}
                    >
                      Calificar Experiencia
                    </IonButton>
                  </div>
                )}
                <>
                  <CalificationModal
                    flow="AUTOPASS"
                    show={is_visible_califications}
                    initialPage={{
                      mainText: `${
                        user?.full_name === '' || user?.full_name === '-'
                          ? 'Hola'
                          : user?.full_name
                      }, ya pagaste tu ticket`,
                      mainImage: flowQualificationImg,
                    }}
                    cancelButtonText={'Ahora no'}
                    payment_intention_id={payment_selected!.id}
                    payment_date={payment_selected!.created_at.toString()}
                    user={user}
                    metadata={{
                      mall_id: payment_selected!.metadata.facility_id as string,
                    }}
                    onClose={() => {
                      this.onCloseCalification();
                    }}
                    onSaveCalification={() => {
                      this.onSaveCalification();
                    }}
                    hasQuestions={(question: boolean) => {
                      this.setState({ has_questions: question });
                    }}
                  >
                    <div>
                      Cuéntanos cómo fue tu experiencia utilizando el servicio
                      de Autopass.
                    </div>
                    <div>Te tomará menos de un minuto.</div>
                  </CalificationModal>
                </>
              </>
            )}

            {selectedHistory.state === 'CREATED' && (
              <>
                <div className="status-big-icon">
                  <img src={processingImg} alt="Procesando..." />
                </div>
                <h2>En proceso...</h2>
                <div className="process-status">Auto estacionado</div>
              </>
            )}
          </div>
        </div>
      );
      return <Page header={header} content={content} />;
    };

    renderAUTOPASS_REMOVED = () => {
      return (
        <Page
          content={
            <div className="body-autopass-removed">
              <IonIcon icon={checkmarkCircleOutline} />
              <h1 className="font-bold">
                Todo listo, {this.state.user!.full_name}.
                <br />
                El servicio ha sido dado de baja.
              </h1>
            </div>
          }
          footer={
            <DefaultFooter
              mainActionText="Finalizar"
              onClickMainAction={this.onServiceRemovedFinalizeHandler}
            />
          }
        />
      );
    };
  }
);
