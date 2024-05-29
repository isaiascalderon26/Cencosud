import React, { Fragment, RefObject } from 'react';
import './index.less';
import { RouteComponentProps } from 'react-router';
import { withIonLifeCycle, IonPage, IonContent, IonIcon, IonSkeletonText, IonSlides, IonSlide, IonFooter, IonHeader, IonButton, IonModal } from '@ionic/react';
import i18n from '../../lib/i18n';
import locales from './locales';
import StartRegisterParking from './../../assets/media/autopass.svg';
import ParkingLogo from '../../assets/media/parking-home.png'
import { add, arrowBack, cardOutline, ellipseOutline, checkmarkCircle, checkmarkCircleOutline, chevronForward, closeOutline, removeCircle, trash, close, addCircleOutline, addCircleSharp, trashSharp } from 'ionicons/icons';
import ParkingClient from '../../clients/ParkingClient';
import isotypeMasterCard from '../../assets/media/isotype-mastercard.svg';
import isotypeVisaCard from '../../assets/media/isotype-visa.svg';
import processingImg from '../../assets/media/atom/icon/timing-process.svg';
import oneClickImg from '../../assets/media/oneclick.svg';
import checkedImg from '../../assets/media/atom/icon/checked.png';
import deleteCardImg from '../../assets/media/delete-card.svg';
import loadingSpin from './../../assets/media/icons/loading-spin.svg';
import autoMoneyIcon from "../../assets/media/parking-auto-money.png";
import qrIcon from "../../assets/media/parking-qr.png";
import pointsIcon from "../../assets/media/parking-points.png";

import UserClient from '../../clients/UserClient';
import BackdropLoading from '../../components/backdrop-loading';
import { IUser } from '../../models/users/IUser';
import RemovePlateModal from '../../components/remove-plate-modal';
import Expr from '../../lib/Expr';
import EurekaConsole from '../../lib/EurekaConsole';
import EventStreamer from '../../lib/EventStreamer';
import CardClient from '../../clients/CardClient';
import FancyTicket from '../../components/parking-ticket';
import RegisterModal from '../../components/register_modal';
import DniFormatter from '../../lib/formatters/DniFormatter';
import AuthenticationClient from '../../clients/AuthenticationClient';
import LoyaltyClient from '../../clients/LoyaltyClient';
import HelpRegisterModal from '../../components/help-register-modal';
import Alert from '../sky-costanera-flow/components/alert';
import Analytics from '../../lib/FirebaseAnalytics';

import ImageHelpCarEnter from '../../assets/media/service-onboarding/help-car-enter.svg';
import ImageHelpCard from '../../assets/media/service-onboarding/help-card.svg';
import ImageHelpLeaves from '../../assets/media/service-onboarding/help-leaves.svg';
import ImageHelpMoney from '../../assets/media/service-onboarding/help-money.svg';
import ImageHelpPhone from '../../assets/media/service-onboarding/help-phone.svg';
import ImageHelpPlateCard from '../../assets/media/service-onboarding/help-plate-card.svg';
import ImageHelpPlate from '../../assets/media/service-onboarding/help-plate.svg';
import ImageHelpReceipt from '../../assets/media/service-onboarding/help-receipt.svg';
import ImageHelpRUT from '../../assets/media/service-onboarding/help-rut.svg';
import ImageHelpScan from '../../assets/media/service-onboarding/help-scan.svg';
import { InAppBrowser, InAppBrowserEvent } from '@ionic-native/in-app-browser';
import ICard from '../../models/cards/ICard';
import PaymentIntentionClient from '../../clients/PaymentIntentionClient';
import IPaymentIntention from '../../models/payments/IPaymentIntention';
import ErrorModal, { IErrorModalProps } from '../../components/error-modal';
import moment from 'moment';
import ButtonPoints from '../../components/button-points';
import RemoteConfigClient from '../../clients/RemoteConfigClient';

const ANIMATION_TIME = 500;
const localize = i18n(locales);
const eureka = EurekaConsole({ label: "parking-flow-page" });

interface IProps extends RouteComponentProps<{
  id: string
}> {
}

interface IState {
  mode: "INITIAL_STATE" | "HOME_PARKING" | "MOBILE_PAYMENT" | "HOME_SERVICES" | "REGISTER_PLATES" |
  "REGISTER_PLATES_VALIDATING" | "REGISTER_PLATES_SUCCESS" | "REGISTER_PLATES_LIST" | "REGISTER_RUT"
  | "REGISTER_CARD_SUCCESS" | "REGISTER_CARD_ERROR" | "REGISTER_CARD_VALIDATING" | "AUTOPASS_HISTORY_DETAILS" | "INITIAL_REGISTER" | "LOADING",
  buttonAct: string,
  menu_is_open: boolean,
  remove_card_modal: boolean,
  slideIndex: number,
  forwardButton: boolean,
  selectedPlate?: string,
  regPlate: string,
  user?: IUser,
  payments?: IPaymentIntention[],
  plateState: "CHILLING" | "LOADING" | "DELETED" | "ALREADY_REGISTERED",
  document_number: string,
  selectedHistory: Record<string, any>,
  cardPaymentMethods: ICard[],
  register_is_open: boolean,
  isValidStatesInputs: {
    document_number: boolean,
  }
  pointsModal: boolean,
  open_modal_card: boolean,
  disabled_button_delete_card_confirm: boolean,
  card_delete: boolean,
  in_site: boolean,
  in_pending_payment: boolean,
  id_card: string,
  modal_is_open: boolean,
  type_modal: string,
  loading_register: boolean,
  loading_stop_register: boolean,
  loading_card_default: boolean,
  cards: {
    lastUpdate: number,
    data: ICard[]
  },
  error_modal?: IErrorModalProps,
}

export default withIonLifeCycle(class ParkingPage extends React.Component<IProps, IState> {
  _isMounted = false;
  private readonly digitInput1?: RefObject<HTMLInputElement>;
  private readonly digitInput2?: RefObject<HTMLInputElement>;
  private readonly digitInput3?: RefObject<HTMLInputElement>;
  private readonly digitInput4?: RefObject<HTMLInputElement>;
  private readonly digitInput5?: RefObject<HTMLInputElement>;
  private readonly digitInput6?: RefObject<HTMLInputElement>;

  constructor(props: any, state: any) {
    super(props, state);

    this.digitInput1 = React.createRef<HTMLInputElement>();
    this.digitInput2 = React.createRef<HTMLInputElement>();
    this.digitInput3 = React.createRef<HTMLInputElement>();
    this.digitInput4 = React.createRef<HTMLInputElement>();
    this.digitInput5 = React.createRef<HTMLInputElement>();
    this.digitInput6 = React.createRef<HTMLInputElement>();
  }

  private swiper: any;
  state: IState = {
    mode: "INITIAL_STATE",
    menu_is_open: false,
    remove_card_modal: false,
    slideIndex: 1,
    forwardButton: true,
    buttonAct: 'one',
    plateState: 'CHILLING',
    document_number: '',
    selectedHistory: {},
    cardPaymentMethods: [],
    register_is_open: false,
    isValidStatesInputs: {
      document_number: false
    },
    pointsModal: false,
    open_modal_card: false,
    disabled_button_delete_card_confirm: false,
    regPlate: '',
    card_delete: true,
    in_site: false,
    in_pending_payment: false,
    id_card: '',
    modal_is_open: false,
    type_modal: '',
    loading_register: false,
    loading_stop_register: false,
    loading_card_default: false,
    cards: {
      lastUpdate: 0,
      data: []
    }
  }

  goBack = () => {
    this.props.history.goBack();
  }

  getUserCards = async (): Promise<ICard[]> => {
    let response;
    let now = new Date().getTime();

    if ((now - this.state.cards.lastUpdate) > 5000) {
      let data = await CardClient.getList();
      response = {
        lastUpdate: new Date().getTime(),
        data: data
      }
      this.setState({
        cards: response
      })
    } else {
      response = this.state.cards;
    }
    return response.data;
  }

  userHasVehicles = async () => {
    const currentUser = await UserClient.me();

    return currentUser.vehicles && currentUser.vehicles.length > 0;
  }

  userHasRUT = async () => {
    const currentUser = await UserClient.me();

    return currentUser.document_number && currentUser.document_number.length > 0;
  }

  userHasCard = async () => {

    const response = await this.getUserCards();
    return response && response?.length > 0 ? true : false;
  }

  ionViewDidEnter() {
    this._isMounted = true;
    if (this._isMounted) {
      const site = this.props.match?.params?.id ?? localStorage.getItem("mall-selected");
      Analytics.customLogEventName("parking", "page_view", site ? site : "", "parking", "parking");
      setTimeout(() => {
        this.onGetUserVehiclesHandler();
      }, 170);
    }
    this.showModalLoyalty();
    EventStreamer.on("DEEPLINK:CARD_ADDED_CALLBACK", this.onDeepLinkAddCardHandler);
  }

  ionViewDidLeave() {
    this._isMounted = false;

    EventStreamer.off("DEEPLINK:CARD_ADDED_CALLBACK", this.onDeepLinkAddCardHandler)
  }

  onDeepLinkAddCardHandler = async (data: any) => {
    Expr.whenInNativePhone(async () => {
      const { response_code } = data;
      if (response_code === "0") {
        this.setState({ mode: "REGISTER_CARD_SUCCESS" });
      } else {
        this.onGetUserVehiclesHandler();
      }

    });
    Expr.whenNotInNativePhone(async () => {
      //const response = data.params.pop().split('=');
      const response = data.params[0].split('=');
      if (response.at(1) === "0") {
        this.setState({ mode: "REGISTER_CARD_SUCCESS" });
      } else {
        this.onGetUserVehiclesHandler();
      }
    });
  }

  onGetUserVehiclesHandler = async () => {
    try {
      const [user, { data: payments }] = await Promise.all([
        UserClient.me(),
        PaymentIntentionClient.list({
          query: {
            'payment_flow.keyword_is': 'AUTOPASS',
            'state.keyword_is_one_of': ['APPROVED', 'REJECTED'],
            'payment_method.details.user_id.keyword_is': AuthenticationClient.getInfo().primarysid,
          },
          sort: {
            created_at: 'desc'
          },
          offset: 0,
          limit: 5
        })
      ]);

      // set context
      this.setState({
        mode: 'HOME_PARKING',
        user,
        payments
      })
    } catch (error) {
      eureka.error('Unexpected error in onGetUserVehiclesHandler', error);

      this.setState({
        error_modal: {
          title: "Hubo un problema",
          message: "No pudimos cargar toda la información. ¿Deseas reintentar?",
          onRetry: () => {
            this.setState({ error_modal: undefined });

            setTimeout(() => {
              this.onGetUserVehiclesHandler();
            }, ANIMATION_TIME);
          },
          onCancel: () => {
            this.setState({ error_modal: undefined });

            setTimeout(() => {
              this.goBack();
            }, ANIMATION_TIME)
          }
        }
      })
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

  onSelectMobilePaymentHandler = async () => {
    this.setState({
      mode: 'MOBILE_PAYMENT'
    })
  }

  onSelectAutoPass = async () => {
    /**old flow autopass */
    /*
    this.setState({ mode: 'LOADING' });


    const rut = await this.userHasRUT();
    const card = await this.userHasCard();
    const plate = await this.userHasVehicles();

    if (rut && card && plate) {
      this.showPlatesList();
      return
    }


    if (!rut || !card || !plate) {
      const selectedMode = 'INITIAL_REGISTER';
      this.setState({
        mode: selectedMode,
      });
    } else {
      this.checkRegisterInitAdvance();
    }*/
    this.props.history.push(`/autopass/${this.props.match?.params?.id ?? localStorage.getItem("mall-selected")}`);

  }

  onSelectAutoScan = async () => {
    Analytics.customLogEvent("ionic_app", "autoscan");
    //return;
    // TODO: uncomment when ready
    this.props.history.push(`/autoscan/${this.props.match?.params?.id ?? localStorage.getItem("mall-selected")}`);
  }

  onKeyboardInput = async (e: any, current: any, next: any, prev: any) => {

    if (e.keyCode === 8) {

      current.current.value = '';

      if (prev !== undefined) {
        prev.current.focus();
      }

      this.setState({
        forwardButton: true
      });

    } else {
      current.current.value = current.current.value.replace(/[^a-z0-9]/gi, '');
      if (current.current.value && next !== undefined) {
        next.current.focus();
      }
    }

    if (await this.formValid()) {
      this.setState({
        forwardButton: false
      });
    }

    return;
  }

  joinPlateInput = () => {
    return [
      this.digitInput1!.current!.value,
      this.digitInput2!.current!.value,
      this.digitInput3!.current!.value,
      this.digitInput4!.current!.value,
      this.digitInput5!.current!.value,
      this.digitInput6!.current!.value,
    ].join('').toUpperCase();
  }

  formValid = async () => {
    const fullString = this.joinPlateInput();
    return fullString.replace(' ', '').length === 6;
  }

  registerPlate = async () => {
    this.setState({
      mode: 'REGISTER_PLATES_VALIDATING'
    });

    const typedPlate = this.joinPlateInput();
    const registeredPlate = await ParkingClient.attachPlateToCurrentUser(typedPlate);

    if (!registeredPlate) {
      this.setState({
        mode: 'REGISTER_PLATES',
        plateState: 'ALREADY_REGISTERED',
      });
    }

    if (registeredPlate) {
      this.setState({
        mode: 'REGISTER_PLATES_SUCCESS'
      });
    }
  }

  showPlatesList = async () => {
    const userData = await UserClient.me();
    const cards = await this.getUserCards();

    this.setState({
      mode: 'REGISTER_PLATES_LIST',
      user: userData,
      cardPaymentMethods: cards,
      loading_card_default: false
    });

    if (cards.length > 0) {
      const hasCardDefault = cards.filter((card: Record<string, any>) => card.default === true).length != 0 ? true : false;
      if (!hasCardDefault) {
        const card_id = cards[0].id;
        this.onSetDefaultCardClickHandler(card_id);
      }
    }

    if (userData.meta_data.autopass_cancelled) {

      // TODO: remove
      if (typeof userData.meta_data.autopass_cancelled === 'boolean') {
        console.log('autopass_cancelled is boolean');
        return;
      }

      setTimeout(() => {
        const paymentIntention = userData.meta_data.autopass_cancelled.payment_intention
        const shortName = userData.full_name.split(' ').filter(Boolean).slice(0, 2).join(' ');

        this.setState({
          error_modal: {
            title: `${shortName}, tienes un pago pendiente`,
            message: "En tu última visita no pudimos efectuar el débito en tu tarjeta registrada. Por favor actualiza el medio de pago, de lo contrario no podrás contar con el servicio.",
            retryMessage: "Resolver",
            onRetry: () => {
              this.setState({ error_modal: undefined });

              setTimeout(() => {
                this.props.history.push(`/autopass-resolution/${paymentIntention}`)
              }, ANIMATION_TIME);
            },
            onCancel: () => {
              this.setState({ error_modal: undefined });
            }
          }
        })
      }, ANIMATION_TIME);
    }

  }

  showRegisterForm = async () => {
    const selectedMode = await this.userHasVehicles() ? 'REGISTER_PLATES_LIST' : 'REGISTER_PLATES';
    if (selectedMode === 'REGISTER_PLATES_LIST') {
      this.showPlatesList();
    } else {
      this.setState({
        mode: selectedMode
      });
    }
  }

  showRegisterPlate = async () => {
    const selectedMode = 'REGISTER_PLATES';
    this.setState({
      mode: selectedMode
    });
  }

  showRegisterCard = async () => {
    const selectedMode = 'REGISTER_CARD_VALIDATING';
    this.setState({
      mode: selectedMode
    });
    this.onAddCardClickHandler();
  }

  removePlate = async (plate: string) => {
    const removedPlate = await ParkingClient.removePlate(plate);
    if (removedPlate.status !== 200) {
      // MANEJAR ERROR
      return
    }
    await this.showPlatesList();
  }

  onRemoveCardConfirmHandler = async () => {
    this.setState({
      remove_card_modal: false
    })
    await this.showPlatesList();
  }

  showParkingDetail = async (parkingRecord: any | IPaymentIntention) => {
    // support to payment intentions
    if ('payment_flow' in parkingRecord) {
      const paymentIntention = parkingRecord as IPaymentIntention;

      // if payment intention rejected
      // redirect to autopass resolution flow
      if (paymentIntention.state === 'REJECTED') {
        this.props.history.push(`/autopass-resolution/${paymentIntention.id}`);
        return;
      }

      this.setState({
        mode: 'AUTOPASS_HISTORY_DETAILS',
        selectedHistory: {
          userId: paymentIntention.payment_method.details.user_id,
          location: paymentIntention.metadata.facility_id,
          locationName: paymentIntention.metadata.facility_name,
          plate: paymentIntention.metadata.plate,
          entranceDateTime: new Date(paymentIntention.metadata.entrance_date_time as string),
          exitDateTime: new Date(paymentIntention.metadata.exit_date_time as string),
          payment: {
            fee: {
              amount: paymentIntention.transaction.amount.total,
              currencyCode: paymentIntention.transaction.currency,
            }
          }
        },
      });
      return;
    }

    this.setState({
      mode: 'AUTOPASS_HISTORY_DETAILS',
      selectedHistory: {
        userId: parkingRecord.userId,
        location: parkingRecord.location,
        locationName: parkingRecord.locationName,
        plate: parkingRecord.plate,
        entranceDateTime: new Date(parkingRecord.entranceDateTime),
        exitDateTime: new Date(parkingRecord.exitDateTime),
        payment: parkingRecord.payment
      },
    });
  }

  formatMoney = (amount: Number): string => {
    // Sorry for the Regex... but it's so Sick! (okno)
    return Number(amount).toFixed(0).replace(/\d(?=(\d{3})+)/g, '$&.');
  }

  onInputChangeHandler = (key: string, value: string) => {

    const isValids = Object.assign(this.state.isValidStatesInputs, {});
    if (value !== undefined) {
      switch (key) {
        case "document_number":
          isValids.document_number = DniFormatter.isRutValid(value);
          break;
        default:
          return;
      }
    }
    const newState: any = { isValidStatesInputs: isValids };
    newState[key] = value;
    this.setState(newState)
  }

  onChangePostHandler = async (key: string) => {
    try {
      this.setState({
        mode: 'REGISTER_CARD_VALIDATING'
      });

      await UserClient.update(key, this.state.document_number)
      setTimeout(() => {
        if (!this.userHasCard()) {
          this.setState({
            mode: 'REGISTER_CARD_VALIDATING'
          });
          this.onAddCardClickHandler();
        } else if (!this.userHasVehicles()) {
          this.setState({
            mode: 'REGISTER_PLATES'
          });
        } else {
          this.showPlatesList();
        }
      }, 400);

      //TODO:llamar a webpay acá
    } catch (error) {
      console.log(error);
    }
  }

  registerInitAdvance = async () => {
    const rut = await this.userHasRUT();
    const card = await this.userHasCard();
    const plate = await this.userHasVehicles();

    if (!rut) {
      this.setState({
        mode: 'REGISTER_RUT'
      });
      return
    }
    if (!card) {
      this.setState({
        mode: 'REGISTER_CARD_VALIDATING'
      })
      this.onAddCardClickHandler();
      return
    }
    if (!plate) {
      this.setState({
        mode: 'REGISTER_PLATES'
      });
      return
    }
    if (rut && card && plate) {
      this.showPlatesList();
      return
    }
  }

  /* REGISTER CARD WEBPAY */
  onAddCardClickHandler = async () => {
    const links = await CardClient.register();
    const inscription_url = links.find((l: any) => l.rel === "inscription");
    if (!inscription_url) {
      eureka.error('the link inscription_url wasn`t found in the dashboard links');
      this.setState({
        loading_register: false
      });
      return;
    }
    let response_code: string | null = 'exit';

    Expr.whenInNativePhone(async () => {
      console.info('Proceso de abrir ventana', inscription_url)
      let inAppBrowserRef = InAppBrowser.create(inscription_url.href, '_blank', { location: 'no' });
      inAppBrowserRef.show()

      inAppBrowserRef.on('exit').subscribe((evt: InAppBrowserEvent) => {
        if (response_code !== '0')
          EventStreamer.emit("DEEPLINK:CARD_ADDED_CALLBACK", { response_code: 'exit' })
      })

      inAppBrowserRef.on("loadstop").subscribe((evt: InAppBrowserEvent) => {
        if (evt.url && evt.url.includes('response_code')) { //url interceptor
          const queryString = evt.url.split('#')[1];
          const urlParams = new URLSearchParams(queryString);
          const code = urlParams.get('response_code')

          console.log('response_code', code)

          response_code = code;
          EventStreamer.emit("DEEPLINK:CARD_ADDED_CALLBACK", { response_code: code })
          inAppBrowserRef.close();
        }
      });
      this.setState({
        loading_register: false
      });
    });

    Expr.whenNotInNativePhone(() => {
      let addCard = false;
      const onPopupMessage = async (e: any) => {
        if (e.origin === e.data.origin && !addCard) {
          // Simulate the deeplink process if we were in a mobile
          EventStreamer.emit("DEEPLINK:CARD_ADDED_CALLBACK", e.data)
          addCard = true;
        } else if (!addCard) {
          console.error("FATAL ADD CARD ERROR:: Origin missmatch");
        }
      };

      window.addEventListener("message", onPopupMessage);
      const loginPopUp = window.open(
        inscription_url.href,
        "_blank",
        "toolbar=yes,scrollbars=yes,resizable=yes,top=100,left=500,width=500,height=600"
      );

      // Only in web
      const timer = setInterval(function () {
        if (loginPopUp && loginPopUp.closed) {
          clearInterval(timer);
          window.removeEventListener("message", onPopupMessage);
        }
      }, 500);

      this.setState({
        loading_register: false
      });
    });
  }

  onSetDefaultCardClickHandler = async (idCard: string) => {
    if (this.state.loading_card_default) return;

    try {
      this.setState({
        loading_card_default: true
      })
      await CardClient.setDefault(idCard);
      this.showPlatesList();

    } catch (error) {
      console.log(error);

      this.setState({
        loading_card_default: false
      })
    }
  }

  onRegisterUserOpenHandler() {
    this.setState({
      register_is_open: true,
    });
  }

  onModalPointsOpenHandler() {
    this.setState({
      pointsModal: true,
    });
  }

  onCloseRegisterUserModalHandler = () => {
    this.setState({
      register_is_open: false,
    });
  };

  onClosePointsModalHandler = () => {
    this.setState({
      pointsModal: false,
    });
  };

  showModalLoyalty = async () => {
    const myLoyalty = await LoyaltyClient.getLoyalty();
    this.setState({
      pointsModal: !myLoyalty.data.loyaltyPlate
    })
  }

  closeModalLoyalty = async () => {

    this.setState({
      pointsModal: false
    });
  }

  goToRegistry = async () => {

    this.setState({
      pointsModal: false,
      mode: "INITIAL_REGISTER"
    });
    const rut = await this.userHasRUT();
    const card = await this.userHasCard();
    const plate = await this.userHasVehicles();

    if (rut && card && plate) {
      this.showPlatesList();
      return
    }

    if (!rut || !card || !plate) {
      const selectedMode = 'INITIAL_REGISTER';
      this.setState({
        mode: selectedMode,
      });
    } else {
      this.checkRegisterInitAdvance();
    }
  }

  showInitialRegistry = async () => {
    this.setState({
      pointsModal: false,
      mode: "INITIAL_REGISTER"
    });
  }

  onLoginClickHandler = async () => {
    await AuthenticationClient.signOut();
    window.location.reload();
  }

  onCloseModalHandler = () => {
    this.setState({
      open_modal_card: false,
      disabled_button_delete_card_confirm: false,
      card_delete: true,
      in_site: false,
      in_pending_payment: false,
      id_card: '',
      modal_is_open: false,
    })
  }

  onPopupDeleteCardHandler = (id: string) => {
    this.setState({
      open_modal_card: true,
      id_card: id
    })
  }

  onRemoveCardHandlerConfirm = async (provider: string, id: string) => {
    this.setState({
      disabled_button_delete_card_confirm: true
    });

    const response = await CardClient.removeCard(provider, id);
    const { id: idCard, reason } = response.data;
    //reason = inSite | pendingPayment
    console.log("reason", reason);
    if (reason === 'inSite') {
      this.setState({
        card_delete: false,
        in_site: true
      })
      return;
    }

    if (reason === 'pendingPayment') {
      this.setState({
        card_delete: false,
        in_pending_payment: true
      })
      return;
    }

    let newCards = this.state.cardPaymentMethods.filter(x => x.id != idCard);

    setTimeout(async () => {

      this.setState({
        cardPaymentMethods: newCards,
        open_modal_card: false,
        disabled_button_delete_card_confirm: false
      });

      if (newCards.length > 0) {
        const hasCardDefault = newCards.filter((card: Record<string, any>) => card.default === true).length != 0 ? true : false;
        if (!hasCardDefault) {
          const card_id = newCards[0].id;
          this.onSetDefaultCardClickHandler(card_id);
        }
      }
    }, 100);

  }

  onGoBackFromRegisterCardInProgressHandler = async () => {
    if (this.state.loading_stop_register) { return }
    else {

      this.setState({
        loading_stop_register: true
      });

      const card = await this.userHasCard();
      const plate = await this.userHasVehicles();

      if (card || plate) {
        this.showPlatesList();
      } else {
        this.setState({
          mode: 'INITIAL_REGISTER'
        });
      }
      // unsubscribe from deeplink to avoid unexpected behavior
      EventStreamer.off("DEEPLINK:CARD_ADDED_CALLBACK", this.onDeepLinkAddCardHandler);

      this.setState({
        loading_stop_register: false
      });
    }
  }

  checkRegisterInitAdvance = () => {
    if (this.state.loading_register) { return } else {
      this.setState({
        loading_register: true
      });

      this.registerInitAdvance();
    }
  }

  helpModal = (id: string) => {
    let strings = [];

    switch (id) {
      case 'register':
        strings.push({
          "image": ImageHelpRUT,
          "title": localize('SLIDER_REGISTER_TITLE1'),
          "description": localize('SLIDER_REGISTER_DESCRIPTION1')
        });
        strings.push({
          "image": ImageHelpPlateCard,
          "title": localize('SLIDER_REGISTER_TITLE2'),
          "description": localize('SLIDER_REGISTER_DESCRIPTION2')
        });
        strings.push({
          "image": ImageHelpMoney,
          "title": localize('SLIDER_REGISTER_TITLE3'),
          "description": localize('SLIDER_REGISTER_DESCRIPTION3')
        });
        strings.push({
          "image": ImageHelpPhone,
          "title": localize('SLIDER_REGISTER_TITLE4'),
          "description": localize('SLIDER_REGISTER_DESCRIPTION4')
        });
        break;

      case 'autopass':
        strings.push({
          "image": ImageHelpPlate,
          "title": localize('SLIDER_AUTOPASS_TITLE1'),
          "description": localize('SLIDER_AUTOPASS_DESCRIPTION1')
        });
        strings.push({
          "image": ImageHelpCarEnter,
          "title": localize('SLIDER_AUTOPASS_TITLE2'),
          "description": localize('SLIDER_AUTOPASS_DESCRIPTION2')
        });
        strings.push({
          "image": ImageHelpLeaves,
          "title": localize('SLIDER_AUTOPASS_TITLE3'),
          "description": localize('SLIDER_AUTOPASS_DESCRIPTION3')
        });
        strings.push({
          "image": ImageHelpReceipt,
          "title": localize('SLIDER_AUTOPASS_TITLE4'),
          "description": localize('SLIDER_AUTOPASS_DESCRIPTION4')
        });
        break;

      case 'autoscan':
        strings.push({
          "image": ImageHelpScan,
          "title": localize('SLIDER_AUTOSCAN_TITLE1'),
          "description": localize('SLIDER_AUTOSCAN_DESCRIPTION1')
        });
        strings.push({
          "image": ImageHelpCard,
          "title": localize('SLIDER_AUTOSCAN_TITLE2'),
          "description": localize('SLIDER_AUTOSCAN_DESCRIPTION2')
        });
        strings.push({
          "image": ImageHelpReceipt,
          "title": localize('SLIDER_AUTOSCAN_TITLE3'),
          "description": localize('SLIDER_AUTOSCAN_DESCRIPTION3')
        });
        break;
    }

    return strings;
  }

  cardDecorator = (type: string) => {
    let icon = cardOutline;

    switch (type) {
      case "Visa":
        icon = isotypeVisaCard;
        break;
      case "MasterCard":
        icon = isotypeMasterCard;
        break;
    }

    return icon;
  }

  plateDecorator = (plate: any) => {
    return plate.match(/.{1,2}/g).join(' · ');
  }

  storeLogo = (store: string) => {
    console.log(this.state);
    //return plate.match(/.{1,2}/g).join(' · ');

    return `${process.env.REACT_APP_BUCKET_URL}/logo/${store.toLocaleLowerCase().replace(/\s/g, '')}-light.png`;
  }

  getMonthNameShort = (date: Date): string => {
    const monthNames = ["Ene", "Feb", "Mar", "Abr", "May", "Jun",
      "Jul", "Ago", "Sept", "Oct", "Nov", "Dic"
    ];

    return monthNames[date.getMonth()];
  }

  showMessage = (): string => {
    const { cards, user } = this.state;
    let message = '';
    if (cards.data.length === 0) {
      message = `${localize('MESSAGE_AUTOPASS_DISABLED')} ${localize('MESSAGE_AUTOPASS_PAYMENT_METHOD')}`;
    }
    if (user?.vehicles?.length === 0) {
      message = `${localize('MESSAGE_AUTOPASS_DISABLED')} ${localize('MESSAGE_AUTOPASS_CAR_PLATE')}`;
    }

    return message;

  }

  sortHistoryParking = (parkingHistory: Array<any>): Array<any> => {
    const parkedSet = parkingHistory
      .filter(record => !record.payment)
      .sort((a, b) => {
        return new Date(b.entranceDateTime).valueOf() - new Date(a.entranceDateTime).valueOf()
      })
    const paidSet = parkingHistory
      .filter(record => record.payment)
      .sort((a, b) => {
        return new Date(b.entranceDateTime).valueOf() - new Date(a.entranceDateTime).valueOf()
      })
    return [...parkedSet, ...paidSet];
  }

  render() {
    const { mode, remove_card_modal, selectedPlate, error_modal } = this.state;
    const dynamicClassName = `parking-flow ${mode.replace(/_/ig, '-').toLowerCase()}`;

    return <IonPage className={dynamicClassName}>
      {(() => {
        const customRender: Function = (this as any)[`render${mode}`];
        if (!customRender) {
          return <div>{mode}</div>;
        }
        return customRender();
      })()}

      {remove_card_modal && <RemovePlateModal plate={selectedPlate!} onClose={
        (action) => {
          action === 'approved' ? this.onRemoveCardConfirmHandler() : this.setState({ remove_card_modal: false })
        }
      } />
      }

      {error_modal && <ErrorModal cssClass="parking-flow-5837" title={error_modal.title} message={error_modal.message} cancelMessage={error_modal.cancelMessage} retryMessage={error_modal.retryMessage} onRetry={error_modal.onRetry} onCancel={error_modal.onCancel} />}
    </IonPage>
  }

  renderINITIAL_STATE = () => {
    return <Fragment>
      <IonContent>
        <div style={{ padding: '0 24px', width: '100%' }}>
          <IonSkeletonText style={{ height: "18px", width: "40%", borderRadius: "12px", marginTop: "48px" }} animated={true} />
          <IonSkeletonText style={{ height: "128px", width: "128px", borderRadius: "50%", marginTop: "19px" }} animated={true} />
          <IonSkeletonText style={{ height: "20px", width: "60%", borderRadius: "12px", marginTop: "19px" }} animated={true} />
          <IonSkeletonText style={{ height: "32px", width: "75%", borderRadius: "12px", marginTop: "19px" }} animated={true} />
        </div>
      </IonContent>
    </Fragment>
  }

  renderHOME_PARKING = () => {
    const { user } = this.state;

    // console.info("1072")
    // // Analytics.customLogEvent("ionic", "parking");
    // console.info("1074")

    return <Fragment>
      <IonHeader>
        <div onClick={() => {
          this.props.history.push(`/mall-home/${this.props.match?.params?.id ?? localStorage.getItem("mall-selected")}`)
        }}>
          <IonIcon icon={arrowBack} />
        </div>
      </IonHeader>
      <IonContent className='parking-init'>
        <div>
          <div className="parking-title">
            <img src={ParkingLogo} alt="parking logo" />
            <h2 className="font-bold">Selecciona uno de los servicios de Parking</h2>
          </div>
          <div>
            <div onClick={() => {
              (user?.email !== "invited"
                ? (this.onSelectAutoPass())
                : this.onRegisterUserOpenHandler())
            }}> {/*invited validation*/}
              <img src={autoMoneyIcon} alt="icon-points"/>
              <div>
                <h3 className="font-bold">Registra tu patente</h3>
                <p dangerouslySetInnerHTML={{ __html: localize('MSJ_AUTOPASS') }} />
              </div>
              <div>
                <IonIcon icon={chevronForward} />
              </div>
            </div>

            <div /* style={{opacity: 0.5}} */ onClick={() => {
              (user?.email !== "invited"
                ? (this.onSelectAutoScan())
                : this.onRegisterUserOpenHandler())
            }}>
              <img src={qrIcon} alt="icon-points"/>
              <div>
                <h3 className="font-bold">Escanea tu ticket</h3>
                <p dangerouslySetInnerHTML={{ __html: localize('MSJ_AUTOSCAN') }} />
              </div>
              {/* TODO: uncomment when ready */}
              <div>
                <IonIcon icon={chevronForward} />
              </div>
            </div>

            {
              RemoteConfigClient.getBoolean('SHOW_BUTTON_CENCOSUD_POINTS', false)
              &&
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

              // <div className="cencosud-points">
              //   <ButtonPoints
              //     title='Paga con Puntos Cencosud'
              //     subtitle='Canjea tus puntos por minutos de estacionamiento libre.'
              //     onClick={() => { this.props.history.push(`/cencosud-points`) }}
              //   />
              // </div>
            }
          </div>
        </div>

        {user?.email !== 'invited' ? <>
          {this.state.pointsModal ?
            <RegisterModal type="PLATE" userInfo={user} onClose={() => this.closeModalLoyalty()}
              onClick={() => { this.goToRegistry() }} />
            : null}
        </> : null}

        {this.state.register_is_open ?
          <RegisterModal type="NEW" userInfo={user} onClose={() => this.onCloseRegisterUserModalHandler()}
            onClick={() => { this.onLoginClickHandler() }} />
          : null}
      </IonContent>
    </Fragment>
  }

  renderINITIAL_REGISTER = () => {
    return <Fragment>
      <IonHeader>
        <div onClick={() => { this.setState({ mode: 'HOME_PARKING' }) }} >
          <IonIcon icon={arrowBack} />
        </div>
      </IonHeader>
      <IonContent className='register-init'>
        <div className="body-register-init">
          <div>
            <img src={StartRegisterParking} alt="parking logo" className="day" />
            <h2 className="font-bold title">{localize('INITIAL_REGISTER_TITLE')}</h2>
            <p className="subtitle description" dangerouslySetInnerHTML={{ __html: localize('INITIAL_REGISTER_SUBTITLE') }} />
            <button className="more-info" onClick={() => this.setState({ modal_is_open: true, type_modal: "REGISTER" })}>
              <div>
                <img src={ParkingLogo} alt="parking logo" />
              </div>
              <div dangerouslySetInnerHTML={{ __html: localize('SLIDER_TRIGGER_TEXT') }}></div>
            </button>
          </div>
        </div>
        <>
          {this.state.modal_is_open && this.state.type_modal === "REGISTER" ?
            <HelpRegisterModal
              onClose={this.onCloseModalHandler}
              modal_is_open={this.state.modal_is_open}
              content={this.helpModal('register')}
            /> : null
          }
        </>
      </IonContent>
      <IonFooter>
        <div className='pad-buttons'>
          <IonButton className='white-centered' onClick={() => { this.checkRegisterInitAdvance() }}>
            {this.state.loading_register ? '' : 'Continuar'}
            {this.state.loading_register ? <IonIcon icon={loadingSpin}></IonIcon> : ''}
          </IonButton>
        </div>
      </IonFooter>
    </Fragment>
  }

  renderMOBILE_PAYMENT = () => {
    return <Fragment>
      <IonContent className='mobile-payment'>
        <IonSlides onIonSlidesDidLoad={this.onGetSwiperHandler} pager={false} options={{ initialSlide: this.state.slideIndex, speed: 400 }}>
          <IonSlide className='swiper-no-swiping application-login' >
            <div onClick={() => { this.setState({ mode: 'HOME_PARKING' }) }}>
              <IonIcon icon={arrowBack} />
            </div>
            <div>
              <img src={ParkingLogo} alt="parking logo" />
              <h1>{localize('PLATE_REGISTER_PARKING_PAYMENT')}</h1>
              <p>{localize('PLATE_REGISTER_PARKING_PAYMENT_DESCRIPTION')}</p>
            </div>
            <IonFooter>
              <IonButton disabled>Continuar</IonButton>
            </IonFooter>
          </IonSlide>
        </IonSlides>
      </IonContent>
    </Fragment>
  }

  renderREGISTER_PLATES = () => {
    const alreadyRegistered = this.state.plateState === 'ALREADY_REGISTERED';
    return <Fragment>
      <IonHeader>
        <div onClick={() => { this.setState({ mode: 'HOME_PARKING' }) }} >
          <IonIcon icon={arrowBack} />
        </div>
      </IonHeader>
      <IonContent className='parking-flow-base mobile-register-plates'>
        <IonSlides onIonSlidesDidLoad={this.onGetSwiperHandler} pager={false} options={{ initialSlide: this.state.slideIndex, speed: 400 }}>
          <IonSlide className='swiper-no-swiping' >
            <div className="slide-content">
              <img src={ParkingLogo} alt="parking logo" />
              <h2 className="font-bold">Ingresa la patente<br />de tu vehículo</h2>
              <div className="register-plates-form fine-print">
                {alreadyRegistered &&
                  <div className="error-message">
                    {localize('PARKING_STATE_ALREADY_REGISTERED')}
                  </div>
                }
                <div className="plate-characters">
                  <input onKeyUp={(e) => this.onKeyboardInput(e, this.digitInput1, this.digitInput2, undefined)} ref={this.digitInput1} maxLength={1} />
                  <input onKeyUp={(e) => this.onKeyboardInput(e, this.digitInput2, this.digitInput3, this.digitInput1)} ref={this.digitInput2} maxLength={1} />
                  <input onKeyUp={(e) => this.onKeyboardInput(e, this.digitInput3, this.digitInput4, this.digitInput2)} ref={this.digitInput3} maxLength={1} />
                  <input onKeyUp={(e) => this.onKeyboardInput(e, this.digitInput4, this.digitInput5, this.digitInput3)} ref={this.digitInput4} maxLength={1} />
                  <input onKeyUp={(e) => this.onKeyboardInput(e, this.digitInput5, this.digitInput6, this.digitInput4)} ref={this.digitInput5} maxLength={1} />
                  <input onKeyUp={(e) => this.onKeyboardInput(e, this.digitInput6, undefined, this.digitInput5)} ref={this.digitInput6} maxLength={1} />
                </div>
              </div>
            </div>
          </IonSlide>
        </IonSlides>
      </IonContent>
      <IonFooter>
        <div className='pad-buttons'>
          <IonButton className="white-centered" disabled={(this.state.forwardButton)} onClick={
            () => {
              this.registerPlate()
            }
          }>Continuar</IonButton>
        </div>
      </IonFooter>
    </Fragment>
  }

  renderREGISTER_PLATES_VALIDATING = () => {
    console.log(this.props);
    return <Fragment>
      <BackdropLoading message="Validando..." />
    </Fragment>
  }

  renderREGISTER_CARD_VALIDATING = () => {
    console.log(this.props);
    return <Fragment>
      <IonHeader>
        <div onClick={this.onGoBackFromRegisterCardInProgressHandler}>
          <IonIcon icon={arrowBack} />
        </div>
      </IonHeader>
      <IonContent className="register-card-in-progress">
        <div className="content">
          <h1>Conectando con...</h1>
          <img src={oneClickImg} alt="oneclick" />
          <BackdropLoading message="" />
        </div>

      </IonContent>
    </Fragment>
  }

  renderLOADING = () => {
    console.log(this.props);
    return <Fragment>
      <BackdropLoading message="Cargando..." />
    </Fragment>
  }

  renderREGISTER_PLATES_SUCCESS = () => {
    return <Fragment>
      <IonHeader>
        <div onClick={() => {
          this.setState({ mode: 'REGISTER_PLATES' })
        }}>
          <IonIcon icon={arrowBack} />
        </div>
      </IonHeader>
      <IonContent className='parking-flow-base mobile-register-plates-success'>
        <div>
          <div className="added-plate">
            <IonIcon icon={checkmarkCircleOutline} />
            <h1
              className="font-bold">{localize('PLATE_REGISTER_SUCCESS_LINE1')}<br />{localize('PLATE_REGISTER_SUCCESS_LINE2')}
            </h1>
          </div>
          <h3 className="feature-disclaimer">{localize('PLATE_REGISTER_PARKING_SUCCESS_FINE_PRINT')}</h3>
        </div>
      </IonContent>
      <IonFooter>
        <div className='pad-buttons'>
          <IonButton onClick={
            () => {
              this.showPlatesList()
            }
          }>Continuar</IonButton>
        </div>
      </IonFooter>
    </Fragment>
  }

  renderREGISTER_PLATES_LIST = () => {
    const { user, cardPaymentMethods, cards, payments } = this.state

    return <Fragment>
      <IonHeader>
        <div onClick={() => {
          this.setState({ mode: 'HOME_PARKING' })
        }}>
          <IonIcon icon={arrowBack} />
        </div>
      </IonHeader>
      <IonContent className='parking-flow-base mobile-parking-list'>
        <IonSlides onIonSlidesDidLoad={this.onGetSwiperHandler} pager={false}
          options={{ initialSlide: this.state.slideIndex, speed: 400 }}>
          <IonSlide className='swiper-no-swiping application-login'>
            <div className="slide-content">
              <h2 className="font-bold">{localize('PARKING_TICKETLESS')}</h2>
              <h3 className="feature-disclaimer">{localize('PARKING_FEATURE_DESCRIPTION')}</h3>

              <button className="more-info listing" onClick={() => this.setState({ modal_is_open: true, type_modal: "AUTOPASS" })}>
                <div>
                  <img src={ParkingLogo} alt="parking logo" />
                </div>
                <div dangerouslySetInnerHTML={{ __html: localize('SLIDER_TRIGGER_TEXT') }}></div>
              </button>
              <Alert type={'alert-expired'} text={`${this.showMessage()}`} show={cards.data.length === 0 || user?.vehicles?.length === 0 ? true : false} />
            </div>
            <div className="horizontal-bar"></div>
            <div className="slide-content">
              {cardPaymentMethods && cardPaymentMethods.map((card) => {
                const iconByCardType = this.cardDecorator(card.card_type);
                const card_number = card.card_number.replace(/XXXX/g, '')
                return (
                  <>
                    <div key={card.id} className={card.default ? 'credit-card selected parking-item' : 'credit-card parking-item'}>
                      <div className="card-icon" onClick={() => this.onSetDefaultCardClickHandler(card.id)}>
                        <IonIcon src={iconByCardType} />
                        <div className="card-hint">{`···· ${card_number}`}</div>
                      </div>
                      <div className='icon-circle'>
                        <IonIcon icon={card.default ? checkmarkCircle : ellipseOutline} onClick={() => this.onSetDefaultCardClickHandler(card.id)} />
                      </div>
                      <div className='icon-trash'>
                        <IonIcon icon={trash} onClick={() => { this.onPopupDeleteCardHandler(card.id) }} />
                      </div>
                    </div>
                    <div className='modal-delete-card'>
                      <IonModal swipeToClose={false} cssClass={'delete-modal'} isOpen={this.state.open_modal_card}>
                        <IonContent>
                          <div>
                            <IonIcon icon={close} onClick={this.onCloseModalHandler} />
                          </div>
                          <div>
                            <div className='delete-card-icon'>
                              <IonIcon icon={deleteCardImg} />
                            </div>
                          </div>
                          <div>
                            <h1>{this.state.card_delete ? localize('CARD_TITLE_DELETE') : localize('CARD_MESSAGE_NO_DELETE_TITLE')}</h1>
                          </div>
                          <div>
                            {this.state.cardPaymentMethods.length === 1 && !this.state.in_site && !this.state.in_pending_payment ? localize('CARD_SUBTITLE_DELETE') : null}
                            {this.state.cardPaymentMethods.length > 1 && !this.state.in_site && !this.state.in_pending_payment ? localize('CARD_SUBTITLE_DELETE_CONFIRM') : null}
                            {this.state.in_site ? localize('CARD_MESSAGE_IN_SITE_BODY') : null}
                            {this.state.in_pending_payment ? localize('CARD_MESSAGE_PENDING_PAYMENT_BODY') : null}
                          </div>
                          <div>
                            {this.state.card_delete ?
                              <IonButton
                                className='white-centered'
                                onClick={() => { this.onRemoveCardHandlerConfirm(card.provider, this.state.id_card) }}
                                disabled={this.state.disabled_button_delete_card_confirm}
                              >
                                {localize('CARD_BUTTON_DELETE')}
                              </IonButton> :
                              <IonButton
                                className='white-centered'
                                onClick={this.onCloseModalHandler}
                              >
                                {localize('CARD_BUTTON_NO_DELETE')}
                              </IonButton>
                            }
                          </div>
                        </IonContent>
                      </IonModal>
                    </div>
                  </>
                )
              })
              }

              <div className="add-new parking-item" onClick={() => { this.showRegisterCard() }} >
                <div className="add-icon"><IonIcon icon={add} /></div>
                <div className="card-hint">{localize('PARKING_ACTIONS_ADD_CARD')}</div>
              </div>
            </div>
            <div className="horizontal-bar"></div>
            <>
              {this.state.modal_is_open && this.state.type_modal === "AUTOPASS" ?
                <HelpRegisterModal
                  onClose={this.onCloseModalHandler}
                  modal_is_open={this.state.modal_is_open}
                  content={this.helpModal('autopass')}
                /> : null
              }
            </>
            <div className="slide-content">
              <h2 className="font-bold parking-descr-text">{localize('PARKING_PLATES')}</h2>
              {user?.vehicles && user?.vehicles.map((vehicle) => {
                const { currentParking } = user
                const Parked = currentParking?.find((parking) => parking.plate === vehicle.plate)
                const isParked = Parked && !Parked?.payment ? true : false

                return (
                  <div className="vehicle-plate parking-item" key={vehicle.plate}
                    onClick={() => !isParked ? this.setState({ selectedPlate: vehicle.plate, remove_card_modal: true }) : null}>
                    <div className="vehicle-plate-text">{this.plateDecorator(vehicle.plate)}</div>
                    <div className="trash-icon"><IonIcon icon={!isParked ? trashSharp : '-'} /></div>
                  </div>
                )
              })}
              <div className="add-new add-vehicle-plate parking-item" onClick={() => { this.showRegisterPlate() }}>
                <div className="add-icon"><IonIcon icon={add} /></div>
                <div className="card-hint">{localize('PARKING_ACTIONS_ADD_PLATE')}</div>
              </div>
            </div>
            <div className="horizontal-bar"></div>

            {!user!.currentParking!.length && !user!.parkingHistory!.length ? null : <div className="slide-content">
              <h2 className="font-bold parking-descr-text" >{localize('PARKING_PARKING')}</h2>
              {user?.currentParking && this.sortHistoryParking(user.currentParking).map((record: any, i) => {
                const recordStatus = record?.payment ? 'status paid' : 'status';
                const parkingStateText = record?.payment ? localize('PARKING_STATE_PAID') : localize('PARKING_STATE_PARKED');
                let parkingDate = new Date(record.entranceDateTime);
                return (
                  <div key={record.plate} className="parking-record parking-item" onClick={async () => {
                    await this.showParkingDetail(record)
                  }}>
                    {/*<div className="logo-icon">
                      <img src={this.storeLogo(record.locationName)}/>
                    </div>*/}
                    <div className="date-time">
                      <div>{parkingDate.getDate()}</div>
                      <div>
                        <span>{this.getMonthNameShort(parkingDate)}.</span>
                        <span>{parkingDate.getFullYear()}</span>
                      </div>
                    </div>
                    <div className="plate">{this.plateDecorator(record.plate)}</div>
                    <div className="check-ticket">
                      <div className={recordStatus}>{parkingStateText}</div>
                      <IonIcon icon={chevronForward} />
                    </div>
                  </div>
                )
              })}

              {/* autopass payments approved or rejected */}
              {payments!.map((payment) => {
                const recordStatus = payment.state === 'APPROVED' ? 'status paid' : 'status pending';
                const parkingStateText = payment.state === 'APPROVED' ? localize('PARKING_STATE_PAID') : localize('PARKING_STATE_PENDING');
                const parkingDate = moment(payment.metadata.entrance_date_time as string);

                return (
                  <div className="parking-record parking-item" onClick={() => { this.showParkingDetail(payment); }}>
                    <div className="date-time">
                      <div>{parkingDate.format('D')}</div>
                      <div>
                        <span>{parkingDate.format('MMM')}</span>
                        <span>{parkingDate.format('YYYY')}</span>
                      </div>
                    </div>
                    <div className="plate">{this.plateDecorator(payment.metadata.plate)}</div>
                    <div className="check-ticket">
                      <div className={recordStatus}>{parkingStateText}</div>
                      <IonIcon icon={chevronForward} />
                    </div>
                  </div>
                )
              })}

              {/* {
                user?.parkingHistory && user.parkingHistory.reverse().map((record: any, i) => {
                  const recordStatus = record.payment ? 'status paid' : 'status';
                  const parkingStateText = record.payment ? localize('PARKING_STATE_PAID') : localize('PARKING_STATE_PARKED');
                  let parkingDate = new Date(record.entranceDateTime);
                  return (
                    <div key={i + record.plate} className="parking-record parking-item" onClick={async () => {
                      await this.showParkingDetail(record)
                    }}>
                    <div className="date-time">
                      <div>{parkingDate.getDate()}</div>
                      <div>
                        <span>{this.getMonthNameShort(parkingDate)}.</span>
                        <span>{parkingDate.getFullYear()}</span>
                      </div>
                    </div>
                      <div className="plate">{this.plateDecorator(record.plate)}</div>
                      <div className="check-ticket">
                        <div className={recordStatus}>{parkingStateText}</div>
                        <IonIcon icon={chevronForward} />
                      </div>
                    </div>
                  )
                })} */}
            </div>}
          </IonSlide>
        </IonSlides>
      </IonContent>
    </Fragment>
  }

  renderREGISTER_RUT = () => {
    const { isValidStatesInputs } = this.state
    return (<Fragment>
      <IonHeader>
        <div onClick={() => this.setState({ mode: 'HOME_PARKING' })}>
          <IonIcon icon={arrowBack} />
        </div>
      </IonHeader>
      <IonContent className='edit-rut'>
        <div>
          <h1>{localize('RUT_TITLE')}</h1>
          <p>{localize('RUT_DESCRIPTION')}</p>
        </div>
        <div>
          <input value={this.state.document_number} placeholder={'12345678-9'} onChange={e => {
            this.onInputChangeHandler('document_number', e.currentTarget.value?.toString()!)
          }} />
        </div>
        {/* { !isValidStatesInputs.document_number  && this.state.document_number.length > 2? <div>{localize('NOT_VALID_RUT')}</div> : null } */}
      </IonContent>
      <IonFooter>
        <div className='pad-buttons'>
          <IonButton disabled={!(isValidStatesInputs.document_number)} className='white-centered' onClick={() => {
            this.onChangePostHandler('document_number')
          }}>
            Continuar
          </IonButton>
        </div>
      </IonFooter>
    </Fragment>
    )
  }

  renderREGISTER_CARD_SUCCESS = () => {
    return <Fragment>
      <IonHeader>
        <div onClick={() => { this.setState({ mode: 'HOME_PARKING' }) }} >
          <IonIcon icon={arrowBack} />
        </div>
      </IonHeader>
      <IonContent className='parking-flow-base mobile-register-card-success'>
        <div>
          <div className="added-card">
            <IonIcon icon={checkmarkCircleOutline} />
            <h1 className="font-bold"> {localize('CARD_REGISTER_SUCCESS_LINE1')}<br />{localize('CARD_REGISTER_SUCCESS_LINE2')}</h1>
          </div>
          <h3 className="feature-disclaimer">{localize('CARD_REGISTER_PARKING_SUCCESS_FINE_PRINT')}</h3>
        </div>
      </IonContent>
      <IonFooter>
        <div className='pad-buttons'>
          <IonButton onClick={() => {
            this.showRegisterForm()
          }}>Continuar</IonButton>
        </div>
      </IonFooter>
    </Fragment>
  }

  renderAUTOPASS_HISTORY_DETAILS = () => {
    const payment = this.state.selectedHistory.payment;
    const { selectedHistory } = this.state;
    return <Fragment>
      <IonHeader>
        <div onClick={() => { this.setState({ mode: 'REGISTER_PLATES_LIST' }) }} >
          <IonIcon icon={closeOutline} />
        </div>
      </IonHeader>
      <IonContent className='autopass-history'>
        <FancyTicket selectedHistory={selectedHistory!} />
        <div className="history-item status-section">
          {payment &&
            <>
              <div className="status-big-icon">
                <img src={checkedImg} alt="Todo listo y pagado..." />
              </div>
              <h2>¡Todo listo!</h2>
              <div className="process-status">Ticket pagado</div>
            </>
          }

          {!payment &&
            <>
              <div className="status-big-icon">
                <img src={processingImg} alt="Procesando..." />
              </div>
              <h2>En proceso...</h2>
              <div className="process-status">Auto estacionado</div>
            </>
          }
        </div>
      </IonContent>
    </Fragment>
  }
})
