import {
  withIonLifeCycle,
  IonPage,
  IonContent,
  IonIcon,
  IonFooter,
  IonHeader,
  IonButton,
} from '@ionic/react';
import moment from 'moment';
import React, { Fragment } from 'react';
import { RouteComponentProps } from 'react-router';
import { BarcodeScanner } from '@capacitor-community/barcode-scanner';
import { OpenNativeSettings } from '@ionic-native/open-native-settings';
import { add, arrowBack, checkmarkCircleSharp, checkmarkCircleOutline, closeOutline, cardOutline, ellipseOutline, informationCircle } from 'ionicons/icons';

// index
import './index.less';
// lib
import Expr from '../../lib/Expr';
import EventStreamer from '../../lib/EventStreamer';
import EurekaConsole from '../../lib/EurekaConsole';
import DniFormatter from '../../lib/formatters/DniFormatter';
import NumberFormatter from '../../lib/formatters/NumberFormatter';
// clients
import CardClient from '../../clients/CardClient';
import UserClient from '../../clients/UserClient';
import TicketClient from '../../clients/TicketClient';
import PaymentIntentionClient from '../../clients/PaymentIntentionClient';
import DiscountClient from '../../clients/DiscountClient';
import AuthenticationClient from '../../clients/AuthenticationClient';
// models
import ICard from '../../models/cards/ICard';
import { IUser } from '../../models/users/IUser';
import ITicketQuote from '../../models/tickets/ITicketQuote';
import IPaymentIntention from '../../models/payments/IPaymentIntention';
import { IDiscount } from '../../models/discount/IDiscount';
// components
import ErrorModal from '../../components/error-modal';
import ImageInTwoMode from '../../components/image-in-two-modes';
import BackdropLoading from '../../components/backdrop-loading';
import ButtonDiscount from '../../components/button-discount';
import DiscountModal from '../../components/discount-modal';
import CalificationModal from '../../components/califications';
import RutScreen from '../../components/rut-screen';
// assets
import oneClickImg from '../../assets/media/oneclick.svg';
import qrCodeDarkImg from '../../assets/media/qr_dark.svg';
import qrCodeLightImg from '../../assets/media/qr_light.svg';
import discountSelectableImg from '../../assets/media/discount-selectable.svg';
import flowQualificationImg from '../../assets/media/icon-flow-qualification.svg';

// import autoScanLogoLight from './../../assets/media/autoscan_light.svg';
// import autoScanLogoDark from './../../assets/media/autoscan_dark.svg';

import autoScanLogoLight from './../../assets/media/autoscan-new.svg';
import autoScanLogoDark from './../../assets/media/autoscan-new.svg';

import ticketWithQrDarkImg from '../../assets/media/ticket_dark.svg';
import ticketWithQrLightImg from '../../assets/media/ticket_light.svg';
import { InAppBrowser, InAppBrowserEvent } from '@ionic-native/in-app-browser';
import ParkingLogo from '../../assets/media/parkingx3_bkp.png'

import ImageHelpCard from '../../assets/media/service-onboarding/help-card.svg';
import ImageHelpReceipt from '../../assets/media/service-onboarding/help-receipt.svg';
import ImageHelpScan from '../../assets/media/service-onboarding/help-scan.svg';
import ImageHelpTimer from '../../assets/media/service-onboarding/help-timer.svg';
import qrLens from '../../assets/media/qr_scanner.svg';

import isotypeMasterCard from '../../assets/media/isotype-mastercard.svg';
import isotypeVisaCard from '../../assets/media/isotype-visa.svg';
import autopassHomeQrImage from './../../assets/media/autopass-home-qr.svg';

import HelpRegisterModal from '../../components/help-register-modal';
import i18n from '../../lib/i18n';
import locales from './locales';
import SettingsClient from '../../clients/SettingsClient';
import { IListParams } from '../../clients/RESTClient';
import StringFormatter from '../../lib/formatters/StringFormatter';

const eureka = EurekaConsole({ label: "autoscan" });
const TICKET_ID = "1900125|26250534190012500039091";
//const TICKET_ID = "1900125|30400495190012500038633";
const SERVICE_ITEM_ID = "1234567"

const localize = i18n(locales);

const formatCardNumber = (cardNumber: string) => {
  return cardNumber.replace(/^X*/, '···· ');
}

const formatStoreName = (str: string): string => {
  return str.replace(/\w\S*/g, function (txt) { return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase(); });
}

interface IProps extends RouteComponentProps<{
  id: string,
  ticket_id?: string,
}> {
}

interface IState {
  mode: "LOADING" | "CAMERA_ONBOARDING" | "ONBOARDING" | "SCANNER" | "SEARCHING" | "CHECKOUT" | "REGISTER_CARD_IN_PROGRESS" | "REGISTER_CARD_SUCCESS" | "PAYMENT_IN_PROGRESS" | "PAYMENT_SUCCESS" | "REGISTER_RUT" | "DISCOUNT",
  user?: IUser,
  user_has_rut: boolean,
  ticket_id?: string,
  quote?: ITicketQuote,
  selected_card?: string,
  cards: ICard[],
  error_modal?: { title: string, message: string, retryMessage?: string, cancelMessage?: string, onRetry?: () => void, onCancel?: () => void },
  isValidStatesInputs: {
    document_number: boolean,
  },
  document_number: string,
  type_modal: string,
  modal_is_open: boolean,
  discounts?: IDiscount[],
  scanMode? : "TICKET" | "MODAL",
  status?: number,
  is_visible_califications: boolean,
  has_questions: boolean,
  payment_intention?: IPaymentIntention
}

export default withIonLifeCycle(class AutoscanPage extends React.Component<IProps, IState> {
  intervalId: NodeJS.Timeout | undefined;

  state: IState = {
    mode: 'LOADING',
    user_has_rut: false,
    cards: [],
    isValidStatesInputs: {
      document_number: false
    },
    type_modal: '',
    document_number: '',
    modal_is_open: false,
    is_visible_califications: false,
    has_questions: false
  }

  async ionViewDidEnter() {
    SettingsClient.remove("AUTOSCAN_TICKET_ID");
    this.checkCameraPermission();
    const { ticket_id } = this.props.match.params;
    if (ticket_id) {
      this.getInfo(ticket_id);
      return;
    }
  }

  ionViewDidLeave() {
    EventStreamer.off("DEEPLINK:CARD_ADDED_CALLBACK", this.onDeepLinkAddCardHandler);
    this.intervalId && clearInterval(this.intervalId);
  }

  checkCameraPermission = async (): Promise<void> => {
    try {
      let isNativePhone = false;
      Expr.whenInNativePhone(() => { isNativePhone = true; });

      if (!isNativePhone) {
        this.setState({ mode: "ONBOARDING" });
        return;
      }

      const status = await BarcodeScanner.checkPermission({ force: false });

      const granted = !!status.granted;
      if (granted) {
        this.setState({ mode: "ONBOARDING" });
      } else {
        this.setState({ mode: "CAMERA_ONBOARDING" });
      }
    } catch (error) {
      eureka.error('An error has ocurred trying to check camera permission', error);

      // show error modal
      this.setState({
        error_modal: {
          title: "Hubo un problema",
          message: "No pudimos cargar toda la información. ¿Deseas reintentar?",
          onRetry: () => {
            this.setState({ error_modal: undefined });

            setTimeout(() => {
              this.checkCameraPermission()
            }, 1000);
          },
          onCancel: () => {
            this.setState({ error_modal: undefined });

            setTimeout(() => {
              this.onGoBackHandler();
            }, 500)
          }
        }
      });
    }
  }

  grantCameraPermission = async () => {
    const showOpenNativeSettingsModal = () => {
      this.setState({
        error_modal: {
          title: "Hubo un problema",
          message: "Debes activar los permisos de tu cámara. Ingresa a la configuración de tu teléfono.",
          retryMessage: "Ir a configuración",
          onRetry: () => {
            this.setState({ error_modal: undefined });

            setTimeout(() => {
              OpenNativeSettings.open('application_details');
            }, 500);
          },
          onCancel: () => {
            this.setState({ error_modal: undefined });
          }
        }
      });
    }

    Expr.whenInNativePhone(async () => {
      try {
        const status = await BarcodeScanner.checkPermission({ force: false });

        if (status.granted) {
          eureka.info('User already granted camera permission');

          this.setState({ mode: "ONBOARDING" });
          return;
        }

        if (status.denied) {
          eureka.info('User denied camera permission');

          showOpenNativeSettingsModal();
          return;
        }

        if (status.restricted || status.unknown) {
          // ios only
          eureka.info('User probably means the permission has been denied');

          showOpenNativeSettingsModal();
          return;
        }

        // user has not denied permission
        // but the user also has not yet granted the permission
        // so request it
        const statusRequest = await BarcodeScanner.checkPermission({ force: true });

        if (statusRequest.asked) {
          // system requested the user for permission during this call
          // only possible when force set to true
        }

        if (statusRequest.granted) {
          // the user did grant the permission now
          eureka.info('User granted the permission');

          this.setState({ mode: "ONBOARDING" });
          return;
        }

        // user did not grant the permission, so he must have declined the request
        showOpenNativeSettingsModal();
        return;
      } catch (error) {
        eureka.error('An error has ocurred trying to grant camera permission', error);

        // show error modal
        this.setState({
          error_modal: {
            title: "Hubo un problema",
            message: "No pudimos cargar la información de tu cámara. ¿Deseas reintentar?",
            onRetry: () => {
              this.setState({ error_modal: undefined });

              setTimeout(() => {
                this.grantCameraPermission();
              }, 1000);
            },
            onCancel: () => {
              this.setState({ error_modal: undefined });

              setTimeout(() => {
                this.onGoBackHandler();
              }, 500)
            }
          }
        });
      }
    });

    Expr.whenNotInNativePhone(() => {
      this.setState({ mode: "ONBOARDING" });
    });
  };

  userHasRUT = async () => {
    const currentUser = await UserClient.me();

    return currentUser.document_number && currentUser.document_number.length > 0;
  }

  createTicketQuote = async (id: string): Promise<void> => {
    try {
      const quote = await TicketClient.quote(id);
      this.setState({ ticket_id: id, quote });
      await this.getDiscounts();
    } catch (error) {
      eureka.error('An error has ocurred trying to create a ticket quote', error);

      throw error;
    }
  }

  getUser = async (): Promise<void> => {
    try {
      const user = await UserClient.me() as IUser;
      this.setState({ user, user_has_rut: !!user.document_number });
    } catch (error) {
      eureka.error('An error has ocurred trying to get the user', error);

      throw error;
    }
  }

  getCards = async (): Promise<void> => {
    try {
      const cards = await CardClient.getList();
      this.setState({ selected_card: cards.length ? cards[0].id : undefined, cards });
    } catch (error) {
      eureka.error('An error has ocurred trying to get user cards', error);

      throw error;
    }
  }

  getDiscounts = async (): Promise<void> => {
    try {

      let queryParams:Record<string,any> = {
        context: {},
        query: {},
      };

      queryParams.context = Object.assign(queryParams.context, {
        'user_ids': AuthenticationClient.getInfo().primarysid,
        'payment_flows': "AUTOSCAN"
      });

      queryParams.query = Object.assign({}, queryParams.query, {
        'selectable_is': true
      });

      const amount = this.state.quote?.amount;
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
          created_at: 'desc'
        },
      };

      queryParams.query = Object.assign({}, queryParams.query, {
        'apply_to.user_ids.keyword_is_one_of': ['*', AuthenticationClient.getInfo().primarysid],
        'apply_to.payment_flows.keyword_is_one_of': ['*','AUTOSCAN'],
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

  getInfo = async (id: string) => {
    try {
      this.setState({ mode: "SEARCHING" });
      await Promise.all([
        this.getUser(),
        this.createTicketQuote(id),
        this.getCards()
      ]);
      this.setState({ mode: "CHECKOUT" });
    } catch (error) {
      eureka.error('An error has ocurred trying to get info', error);

      console.log({ error });
      const { data, statusCode } = (error as any).response.data;
      console.log(statusCode)

      if (statusCode === 400 && data.code === 'ERROR_QUOTE_SHOPPING_NOT_ENABLED') {
        this.setState({
          error_modal: {
            title: "Ocurrió un problema",
            message: `El servicio de Registra tu patente no se encuentra disponible para ${data.mall}.`,
            cancelMessage: "Cerrar",
            onCancel: () => {
              this.setState({ error_modal: undefined, mode: "ONBOARDING" });

            },
          }
        })
        return;
      }

      if (statusCode === 400 && data.code === 'ERROR_QUOTE_READING_QR') {
        this.setState({
          error_modal: {
            title: "Ocurrió un problema",
            message: `Apunte su cámara para leer el QR.`,
            cancelMessage: "Cerrar",
            onCancel: () => {
              this.setState({ error_modal: undefined, mode: "ONBOARDING" });

            },
          }
        })
        return;
      }

      // show error modal
      this.setState({
        error_modal: {
          title: "Hubo un problema",
          message: "No pudimos encontrar la información. ¿Deseas reintentar?",
          onRetry: () => {
            this.setState({ error_modal: undefined });
            this.getInfo(id);
          },
          onCancel: () => {
            this.setState({ error_modal: undefined, mode: "ONBOARDING" })
          }
        }
      });


    }
  }

  selectCard = (id: string) => {
    this.setState({ selected_card: id });
  }

  startCardRegistration = async () => {
    const showErrorModal = () => {
      this.setState({
        error_modal: {
          title: "Hubo un problema",
          message: "No pudimos registrar tu tarjeta. ¿Deseas reintentar?",
          onRetry: () => {
            this.setState({ error_modal: undefined });

            // // start again card registration
            setTimeout(() => {
              this.startCardRegistration();
            }, 1000);
          },
          onCancel: () => {
            this.setState({ error_modal: undefined, mode: "CHECKOUT" })
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

  discountDetail = (discounts:IDiscount) => {
    const { discount } = discounts;
    const amount = this.state.quote!.amount
    if(discount.type === "PERCENT"){
      const percentValue = discount?.details.value ? (this.state.quote!.amount*discount?.details.value)/100 : 0;
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
        return amount >  amountValue ? amountValue : amount;
      }
    }
  }

  executePayment = async () => {
    try {
      this.setState({ mode: "PAYMENT_IN_PROGRESS" });

      // execute payment
      const { user, ticket_id, quote, cards, discounts } = this.state;
      const card = cards.find((card) => card.id === this.state.selected_card);
      const amount = quote!.amount < this.applyDiscount() ? 0 : quote!.amount - this.applyDiscount();
      const created = await PaymentIntentionClient.create({
        payment_flow: 'AUTOSCAN',
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
            discount: this.applyDiscount()
          },
          line_items: [{
            id: SERVICE_ITEM_ID,
            description: 'Pago de ticket Registra tu patente MiMall',
            price: amount,
            quantity: 1
          }]
        },
        discounts: discounts,
        metadata: {
          ticket_id: ticket_id,
          ticket_quote_date: quote!.quote_date,
          discount: discounts?.map((discount:IDiscount) => {
            return {
                code: discount.code,
                discount_applied: this.discountDetail(discount),
                id_discount: discount.id
              }
          })
        }
      } as unknown as IPaymentIntention);

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
            this.setState({ error_modal: undefined, mode: "CHECKOUT" })
          }
        }
      });
    }
  }

  checkPaymentStatus = async (id: string) => {
    this.intervalId = setInterval(async () => {
      try {
        const response = await PaymentIntentionClient.getStatus(id);
        if (response.status === "IN_PROGRESS") {
          return;
        }

        if (response.status === "SUCCESS") {
          this.setState({ mode: "PAYMENT_SUCCESS" });
        } else {
          if (response.error?.code === "ERROR_QUOTE_TIME_EXCEEDED") {
            this.setState({
              error_modal: {
                title: "El valor del ticket virtual ha cambiado",
                message: "El tiempo de espera de 5 minutos se cumplió, para poder continuar deberás escanear nuevamente tu ticket.",
                retryMessage: "Volver a escanear",
                onRetry: () => {
                  this.setState({ error_modal: undefined });
                  this.onQRCodeScanHandler();
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
                  this.setState({ error_modal: undefined, mode: "CHECKOUT" })
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

  onDeepLinkAddCardHandler = (data: any) => {
    // start unsubscribing
    EventStreamer.off("DEEPLINK:CARD_ADDED_CALLBACK", this.onDeepLinkAddCardHandler);

    const updateCards = async () => {
      try {
        await this.getCards();
        this.setState({ mode: "REGISTER_CARD_SUCCESS" });
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
              this.setState({ error_modal: undefined, mode: "CHECKOUT" })
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

  onGoBackHandler = () => {
    this.props.history.goBack();
  }

  onGoBackToOnboardingHandler = () => {
    this.setState({ mode: "ONBOARDING" });
  }

  onQRCodeScanHandler = async () => {
    Expr.whenInNativePhone(async () => {
      try {
        this.setState({ mode: "SCANNER", scanMode: "TICKET" });

        // make background of WebView transparent
        BarcodeScanner.hideBackground();

        // trick to hide the webview
        document.body.style.backgroundColor = "transparent";

        const result = await BarcodeScanner.startScan();

        eureka.debug("BarcodeScanner result", result);

        // if the result has content
        if (result.hasContent) {
          //split the result
          const dataTicket = result.content?.split("#ticket_id=");

          this.getInfo(dataTicket?.pop()!);
        }

        eureka.info(`Bar code scanned successfuly`, JSON.stringify(result));
      } catch (ex) {
        eureka.error('An error has ocurred trying to read the ticket qr');
        eureka.error((ex as Error).message, ex);

        // show error modal
        this.setState({
          error_modal: {
            title: "Hubo un problema",
            message: "No pudimos leer el código QR. ¿Deseas reintentar?",
            onRetry: () => {
              this.setState({ error_modal: undefined });

              setTimeout(() => {
                this.onQRCodeScanHandler();
              }, 1000);
            },
            onCancel: () => {
              this.setState({ error_modal: undefined, mode: "ONBOARDING" })
            }
          }
        });
      } finally {
        document.body.style.backgroundColor = "";
      }
    })

    Expr.whenNotInNativePhone(() => {
      this.getInfo(TICKET_ID);
    })
  }

  onAddNewCardHandler = async () => {
    this.setState({ mode: "REGISTER_CARD_IN_PROGRESS" });

    this.startCardRegistration();
  }

  onPayHandler = async () => {
    const { user_has_rut } = this.state;
    if (!user_has_rut) {
      this.setState({ mode: "REGISTER_RUT" });
      return;
    }

    this.executePayment();
  }

  onGoBackFromRegisterCardInProgressHandler = () => {
    this.setState({ mode: "CHECKOUT" });

    // unsubscribe from deeplink to avoid unexpected behavior
    EventStreamer.off("DEEPLINK:CARD_ADDED_CALLBACK", this.onDeepLinkAddCardHandler);
  }

  onStopScanner = () => {
    BarcodeScanner.showBackground();
    BarcodeScanner.stopScan();

    !this.state.scanMode || this.state.scanMode === "TICKET" ? this.setState({ mode: 'ONBOARDING' }) : this.setState({ mode: "CHECKOUT" });
  }

  onStopScannerModal = (status: number|undefined) => {
    BarcodeScanner.showBackground();
    BarcodeScanner.stopScan();
    eureka.info("Stop out")
    this.setState({ mode: "DISCOUNT", status: status});
  }

  onCloseModalHandler = () => {
    this.setState({
      modal_is_open: false,
    })
  }

  onScanHandler = () => {
    this.setState({ mode: "SCANNER", scanMode: "MODAL" });
  }

  onCloseHandler = () => {
    this.setState({ mode: "CHECKOUT" });
  }

  onCouponClickHandler = (data: IDiscount) => {
    eureka.info("Discount clicked", data);
    const distinctDiscount = this.state.discounts!.filter((discount: IDiscount) => discount.id === data.id).length === 1  ? true : false;
    if(!distinctDiscount){
      const discountCurrent = this.state.discounts!.filter(f => f.selectable === true);
      let newDiscounts:IDiscount[] = [];
      newDiscounts = [...newDiscounts, ...this.state.discounts!, data];
      newDiscounts = newDiscounts.filter(x => x.id != discountCurrent[0]?.id)
      eureka.info("New discounts", newDiscounts);
      this.setState({ discounts: newDiscounts , mode: "CHECKOUT" });
      return;
    }
    this.setState({ mode: "CHECKOUT" });
    return;
  }

  helpModal = () => {
    let strings = [];

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
    strings.push({
      "image": ImageHelpTimer,
      "title": localize('SLIDER_AUTOSCAN_TITLE4'),
      "description": localize('SLIDER_AUTOSCAN_DESCRIPTION4')
    });

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

  applyDiscount = (): number => {
    let arrayValues:Array<number> = [];

    const amount = this.state.quote!.amount

    this.state.discounts?.map(item => {
        if(item.discount?.type === "PERCENT"){
          const percentValue = item.discount?.details.value ? (this.state.quote!.amount*item.discount?.details.value)/100 : 0;
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
            arrayValues.push(amount >  amountValue ? amountValue : amount)
          }
        }
    });
    const totalDiscount = arrayValues.reduce((a:number, b:number) => a + b,0);
    return totalDiscount;
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

    return <IonPage className={`austoscan-flow ${mode.replace(/_/ig, '-').toLowerCase()}`}>
      {(() => {
        const customRender: Function = (this as any)[`render${mode}`];
        if (!customRender) {
          return <div>{mode}</div>;
        }
        return customRender();
      })()}

      {error_modal && <ErrorModal title={error_modal.title} message={error_modal.message} cancelMessage={error_modal.cancelMessage} retryMessage={error_modal.retryMessage} onRetry={error_modal.onRetry} onCancel={error_modal.onCancel} />}
    </IonPage>
  }

  /**
   * Render loading view
   */
  renderLOADING = () => {

    return (
      <Fragment>
        <BackdropLoading message="Cargando..." />
      </Fragment>
    )
  }

  /**
   * Render camera oboarding view
   */
  renderCAMERA_ONBOARDING = () => {

    return (
      <Fragment>
        <IonHeader>
          <div onClick={this.onGoBackHandler}>
            <IonIcon icon={arrowBack} />
          </div>
        </IonHeader>
        <IonContent className="camera-onboarding">
          <div className="content">
            <ImageInTwoMode srcLight={autoScanLogoLight} srcDark={autoScanLogoDark} alt="autoscan logo" />
            <h2>Escanea tu ticket</h2>
            <p>Paga el ticket de estacionamiento directamente desde la app escaneando el código QR y olvídate de la filas.</p>
            <br />
            <button className="more-info listing" onClick={() => this.setState({ modal_is_open: true, type_modal: "AUTOSCAN" })}>
              <div>
                <img src={ParkingLogo} alt="parking logo" />
              </div>
              <div dangerouslySetInnerHTML={{ __html: localize('SLIDER_TRIGGER_TEXT') }}></div>
            </button>
          </div>


          <>
            {this.state.modal_is_open && this.state.type_modal === "AUTOSCAN" ?
              <HelpRegisterModal
                onClose={this.onCloseModalHandler}
                modal_is_open={this.state.modal_is_open}
                content={this.helpModal()}
              /> : null
            }
          </>
        </IonContent>
        <IonFooter>
          <div className='pad-buttons'>
            <IonButton className='white-centered' onClick={this.grantCameraPermission}>
              Continuar
            </IonButton>
          </div>
        </IonFooter>
      </Fragment>
    )
  }

  /**
   * Render oboarding view
   */
  renderONBOARDING = () => {
    return (
      <Fragment>
        <IonHeader>
          <div onClick={this.onGoBackHandler}>
            <IonIcon icon={arrowBack} />
          </div>
        </IonHeader>
        <IonContent className="onboarding">
          <div className="content">
            {/* <ImageInTwoMode srcLight={ticketWithQrLightImg} srcDark={ticketWithQrDarkImg} alt="ticket with qr" /> */}
            <img
              src={autopassHomeQrImage}
              alt="parking logo"
              className="plate-register-image"
            />
            <h2 className='title'
            >Escanea tu ticket</h2>
            <p className='description'>
              Paga el ticket de estacionamiento directamente desde la app escaneando el código QR y olvídate de la filas.
            </p>

            <br />
            <button className="more-info listing" onClick={() => this.setState({ modal_is_open: true, type_modal: "AUTOSCAN" })}>
              <div>
                <img src={ParkingLogo} alt="parking logo" />
              </div>
              <div dangerouslySetInnerHTML={{ __html: localize('SLIDER_TRIGGER_TEXT') }}></div>
            </button>

          </div>

          {this.state.modal_is_open && this.state.type_modal === "AUTOSCAN" ?
            <HelpRegisterModal
              onClose={this.onCloseModalHandler}
              modal_is_open={this.state.modal_is_open}
              content={this.helpModal()}
            /> : null
          }
        </IonContent>
        <IonFooter>
          <div className='pad-buttons'>
            <IonButton className='white-centered' onClick={this.onQRCodeScanHandler}>
              Continuar
            </IonButton>
          </div>
        </IonFooter>
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
        <div className="content">
          <IonIcon src={qrLens} />
          <div className="message">Coloca el código en el centro del recuadro para escanear.</div>
        </div>
      </Fragment>
    )
  }

  /**
   * Render search ticket details view
   */
  renderSEARCHING = () => {

    return (
      <Fragment>
        <div className="searching">
          <ImageInTwoMode srcLight={qrCodeLightImg} srcDark={qrCodeDarkImg} alt="QR code" />
          <h2>Buscando información...</h2>
        </div>
      </Fragment>
    )
  }

  /**
   * Render checkout view
   */
  renderCHECKOUT = () => {
    const { user_has_rut, cards, selected_card, quote, discounts } = this.state;
    const storeName = formatStoreName(this.state.quote!.store);
    const quoteAmount = NumberFormatter.toCurrency(this.state.quote!.amount);
    const quoteDate = moment(this.state.quote!.quote_date).format('D MMM YYYY').split(' ');

    const amountDiscount = this.state.quote!.amount < this.applyDiscount() ? 0 : Math.round(this.state.quote!.amount - this.applyDiscount());
    const payDisabled = !selected_card || quote!.amount <= 0;
    const actionText = user_has_rut ? "Pagar" : "Continuar";

    return (
      <Fragment>
        <IonContent className="checkout">
          <div className="content">
            <div className="ticket">
              <div className="back-button" onClick={this.onGoBackToOnboardingHandler}>
                <IonIcon icon={arrowBack} />
              </div>
              <h2 className="title">Detalle de ticket virtual</h2>
              <div className="ticket-section">
                <div className="fancy-ticket">
                  <div className="record-details">
                    <div className="info-piece location">
                      <div className="label">Mall</div>
                      <div>
                        {storeName}
                      </div>
                    </div>
                    <div className="info-piece date">
                      <div className="label">Fecha</div>
                      <div className="date-data">
                        <div className="day-of-month principal">
                          {quoteDate[0]}
                        </div>
                        <div className="date-month-year secondary">
                          <div className="month">
                            {quoteDate[1]}
                          </div>
                          <div className="year">
                            {quoteDate[2]}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="ticket-cut-out">
                    <div className="ticket-cutout" />
                    <div className="ticket-cutout ticket-cutout--right" />
                  </div>

                  <div className="paid-amount">
                    <div className="info-piece date">
                      <div className="content-amounts">
                        <div className="label">Monto a pagar</div>
                        <div className="after">
                          {discounts!.length > 0 ?  `Antes: ${quoteAmount}` : null}
                        </div>
                      </div>
                    </div>
                    <div className="amount">
                      {`${amountDiscount}*`}
                    </div>
                    <div className="discounts">
                      {discounts?.map(item => {
                        if(item.selectable === false){
                          return (
                            <div className="collaborator">{item.title}: {item.description}</div>
                          )
                        }
                        if(item.selectable === true){
                          return (
                            <div className="selectable">
                              <img src={discountSelectableImg} alt="icon"/>
                              cupon: {StringFormatter.shortText(item.title.toUpperCase(),29,29)}
                            </div>
                          )
                        }
                      })}
                    </div>
                    <p className="message">*Este monto variará dentro de 5 minutos.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="payment-methods">
              <h2 className="title">Selecciona un medio de pago</h2>
              {cards.map((card) => {
                const isSelected = card.id === selected_card;
                const iconByCardType = this.cardDecorator(card.card_type);
                return (
                  <div key={`${card.id}`} className={`item ${isSelected ? 'selected' : ''}`} onClick={() => { this.selectCard(card.id) }}>
                    <IonIcon className="card-icon" src={iconByCardType} />
                    <h3 className="text">{formatCardNumber(card.card_number)}</h3>
                    <IonIcon icon={isSelected ? checkmarkCircleSharp : ellipseOutline} />
                  </div>
                )
              })}
              <div className="item" onClick={this.onAddNewCardHandler}>
                <div className="add-icon"><IonIcon icon={add} /></div>
                <h3 className="text">Agregar tarjeta</h3>
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
                  : <div className="item" onClick={() => { this.setState({ mode: "DISCOUNT" }) }}>
                      <div className="add-icon"><IonIcon icon={add} /></div>
                        <h3 className="text">Cupón</h3>
                    </div>
                }
              </div>
            </div>
          </div>
        </IonContent>
        <IonFooter>
          <div className='pad-buttons'>
            <IonButton className='white-centered' disabled={payDisabled} onClick={this.onPayHandler}>
              {actionText}
            </IonButton>
          </div>
        </IonFooter>
      </Fragment>
    )
  }

  /**
   * Render register card in progress view
   */
  renderREGISTER_CARD_IN_PROGRESS = () => {
    return (
      <Fragment>
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
    )
  }

  /**
   * Render register card success view
   */
  renderREGISTER_CARD_SUCCESS = () => {
    return (
      <Fragment>
        <IonHeader>
          <div onClick={() => { this.setState({ mode: "CHECKOUT" }) }} >
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
            <IonButton onClick={() => { this.setState({ mode: 'CHECKOUT' }) }}>
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
   * Render payment success view
   */
  renderPAYMENT_SUCCESS = () => {
    const { discounts, has_questions, is_visible_califications, user, payment_intention } = this.state;
    const storeName = formatStoreName(this.state.quote!.store);
    const quoteAmount = NumberFormatter.toCurrency(this.state.quote!.amount);
    const quoteDate = moment(this.state.quote!.quote_date).format('D MMM YYYY').split(' ');
    const amountDiscount = this.state.quote!.amount < this.applyDiscount() ? 0 : Math.round(this.state.quote!.amount - this.applyDiscount());

    return (
      <Fragment>
        <IonContent className="payment-success">
          <div className="content">
            <div className="ticket">
              <div className="close-button" onClick={() => { this.props.history.replace(`/mall-home/${this.props.match.params.id}`) }}>
                <IonIcon icon={closeOutline} />
              </div>
              <h2 className="title">Detalle de ticket virtual</h2>
              <div className="ticket-section">
                <div className="fancy-ticket">
                  <div className="record-details">
                    <div className="info-piece location">
                      <div className="label">Mall</div>
                      <div>
                        {storeName}
                      </div>
                    </div>
                    <div className="info-piece date">
                      <div className="label">Fecha</div>
                      <div className="date-data">
                        <div className="day-of-month principal">
                          {quoteDate[0]}
                        </div>
                        <div className="date-month-year secondary">
                          <div className="month">
                            {quoteDate[1]}
                          </div>
                          <div className="year">
                            {quoteDate[2]}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="ticket-cut-out">
                    <div className="ticket-cutout" />
                    <div className="ticket-cutout ticket-cutout--right" />
                  </div>

                  <div className="paid-amount">
                    <div className="info-piece date">
                      <div className="content-amounts">
                        <div className="label">Monto pagado</div>
                        <div className="after">
                            {discounts!.length > 0 ?  `Antes: ${quoteAmount}` : null}
                        </div>
                      </div>
                    </div>
                    <div className="amount">
                      ${amountDiscount}
                    </div>
                    <div className="discounts">
                      {discounts?.map(item => {
                        if(item.selectable === false){
                          return (
                            <div className="collaborator" key={item.id}>{item.title}: {item.description} </div>
                          )
                        }
                        if(item.selectable === true){
                          return (
                            <div className="selectable" key={item.id}>
                              <img src={discountSelectableImg} alt="icon"/>
                              cupon: {item.title.toUpperCase()}
                            </div>
                          )
                        }
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="success">
              <div className="shape" />
              <IonIcon icon={checkmarkCircleOutline} />
              <h1>¡Todo listo!</h1>
              <p>Ticket pagado</p>
            </div>
            {has_questions &&
                <div className="button-califications">
                    <IonButton className='white-centered' onClick={() => { this.setState({ is_visible_califications: true }) }}>
                        Continuar
                    </IonButton>
                </div>
              }
              <>
                <CalificationModal
                  flow='AUTOSCAN'
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
                  <div>Cuéntanos cómo fue tu experiencia utilizando el servicio de Registra tu patente.</div>
                  <div>Te tomará menos de un minuto.</div>
                </CalificationModal>
              </>
            <div className="reminder">
              <IonIcon icon={informationCircle} />
              <p>
                Recuerda que tienes 10 minutos para salir del estacionamiento.<br />
                Debes conservar tu ticket.
              </p>
            </div>
          </div>
        </IonContent>
      </Fragment>
    )
  }

  /**
   * Render register rut view
   */
  renderREGISTER_RUT = () => {

    return (
      <Fragment>
        <IonHeader>
          <div onClick={() => { this.setState({ mode: 'CHECKOUT' }) }}>
            <IonIcon icon={arrowBack} />
          </div>
        </IonHeader>
        <RutScreen
            title={'Necesitamos que ingreses tu RUT'}
            subtitle={'Esto es necesario para seguir con el proceso'}
            onBack={() => { }}
            onContinue={() => {
              // show loading
              this.setState({ mode: "PAYMENT_IN_PROGRESS" });
              setTimeout(() => {
                this.executePayment();
              });
            }}
            onValue={(rut: string) => {
                eureka.info("Update rut", rut)
                this.setState((prev: any) => ({ ...prev, user_has_rut: true, user: { ...prev.user, document_number: rut } }));
            }}
            disabledHeader={true}
        />
      </Fragment>
    )
  }

  renderDISCOUNT = () => {
    const store = this.state.ticket_id?.split("|")[0];
    return (
    <Fragment>
      <DiscountModal
        context={{ paymentFlow: "AUTOSCAN", storeNumber: store }}
        onScan={() => { this.onScanHandler() }}
        onStop={this.onStopScannerModal}
        onClose={() => { this.onCloseHandler() }}
        onCouponClick={this.onCouponClickHandler}
        onStatus={this.state.status}
      />
    </Fragment>
    )
  }


})
