import {
  withIonLifeCycle,
  IonPage,
  IonContent,
  IonIcon,
  IonFooter,
  IonHeader,
  IonButton,
  IonGrid,
  IonRow,
  IonCol,
} from '@ionic/react';
import React, { Fragment } from 'react';
import { add, arrowBack, checkmarkCircleSharp, cardOutline, ellipseOutline, checkmarkCircleOutline, hourglass, closeOutline, close } from 'ionicons/icons';
import { RouteComponentProps } from 'react-router';
import i18n from '../../lib/i18n';
import locales from './locales';
import lodash from 'lodash';
import './index.less';
//libs
import moment from 'moment';
import Expr from '../../lib/Expr';
import EurekaConsole from '../../lib/EurekaConsole';
import EventStreamer from '../../lib/EventStreamer';
import DniFormatter from '../../lib/formatters/DniFormatter';
import NumberFormatter from '../../lib/formatters/NumberFormatter';
//assets
import { InAppBrowser, InAppBrowserEvent } from '@ionic-native/in-app-browser';
import isotypeMasterCard from '../../assets/media/isotype-mastercard.svg';
import isotypeVisaCard from '../../assets/media/isotype-visa.svg';
import oneClickImg from '../../assets/media/oneclick.svg';
import KnowMoreClockDark from '../../assets/media/know-more-clock-dark.svg';
import KnowMoreDiscapacityDark from '../../assets/media/know-more-discapacity-dark.svg';
import KnowMoreUserDark from '../../assets/media/know-more-user-dark.svg';
import KnowMoreCovidDark from '../../assets/media/know-more-covid-dark.svg';
import KnowMoreClock from '../../assets/media/know-more-clock.svg';
import KnowMoreDiscapacity from '../../assets/media/know-more-discapacity.svg';
import KnowMoreUser from '../../assets/media/know-more-user.svg';
import KnowMoreCovid from '../../assets/media/know-more-covid.svg';
import Info from '../../assets/media/info.svg';
import LogoSky from '../../assets/media/logo-sky.svg';
import qrLens from '../../assets/media/qr_scanner.svg';
import discountSelectableImg from '../../assets/media/discount-selectable.svg';
import flowQualificationImg from '../../assets/media/icon-flow-qualification.svg';
// components
import SelectTickets, { ISelectedTicket } from './components/select-tickets';
import SelectDate from './components/select-date';
import SelectTime from './components/select-time';
import SeparationLine from './components/separation-line';
import BackdropLoading from '../../components/backdrop-loading';
import MerchantDetailHeader from './components/merchant-detail-header';
import SliderImages from './components/slider-images';
import InformationItem from './components/information-item';
import PurchaseTicket from '../../components/purchase-ticket';
import TicketsPage from '../sky-costanera-tickets-flow';
import { ILink } from '../../models/ILink';
import { IUser } from '../../models/users/IUser';
import { IReservationContexts } from '../../models/reservation-contexts/IReservationContexts';
import { IReservationCart } from '../../models/reservation-cart/IReservationCart';
import { IReservationSlot } from '../../models/reservation-slot/IReservationSlot';
import { IReservationSlotDate } from '../../models/reservation-slot/IReservationSlotDate';
import IPaymentIntention from '../../models/payments/IPaymentIntention';
import ITicketPayment from '../../models/tickets/ITicketPayment';
import Identifications from './components/identifications';
import ZoomImage from '../../components/zoom_image';
import ErrorModal from '../../components/error-modal';
import CalificationModal from '../../components/califications';
import RutScreen from '../../components/rut-screen';
// clients
import CardClient from '../../clients/CardClient';
import ReservationClient from '../../clients/ReservationClient';
import UserClient from '../../clients/UserClient';
import PaymentIntentionClient from '../../clients/PaymentIntentionClient';
import { ISite } from '../../models/store-data-models/ISite';
import { DefaultHeader } from '../../components/page';
import RegisterModal from '../../components/register_modal';
import AuthenticationClient from '../../clients/AuthenticationClient';
import DiscountClient from '../../clients/DiscountClient';
import { IListParams } from '../../clients/RESTClient';
//models
import { IDiscount } from '../../models/discount/IDiscount';
import DiscountModal from '../../components/discount-modal';
import { BarcodeScanner } from '@capacitor-community/barcode-scanner';
import ButtonDiscount from '../../components/button-discount';
import StringFormatter from '../../lib/formatters/StringFormatter';
import FirebaseAnalytics from '../../lib/FirebaseAnalytics';


const eureka = EurekaConsole({ label: "sky-costanera" });
const localize = i18n(locales);

interface IProps extends RouteComponentProps<{
  id: string,
}> {
}

interface ICard {
  id: string;
  active: boolean;
  card_number: string;
  card_token: string;
  card_type: string;
  default: boolean;
  links: ILink[];
  meta_data: Record<string, unknown>
  provider: string;
}

interface IFlags {
  enable_form: boolean;
  validations: boolean;
};

interface IPartners {
  document_number: string;
  document_type: string;
}

interface ISelected {
  count: number;
  name: string;
  price: number;
  type: string;
}
interface IProps {
  title?: string;
}

type IMode = 'INITIAL_STATE' | 'TICKETS_DATE' | 'FORM' | 'HOME' | 'KNOW_MORE' | 'TICKET_PAYMENT' | "CHECKOUT_SKY" | "IDENTIFICATIONS" | "REGISTER_CARD_IN_PROGRESS_SKY" | "REGISTER_CARD_SUCCESS_SKY" | "PAYMENT_IN_PROGRESS" | "REGISTER_RUT" | "PAYMENT_SUCCESS_SKY" | "TICKETS_DETAIL" | "SCANNER" | "DISCOUNT";

interface IState {
  mode: IMode,
  user?: IUser,
  modal: boolean;
  selected_card?: string,
  cards: ICard[],
  reservation_contexts?: IReservationContexts,
  reservation_slots: IReservationSlot[],
  reservation_slots_same_date: IReservationSlot[],
  reservation_cart: IReservationCart
  isValidStatesInputs: {
    document_number: boolean,
  },
  error_modal?: { title: string, message: string, retryMessage?: string, cancelMessage?: string, onRetry?: () => void, onCancel?: () => void },
  document_number: string,
  user_has_rut: boolean,
  selected_slot_date?: string,
  selected_slot?: IReservationSlot,
  form_error_number_tickets: boolean,
  form_error_date: boolean,
  form_error_time: boolean,
  form_sended: boolean,
  payment_ticket?: ITicketPayment,
  flags?: IFlags,
  users_add?: IPartners[],
  line_items?: ILineItem[],
  zoom_image: boolean,
  zoom_image_url?: string,
  selected_tickets?: ISelectedTicket[],
  backgrounds?: string[],
  selected_background?: string,
  bottom_modal: boolean,
  register_is_open: boolean,
  discounts?: IDiscount[],
  site?: ISite,
  status?: number,
  is_visible_califications: boolean,
  has_questions: boolean,
  payment_intention?: IPaymentIntention,
}


const weekLabels = [
  {key: 0, value: "Dom"},
  {key: 1, value: "Lun"},
  {key: 2, value: "Mar"},
  {key: 3, value: "Mie"},
  {key: 4, value: "Jue"},
  {key: 5, value: "Vie"},
  {key: 6, value: "Sab"},
]

const galery = [
  'https://ux-cdn.cencosudx.io/mimall-app/skycostanera/skycostanera-1.jpeg',
  'https://ux-cdn.cencosudx.io/mimall-app/skycostanera/skycostanera-10.jpeg',
  'https://ux-cdn.cencosudx.io/mimall-app/skycostanera/skycostanera-11.jpeg',
  'https://ux-cdn.cencosudx.io/mimall-app/skycostanera/skycostanera-12.jpeg'
]

interface ILineItem {
  id: string,
  description: string,
  price: number,
  quantity: number
}

export default withIonLifeCycle(class SkyCostaneraPage extends React.Component<IProps, IState> {
  lastY: number = 0;

  constructor(props:any) {
    super(props)
    this.childCallback = this.childCallback.bind(this);
  }

  intervalId: NodeJS.Timeout | undefined;
  state: IState = {
    mode: 'INITIAL_STATE',
    modal: true,
    cards: [],
    reservation_contexts: undefined,
    reservation_slots: [],
    reservation_slots_same_date: [],
    reservation_cart: {cant_tickets_adult: 0, cant_tickets_child: 0, cant_tickets_infant: 0, total_tickets: 0, total_price: 0},
    isValidStatesInputs: {
      document_number: false
    },
    document_number: '',
    user_has_rut: false,
    form_error_number_tickets: false,
    form_error_date: false,
    form_error_time: false,
    form_sended: false,
    zoom_image: false,
    bottom_modal: false,
    register_is_open: false,
    is_visible_califications: false,
    has_questions: false
  }

  goTo = (mode: IMode) => {
    this.setState({ mode });
  }

  onGoBackHandler = () => {
    this.props.history.goBack();
  }

  IdentificationsHandler = () => {
    this.onPayHandler();
  }

  /** Checkout functions */
  formatCardNumber = (cardNumber: string) => {
    return cardNumber.replace(/^X*/, '···· ');
  }

  formatMoney = (num: Number): string => {
    var p = Number(num).toFixed(2).split(".");
    return "$" + p[0].split("").reverse().reduce(function (acc, num, i, orig) {
      return num == "-" ? acc : num + (i && !(i % 3) ? "." : "") + acc;
    }, "");
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


  parseSingularOrPlurarText = (selectedTicket: ISelectedTicket): string => {

    const textInfoTicket = {
      ADULT: {
        singular_ticket_name: 'Adulto',
        plural_ticket_name: 'Adultos',
        ticket_description: '',
      },
      CHILD: {
        singular_ticket_name: 'Niño',
        plural_ticket_name: 'Nińos',
        ticket_description: '(5 a 12 años)',
      },
      INFANT: {
        singular_ticket_name: 'Infante',
        plural_ticket_name: 'Infantes',
        ticket_description: '(0 a 4 años)',
      }
    }

    return selectedTicket.count>1?textInfoTicket[selectedTicket.type].plural_ticket_name:textInfoTicket[selectedTicket.type].singular_ticket_name;
  }

  getReservationContent = async (): Promise<void> => {
    try{
      const reservation_contexts = await ReservationClient.getContext() as IReservationContexts;

      let backgrounds = reservation_contexts.metadata?.backgrounds as string[] | undefined;
      if (!backgrounds || !backgrounds.length) {
        // set default url to avoid bugs
        backgrounds = ["https://ux-cdn.cencosudx.io/mimall-app/skycostanera/landing/skycostanera_landing_1.jpg"];
      }

      this.setState({
        reservation_contexts: reservation_contexts,
        backgrounds,
        selected_background: backgrounds[0]
      })
    }
    catch (error){
      eureka.error('An error has ocurred trying to get Sky Costanera reservation contexts', error);
      throw error;
    }
  }

  getReservationSlots = async (): Promise<void> => {
    try{
      const reservation_slots = await ReservationClient.getSlogs() as IReservationSlot[];
      this.setState({reservation_slots: reservation_slots});
    }
    catch (error){
      eureka.error('An error has ocurred trying to get Sky Costanera reservation contexts', error);
      throw error;
    }
  }

  getReservationSlotsDates = (): IReservationSlotDate[] => {
    let slogsDate: IReservationSlotDate[] = [];
    let slogsDateLabel: string[] = [];

    this.state.reservation_slots.filter((item) => item.enabled).map((item) => {
        const daykey: number = moment(item.start).day();
        const dateLabel = weekLabels.find(o => o.key == daykey)?.value;
        slogsDate.push({date: item.start, dayNum: moment(item.start).date(), dayText: dateLabel?dateLabel:'?'});
        slogsDateLabel.push(dateLabel?dateLabel:"?");
    });

    let current: string | undefined;
    let result: IReservationSlotDate[] = [];
    for (let i = 0; i < slogsDate.length; i++) {
      const slotDate = slogsDate[i];
      if (slotDate.dayText !== current) {
        current = slotDate.dayText;

        result.push(slotDate);
      }
    }
    return result;
  }

  getReservationSlotsTimes = (selectedSlogDate: string): IReservationSlot[] => {
    let dateFormat = moment(selectedSlogDate).format('YYYYMMDD');
    let result = this.state.reservation_slots.filter((item) => item.enabled && moment(item.start).format('YYYYMMDD')===dateFormat);
    console.log(result);
    return result;
  }

  getUser = async (): Promise<IUser> => {
    try {
      const user = await UserClient.me() as IUser;
      this.setState({ user, user_has_rut: !!user.document_number });
      return user;
    } catch (error) {
      eureka.error('An error has ocurred trying to get the user', error);

      throw error;
    }
  }

  getCards = async (): Promise<void> => {
    try {
      const cards = await CardClient.getList() as ICard[];
      let card_id;

      cards.map((card) => {
        if(card.default){
          card_id = card.id;
        }
      });

      this.setState({ selected_card: cards.length ? card_id : undefined, cards });
    } catch (error) {
      eureka.error('An error has ocurred trying to get user cards', error);
      throw error;
    }
  }

  selectCard = async (id: string) => {
    try {
      await CardClient.setDefault(id);
      this.setState({ selected_card: id });
    } catch (error) {
      console.log(error);
    }
  }

  getFlags = async () => {
    try {
      const sites = await UserClient.getSites();
      const site = sites.data.find((site: ISite) => { return site.name === this.props.match.params.id });

      const flags = {
        enable_form: site?.meta_data?.skyCostanera?.enable_form,
        validations: site?.meta_data?.skyCostanera?.validation,
      } as IFlags;

      this.setState({ flags, site: site });
    } catch (error) {
      eureka.error('An error has ocurred trying to get flags', error);
      throw error;
    }
  }

  updateFormError = () => {
    this.getAdultsTicketsNumber() < 1 ? this.setState({form_error_number_tickets: true}):this.setState({form_error_number_tickets: false});
    this.state.selected_slot_date==null?this.setState({form_error_date: true}):this.setState({form_error_date: false});
    this.state.selected_slot==null?this.setState({form_error_time: true}):this.setState({form_error_time: false});
  }

  async componentDidMount() {
    FirebaseAnalytics.customLogEvent("ionic_app", "sky_costanera");

    //Request user first. If user is type invited do not request users cards
    const user = await this.getUser();
    const sites = await UserClient.getSites();
    const site = sites.data.find((site: ISite) => { return site.name === this.props.match.params.id });
    if(user.email!=='invited'){
      await Promise.all([
        this.getCards(),
        this.getReservationContent(),
        this.getReservationSlots(),
        this.getFlags(),

      ]);
    }
    else{
      await Promise.all([
        this.getReservationContent(),
        this.getReservationSlots(),
        this.getFlags()
      ]);
    }

    this.setState({
      mode: 'HOME',
    });
  }


  onAddNewCardHandler = async () => {
    this.setState({ mode: "REGISTER_CARD_IN_PROGRESS_SKY" });

    this.startCardRegistration();
  }

  ionViewDidLeave() {
    EventStreamer.off("DEEPLINK:CARD_ADDED_CALLBACK", this.onDeepLinkAddCardHandler);
    this.intervalId && clearInterval(this.intervalId);
  }

  startCardRegistration = async () => {
    const showErrorModal = () => {
      this.setState({
        error_modal: {
          title: "Hubo un problema",
          message: "No pudimos registrar tu tarjeta. ¿Deseas reintentar?",
          onRetry: () => {
            this.setState({ error_modal: undefined });

            //start again card registration
            setTimeout(() => {
              this.startCardRegistration();
            }, 1000);
          },
          onCancel: () => {
            this.setState({ error_modal: undefined, mode: "CHECKOUT_SKY" })
          }
        }
      });
    }

    try {
      // subscribe to deep link
      EventStreamer.on("DEEPLINK:CARD_ADDED_CALLBACK", this.onDeepLinkAddCardHandler);
      const links = await CardClient.register();
      const inscriptionUrl = links.find((l: any) => l.rel === "inscription");
      if (!inscriptionUrl) {
        throw new Error("No inscription url found");
      }

      let response_code: string | null = 'exit';

      Expr.whenInNativePhone(async () => {

        let inAppBrowserRef = InAppBrowser.create(inscriptionUrl.href, '_blank', { location: 'no' });

        inAppBrowserRef.show()

        inAppBrowserRef.on('exit').subscribe((evt: InAppBrowserEvent) => {
          if (response_code !== '0')
            EventStreamer.emit("DEEPLINK:CARD_ADDED_CALLBACK", { response_code: 'exit' })
        })

        inAppBrowserRef.on("loadstop").subscribe((evt: InAppBrowserEvent) => {
          if (evt.url && evt.url.includes('response_code')) { //url interceptor
            const queryString = evt.url.split('#')[1];
            const urlParams = new URLSearchParams(queryString);
            const code = urlParams.get('response_code');
            response_code = code;
            EventStreamer.emit("DEEPLINK:CARD_ADDED_CALLBACK", { response_code: code });
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
            EventStreamer.emit("DEEPLINK:CARD_ADDED_CALLBACK", e.data)
            addCard = true;
          } else if (!addCard) {
            eureka.error("FATAL ADD CARD ERROR:: Origin missmatch");
          }
        };

        window.addEventListener("message", onPopupMessage);
        const loginPopUp = window.open(
          inscriptionUrl.href,
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
      });
    } catch (error) {
      eureka.error('An error has ocurred starting card registration', error);

      showErrorModal();
    }
  }

  onDeepLinkAddCardHandler = (data: any) => {
    // start unsubscribing
    EventStreamer.off("DEEPLINK:CARD_ADDED_CALLBACK", this.onDeepLinkAddCardHandler);
    const updateCards = async () => {
      try {
        await this.getCards();
        this.setState({ mode: "REGISTER_CARD_SUCCESS_SKY" });
      } catch (error) {
        eureka.error('An error has ocurred trying to update cards', error);

        // show error modal
        this.setState({
          error_modal: {
            title: "Hubo un problema",
            message: "No pudimos registrar tu tarjeta. ¿Deseas reintentar?",
            onRetry: () => {
              this.setState({ error_modal: undefined });

              setTimeout(() => {
                updateCards();
              }, 1000);
            },
            onCancel: () => {
              this.setState({ error_modal: undefined, mode: "CHECKOUT_SKY" })
            }
          }
        });
      }
    }

    Expr.whenInNativePhone(() => {
      const { response_code } = data;
      if (response_code === "0") {
        updateCards();
      }
    });

    Expr.whenNotInNativePhone(() => {
      if (data.response_code === 0) {
        updateCards();
      }
    });
  }

  onGoBackFromRegisterCardInProgressHandler = () => {
    this.setState({ mode: "CHECKOUT_SKY" });

    // unsubscribe from deeplink to avoid unexpected behavior
    EventStreamer.off("DEEPLINK:CARD_ADDED_CALLBACK", this.onDeepLinkAddCardHandler);
  }

  userHasRUT = async () => {
    const currentUser = await UserClient.me();

    return currentUser.document_number && currentUser.document_number.length > 0;
  }

  onStopScanner = () => {
    BarcodeScanner.showBackground();
    BarcodeScanner.stopScan();
    this.setState({ mode: "DISCOUNT" });
  }

  onStopScannerModal = (status: number|undefined) => {
    BarcodeScanner.showBackground();
    BarcodeScanner.stopScan();
    eureka.info("Stop out")
    this.setState({ mode: "DISCOUNT", status: status});
  }

  getTypePrice = (type: string): number => {
    const ticket_types =  this.state.reservation_slots_same_date[0].ticket_types;

    let price = ticket_types.filter((item) => item.type === type)[0].price;
    return price?price : 0;
  }

  getTypeName = (type: string): string => {
    const ticket_types =  this.state.reservation_slots_same_date[0].ticket_types;

    let name = ticket_types.filter((item) => item.type === type)[0].name;
    return name ? name : "";
  }

  getTypeId = (type: string): string => {
    const ticket_types =  this.state.reservation_slots_same_date[0].ticket_types;
    let id = ticket_types.filter((item) => item.type === type)[0].type
    return id ? id : "";
  }

  getDiscounts = async (): Promise<void> => {
    try {

      let queryParams:Record<string,any> = {
        context: {},
        query: {},
      };

      queryParams.context = Object.assign(queryParams.context, {
        'user_ids': AuthenticationClient.getInfo().primarysid,
        'payment_flows': "SKY-COSTANERA"
      });

      queryParams.query = Object.assign({}, queryParams.query, {
        'selectable_is': true
      });

      const amount = this.getPriceOfTickets();
      let arrayDiscounts:IDiscount[] = [];
      const discountsNoSelectable = await this.getDiscountNoSelectable();
      arrayDiscounts =  discountsNoSelectable ? [...arrayDiscounts, discountsNoSelectable] : arrayDiscounts;

      const response = await DiscountClient.list_convenient(queryParams, amount as unknown as string);

      if(response){
        arrayDiscounts = [...arrayDiscounts, response];
      }

      //yes, non-selectable discount is equal to or greater than the amount to be paid
      if(discountsNoSelectable){
        const { details, type } = discountsNoSelectable.discount;
        if((type === "PERCENT" && details.value < 100) || (type === "AMOUNT" && details.value <= amount!)) {
          arrayDiscounts = [...arrayDiscounts];
        }
      }

      const discounts = arrayDiscounts;
      this.setState({ discounts: discounts});


    } catch (error) {
      eureka.error('An error has ocurred trying to get user discounts', error);
      throw error;
    }
  }

  getDiscountNoSelectable = async (): Promise<IDiscount> => {
    try {
      let queryParams:IListParams = {
        offset: 0,
        limit: 10,
        query: {},
        sort: {
            priority: 'asc'
        },
      };

      queryParams.query = Object.assign({}, queryParams.query, {
        'apply_to.user_ids.keyword_is_one_of': ['*', AuthenticationClient.getInfo().primarysid],
        'apply_to.payment_flows.keyword_is_one_of': ['*','SKY-COSTANERA'],
        'selectable_is': false
      });

      const response = await DiscountClient.list(queryParams);
      const discount = response.data[0] as IDiscount;
      return discount;

    } catch (error) {
      eureka.error('An error has ocurred trying to get user discounts no selectable', error);
      throw error;
    }
  }

  executePayment = async () => {
    moment.locale('es');

    try {
      this.setState({ mode: "PAYMENT_IN_PROGRESS" });

      // execute payment
      const { user,  cards, discounts } = this.state;
      const card = cards.find((card) => card.id === this.state.selected_card);
      const amount = this.getPriceOfTickets() < this.applyDiscount(this.getPriceOfTickets()) ? 0 : this.getPriceOfTickets() - this.applyDiscount(this.getPriceOfTickets());
      const created = await PaymentIntentionClient.create({
        payment_flow: 'SKY-COSTANERA',
        payer: {
          email: user!.email,
          full_name: user!.full_name,
          document_type: 'RUT',
          document_number: user!.document_number,
          country: 'Chile',
        },
        payment_method: {
          details: {
            card_token: card!.card_token,
            card_type: card!.card_type,
            user_id: user!.primarysid
          }
        },
        transaction: {
          amount: {
            total: amount,
            subtotal: Math.round(amount/1.19),
            discount: this.applyDiscount(this.getPriceOfTickets())
          },
          line_items: this.state.selected_tickets?.map(x => {
            return {
              id: x.type,
              description: this.parseSingularOrPlurarText(x),
              price: (x.price-this.applyDiscount(x.price)),
              quantity: x.count
            }
          })
        },
        discounts: discounts,
        metadata: {
          reservation_slot: this.state.selected_slot,
          reservation_date: moment(this.state.selected_slot?.start).toISOString(),
          reservation_time: moment(this.state.selected_slot?.start).format('HH:mm'),
          reservation_day: moment(this.state.selected_slot?.start).format('dddd'),
          partners : this.state.users_add,
          discount: discounts?.map((discount:IDiscount) => {
            return {
                code: discount.code,
                discount_applied: this.discountDetail(discount),
                id_discount: discount.id
              }
          })
        }
      } as unknown as IPaymentIntention);
      console.log("createdx", created);
      // start checking payment task
      this.checkPaymentStatus(created.id);
      //payment intention for save in state
      this.setState({ payment_intention: created });

    } catch (error) {
      eureka.error('An error has ocurred trying execute a payment', error);

      // show error modal
      this.setState({
        error_modal: {
          title: "Hubo un problema",
          message: "No pudimos realizar el pago. ¿Deseas reintentar?",
          onRetry: () => {
            this.setState({ error_modal: undefined });

            setTimeout(() => {
              this.onPayHandler();
            }, 1000);
          },
          onCancel: () => {
            this.setState({ error_modal: undefined, mode: "CHECKOUT_SKY" })
          }
        }
      });
    }
  }

  onLoginClickHandler = async () => {
    await AuthenticationClient.signOut();
    window.location.reload();
  }

  checkPaymentStatus = async (id: string) => {
    this.intervalId = setInterval(async () => {
      try {
        const response = await PaymentIntentionClient.getStatus(id);

        if (response.status === "IN_PROGRESS") {
          return;
        }
        if (response.status === "SUCCESS") {
          const amount = this.getPriceOfTickets() < this.applyDiscount(this.getPriceOfTickets()) ? 0 : this.getPriceOfTickets() - this.applyDiscount(this.getPriceOfTickets());
          const payment = {
            reservation_code: lodash.get(response,'outcome.result.ticket_code'),
            reservation_slot: this.state.selected_slot,
            tickets: {
              list_tickets: this.state.selected_tickets?.map(x => {
                return {
                  id: x.type,
                  description: this.parseSingularOrPlurarText(x),
                  price: (x.price-this.applyDiscount(x.price)),
                  quantity: x.count
                }
              }),
              total_tickets: this.getNumberOfTickets(),
              total_price: amount
            },
            date: this.state.selected_slot?.start,
            name: this.state.user?.full_name,
            rut: this.state.user?.document_number,
            code_qr: lodash.get(response,'outcome.result.ticket_qr_code_url'),
            code_qr_data: response.id,
            total_discount: this.applyDiscount(this.getPriceOfTickets()),
          } as ITicketPayment;

          this.setState({ payment_ticket: payment });

          console.log("payment", payment);
          setTimeout(() => {
            this.setState({ mode: "PAYMENT_SUCCESS_SKY" });
          }, 1000);

          console.log("payment success", response);
        } else {
          if (response.error?.code === "ERROR_QUOTE_TIME_EXCEEDED") {
            this.setState({
              error_modal: {
                title: "El valor del ticket virtual ha cambiado",
                message: "El tiempo de espera de 5 minutos se cumplió, para poder continuar deberás escanear nuevamente tu ticket.",
                retryMessage: "Volver a escanear",
                onRetry: () => {
                  this.setState({ error_modal: undefined });
                  //this.onQRCodeScanHandler();
                },
              }
            });
          }
          else {
            // show fallback error modal
            this.setState({
              error_modal: {
                title: "Hubo un problema",
                message: "No se pudo realizar el pago. ¿Deseas reintentar?",
                onRetry: () => {
                  this.setState({ error_modal: undefined });
                  this.onPayHandler();
                },
                onCancel: () => {
                  this.setState({ error_modal: undefined, mode: "CHECKOUT_SKY" })
                }
              }
            });
          }
        }

        this.intervalId && clearInterval(this.intervalId);
      } catch (error) {
        eureka.error('An error has ocurred trying to check payment status', error);
        eureka.error((error as Error).message, error);

        // clear interval
        this.intervalId && clearInterval(this.intervalId);
        // start again
        this.checkPaymentStatus(id);
      }
    }, 3000);
  }

  onPayHandler = async () => {
    const { user_has_rut } = this.state;
    if (!user_has_rut) {
      this.setState({ mode: "REGISTER_RUT" });
      return;
    }

    this.executePayment();
  }

  updatereservation_cart = (reservation_cart: IReservationCart) => {

    let lineItems: ILineItem[] = [];
    if(this.state.reservation_cart.cant_tickets_adult>0)
      lineItems.push({
        id: this.getTypeId('ADULT'),
        description: this.getTypeName('ADULT'),
        price: this.state.reservation_cart.cant_tickets_adult*this.getTypePrice('ADULT'),
        quantity: this.state.reservation_cart.cant_tickets_adult
      });
    if(this.state.reservation_cart.cant_tickets_child>0)
      lineItems.push({
        id: this.getTypeId('CHILD'),
        description: this.getTypeName('CHILD'),
        price: this.state.reservation_cart.cant_tickets_child*this.getTypePrice('CHILD'),
        quantity: this.state.reservation_cart.cant_tickets_child
      });
    if(this.state.reservation_cart.cant_tickets_infant>0)
      lineItems.push({
        id: this.getTypeId('INFANT'),
        description: this.getTypeName('INFANT'),
        price: this.state.reservation_cart.cant_tickets_infant*this.getTypePrice('INFANT'),
        quantity: this.state.reservation_cart.cant_tickets_infant
      });

    this.setState({reservation_cart: reservation_cart, line_items: lineItems});
    this.updateFormError();
  }

  verifyButtonDiscount = () => {
    //false = button add
    //true = button most convenient
    const { discounts } =  this.state;
    if(discounts!.length > 0){
      const isSelectable = discounts!.filter(f => f.selectable === true).length > 0 ? true : false;
      const isNotSelectable = discounts!.filter(f => f.selectable === false).length > 0 ? true : false;
      if(isSelectable && isNotSelectable){
        return true;
      }
      if(isSelectable){
        return true;
      }
      if(isNotSelectable){
        return false;
      }
    }else{
      return false;
    }
  }

  resetData = () => {
    this.setState({ selected_slot: undefined, selected_slot_date: undefined, reservation_cart: {cant_tickets_adult: 0, cant_tickets_child: 0, cant_tickets_infant:0, total_price:0, total_tickets:0} });
  }

  childCallback = (value:IPartners[]) => {
    console.log("childCallback", value);
    this.setState({ users_add : value });
  }

  onCloseZoomImage = () => {
    this.setState({zoom_image:false});
  }

  onShowZoomImage = (image_url: string) => {
    this.setState({zoom_image: true, zoom_image_url: image_url})
  }

  getNumberOfTickets = ():number => {
    if(!this.state.selected_tickets)
      return 0;
    return this.state.selected_tickets?.reduce((total , item: ISelectedTicket) => total + item.count, 0);
  }

  getAdultsTicketsNumber = ():number => {
    if(!this.state.selected_tickets)
      return 0;
    var adultTickets= this.state.selected_tickets.filter((x:ISelected) => x.type === 'ADULT')[0];
    if(!adultTickets)
      return 0;

    return adultTickets.count;

  }

  getPriceOfTickets = () => {
    if(!this.state.selected_tickets)
      return 0;
    return this.state.selected_tickets?.reduce((total , item: ISelectedTicket) => total + (item.price*item.count), 0);
  }

  onResetSelectedTickets = () => {
    console.log(this.state.selected_tickets);
    if(this.state.selected_tickets)
      this.setState((prevState) => ({
        ...prevState,
        selected_tickets: prevState.selected_tickets!.map((ticket) => {
          return {
            ...ticket,
            count: 0
          }

        })
      }));
  }

  onToggleBottomModal = () => {
    this.setState((prevState) => ({ bottom_modal: !prevState.bottom_modal }));
  }

  onTouchStart = (ev: any) => {
    this.lastY = ev.changedTouches[0].clientY;
  }

  onTouchEnd = (ev: any) => {
    this.setState({ bottom_modal: this.lastY > ev.changedTouches[0].clientY })
  }

  onSelectBackground = (background: string) => {
    this.setState({ selected_background: background, bottom_modal: false });
  }

  onCouponClickHandler = (data: IDiscount) => {
    eureka.info("Discount clicked", data);
    const distinctDiscount = this.state.discounts!.filter((discount: IDiscount) => discount.id === data.id).length === 1  ? true : false;
    if(!distinctDiscount){
      const discountCurrent = this.state.discounts!.filter(f => f.selectable === true);
      let newDiscounts:IDiscount[] = [];
      newDiscounts = [...newDiscounts, ...this.state.discounts!, data];
      newDiscounts = newDiscounts.filter(x => x.id != discountCurrent[0]?.id)
      this.setState({ discounts: newDiscounts , mode: "CHECKOUT_SKY" });
      return;
    }

    this.setState({ mode: "CHECKOUT_SKY" });
    return;
  }

  applyDiscount = (amount:number): number => {
    let arrayValues:Array<number> = [];

    this.state.discounts?.map(item => {
        if(item.discount?.type === "PERCENT"){
          const percentValue = item.discount?.details.value ? (amount*item.discount?.details.value)/100 : 0;
          if(percentValue > item.discount?.details.max_value &&  item.discount?.details.max_value !== 0 ) {
            arrayValues.push(item.discount?.details.max_value)
          } else {
            arrayValues.push(percentValue)
          }
        }else{
          const amountValue = item.discount?.details.value ? item.discount?.details.value : 0;
          if(amountValue > item.discount?.details.max_value &&  item.discount?.details.max_value !== 0 ) {
            arrayValues.push(amount > item.discount?.details.max_value ? item.discount?.details.max_value : amount)
          } else {
            arrayValues.push(amount > amountValue ? amountValue : amount)
          }
        }
    });
    const totalDiscount = arrayValues.reduce((a:number, b:number) => a + b,0);
    return totalDiscount;
  }

  discountDetail = (discounts:IDiscount) => {
    const { discount } = discounts;
    const amount = this.getPriceOfTickets()

    if(discount.type === "PERCENT"){
      const percentValue = discount?.details.value ? (this.getPriceOfTickets()*discount?.details.value)/100 : 0;
      if(percentValue > discount?.details.max_value && discount?.details.max_value !== 0 ) {
        return discount?.details.max_value;
      } else {
        return percentValue;
      }

    }else{
      const amountValue = discount?.details.value ? discount?.details.value : 0;
      if(amountValue > discount?.details.max_value &&  discount?.details.max_value !== 0 ) {
        return amount > discount?.details.max_value ? discount?.details.max_value : amount;
      } else {
        return amount > amountValue ? amountValue : amount;
      }
    }
  }

  onSaveCalification = () => {
    this.setState({ is_visible_califications: false, has_questions: false });
  }

  onCloseCalification = () => {
      this.setState({ is_visible_califications: false });
  }

  /**
   * Main render
   */
  render() {
    const { mode, error_modal } = this.state;

    return (
      <IonPage className={`sky-costanera-flow ${mode.replace(/_/ig, '-').toLowerCase()}`}>
        {(() => {
          const customRender: Function = (this as any)[`render${mode}`];
          if (!customRender) {
            return <div>{mode}</div>;
          }
          return customRender();
        })()}

        {error_modal && <ErrorModal title={error_modal.title} message={error_modal.message} cancelMessage={error_modal.cancelMessage} retryMessage={error_modal.retryMessage} onRetry={error_modal.onRetry} onCancel={error_modal.onCancel} />}
    </IonPage>
    )
  }

  renderINITIAL_STATE = () => {
    return <Fragment>
      <BackdropLoading message="Cargando" />
    </Fragment>
  }

  /**
   * Render onboarding view
   */
  renderTICKETS_DATE = () => {
    return (
      <Fragment>
        <IonHeader>
          <div onClick={()=>this.goTo('HOME')}>
            <IonIcon icon={arrowBack} />
          </div>
        </IonHeader>
        <IonContent className="tickets-date">
          <div className="content">
            <h1>Selecciona el número de tickets y una fecha</h1>
            <p>Completa los datos requeridos para poder <br/>efectuar la compra.</p>
            <SelectDate selectedSlogDate={this.state.selected_slot_date} formError={this.state.form_error_date&&this.state.form_sended} reservationSlogDate={this.getReservationSlotsDates()} onChange={(selectedSlogDate: string) => {this.setState({selected_slot_date: selectedSlogDate, reservation_slots_same_date: this.getReservationSlotsTimes(selectedSlogDate), selected_slot: undefined}, () => {this.updateFormError();this.onResetSelectedTickets()})}}/>
            <SelectTime selectedSlog={this.state.selected_slot} formError={this.state.form_error_time&&this.state.form_sended} reservationSlogs={this.state.reservation_slots_same_date} disabled={this.state.selected_slot_date?false:true} onChange={(selectedReservationSlog: IReservationSlot) => {this.setState({selected_slot: selectedReservationSlog},() => this.updateFormError())}}/>
            <SelectTickets selectedTickets={this.state.selected_tickets} formError={this.state.form_error_number_tickets && this.state.form_sended} ticketTypes={this.state.selected_slot?.ticket_types} onChange={(selectedTickets) => {this.setState({ selected_tickets: selectedTickets }, () => this.updateFormError())}} disabled={this.state.selected_slot_date && this.state.selected_slot ? false : true}/>
            {(this.state.form_error_number_tickets || this.state.form_error_date || this.state.form_error_time) && this.state.form_sended  && <div className="formError">Debes ingresar la información requerida.</div>}
          </div>
        </IonContent>
        <IonFooter>
          <SeparationLine marginTop="68px" marginBottom="33px" background="#FAFAFA" darkBackground="#1A1A1A" height="8px"/>
          <div className="content-price">
            <div className="label">Monto a pagar:</div>
            <div className="price">{NumberFormatter.toCurrency(this.getPriceOfTickets())}</div>
          </div>
          <div className='pad-buttons'>
            <IonButton className='white-centered' onClick={async() => {
                if(this.getAdultsTicketsNumber() > 0){
                  this.setState({form_error_number_tickets: false, form_error_date: false, form_error_time: false, form_sended: false});
                  await this.getDiscounts();
                  this.goTo('CHECKOUT_SKY');
                }
                else{
                  this.setState({form_sended: true});
                  this.updateFormError();
                }
              }}>
              Continuar
            </IonButton>
          </div>
        </IonFooter>
      </Fragment>
    )
  }

  /**
   * Render onboarding view
   */
  renderHOME = () => {
     const { reservation_contexts, selected_background, backgrounds, bottom_modal, user, register_is_open } = this.state;

     let isOpen = false;
     let storeState = 'Cerrado';
     let storeStateMessage = '';
     const dayOfWeef = moment().day();
     const hoursMinutes = parseInt(moment().format('Hmm'));
     const mach = reservation_contexts!.opening_hours.find((oh) => oh.day === dayOfWeef);
     if (mach) {
        const hours = mach.hours.find((h) => hoursMinutes >= h.open && hoursMinutes < h.close);
        if (hours) {
          isOpen = true;
          storeState = 'Abierto';
          storeStateMessage = `Cierre de boleterías a las ${moment(`${hours.close}`, "Hmm").format('H[:]mm')} hrs`;
        } else {
          isOpen = false;
          storeState = 'Cerrado';
          storeStateMessage = 'Lo sentimos, estamos cerrados ahora.';
        }
     }


     let titleStyle: React.CSSProperties = { marginTop: '0px' };
     let modalStyle: React.CSSProperties = { height: '212px' };
     let showMoreStyle: React.CSSProperties = { display: 'none' };
     let logoStyle: React.CSSProperties = { width: '96px', bottom: '153px', left: '10px' };
     if (bottom_modal) {
        modalStyle = { height: '375px' };
        showMoreStyle = { display: 'block' };
        logoStyle = {
          width: '167px',
          bottom: '277px',
          left: '0px'
        };
        titleStyle = { marginTop: '20px' };
     }
     return (
       <Fragment>
         <IonContent className='home' style={{ backgroundImage: `url(${selected_background})` }}>
            <DefaultHeader onBack={() => this.props.history.goBack()}/>
            {backgrounds && (
              <div className='select-background'>
                <div className='content'>
                  {backgrounds.map((background, index, backgrounds) => {
                    let dClass = 'selector';
                    if (selected_background === background) {
                      dClass += ' selected';
                    }
                    if (index === backgrounds.length - 1) {
                      dClass += ' last';
                    }

                    return (
                      <img key={`${index}-${background}`} className={dClass} src={background} alt={`background`} onClick={() => this.onSelectBackground(background)}/>
                    )
                  })}
                </div>
              </div>
            )}

            { register_is_open === false && <img slot='fixed' className='logo' src={LogoSky} alt="logo sky" style={logoStyle}/>}
            { register_is_open === false && <div className='bottom-modal' slot='fixed' style={modalStyle}>
              <div className='dragger'>
                <div className='drag-area' onTouchStart={this.onTouchStart} onTouchEnd={this.onTouchEnd}>
                  <div className='item'/>
                </div>
              </div>
              <h1 style={titleStyle}>Sky Costanera</h1>
              <p>
                <span className={`tag ${isOpen ? 'open': 'closed'}`}>{storeState}</span><span> · </span>{storeStateMessage}
              </p>
              <div className='show-more' style={showMoreStyle}>
                <p>
                ¡Ven, sube a la cima con nosotros! En menos de un minuto estarás a 300 metros de altura, en el punto más alto de Latinoamérica.
                </p>
                <div className='know-more' onClick={()=> this.setState({mode:'KNOW_MORE'})}>
                  <img src={Info} alt="info" />
                  <span>
                    Conoce más de Sky Costanera
                  </span>
                </div>
              </div>
              <div className='pad-buttons'>
                <IonButton className='white-centered' onClick={() => { user?.email === 'invited' ? this.setState({register_is_open: true}) : this.goTo('TICKETS_DATE');} }>
                  Compra tus tickets
                </IonButton>
              </div>
            </div>}
            { user?.email==='invited' && register_is_open === true && <RegisterModal type="NEW" userInfo={user} onClose={() => { this.setState({register_is_open: false}) }}
            onClick={() => { this.onLoginClickHandler() }} />}
         </IonContent>
       </Fragment>
     )
  }

  /**
   * Render onboarding view
   */
  renderKNOW_MORE = () => {
    return (
      <Fragment>
        <IonHeader>
          <div onClick={()=>this.goTo('HOME')}>
            <IonIcon icon={arrowBack} />
          </div>
        </IonHeader>
        <IonContent className="know-more">
          <div className="content">
            <h1>Encuentra en tu próxima visita a Sky Costanera</h1>
            <SliderImages images={galery} zoom_image={this.onShowZoomImage}/>
            <button className="more-info" onClick={()=> this.props.history.push(`/help-information/${this.props.match.params.id}`)}>
              <div>
                <img src={Info} alt="parking logo" />
              </div>
              <div dangerouslySetInnerHTML={{ __html: 'Preguntas frecuentes' }}></div>
            </button>
            <IonGrid>
                <IonRow>
                  <IonCol>
                    <InformationItem icon={ KnowMoreClock} title="Duración" text="La duración de tu visita es tan larga como tu quieras, solo debes recordar que no puedes subir alimentos y que el último ascensor baja a las 21:00 hrs." />
                  </IonCol>
                  <IonCol>
                    <InformationItem icon={ KnowMoreDiscapacity} title="Accesibilidad" text="Sky Costanera es un espacio seguro y cuenta con los protocolos de accesibilidad universal." />
                  </IonCol>
                </IonRow>
                <IonRow>
                  <IonCol>
                    <InformationItem icon={KnowMoreUser} title="Anfitrión o anfitriona" text="Nuestro equipo de anfitriones estarán para ayudarte en todo momento, ¡Pregunta por los horarios de los tour guiados gratuitos!" />
                  </IonCol>
                  <IonCol>
                    <InformationItem icon={ KnowMoreCovid} title="Medidas Covid-19" text="Contamos con todas las medidas de prevención y sanitización." />
                  </IonCol>
                </IonRow>
              </IonGrid>
          </div>
        </IonContent>
        <ZoomImage outside_close_button={true} modal_open={this.state.zoom_image} image_url={this.state.zoom_image_url?this.state.zoom_image_url:''} onClose={this.onCloseZoomImage}></ZoomImage>
      </Fragment>

    )
  }

  /**
   * Render form view
   */
  renderFORM = () => {

    return (
      <Fragment>
        <IonHeader>
          <div onClick={() => this.goTo('TICKETS_DATE')}>
            <IonIcon icon={arrowBack} />
          </div>
        </IonHeader>
        <IonContent>
        </IonContent>
        <IonFooter>
          <div className='pad-buttons'>
            <IonButton className='white-centered' onClick={() => null}>
              Continuar
            </IonButton>
          </div>
        </IonFooter>
      </Fragment>
    )
  }

  /**
   * Render checkout view
   */
  renderCHECKOUT_SKY = () => {
    const { discounts } = this.state;
    const quoteAmount = NumberFormatter.toCurrency(this.getPriceOfTickets());
    const amountDiscount = this.getPriceOfTickets() < this.applyDiscount(this.getPriceOfTickets()) ? 0 : Math.round(this.getPriceOfTickets() - this.applyDiscount(this.getPriceOfTickets()));
        return <Fragment>
          <IonContent className='body-ticket'>
            <div className="sales-ticket">
              <div className="back-button" onClick={() => this.goTo('TICKETS_DATE')}>
                <IonIcon icon={arrowBack} />
              </div>
              <div className="ticket-section">
                <h2>{localize('TICKET_DETAIL_TITLE')}</h2>
                <div className="fancy-ticket">
                  <div className="record-details">
                    <div className="info-piece visitors">
                      <div className="label">
                        {localize('VISITORS_TITLE')}
                      </div>
                      <div>
                        <ul className="list-visitors">
                          {this.state.selected_tickets?.map((data, index) => {
                            return (
                              data.count > 0 ? <li key={index}>{data.count} {this.parseSingularOrPlurarText(data)}</li> : null
                            )
                          })}
                        </ul>
                      </div>
                    </div>
                    <div className="info-piece date">
                      <div className="label">{localize('DATE_TITLE')}</div>
                      <div className="date-data">
                        <div className="day-of-month principal">
                          {moment(this.state.selected_slot?.start).date()}
                        </div>
                        <div className="date-month-year secondary">
                          <div className="month">
                            {moment(this.state.selected_slot?.start).format('MMMM')}
                          </div>
                          <div className="year">
                            {moment(this.state.selected_slot?.start).year()}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="info-piece time">
                      <div className="label">
                        {localize('HOUR_TITLE')}
                      </div>
                      <div>
                      {`${moment(this.state.selected_slot?.start).format('HH')}:${moment(this.state.selected_slot?.start).format('mm')}`}
                      </div>
                    </div>
                    <div className="info-piece footer"></div>
                  </div>
                  <div className="ticket-cut-out">
                    <div className="ticket-cutout" />
                    <div className="ticket-cutout ticket-cutout--right" />
                  </div>
                  <div className="paid-amount">
                    <div className="info-piece date">
                    <div className="content-amounts">
                      <div className="label">{localize('PAYMENT_TITLE')}</div>
                        <div className="after">
                          {discounts!.length > 0 ?  `Antes: ${quoteAmount}` : null}
                        </div>
                      </div>
                    </div>
                    <div className="amount">
                      {NumberFormatter.toCurrency(amountDiscount)}
                    </div>
                    <div className="discounts">
                      {discounts?.map(item => {
                        if(item.selectable === false){
                          return (
                            <div className="collaborator" key={item.id}>{item.title}: {item.description}</div>
                          )
                        }
                        if(item.selectable === true){
                          return (
                            <div className="selectable" key={item.id}>
                              <img src={discountSelectableImg} alt="icon"/>
                              cupon: {StringFormatter.shortText(item.title.toUpperCase(),29,29)}
                            </div>
                          )
                        }
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="payment-methods">
              <h2 className="title">{localize('SELECTED_PAYMENT_TITLE')}</h2>
                {this.state.cards.map((card) => {
                  const isSelected = card.id === this.state.selected_card;
                  const iconByCardType = this.cardDecorator(card.card_type);
                  return (
                    <div key={`${card.id}`} className={`item ${isSelected ? 'selected' : ''}`} onClick={() => { this.selectCard(card.id) }}>
                      <IonIcon className="card-icon" src={iconByCardType} />
                        <h3 className="text">{this.formatCardNumber(card.card_number)}</h3>
                      <IonIcon icon={isSelected ? checkmarkCircleSharp : ellipseOutline} />
                    </div>
                  )
                })}
                <div className="item" onClick={this.onAddNewCardHandler}>
                  <div className="add-icon"><IonIcon icon={add} /></div>
                  <h3 className="text">{localize('ADD_CARD_TEXT')}</h3>
                </div>
                <div>
                  {this.verifyButtonDiscount()
                    ?
                    discounts!.map(item => {
                      if(item.selectable){
                        return (
                          <Fragment key={item.id}>
                            <ButtonDiscount onClick={() => { this.setState({ mode: "DISCOUNT" }) }} code={item.code} />
                          </Fragment>
                        )
                      }
                    })
                    :
                    <div className="item" onClick={() => { this.setState({ mode: "DISCOUNT" }) }}>
                      <div className="add-icon"><IonIcon icon={add} /></div>
                      <h3 className="text">Cupón</h3>
                    </div>
                  }
                </div>
            </div>
          </IonContent>
          <IonFooter>
          <div className='pad-buttons'>
            {this.state.flags?.enable_form && this.state.selected_tickets && this.state.selected_tickets.filter((x:ISelected) => x.type === 'ADULT')[0].count > 1 && this.state.user_has_rut ?
              <IonButton className='white-centered'  onClick={ () => {this.goTo('IDENTIFICATIONS') }} disabled={!this.state.selected_card}>
                Pagar
              </IonButton> :
              <IonButton className='white-centered'  onClick={ this.onPayHandler } disabled={!this.state.selected_card}>
                Pagar
              </IonButton>
            }
          </div>
          </IonFooter>
        </Fragment>
  }

  /**
   * Render identifications view
   */
  renderIDENTIFICATIONS = () => {
    const { selected_tickets, flags } = this.state;
    const quantity_adults = selected_tickets ? selected_tickets.filter((x:ISelected) => x.type === 'ADULT')[0].count - 1 : 0;

    return (
      <Fragment>
        <IonHeader>
          <div onClick={() => this.goTo('CHECKOUT_SKY')}>
            <IonIcon icon={arrowBack} />
          </div>
        </IonHeader>
          <Identifications
            quantity_adults={quantity_adults}
            goSend={this.IdentificationsHandler}
            global_flag_validation={flags?.validations}
            document_number={this.state.user?.document_number}
            users_add={this.childCallback}
          />
      </Fragment>
    )
  }
  /**
   * Render register card in progress view
   */
  renderREGISTER_CARD_IN_PROGRESS_SKY = () => {
  return (
    <Fragment>
      <IonHeader>
        <div onClick={this.onGoBackFromRegisterCardInProgressHandler}>
          <IonIcon icon={arrowBack} />
        </div>
      </IonHeader>
      <IonContent className="register-card-in-progress">
        <div className="content">
          <h1>{localize('CARD_IN_PROGRESS_TEXT')}</h1>
          <img src={oneClickImg} alt="oneclick" />
          <BackdropLoading message="" />
        </div>

      </IonContent>
    </Fragment>
  )
  }

  /**
   * Render register card success view
   */
  renderREGISTER_CARD_SUCCESS_SKY = () => {
    return (
      <Fragment>
        <IonHeader>
          <div onClick={() => { this.setState({ mode: "CHECKOUT_SKY" }) }} >
            <IonIcon icon={arrowBack} />
          </div>
        </IonHeader>
        <IonContent className="register-card-success">
          <div className="content">
            <IonIcon icon={checkmarkCircleOutline} />
            <h1 className="font-bold">
              ¡Todo listo!
              <br />
              Tarjeta agregada.
            </h1>
          </div>
        </IonContent>
        <IonFooter>
          <div className='pad-buttons'>
            <IonButton onClick={() => { this.goTo('CHECKOUT_SKY')}}>
              Continuar
            </IonButton>
          </div>
        </IonFooter>
      </Fragment>
    )
  }

  /**
  * Render payment in progress view
  */
  renderPAYMENT_IN_PROGRESS = () => {
    return (
      <Fragment>
        <BackdropLoading message="Pagando..." />
      </Fragment>
    )
  }

  /**
   * Render payment success view.
   */
  renderPAYMENT_SUCCESS_SKY = () => {
    const { is_visible_califications, has_questions, user, payment_intention } = this.state;
    return (
      <Fragment>
        <IonHeader>
          <div className="btn-close">
                <IonIcon icon={close}  size="large" onClick={() => {
                  this.resetData();
                  this.props.history.goBack();
          }}/>
          </div>
        </IonHeader>
        <IonContent>
          <div className="payment-content">
            <h1>¡Todo listo!</h1>
            <p>Este es tu ticket para ingresar a Sky Costanera.</p>
          </div>
          <div className="ticket-payment-body">
            <PurchaseTicket data={this.state.payment_ticket} />
          </div>
            <>
              <CalificationModal
                flow='SKY-COSTANERA'
                show={is_visible_califications}
                initialPage={{
                    mainText: `${user?.full_name === '' || user?.full_name === '-' ? 'Hola' : user?.full_name}, ya pagaste tu ticket`,
                    mainImage: flowQualificationImg
                }}
                cancelButtonText={'Ahora no'}
                payment_intention_id={payment_intention!.id}
                payment_date={payment_intention!.created_at.toString()}

                user={user}
                metadata={{
                    "mall_id": payment_intention!.metadata.facility_id as string
                }}

                onClose={() => { this.onCloseCalification() }}
                onSaveCalification={() => { this.onSaveCalification() }}
                hasQuestions={(question:boolean) => { this.setState({ has_questions: question }) }}
                isDisabledOnboarding={true}
                >
                <div>Cuéntanos cómo fue tu experiencia utilizando el servicio de Sky Costanera.</div>
                <div>Te tomará menos de un minuto.</div>
              </CalificationModal>
            </>
        </IonContent>
        <IonFooter>
          <div className='pad-buttons'>
            {has_questions &&
              <div className="button-califications">
                <IonButton className='white-centered' onClick={() => { this.setState({ is_visible_califications: true }) }}>
                  Continuar
                </IonButton>
              </div>
            }
            <div style={{ paddingTop: '15px' }}>
              <IonButton className='button-light' onClick={() => {
                this.goTo('TICKETS_DETAIL');
                } }>
                Ver mis tickets
              </IonButton>
            </div>
          </div>
        </IonFooter>
      </Fragment>
    )
  }

  /**
   * Render list tickets view
   */
  renderTICKETS_DETAIL = () => {
    return (
      <Fragment>
        <TicketsPage store={'costanera center'} user={this.state.user} onClose={() => this.setState({ mode: 'PAYMENT_SUCCESS_SKY' })} />
      </Fragment>
    )
  }

  /**
   * Render register rut view
   */
   renderREGISTER_RUT = () => {
    return (
      <Fragment>
        <RutScreen
            title={'Necesitamos que ingreses tu RUT'}
            subtitle={'Esto es necesario para seguir con el proceso'}
            onBack={() => { this.setState({ mode: 'CHECKOUT_SKY' }) }}
            onContinue={() => {
              if(this.state.flags?.enable_form && this.state.selected_tickets && this.state.selected_tickets.filter((x:ISelected) => x.type === 'ADULT')[0].count > 1){
                this.setState({ mode: 'IDENTIFICATIONS'});
                return;
              }else{
                this.setState({ mode: "PAYMENT_IN_PROGRESS" });
              }
              setTimeout(() => {
                this.executePayment();
              });
            }}
            onValue={(rut: string) => {
                eureka.info("Update rut", rut)
                this.setState((prev: any) => ({ ...prev, user_has_rut: true, user: { ...prev.user, document_number: rut } }));
            }}
        />
      </Fragment>
    )
  }

  /** Render discount modal */
  renderDISCOUNT = () => {
    const store = this.state.site?.id as string;
    return (
      <Fragment>
        <DiscountModal
          context={{ paymentFlow: "SKY-COSTANERA", storeNumber: store }}
          onScan={() => { this.goTo("SCANNER") }}
          onStop={this.onStopScannerModal}
          onClose={() => { this.goTo("CHECKOUT_SKY") }}
          onCouponClick={this.onCouponClickHandler}
          onStatus={this.state.status}
        />
      </Fragment>
    )
  }

  /**
   * Render scanner view
   */
   renderSCANNER = () => {
    return (
      <Fragment>
        <IonHeader>
          <div onClick={this.onStopScanner}>
            <IonIcon icon={arrowBack} />
          </div>
        </IonHeader>
        <div className="content-scanner">
          <IonIcon src={qrLens} />
          <div className="message">Coloca el código en el centro del recuadro para escanear.</div>
        </div>
      </Fragment>
    )
  }

})
