import {
  withIonLifeCycle,
  IonPage,
  IonContent,
  IonIcon,
  IonFooter,
  IonButton,
  IonHeader,
} from '@ionic/react';
import moment from 'moment';
import React, { Fragment } from 'react';
import { RouteComponentProps } from 'react-router';
import { InAppBrowser, InAppBrowserEvent } from '@ionic-native/in-app-browser';
import { add, arrowBack, cardOutline, checkmarkCircleOutline, checkmarkCircleSharp, closeOutline, ellipseOutline, informationCircle, trash } from 'ionicons/icons';
import { BarcodeScanner } from '@capacitor-community/barcode-scanner';
// style
import './index.less';
// components
import ErrorModal from '../../components/error-modal';
import BackdropLoading from '../../components/backdrop-loading';
import Page, { DefaultFooter, DefaultHeader } from '../../components/page';
import DiscountModal from '../../components/discount-modal';
import ButtonDiscount from '../../components/button-discount';
import CalificationModal from '../../components/califications';
// lib
import Expr from '../../lib/Expr';
import EurekaConsole from '../../lib/EurekaConsole';
import EventStreamer from '../../lib/EventStreamer';
import NumberFormatter from '../../lib/formatters/NumberFormatter';
import Utilities from '../coupons-flow/lib/Utilities';
// clients
import CardClient from '../../clients/CardClient';
import PaymentIntentionClient from '../../clients/PaymentIntentionClient';
import { IListParams } from '../../clients/RESTClient';
import AuthenticationClient from '../../clients/AuthenticationClient';
import DiscountClient from '../../clients/DiscountClient';
import UserClient from '../../clients/UserClient';
// models
import ICard from '../../models/cards/ICard'
import IPaymentIntention from '../../models/payments/IPaymentIntention';
import { IDiscount } from '../../models/discount/IDiscount';
import { IUser } from '../../models/users/IUser';
// assets
import oneClickImg from '../../assets/media/oneclick.svg';
import isotypeVisaCard from '../../assets/media/isotype-visa.svg';
import isotypeMasterCard from '../../assets/media/isotype-mastercard.svg';
import qrLens from '../../assets/media/qr_scanner.svg';
import discountSelectableImg from '../../assets/media/discount-selectable.svg';
import flowQualificationImg from '../../assets/media/icon-flow-qualification.svg';
import StringFormatter from '../../lib/formatters/StringFormatter';

const ANIMATION_TIME = 200;
const eureka = EurekaConsole({ label: "autopass-resolution" });

// util functions
const resolveSelectedCardId = (cards: ICard[], selected?: string) => {
  // state selected has priority
  if (selected) {
    const match = cards.find((card) => card.id === selected);
    if (match) {
      return selected;
    }
  }

  const active = cards.find((card) => card.active);
  if (active) {
    return active.id;
  }

  if (cards.length > 0) {
    return cards[0].id;
  }
}

const resolveCardIcon = (type: string) => {
  switch (type) {
    case "Visa":
      return isotypeVisaCard;
    case "MasterCard":
      return isotypeMasterCard;
    default:
      return cardOutline;
  }
}

const formatCardNumber = (cardNumber: string) => {
  return cardNumber.replace(/^X*/, '···· ');
}

// to render the ticket easy
interface ITicketDetails {
  licensePlate: string;
  parkingTime: string;
  mallName: string;
  entryDate: { day: string; month: string; year: string };
  amountToPay: string;
}

interface IProps extends RouteComponentProps<{
  id: string,
}> {
}

type IMode = "LOADING" | "CHECKOUT" | "REGISTER_CARD_IN_PROGRESS" | "REGISTER_CARD_SUCCESS" | "PAYMENT_SUCCESS" | "DISCOUNT" | "SCANNER";

interface IState {
  mode: IMode,
  loading_message?: string,
  cards?: ICard[],
  selected_card?: string,
  payment?: IPaymentIntention,
  ticket_details?: ITicketDetails,
  error_modal?: { title: string, message: string, retryMessage?: string, cancelMessage?: string, onRetry?: () => void, onCancel?: () => void },
  discounts?: IDiscount[],
  amount?: number,
  status?: number,
  is_visible_califications: boolean,
  has_questions: boolean,
  user?: IUser
}

export default withIonLifeCycle(class AutoscanPage extends React.Component<IProps, IState> {
  intervalId: NodeJS.Timeout | undefined;

  state: IState = {
    mode: 'LOADING',
    loading_message: 'Cargando...',
    is_visible_califications: false,
    has_questions: false
  }

  ionViewDidEnter = async () => {
    eureka.info(`Starting flow for payment ${this.props.match.params.id}`);

    setTimeout(() => {
      this.setContext();
    }, ANIMATION_TIME);
  }

  ionViewDidLeave = async () => {
  }

  onDeepLinkAddCardHandler = (data: any) => {
    // start unsubscribing
    EventStreamer.off("DEEPLINK:CARD_ADDED_CALLBACK", this.onDeepLinkAddCardHandler);

    const updateCards = async () => {
      try {
        const cards = await this.getCards();
        this.setState({
          mode: "REGISTER_CARD_SUCCESS",

          // update context
          cards,
          selected_card: resolveSelectedCardId(cards, this.state.selected_card)
        });
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

  goBack = () => {
    this.props.history.goBack();
  }

  getPayment = async () => {
    const paymentIntention = await PaymentIntentionClient.getById(this.props.match.params.id);
    return paymentIntention;
  }

  getCards = async () => {
    const cards = await CardClient.getList();
    return cards;
  }

  getUser = async (): Promise<IUser> => {
    const user = await UserClient.me();
    return user;
  }

  getDiscounts = async (): Promise<void> => {
    try {
      
      let queryParams:Record<string,any> = {
        context: {},
        query: {},
      };

      queryParams.context = Object.assign(queryParams.context, {
        'user_ids': AuthenticationClient.getInfo().primarysid,
        'payment_flows': "AUTOPASS"
      });

      queryParams.query = Object.assign({}, queryParams.query, {
        'selectable_is': true
      });
      const payment = await this.getPayment();
      const amount = payment.transaction.amount.total;
      this.setState({ amount : amount });
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
        'apply_to.payment_flows.keyword_is_one_of': ['*','AUTOPASS'],
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

  setContext = async () => {
    try {
      this.setState({ mode: 'LOADING', loading_message: 'Cargando...' });

      const [payment, cards, user] = await Promise.all([
        this.getPayment(),
        this.getCards(),
        this.getUser(),
        this.getDiscounts()
      ]);

      // check payment conditions
      if (payment.payment_flow !== 'AUTOPASS') {
        throw new Error(`Payment ${payment.id} is not an autopass payment`);
      }
      if (payment.state !== 'REJECTED') {
        throw new Error(`Payment ${payment.id} is not rejected`);
      }

      this.setState({
        mode: 'CHECKOUT',
        loading_message: '',
        user,
        // context
        cards,
        payment,
        selected_card: resolveSelectedCardId(cards),
        ticket_details: {
          licensePlate: payment.metadata.plate as string,
          parkingTime: `${moment.utc(moment(payment.metadata.exit_date_time as string).diff(moment(payment.metadata.entrance_date_time as string))).format("H:mm")} hrs`,
          mallName: payment.metadata.facility_name as string, // TODO: capitalize
          entryDate: {
            day: moment(payment.metadata.entrance_date_time as string).format("D"),
            month: moment(payment.metadata.entrance_date_time as string).format("MMM"),
            year: moment(payment.metadata.entrance_date_time as string).format("YYYY"),
          },
          amountToPay: NumberFormatter.toCurrency(payment.transaction.amount.total),
        }
      })

      this.setState({ mode: 'CHECKOUT', loading_message: '' });  // esto esta de mas
    } catch (error) {
      eureka.error(`Unexpected error getting context`, error);

      this.setState({
        error_modal: {
          title: "Hubo un problema",
          message: "No pudimos cargar toda la información. ¿Deseas reintentar?",
          onRetry: () => {
            this.setState({ error_modal: undefined });

            setTimeout(() => {
              this.setContext();
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

  selectCard = (id: string) => {
    // check if already selected
    if (id === this.state.selected_card) {
      return;
    }

    this.setState({ selected_card: id });

    setTimeout(async () => {
      // try to set the card as active
      try {
        await CardClient.setDefault(id);
      } catch (error) {
        eureka.error(`Unexpected error setting card as active`, error);
      }
    }, ANIMATION_TIME);
  }

  startCardRegistration = async () => {
    const showErrorModal = () => {
      this.setState({
        error_modal: {
          title: "Hubo un problema",
          message: "No pudimos registrar tu tarjeta. ¿Deseas reintentar?",
          onRetry: () => {
            this.setState({ error_modal: undefined });

            // start again card registration
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

  addNewCard = () => {
    this.setState({ mode: "REGISTER_CARD_IN_PROGRESS" });

    setTimeout(() => {
      this.startCardRegistration();
    }, ANIMATION_TIME);
  }

  goBackFromRegisterCardInProgressHandler = () => {
    this.setState({ mode: "CHECKOUT" });

    // unsubscribe from deeplink to avoid unexpected behavior
    EventStreamer.off("DEEPLINK:CARD_ADDED_CALLBACK", this.onDeepLinkAddCardHandler);
  }

  goTo = (mode: IMode) => {
    this.setState({ mode });
  }

  discountDetail = (discounts:IDiscount) => {
    const { discount } = discounts;
    const amount = this.state!.amount || 0;
    if(discount.type === "PERCENT"){
      const percentValue = discount?.details.value ? (this.state.amount!*discount?.details.value)/100 : 0;
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

  checkPaymentStatus = async (id: string) => {
    this.intervalId = setInterval(async () => {
      try {
        const response = await PaymentIntentionClient.getStatus(id);
        if (response.status === "IN_PROGRESS") {
          return;
        }

        if (response.status === "SUCCESS") {

          const paymentIntention = await this.getPayment();
          // emit autopass-resolution event
          EventStreamer.emit("AUTOPASS_RESOLUTION", paymentIntention);
          eureka.info(`Event autopass-resolution was emitted,  payment id ${paymentIntention.id}`);
          this.setState({ mode: "PAYMENT_SUCCESS" });

        } else {
          // show fallback error modal
          this.setState({
            error_modal: {
              title: "Hubo un problema",
              message: "No se pudo realizar el pago. ¿Deseas reintentar?",
              onRetry: () => {
                this.setState({ error_modal: undefined });

                setTimeout(() => {
                  this.pay();
                }, ANIMATION_TIME);
              },
              onCancel: () => {
                this.setState({ error_modal: undefined, mode: "CHECKOUT" })
              }
            }
          });
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
    }, 1500);
  }

  pay = async () => {
    try {
      this.setState({ mode: "LOADING", loading_message: 'Validando Pago...' });

      // execute payment
      const { payment, cards, selected_card, discounts } = this.state;

      const card = cards!.find((card) => card.id === selected_card);
      if (!card) {
        throw new Error("No card matched using selected card id");
      }
      const amount = payment!.transaction.amount.total < this.applyDiscount() ? 0 : payment!.transaction.amount.total - this.applyDiscount();
      const subtotal =  Math.round(amount/1.19);
      const transaction = { ...payment!.transaction, 
        amount: {
          total: amount,
          subtotal: subtotal,
          discount: this.applyDiscount(),
          tax: amount-subtotal
        },
        line_items: payment?.transaction.line_items.map(t => ({
          description: t.description,
          id: t.id,
          price: amount,
          quantity: t.quantity
        }))
      };

      const created = await PaymentIntentionClient.create({
        payment_flow: 'AUTOPASS-RESOLUTION',
        payer: payment!.payer,
        payment_method: {
          // ony override the payment method
          // because only the same user can resolve the payment
          details: {
            card_token: card.card_token,
            card_type: card.card_type,
            user_id: payment!.payment_method!.details.user_id
          }
        },
        transaction: transaction,
        discounts: discounts,
        metadata: {
          payment_to_resolve: payment!.id,
          discount: discounts?.map((discount:IDiscount) => {
            return {
              code: discount.code,
              discount_applied: this.discountDetail(discount),
              id_discount: discount.id
            }
          })
        }
      } as unknown as IPaymentIntention);
      eureka.log("Payment created", created);
      // start checking payment task
      this.checkPaymentStatus(created.id);

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
              this.pay();
            }, ANIMATION_TIME);
          },
          onCancel: () => {
            this.setState({ error_modal: undefined, mode: "CHECKOUT" })
          }
        }
      });
    }
  }

  deleteCard = async (card: ICard) => {
    this.setState({
      error_modal: {
        title: "Eliminar tarjeta",
        message: "¿Estás seguro que deseas eliminar la tarjeta registrada previamente?",
        retryMessage: "Eliminar",
        onRetry: () => {
          this.setState({ error_modal: undefined });

          setTimeout(() => {
            deleteRequest(card);
          }, ANIMATION_TIME);
        },
        onCancel: () => {
          setTimeout(() => {
            this.setState({ error_modal: undefined, mode: "CHECKOUT" });
          }, ANIMATION_TIME);
        }
      }
    });

    const deleteRequest = async (card: ICard) => {
      try {
        // show loading
        this.setState({ mode: "LOADING", loading_message: 'Eliminando...' });

        await CardClient.removeCard(card.provider, card.id);

        this.setState((prevState) => {
          const filteredCards = prevState.cards!.filter((c) => c.id !== card.id);
          return {
            ...prevState,
            mode: "CHECKOUT",
            cards: filteredCards,
            selected_card: resolveSelectedCardId(filteredCards, prevState.selected_card)
          }
        });
      } catch (error) {
        eureka.error(`Unexpected error deleting card ${card.id}`, error);

        // show error modal
        this.setState({
          error_modal: {
            title: "Hubo un problema",
            message: "No pudimos eliminar la tarjeta. ¿Deseas reintentar?",
            onRetry: () => {
              this.setState({ error_modal: undefined });
  
              setTimeout(() => {
                deleteRequest(card);
              }, ANIMATION_TIME);
            },
            onCancel: () => {
              setTimeout(() => {
                this.setState({ error_modal: undefined, mode: "CHECKOUT" })
              }, ANIMATION_TIME);
            }
          }
        })
      }
    }
  }

  onScanHandler = () => {
    this.setState({ mode: "SCANNER" });
  }

  onStopScannerModal = (status: number|undefined) => {
    BarcodeScanner.showBackground();
    BarcodeScanner.stopScan();
    this.setState({ mode: "DISCOUNT", status: status });
  }

  onStopScanner = () => {
    BarcodeScanner.showBackground();
    BarcodeScanner.stopScan();
    this.setState({ mode: "CHECKOUT" });
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
      this.setState({ discounts: newDiscounts , mode: "CHECKOUT" });
      return;
    }

    this.setState({ mode: "CHECKOUT" });
    return;
  }

  applyDiscount = (): number => {
    let arrayValues:Array<number> = [];
    const amount = this.state.payment?.transaction.amount.total as unknown as number;
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

    return <IonPage className={`autopass-resolution-flow ${mode.replace(/_/ig, '-').toLowerCase()}`}>
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
    const { loading_message } = this.state;

    return (
      <Fragment>
        <BackdropLoading message={loading_message!} />
      </Fragment>
    )
  }

  /**
   * Render checkout view
   */
  renderCHECKOUT = () => {
    const { cards, selected_card, ticket_details, discounts, payment } = this.state;
    const amount =  payment?.transaction.amount.total as unknown as number;
    const amountDiscount = amount < this.applyDiscount() ? 0 : Math.round(amount - this.applyDiscount());
    const content = (
      <div className="checkout">
        <div className="ticket">
          <div className="close-button" onClick={this.goBack}>
            <IonIcon icon={closeOutline} />
          </div>
          <h2 className="title">Detalle de ticket pendiente</h2>
          <div className="ticket-section">
            <div className="fancy-ticket">
              <div className="record-details">
                <div className="info-piece plate">
                  <div className="label">Patente</div>
                  <div>
                    {ticket_details!.licensePlate}
                  </div>
                </div>
                <div className="info-piece time">
                  <div className="label">Tiempo</div>
                  <div>
                    {ticket_details!.parkingTime}
                  </div>
                </div>
                <div className="info-piece location">
                  <div className="label">Mall</div>
                  <div>
                    {ticket_details!.mallName}
                  </div>
                </div>
                <div className="info-piece date">
                  <div className="label">Fecha</div>
                  <div className="date-data">
                    <div className="day-of-month principal">
                      {ticket_details!.entryDate.day}
                    </div>
                    <div className="date-month-year secondary">
                      <div className="month">
                        {ticket_details!.entryDate.month}
                      </div>
                      <div className="year">
                        {ticket_details!.entryDate.year}
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
                      {discounts!.length > 0 ?  `Antes: ${ticket_details!.amountToPay}` : null} 
                    </div>
                  </div>
                </div>
                <div className="amount">
                  {NumberFormatter.toCurrency(amountDiscount)}*
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
          <h2 className="title">Selecciona un medio de pago</h2>
          {cards!.map((card) => {
            const isSelected = card.id === selected_card!;
            const cardIcon = resolveCardIcon(card.card_type);
            return (
              <div key={`${card.id}`} className={`item ${isSelected ? 'selected' : ''}`} onClick={() => { this.selectCard(card.id)}}>
                <IonIcon className="card-icon" src={cardIcon} />
                <h3 className="text">{formatCardNumber(card.card_number)}</h3>
                <IonIcon icon={isSelected ? checkmarkCircleSharp : ellipseOutline} />
                <div className='delete' onClick={() => this.deleteCard(card)}>
                  <IonIcon icon={trash} />
                </div>
              </div>
            )
          })}
          <div className="item" onClick={this.addNewCard}>
            <div className="add-icon"><IonIcon icon={add} /></div>
            <h3 className="text">Agregar medio de pago</h3>
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
      </div>
    );
    const isPayDisabled = !selected_card;
    return (
      <Page
        content={content}
        footer={(
          <DefaultFooter
            mainActionText='Pagar'
            mainActionIsDisabled={isPayDisabled}
            onClickMainAction={this.pay}
            />
        )}
        />
      )
  }

  /**
   * Render register card in progress view
   */
  renderREGISTER_CARD_IN_PROGRESS = () => {

    const header = <DefaultHeader onBack={this.goBackFromRegisterCardInProgressHandler}/>;
    const content = (
      <div className="register-card-in-progress">
        <h1>Conectando con...</h1>
        <img src={oneClickImg} alt="oneclick" />
        <BackdropLoading message="" />
      </div>
    )
    return (
      <Page
        header={header}
        content={content}
        />
    )
  }

  /**
   * Render register card success view
   */
  renderREGISTER_CARD_SUCCESS = () => {

    return (
      <Fragment>
        <IonHeader>
          <div onClick={() => { this.goTo('CHECKOUT') }} >
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
            <IonButton onClick={() => { this.goTo('CHECKOUT') }}>
              Continuar
            </IonButton>
          </div>
        </IonFooter>
      </Fragment>
    )
  }

  /**
   * Render payment success view
   */
  renderPAYMENT_SUCCESS = () => {
    const { ticket_details, payment, discounts, is_visible_califications, has_questions, user } = this.state;
    const amount =  payment?.transaction.amount.total as unknown as number;
    const amountDiscount = amount < this.applyDiscount() ? 0 : Math.round(amount - this.applyDiscount());
    return (
      <Fragment>
        <IonContent className="payment-success">
          <div className="content">
            <div className="ticket">
              <div className="close-button" onClick={this.goBack}>
                <IonIcon icon={closeOutline} />
              </div>
              <h2 className="title">Detalle de ticket virtual</h2>
              <div className="ticket-section">
                <div className="fancy-ticket">
                  <div className="record-details">
                    <div className="info-piece plate">
                      <div className="label">Patente</div>
                      <div>
                        {ticket_details!.licensePlate}
                      </div>
                    </div>
                    <div className="info-piece time">
                      <div className="label">Tiempo</div>
                      <div>
                        {ticket_details!.parkingTime}
                      </div>
                    </div>
                    <div className="info-piece location">
                      <div className="label">Mall</div>
                      <div>
                        {ticket_details!.mallName}
                      </div>
                    </div>
                    <div className="info-piece date">
                      <div className="label">Fecha</div>
                      <div className="date-data">
                        <div className="day-of-month principal">
                          {ticket_details!.entryDate.day}
                        </div>
                        <div className="date-month-year secondary">
                          <div className="month">
                            {ticket_details!.entryDate.month}
                          </div>
                          <div className="year">
                            {ticket_details!.entryDate.year}
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
                              {discounts!.length > 0 ?  `Antes: ${ NumberFormatter.toCurrency(amount)}` : null} 
                          </div>
                        </div>
                    </div>
                    <div className="amount">
                      { NumberFormatter.toCurrency(amountDiscount)}
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
              {has_questions && 
                <div className="button-califications">
                    <IonButton className='white-centered' onClick={() => { this.setState({ is_visible_califications: true }) }}>
                        Calificar Experiencia
                    </IonButton>
                </div>
              }
              <>
                <CalificationModal
                  flow='AUTOPASS'
                  show={is_visible_califications}
                  initialPage={{
                      mainText: `${user?.full_name === '' || user?.full_name === '-' ? 'Hola' : user?.full_name}, ya pagaste tu ticket`,
                      mainImage: flowQualificationImg
                  }}
                  cancelButtonText={'Ahora no'}
                  payment_intention_id={payment!.id} // payment_intention_id to parent 
                  payment_date={payment!.created_at.toString()}
                  
                  user={user}
                  metadata={{
                      "mall_id": payment!.metadata.facility_id as string
                  }}

                  onClose={() => { this.onCloseCalification() }}
                  onSaveCalification={() => { this.onSaveCalification() }}
                  hasQuestions={(question:boolean) => { this.setState({ has_questions: question }) }}
                  >
                  <div>Cuéntanos cómo fue tu experiencia utilizando el servicio de Escanea tu ticket.</div>
                  <div>Te tomará menos de un minuto.</div>
                </CalificationModal>
              </>
            </div>
          </div>
        </IonContent>
      </Fragment>
    )
  }

  /** Render discount modal */
  renderDISCOUNT = () => {
    const store = this.state.payment?.metadata.facility_id as string;
    return (
    <Fragment>
      <DiscountModal 
        context={{ paymentFlow: "AUTOPASS", storeNumber: store }} 
        onScan={() => { this.onScanHandler() }}
        onStop={this.onStopScannerModal}
        onClose={() => { this.onCloseHandler() }}
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
        <div className="content">
          <IonIcon src={qrLens} />
          <div className="message">Coloca el código en el centro del recuadro para escanear.</div>
        </div>
      </Fragment>
    )
  }

})
