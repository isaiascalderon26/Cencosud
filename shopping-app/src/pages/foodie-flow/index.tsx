import lodash from 'lodash';
import moment from 'moment';
import React, { Fragment } from 'react';
import { arrowBack } from 'ionicons/icons';
import { RouteComponentProps } from 'react-router';
import { BarcodeScanner } from '@capacitor-community/barcode-scanner';
import {
  IonFooter,
  IonHeader,
  IonIcon,
  IonPage,
  withIonLifeCycle,
} from '@ionic/react';

/**
 * Style
 */
import './index.less';

/**
 * Components
 */
import StoreView from './components/store-view';
import StoresView from './components/stores-view';
import SupportView from './components/support-view';
import VoucherView from './components/voucher-view';
import RutScreen from '../../components/rut-screen';
import CheckoutView from './components/checkout-view';
import ProductModal from './components/product-modal';
import OnBoardingView from './components/onboarding-view';
import DiscountModal from '../../components/discount-modal';
import RegisterModal from '../../components/register_modal';
import ShoppingCartView from './components/shopping-cart-view';
import BackdropLoading from '../../components/backdrop-loading';
import ImageInTwoMode from '../../components/image-in-two-modes';
import ErrorModal, { IErrorModalProps } from '../../components/error-modal';
import NotificationModal from './components/notification-modal';
import ContactFormScreen from '../../components/contact-form-screen';

/**
 * Lib
 */
import EurekaConsole from '../../lib/EurekaConsole';
import EventStreamer from '../../lib/EventStreamer';
import DniFormatter from '../../lib/formatters/DniFormatter';

/**
 * Clients
 */
import UserClient from '../../clients/UserClient';
import CardClient from '../../clients/CardClient';
import FoodieClient from '../../clients/FoodieClient';
import SettingsClient from '../../clients/SettingsClient';
import DiscountClient from '../../clients/DiscountClient';
import { IArrayRestResponse, IListParams } from '../../clients/RESTClient';
import ShoppingCartClient from '../../clients/ShoppingCartClient';
import AuthenticationClient from '../../clients/AuthenticationClient';
import PaymentIntentionClient from '../../clients/PaymentIntentionClient';
import CalificationQuestionClient from '../../clients/CalificationQuestionClient';

/**
 * Models
 */
import ICard from '../../models/cards/ICard';
import IItem from '../../models/foodie/IItem';
import { IUser } from '../../models/users/IUser';
import IProduct from '../../models/foodie/IProduct';
import IDelivery from '../../models/foodie/IDelivery';
import { IDiscount } from '../../models/discount/IDiscount';
import { ISite } from '../../models/store-data-models/ISite';
import ILocal, { ILocalSlot } from '../../models/foodie/ILocal';
import ICalificationQuestion from '../../models/calification/ICalificationQuestion';
import IPaymentIntention, {
  ICreatePaymentIntention,
} from '../../models/payments/IPaymentIntention';

/**
 * Assets
 */
import qrLens from '../../assets/media/qr_scanner.svg';
import qrCodeDarkImg from '../../assets/media/qr_dark.svg';
import qrCodeLightImg from '../../assets/media/qr_light.svg';
import CellPhoneWithCutlery from '../../assets/media/foodie/onboarding-step-01.svg';
import BottomNavigationBar from '../../components/v2/navigation/bottom-navigation-bar';
import UserMenu from '../../components/user-menu';
import StoresByCategoryView from './components/stores-by-category-view';
import { IFoodieCategory } from '../../models/foodie/IFoodieCategory';

const ANIMATION_TIME = 200;
const UNIQUE_CLASS = 'ffmekwpoel';
const eureka = EurekaConsole({ label: 'foodie-page' });

const parseParam = (
  param: string
): { key: string; value: string; option: string } => {
  const [key, value, option] = param.split(':');
  return { key, value, option };
};

interface IProps extends RouteComponentProps<{ id: string; param?: string }> {}

type IMode =
  | 'LOADING'
  | 'REGISTER_POPUP'
  | 'ONBOARDING'
  | 'STORES'
  | 'STORE'
  | 'STORES_BY_CATEGORY'
  | 'SHOPPING_CART'
  | 'CHECKOUT'
  | 'DISCOUNT'
  | 'SCANNER'
  | 'SEARCHING'
  | 'ADD_DOCUMENT_NUMBER'
  | 'VOUCHER'
  | 'MULTI_VOUCHER'
  | 'SUPPORT'
  | 'NOTOTIFICATIONMODAL';

interface IState {
  mode: IMode;
  menu_is_open: boolean;
  user?: IUser;
  loading_message?: string;
  locals?: IArrayRestResponse<ILocal>;
  selected_local?: ILocal;
  locals_slots?: Record<string, ILocalSlot[]>;
  selected_product?: IProduct;
  products?: IArrayRestResponse<IProduct>;
  products_promotion?: IArrayRestResponse<IProduct>;
  fetching_more_products: boolean;
  open_product_modal?: boolean;
  deliveries?: Record<string, IDelivery>;
  selected_card?: ICard;
  submitted: boolean;
  showForm: boolean;
  payment_intention?: IPaymentIntention;
  payment_intentions?: IPaymentIntention[];
  active_pay_int_idx?: number;
  foodieCategories: IFoodieCategory[];
  categorySelected: string;

  is_first_time?: boolean;
  pending_payments?: IArrayRestResponse<IPaymentIntention>;
  document_number: { value: string; is_valid: boolean };
  error_modal?: IErrorModalProps;
  product_modal: { visible: boolean; data?: IProduct | IItem };
  calificationQuestions?: ICalificationQuestion[];
  site?: ISite;
  scanMode?: 'TICKET' | 'MODAL';
  discounts?: Record<string, IDiscount[]>;
  localDiscountFilter?: ILocal;
  status?: number;
  paymentValidationModal?: {
    title: string;
    message: string;
    retryMessage: string;
    onRetry: () => void;
  };
}

export default withIonLifeCycle(
  class FoodieFlowPage extends React.Component<IProps, IState> {
    navHistory: IMode[] = [];
    pageRef = React.createRef<any>();
    intervalId1: NodeJS.Timeout | undefined;
    intervalId2: NodeJS.Timeout | undefined;
    media = window.matchMedia('(prefers-color-scheme: dark)');

    state: IState = {
      showForm: false,
      mode: 'LOADING',
      menu_is_open: false,
      loading_message: 'Cargando...',
      fetching_more_products: false,
      product_modal: { visible: false },
      submitted: false,
      document_number: { value: '', is_valid: false },
      categorySelected: '',
      foodieCategories: [],
    };

    productsCommonFilter = {
      is_modifier_is: false,
      exist: 'category.id',
    };

    componentDidMount = () => {
      this.onBootstrap();
      EventStreamer.on('CARD_SELECTED', this.onCardChangeHandler);
    };

    componentWillUnmount = () => {
      EventStreamer.off('CARD_SELECTED', this.onCardChangeHandler);
    };

    componentDidUpdate = (prevProps: IProps, prevState: IState) => {
      // detect mode change
      if (prevState.mode !== this.state.mode) {
        // entering to store
        if (this.state.mode === 'STORE') {
          this.fetchStoreProducts();
        }

        // entering to voucher
        if (this.state.mode === 'VOUCHER') {
          if (this.state.payment_intention) {
            this.checkOrderDeliveryState(this.state.payment_intention.id);
          }
        }
        // leaving voucher
        if (prevState.mode === 'VOUCHER') {
          // clear interval
          this.intervalId2 && clearInterval(this.intervalId2);
        }

        // entering multi voucher
        if (this.state.mode === 'MULTI_VOUCHER') {
          if (this.state.payment_intentions) {
            this.checkMultiOrderDeliveryState(
              this.state.payment_intentions?.map((pi) => pi.id)
            );
          }
        }
        // leaving multi voucher
        if (prevState.mode === 'MULTI_VOUCHER') {
          // clear interval
          this.intervalId2 && clearInterval(this.intervalId2);
        }

        if (
          prevState.mode &&
          prevState.mode !== 'LOADING' &&
          this.state.mode === 'ONBOARDING'
        ) {
          this.tryToSyncPendingPayments();
        }
      }
      if (prevProps.match.params.param !== this.props.match.params.param) {
        this.onBootstrap();
      }
    };

    ionViewDidEnter = () => {
      document.addEventListener('ionBackButton', this.onPressBackButton);
    };

    ionViewDidLeave = () => {
      document.removeEventListener('ionBackButton', this.onPressBackButton);

      this.intervalId1 && clearInterval(this.intervalId1);
      this.intervalId2 && clearInterval(this.intervalId2);
    };

    pushHistory = (mode: IMode, navigate = false) => {
      this.navHistory.push(mode);

      if (navigate) {
        this.setState({ mode });
      }
    };

    replaceHistory = (mode: IMode, navigate = false) => {
      this.navHistory.pop();
      this.navHistory.push(mode);

      if (navigate) {
        this.setState({ mode });
      }
    };

    clearHistory = () => {
      this.navHistory = [];
    };

    resetHistory = (mode: IMode, navigate = false) => {
      this.clearHistory();

      this.pushHistory(mode, navigate);
    };

    backHistory = (navigate = true, steps = 1) => {
      let i = 0;
      while (i < steps) {
        this.navHistory.pop();
        i++;
      }

      if (navigate) {
        if (!this.navHistory.length) {
          if (this.props.history.action !== 'POP') {
            this.props.history.goBack();
          } else {
            this.props.history.push('/');
          }
          return;
        }
        this.setState({ mode: this.navHistory[this.navHistory.length - 1] });
      }
    };

    fetchUser = async () => {
      const user = (await UserClient.me()) as IUser;
      return user;
    };

    fetchFoodieCategories = async () => {
      const response: IFoodieCategory[] = await FoodieClient.getListOfCategories();

      return response;
    };

    fetchLocals = async () => {
      let { site } = this.state;
      if (!site) {
        site = await this.fetchSite();
      }

      const response = await FoodieClient.listLocals({
        offset: 0,
        limit: 12,
        query: {
          'location_id.keyword_is': site!.id,
        },
        sort: { created_at: 'desc' },
      });

      return response;
    };

    fetchSelectedLocal = async () => {
      if (!this.props.match.params.param) {
        return;
      }

      const { key, value } = parseParam(this.props.match.params.param);
      if (key !== 'local') {
        return;
      }

      const local = await FoodieClient.getLocalById(value);
      return local;
    };

    fetchLocalSlots = async () => {
      if (!this.props.match.params.param) {
        return;
      }

      const { key, value } = parseParam(this.props.match.params.param);
      if (key !== 'local') {
        return;
      }

      const slots = await FoodieClient.getLocalSlots(value);
      return { value: slots };
    };

    fetchSelectedCard = async (): Promise<ICard | undefined> => {
      const cards = await CardClient.getList();
      const defaults = cards.filter((card: ICard) => card.default === true);

      if (!defaults.length) {
        return undefined;
      }

      return defaults.pop();
    };

    fetchIsFirstTime = async () => {
      return SettingsClient.get('FOODIE_FIRST_TIME', true);
    };

    fetchPendingPayments = async () => {
      const userId = AuthenticationClient.getInfo().primarysid;
      const pending = await PaymentIntentionClient.list({
        offset: 0,
        limit: 10,
        query: {
          'state.keyword_is': 'APPROVED',
          'payment_flow.keyword_is': 'FOODIE',
          'payment_method.details.user_id.keyword_is': userId,
          'outcome.result.foodie_order_delivery_state.keyword_is_not_one_of': [
            'DELIVERED',
            'CANCELLED',
          ],
        },
      });
      return pending;
    };

    tryToSyncPendingPayments = async () => {
      try {
        const pending_payments = await this.fetchPendingPayments();
        this.setState({ pending_payments });
      } catch (error) {
        // Silent error
        eureka.error('Unexpected error while syncing pending payments.', error);
      }
    };

    fetchPaymentIntention = async () => {
      if (!this.props.match.params.param) {
        return;
      }

      const { key, value } = parseParam(this.props.match.params.param);
      if (key !== 'payment') {
        return;
      }

      const userId = AuthenticationClient.getInfo().primarysid;
      const payments = await PaymentIntentionClient.list({
        offset: 0,
        limit: 1,
        query: {
          'id.keyword_is': value,
          'payment_method.details.user_id.keyword_is': userId,
        },
      });

      if (payments.data && payments.data.length > 0) {
        return payments.data[0];
      } else {
        this.props.history.push('/');
        return undefined;
      }
    };

    fetchStoreProducts = async () => {
      try {
        let defaultSort: any = {
          'sorting.keyword': 'asc',
          'category.sort': 'asc',
          sort: 'asc',
          'category.id.keyword': 'asc',
        };
        const products = await FoodieClient.listProducts({
          offset: 0,
          limit: 1000,
          query: {
            ...this.productsCommonFilter,
            'local_id.keyword_is': this.state.selected_local?.id,
            enable_is: true,
          },
          sort: defaultSort,
        });

        if (products.data.length === 0) {
          this.onLocalWithoutProducts();
        } else {
          this.setState({ products });
        }
      } catch (error) {
        eureka.error('Unexpected error while showing store detail', error);

        this.setState({
          error_modal: {
            title: 'Ocurrió un problema',
            message: 'No pudimos cargar la información. ¿Deseas reintentar?',
            onRetry: () => {
              this.setState({ error_modal: undefined });

              setTimeout(() => {
                this.fetchStoreProducts();
              }, ANIMATION_TIME);
            },
            onCancel: () => {
              this.setState({ error_modal: undefined });

              this.backHistory(true);
            },
          },
        });
      }
    };

    fetchCalificationQuestion = async () => {
      const questions = await CalificationQuestionClient.list({
        offset: 0,
        limit: 5,
        query: {
          flow_is: 'FOODIE',
          enabled_is: true,
        },
        sort: {
          priority: 'asc',
        },
      });
      return questions.data;
    };

    checkPaymentIntentionStatus = (id: string) => {
      this.intervalId1 = setInterval(async () => {
        try {
          const response = await PaymentIntentionClient.getStatus(id);
          if (response.status === 'IN_PROGRESS') {
            return;
          }

          if (response.status === 'SUCCESS') {
            // when can`t start again
            this.resetHistory('VOUCHER', true);
            // clear shopping cart
            ShoppingCartClient.clearItems(this.state.selected_local!.id);
          } else {
            // TODO: map error codes to improve experience
            this.setState({
              error_modal: {
                title: 'Hubo un problema',
                message: 'No se pudo realizar el pago. ¿Deseas reintentar?',
                onRetry: () => {
                  this.setState({ error_modal: undefined });

                  setTimeout(() => {
                    // remove before loading
                    this.backHistory(false);

                    this.onPayOrder();
                  }, ANIMATION_TIME);
                },
                onCancel: () => {
                  this.setState({ error_modal: undefined });

                  setTimeout(() => {
                    this.backHistory(true);
                  }, ANIMATION_TIME);
                },
              },
            });
          }

          this.intervalId1 && clearInterval(this.intervalId1);
        } catch (error) {
          eureka.error(
            'Unexpected error trying to check payment intention status',
            error
          );

          // clear interval
          this.intervalId1 && clearInterval(this.intervalId1);

          // start again
          this.checkPaymentIntentionStatus(id);
        }
      }, 2000);
    };

    checkMultiPaymentIntentionStatus = (ids: string[]) => {
      this.intervalId1 = setInterval(async () => {
        try {
          const response = await Promise.all(
            ids.map((id) => PaymentIntentionClient.getStatus(id))
          );

          for (const pay_int_st of response) {
            if (pay_int_st.status === 'SUCCESS') {
              const payment_intention = this.state.payment_intentions?.find(
                (p) => p.id === pay_int_st.id
              );
              if (payment_intention) {
                // clear shopping cart for the local
                await ShoppingCartClient.clearItems(
                  lodash.get(payment_intention, 'metadata.foodie_local.id')
                );
              }
            }
          }

          if (response.some((r) => r.status === 'IN_PROGRESS')) {
            return;
          }
          if (response.every((r) => r.status === 'SUCCESS')) {
            this.resetHistory('MULTI_VOUCHER', true);
          }

          if (
            response.some(
              (r) => r.status === 'FAILED' || r.status === 'REFUNDED'
            )
          ) {
            // TODO: map error codes to improve experience

            const failId = response.find((r) =>
              ['FAILED', 'REFUNDED'].includes(r.status)
            )?.id;
            const pIFailed = this.state.payment_intentions?.find(
              (pi) => pi.id === failId
            );
            const localName = lodash.get(
              pIFailed,
              'metadata.foodie_local.name'
            );

            this.setState({
              error_modal: {
                title: 'Hubo un problema',
                message: `No se pudo realizar el pago de ${localName} ¿Deseas reintentar?`,
                onRetry: () => {
                  this.setState({ error_modal: undefined });

                  setTimeout(() => {
                    // remove before loading
                    this.backHistory(false);

                    this.onPayOrder(true);
                  }, ANIMATION_TIME);
                },
                onCancel: () => {
                  this.setState({ error_modal: undefined });

                  setTimeout(() => {
                    this.backHistory(true);
                  }, ANIMATION_TIME);
                },
              },
            });
          }

          this.intervalId1 && clearInterval(this.intervalId1);
        } catch (error) {
          eureka.error(
            'Unexpected error trying to check payment intention status',
            error
          );

          // clear interval
          this.intervalId1 && clearInterval(this.intervalId1);

          // start again
          this.checkMultiPaymentIntentionStatus(ids);
        }
      }, 2000);
    };

    checkOrderDeliveryState = (id: string) => {
      this.intervalId2 = setInterval(async () => {
        try {
          const response = await PaymentIntentionClient.getById(id);
          const deliveryState = lodash.get(
            response,
            'outcome.result.foodie_order_delivery_state'
          ) as string | undefined;

          // always update payment intention
          this.setState({ payment_intention: response });

          // not defined yet
          if (!deliveryState) {
            return;
          }

          // is not final state
          if (!['DELIVERED', 'CANCELLED'].includes(deliveryState)) {
            return;
          }

          this.intervalId2 && clearInterval(this.intervalId2);
        } catch (error) {
          eureka.error(
            'Unexpected error trying to check order delivery state',
            error
          );

          // clear interval
          this.intervalId2 && clearInterval(this.intervalId2);

          // start again
          this.checkOrderDeliveryState(id);
        }
      }, 5000);
    };

    checkMultiOrderDeliveryState = (ids: string[]) => {
      this.intervalId2 = setInterval(async () => {
        try {
          const response = await Promise.all(
            ids.map((id) => PaymentIntentionClient.getById(id))
          );

          // always update payment intention
          this.setState({
            payment_intentions: response,
            active_pay_int_idx: this.state.active_pay_int_idx || 0,
          });

          const deliveryStates = response.map(
            (pi) =>
              lodash.get(pi, 'outcome.result.foodie_order_delivery_state') as
                | string
                | undefined
          );

          // not defined yet
          if (!deliveryStates || deliveryStates.length !== response.length) {
            return;
          }

          // is not final state
          if (
            deliveryStates.some(
              (state) => state !== 'DELIVERED' && state !== 'CANCELLED'
            )
          ) {
            return;
          }

          this.intervalId2 && clearInterval(this.intervalId2);
        } catch (error) {
          eureka.error(
            'Unexpected error trying to check multi-order delivery state',
            error
          );

          // clear interval
          this.intervalId2 && clearInterval(this.intervalId2);

          // start again
          this.checkMultiOrderDeliveryState(ids);
        }
      }, 5000);
    };

    getAmountWithDiscountsByLocal = (
      local: ILocal
    ): { realAmount: number; totalDiscount: number; finalAmount: number } => {
      //const local = this.state.selected_local!.id;
      //const stats = ShoppingCartClient.getCartStats(local);
      const stats = ShoppingCartClient.getCartStats(local.id);
      const totalDiscount = this.calcTotalDiscount(local);

      // TODO: make this better
      // MVP-1: this put the amount = 1 if it gets to 0 due to discounts
      const amount =
        stats.amount <= totalDiscount ? 1 : stats.amount - totalDiscount;

      const discountData = {
        realAmount: stats.amount,
        totalDiscount: totalDiscount,
        finalAmount: amount,
      };
      return discountData;
    };

    fetchSite = async () => {
      const sites = await UserClient.getSites();
      const site = sites.data.find((site: ISite) => {
        return site.name === this.props.match.params.id;
      });
      return site;
    };

    fetchAllDiscounts = async (locals: ILocal[]): Promise<void> => {
      try {
        let blackList: string[] = [];
        let discounts = {};

        for (const local of locals) {
          if (this.state.discounts) {
            let discountsToBlacklist = Object.entries(this.state.discounts);
            if (discountsToBlacklist.length > 0) {
              blackList = [
                ...blackList,
                ...Object.entries(this.state.discounts)
                  .filter((entry) => entry[0] !== local.id)
                  .flatMap((entry) => entry[1])
                  .map((d) => d.id),
              ];
            } else {
              blackList = [...blackList];
            }
          }

          const selectableDiscount =
            this.state.discounts &&
            this.state.discounts[local.id] &&
            this.state.discounts[local.id].filter((d) => d.selectable === true);
          const unSelectableDiscount =
            this.state.discounts &&
            this.state.discounts[local.id] &&
            this.state.discounts[local.id].filter(
              (d) => d.selectable === false
            );

          let queryParams: Record<string, any> = {
            context: {},
            query: {},
          };

          queryParams.context = Object.assign(queryParams.context, {
            user_ids: AuthenticationClient.getInfo().primarysid,
            payment_flows: 'FOODIE',
            restaurants: local.restaurant_id,
          });
          if (blackList.length > 0) {
            queryParams.query = Object.assign({}, queryParams.query, {
              selectable_is: true,
              _id_is_not_one_of: blackList,
            });
          } else {
            queryParams.query = Object.assign({}, queryParams.query, {
              selectable_is: true,
            });
          }

          const amount = ShoppingCartClient.getCartStats(local.id).amount;

          let arrayDiscounts: IDiscount[] = [];
          const discountsNoSelectable =
            unSelectableDiscount && unSelectableDiscount.length > 0
              ? unSelectableDiscount[0]
              : await this.fetchDiscountNoSelectable(local);
          arrayDiscounts = discountsNoSelectable
            ? [...arrayDiscounts, discountsNoSelectable]
            : arrayDiscounts;

          const response =
            selectableDiscount && selectableDiscount.length > 0
              ? selectableDiscount[0]
              : await DiscountClient.list_convenient(
                  queryParams,
                  amount as unknown as string
                );

          if (response) {
            arrayDiscounts = [...arrayDiscounts, response];
            blackList = [...blackList, response.id];
          }

          //yes, non-selectable discount is equal to or greater than the amount to be paid
          if (discountsNoSelectable) {
            const { details, type } = discountsNoSelectable.discount;
            if (
              (type === 'PERCENT' && details.value < 100) ||
              (type === 'AMOUNT' && details.value <= amount!)
            ) {
              arrayDiscounts = [...arrayDiscounts];
            }
          }

          discounts = {
            ...discounts,
            [local.id]: arrayDiscounts,
          };
        }

        this.setState({ discounts: discounts });
      } catch (error) {
        eureka.error(
          'An error has ocurred trying to get user discounts',
          error
        );
        throw error;
      }
    };

    fetchDiscountNoSelectable = async (local: ILocal): Promise<IDiscount> => {
      try {
        const response = await DiscountClient.list({
          offset: 0,
          limit: 1,
          query: {
            'validity.start_at_range_lte': moment(),
            'validity.end_at_range_gte': moment(),
            'apply_to.user_ids.keyword_is_one_of': [
              '*',
              AuthenticationClient.getInfo().primarysid,
            ],
            'apply_to.payment_flows.keyword_is_one_of': ['*', 'FOODIE'],
            selectable_is: false,
          },
          sort: {
            created_at: 'desc',
          },
        });
        const discount = response.data[0] as IDiscount;
        return discount;
      } catch (error) {
        eureka.error(
          'An error has ocurred trying to get user discounts no selectable',
          error
        );
        throw error;
      }
    };

    calcTotalDiscount = (local: ILocal): number => {
      let arrayValues: Array<number> = [];

      //const local = this.state.selected_local!.id;
      //const amount = ShoppingCartClient.getCartStats(local).amount;
      const amount = ShoppingCartClient.getCartStats(local.id).amount;

      if (this.state.discounts && this.state.discounts[local.id]) {
        this.state.discounts[local.id].forEach((item) => {
          if (item.discount?.type === 'PERCENT') {
            const percentValue = item.discount?.details.value
              ? (amount * item.discount?.details.value) / 100
              : 0;
            if (
              percentValue > item.discount?.details.max_value &&
              item.discount?.details.max_value !== 0
            ) {
              arrayValues.push(item.discount?.details.max_value);
            } else {
              arrayValues.push(percentValue);
            }
          } else {
            const amountValue = item.discount?.details.value
              ? item.discount?.details.value
              : 0;
            if (
              amountValue > item.discount?.details.max_value &&
              item.discount?.details.max_value !== 0
            ) {
              arrayValues.push(item.discount?.details.max_value);
            } else {
              arrayValues.push(amountValue);
            }
          }
        });
      }
      const totalDiscount = arrayValues.reduce(
        (a: number, b: number) => a + b,
        0
      );
      return Math.round(totalDiscount);
    };

    discountDetail = (discounts: IDiscount) => {
      const { discount } = discounts;
      const local = this.state.selected_local!.id;
      const amount = ShoppingCartClient.getCartStats(local).amount;
      if (discount.type === 'PERCENT') {
        const percentValue = discount?.details.value
          ? (amount * discount?.details.value) / 100
          : 0;
        if (
          percentValue > discount?.details.max_value &&
          discount?.details.max_value !== 0
        ) {
          return discount?.details.max_value;
        } else {
          return percentValue;
        }
      } else {
        const amountValue = discount?.details.value
          ? discount?.details.value
          : 0;
        if (
          amountValue > discount?.details.max_value &&
          discount?.details.max_value !== 0
        ) {
          return amount > discount?.details.max_value
            ? discount?.details.max_value
            : amount;
        } else {
          return amount > amountValue ? amountValue : amount;
        }
      }
    };

    fetchStoreProductsWithPromotion = async () => {
      try {
        const locals = await this.fetchLocals();
        const localIds = locals.data
          .map((local) => (local.state === 'OPEN' ? local.id : null))
          .filter((id) => id !== null);

        let defaultSort: any = {
          'sorting.keyword': 'asc',
          'category.sort': 'asc',
          sort: 'asc',
          'category.id.keyword': 'asc',
        };
        let queryParams: IListParams = {
          offset: 0,
          limit: 1000,
          query: {},
          sort: defaultSort,
        };

        queryParams.query = Object.assign({}, queryParams.query, {
          'local_id.keyword_is_one_of': localIds,
          exist: 'reference_price',
        });
        const products_promotion =  await FoodieClient.listProducts(queryParams);

        return !localIds.length ? undefined : products_promotion;
      } catch (error) {
        eureka.error('Unexpected error while showing store detail', error);
      }
    };

    onBootstrap = async () => {
      try {
        this.pushHistory('LOADING', false);
        this.setState({ mode: 'LOADING', loading_message: 'Cargando...' });

        const site = await this.fetchSite();

        this.setState({ site });

        const user = await this.fetchUser();
        this.setState({ user });
        if (user?.email === 'invited') {
          this.pushHistory('REGISTER_POPUP', true);
          return;
        }

        const [
          //user,
          foodieCategories,
          locals,
          selected_local,
          locals_slots,
          selected_card,
          is_first_time,
          pending_payments,
          payment_intention,
          calificationQuestions /*, site*/,
          products_promotion,
        ] = await Promise.all([
          //this.fetchUser(),
          this.fetchFoodieCategories(),
          this.fetchLocals(),
          this.fetchSelectedLocal(),
          this.fetchLocalSlots(),
          this.fetchSelectedCard(),
          this.fetchIsFirstTime(),
          this.fetchPendingPayments(),
          this.fetchPaymentIntention(),
          this.fetchCalificationQuestion(),
          this.fetchStoreProductsWithPromotion(),

          //this.fetchSite()
        ]);

        let mode: IMode = 'ONBOARDING';
        console.log(mode);

        const thereArePendingPayments = pending_payments.data.length;
        if (selected_local) {
          mode = 'STORE';
        } else if (payment_intention) {
          mode = 'VOUCHER';
        } else if (thereArePendingPayments) {
          mode = 'ONBOARDING';
        }

        this.replaceHistory(mode, false);
        this.setState({
          //user,
          locals,
          selected_local,
          locals_slots,
          selected_card,
          is_first_time,
          pending_payments,
          payment_intention,
          mode,
          calificationQuestions,
          products_promotion,
          foodieCategories,
          //site
        });

        if (mode === 'ONBOARDING') {
          const locationState = this.props.location.state as any;

          if (locationState?.paymentIntentionId) {
            const order = pending_payments?.data?.find(
              (pending: IPaymentIntention) =>
                pending.id === locationState.paymentIntentionId
            );

            if (order) {
              this.onClickPendingItem(order);
            }
          }
        }
        console.log(mode);
      } catch (error) {
        eureka.error('Unexpected error while bootstrapping', error);

        this.setState({
          error_modal: {
            title: 'Ocurrió un problema',
            message: 'No pudimos cargar la información. ¿Deseas reintentar?',
            onRetry: () => {
              this.setState({ error_modal: undefined });

              setTimeout(() => {
                // remove before loading
                this.backHistory(false);

                this.onBootstrap();
              }, ANIMATION_TIME);
            },
            onCancel: () => {
              this.setState({ error_modal: undefined });

              setTimeout(() => {
                this.backHistory(true);
              }, ANIMATION_TIME);
            },
          },
        });
      }
    };

    onPressBackButton = (ev: any) => {
      ev.detail.register(10, () => {
        this.backHistory(true);
      });
    };

    onCardChangeHandler = (card?: ICard) => {
      this.setState({ selected_card: card });
    };

    onOpenProductModal = (product: IProduct) => {
      this.setState({ product_modal: { visible: true, data: product } });
    };

    onCloseProductModal = () => {
      this.setState({ product_modal: { visible: false } });
    };

    onShowStoreDetail = async () => {
      this.pushHistory('STORE');
      this.setState({ mode: 'STORE', products: undefined });
    };

    onOpenCart = () => {
      this.pushHistory('SHOPPING_CART', true);
    };

    onEndOnboarding = () => {
      this.pushHistory('STORES', true);
      SettingsClient.set('FOODIE_FIRST_TIME', false);
    };

    onSelectedLocal = async (local: ILocal) => {
      this.setState({ selected_local: local });

      // Loading asynchronous local slots - fail silently
      try {
        const slots = await FoodieClient.getLocalSlots(local.id);
        this.setState({
          locals_slots: { ...this.state.locals_slots, [local.id]: slots },
        });
      } catch (error) {
        eureka.error('Unexpected error while fetching local slots', error);
      }
    };

    onFetchMoreProducts = async () => {
      try {
        // check if already fetching
        if (this.state.fetching_more_products) {
          eureka.info('Fetching more products aborted; already fetching');
          return;
        }

        // check if there are not more products
        const products = this.state.products!;
        if (products.data.length >= products.total) {
          eureka.info(
            'Fetching more products aborted; there are not more products'
          );
          return;
        }

        this.setState({ fetching_more_products: true });

        console.log({
          products_limit: products.limit,
          products_total: products.total,
          products_offset: products.offset,
        });

        const moreProducts = await FoodieClient.listProducts({
          offset:
            products.limit < products.total ? products.limit : products.total,
          limit: 50,
          query: {
            ...this.productsCommonFilter,
            'local_id.keyword_is': this.state.selected_local?.id,
            enable_is: true,
          },
          sort: {
            'category.sort': 'asc',
            sort: 'asc',

            'category.id.keyword': 'desc',
            created_at: 'desc',
          },
        });

        this.setState((prevState) => ({
          ...prevState,
          products: {
            ...moreProducts,
            offset: 0,
            limit: prevState.products!.limit + moreProducts.limit,
            total: moreProducts.total,
            data: [...prevState.products!.data, ...moreProducts.data],
          },
          fetching_more_products: false,
        }));
      } catch (error) {
        eureka.error('Unexpected error while fetching more products', error);

        // fail silently
        this.setState({ fetching_more_products: false });
      }
    };

    onOpenCheckout = () => {
      this.pushHistory('CHECKOUT', true);
    };

    onDeleteItemFromCart = (item: IItem, localId: string) => {
      const updatedItem: IItem = { ...item, quantity: 0 };
      ShoppingCartClient.updateItem(localId, updatedItem);
    };

    onClearShoppingCart = async () => {
      this.setState({
        error_modal: {
          title: '¿Seguro que deseas eliminar todo el carrito?',
          message: 'Está acción no se puede revertir',
          retryMessage: 'Si, eliminar carrito',
          cancelMessage: 'No, mantener carrito',
          onRetry: () => {
            this.setState({
              error_modal: undefined,
              deliveries: undefined,
              locals_slots: undefined,
            });

            const locals = ShoppingCartClient.getLocalsIdsWithCartItems();
            Promise.all(
              locals.map((l) => {
                return ShoppingCartClient.clearItems(l);
              })
            ).then(() => {
              this.forceUpdate();
            });
          },
          onCancel: () => {
            this.setState({ error_modal: undefined });
          },
        },
      });
    };

    onLocalWithoutProducts = () => {
      this.setState({
        error_modal: {
          title: 'Restaurante sin stock',
          message:
            'El restaurante no tiene productos para mostrar, intentalo más tarde o elige otro restaurante',
          retryMessage: 'Elegir otro restaurante',
          onRetry: () => {
            this.setState({ error_modal: undefined });

            setTimeout(() => {
              this.backHistory(true);
            }, ANIMATION_TIME);
          },
        },
      });
    };

    onAddMoreToShoppingCart = () => {
      this.pushHistory('STORES', true);
    };

    getUnavailableItems = async (): Promise<{
      items: { localId: string; item: IItem }[];
      ids: string[];
    }> => {
      const items = ShoppingCartClient.getCartsData();
      const productIds = items
        .flatMap((obj) => obj.items)
        .map((prod) => prod.product_id);

      const productsToRemove = await FoodieClient.listProducts({
        offset: 0,
        limit: productIds.length,
        query: {
          ...this.productsCommonFilter,
          _id_is_one_of: productIds,
          enable_is: false,
        },
      });

      if (productsToRemove.data.length > 0) {
        const productsToRemoveIds = productsToRemove.data.map((e) => e.id);

        const its = items.reduce(
          (acum: { localId: string; item: IItem }[], obj) => {
            const tmpObj = obj.items
              .filter((p) => productsToRemoveIds.includes(p.product_id))
              .map((p) => {
                return {
                  localId: obj.localId,
                  item: { ...p, enable: false },
                };
              });
            if (tmpObj.length > 0) {
              acum = [...acum, ...tmpObj];
            }
            return acum;
          },
          []
        );
        return { items: its, ids: productsToRemoveIds };
      } else {
        return { ids: [], items: [] };
      }
    };

    checkLocalState = async (): Promise<boolean> => {
      const localsIds = ShoppingCartClient.getLocalsIdsWithCartItems();
      const response = await FoodieClient.listLocals({
        offset: 0,
        limit: 1000,
        query: {
          _id_is_one_of: localsIds,
          'state.keyword_is': 'CLOSED',
        },
      });
      if (response.data.length > 0) {
        const closedLocalsIds = response.data.map((l) => l.id);

        const selected_local: ILocal = {
          ...this.state.selected_local!,
          state: closedLocalsIds.includes(this.state.selected_local!.id)
            ? 'CLOSED'
            : 'OPEN',
        };

        // Editar products state
        this.setState({
          paymentValidationModal: {
            title: 'Existen locales cerrados.',
            message:
              'Para poder continuar con tu compra, elimina los productos de locales cerrados.',
            retryMessage: 'Eliminar productos',
            onRetry: () => {
              this.pushHistory('SHOPPING_CART', true);
              this.setState({ paymentValidationModal: undefined });
            },
          },
          locals: {
            ...this.state.locals!,
            data: [
              ...this.state.locals!.data.map<ILocal>((l) => {
                if (closedLocalsIds.includes(l.id)) {
                  return {
                    ...l,
                    state: 'CLOSED',
                  };
                }
                return l;
              }),
            ],
          },
          selected_local: selected_local,
        });
        return false;
      }

      return true;
    };

    checkUnavailableItems = async (): Promise<boolean> => {
      const productsToRemove = await this.getUnavailableItems();
      if (productsToRemove.ids.length > 0) {
        // Edit shipping-cart-item state
        for (const prod of productsToRemove.items) {
          await ShoppingCartClient.updateItem(prod.localId, prod.item);
        }

        // Editar products state
        this.setState({
          paymentValidationModal: {
            title: 'Tienes productos que han dejado de estar disponibles.',
            message:
              'Para poder continuar con tu compra, elimina los productos que se encuentran inactivos.',
            retryMessage: 'Eliminar productos',
            onRetry: () => {
              this.pushHistory('SHOPPING_CART', true);
              this.setState({ paymentValidationModal: undefined });
            },
          },
          products: {
            ...this.state.products!,
            data: [
              ...this.state.products!.data.map((p) => {
                if (productsToRemove.ids.includes(p.id)) {
                  return { ...p, enable: false };
                }
                return p;
              }),
            ],
          },
        });
        return false;
      }
      return true;
    };

    onPayOrder = async (retryOnErrorMultiOrder?: boolean) => {
      try {
        // mark form as submited
        this.setState({ submitted: true });
        // check required data
        //const { delivery, selected_card } = this.state;
        const { deliveries, selected_card } = this.state;
        if (!deliveries || !selected_card) {
          return;
        }

        // if user don't have rut
        // redirect to add rut view
        if (!this.state.user!.document_number) {
          this.pushHistory('ADD_DOCUMENT_NUMBER', true);
          return;
        }

        this.pushHistory('LOADING', false);
        this.setState({ mode: 'LOADING', loading_message: 'Pagando...' });

        const checks = await Promise.all([
          this.checkUnavailableItems(),
          this.checkLocalState(),
        ]);

        if (checks.every((ck) => ck === true)) {
          const createPaymentObject = (
            finalAmount: number,
            totalDiscount: number,
            local: ILocal
          ): ICreatePaymentIntention => {
            const paymentObj = {
              payment_flow: 'FOODIE' as any,
              payer: {
                email: this.state.user!.email,
                full_name: this.state.user!.full_name,
                document_type: 'RUT',
                document_number: this.state.user!.document_number!,
                country: 'Chile',
              },
              payment_method: {
                kind: 'TBK_ONECLICK',
                details: {
                  card_token: this.state.selected_card!.card_token,
                  card_type: this.state.selected_card!.card_type,
                  user_id: this.state.user!.primarysid,
                },
              },
              transaction: {
                currency: 'CLP',
                amount: {
                  total: finalAmount,
                  subtotal: Math.round(finalAmount / 1.19),
                  discount: totalDiscount,
                },
                line_items: ShoppingCartClient.getCartList(local.id).map(
                  (item) => ({
                    id: item.id,
                    description: item.name,
                    price: item.price,
                    quantity: item.quantity,
                  })
                ),
              },
              discounts: this.state.discounts && this.state.discounts[local.id],
              metadata: {
                foodie_local: this.state.locals?.data.find(
                  (l) => l.id === local.id
                ),
                foodie_cart: ShoppingCartClient.getCartList(local.id),
                foodie_delivery: this.state.deliveries![local.id],

                discount:
                  this.state.discounts &&
                  this.state.discounts[local.id].map((discount: IDiscount) => {
                    return {
                      code: discount.code,
                      discount_applied: this.discountDetail(discount),
                      id_discount: discount.id,
                    };
                  }),
              },
            };
            return paymentObj;
          };

          const localsIds = ShoppingCartClient.getLocalsIdsWithCartItems();

          if (localsIds.length > 1 || retryOnErrorMultiOrder) {
            // Multipedido
            const paymentsArr = localsIds
              .map((id) => this.state.locals?.data.find((l) => l.id === id))
              .filter((l) => l !== undefined)
              .map((local) => {
                //return createPaymentObject(ShoppingCartClient.getCartStats(local!.id).amount,0,local!)
                const data = this.getAmountWithDiscountsByLocal(local!);
                const paymentObj = createPaymentObject(
                  data.finalAmount,
                  data.totalDiscount,
                  local!
                );
                return paymentObj;
              });
            const createdArr = await PaymentIntentionClient.bulkCreate(
              paymentsArr as ICreatePaymentIntention[]
            );
            if (retryOnErrorMultiOrder) {
              this.setState({
                active_pay_int_idx: this.state.active_pay_int_idx || 0,
                payment_intentions: this.state.payment_intentions?.map((pi) => {
                  const substitute = createdArr.find((c) => c.id === pi.id);
                  if (substitute) {
                    return substitute;
                  } else {
                    return pi;
                  }
                }),
              });
            } else {
              this.setState({
                payment_intentions: createdArr,
                active_pay_int_idx: this.state.active_pay_int_idx || 0,
              });
            }

            // start check status
            this.checkMultiPaymentIntentionStatus(createdArr.map((p) => p.id));
          } else {
            const local = this.state.locals?.data.find(
              (l) => l.id === localsIds[0]
            );
            if (local) {
              const data = this.getAmountWithDiscountsByLocal(local);
              const paymentObj = createPaymentObject(
                data.finalAmount,
                data.totalDiscount,
                local
              );

              const created = await PaymentIntentionClient.create(
                paymentObj as ICreatePaymentIntention
              );
              this.setState({ payment_intention: created });
              // start check status
              this.checkPaymentIntentionStatus(created.id);
            }
          }
        }
      } catch (error) {
        eureka.error('Unexpected error on paying order', error);

        this.setState({
          error_modal: {
            title: 'Hubo un problema',
            message: 'No pudimos crear la orden. ¿Deseas reintentar?',
            onRetry: () => {
              this.setState({ error_modal: undefined });

              setTimeout(async () => {
                // remove before loading
                this.backHistory(false);

                this.onPayOrder();
              }, ANIMATION_TIME);
            },
            onCancel: () => {
              this.setState({ error_modal: undefined });

              this.backHistory(true);
            },
          },
        });
      }
    };

    onSelectDeliveryMethod = (selected: {
      local: ILocal;
      idDeliveryMethodSelected: string;
    }) => {
      this.setState({
        deliveries: {
          ...this.state.deliveries,
          [selected.local.id]: {
            type: selected.idDeliveryMethodSelected,
            schedule_info: {
              ...(this.state.deliveries &&
              this.state.deliveries[selected.local.id]
                ? this.state.deliveries[selected.local.id].schedule_info
                : { type: 'ASAP', date: new Date() }),
            },
          },
        },
      });
    };

    onSelectWithdrawAsap = (local: ILocal) => {
      this.setState({
        deliveries: {
          ...this.state.deliveries,
          [local.id]: {
            ...this.state.deliveries![local.id],
            schedule_info: {
              date: new Date(),
              type: 'ASAP',
            },
          },
        },
      });
    };

    onSelectWithdrawScheduled = (slot: ILocalSlot, local: ILocal) => {
      this.setState({
        deliveries: {
          ...this.state.deliveries,
          [local.id]: {
            ...this.state.deliveries![local.id],
            schedule_info: {
              date: slot.start,
              type: 'SCHEDULED',
            },
          },
        },
      });
    };

    onOpenCardManagement = () => {
      this.props.history.push('/cards');
    };

    onAddNewCard = () => {
      this.props.history.push('/cards');
    };

    onClickCartItem = (item: IItem) => {
      this.setState({ product_modal: { visible: true, data: item } });
    };

    onSaveDocumentNumber = async () => {
      try {
        this.pushHistory('LOADING', false);
        this.setState({ mode: 'LOADING', loading_message: 'Actualizando...' });

        await UserClient.update(
          'document_number',
          this.state.document_number.value
        );

        // update user object
        this.setState((prevState) => ({
          ...prevState,
          user: {
            ...prevState.user!,
            document_number: this.state.document_number.value,
          },
        }));

        // remove current loading
        this.backHistory(false);

        // fire pay order
        this.onPayOrder();
      } catch (error) {
        eureka.error('Unexpected error saving document number in user');

        this.setState({
          error_modal: {
            title: 'Hubo un problema',
            message:
              'No pudimos crear actualizar el usuario. ¿Deseas reintentar?',
            onRetry: () => {
              this.setState({ error_modal: undefined });

              setTimeout(async () => {
                // remove before loading
                this.backHistory(false);

                this.onSaveDocumentNumber();
              }, ANIMATION_TIME);
            },
            onCancel: () => {
              this.setState({ error_modal: undefined });

              this.backHistory(true);
            },
          },
        });
      }
    };

    onChangeDocumentNumber = (value: string) => {
      const is_valid = DniFormatter.isRutValid(value);
      this.setState({ document_number: { value, is_valid } });
    };

    onClickPendingItem = (paymentIntention: IPaymentIntention) => {
      this.pushHistory('VOUCHER', false);
      this.setState({ mode: 'VOUCHER', payment_intention: paymentIntention });
    };

    onClickFinalizeVoucher = () => {
      if (this.props.history.action !== 'POP') {
        this.props.history.goBack();
      } else {
        this.props.history.push('/');
      }
    };

    onScanHandler = () => {
      this.setState({ mode: 'SCANNER', scanMode: 'MODAL' });
    };

    onStopScannerModal = (status: number | undefined) => {
      BarcodeScanner.showBackground();
      BarcodeScanner.stopScan();
      eureka.info('Stop out');
      this.setState({ mode: 'DISCOUNT', status: status });
    };

    onStopScanner = () => {
      BarcodeScanner.showBackground();
      BarcodeScanner.stopScan();

      !this.state.scanMode || this.state.scanMode === 'TICKET'
        ? this.setState({ mode: 'ONBOARDING' })
        : this.setState({ mode: 'CHECKOUT' });
    };

    onCloseDiscountHandler = () => {
      this.setState({ mode: 'CHECKOUT' });
    };

    onCouponClickHandler = (data: IDiscount, local: ILocal) => {
      eureka.info('Discount clicked', data);

      const distinctDiscount =
        this.state.discounts &&
        this.state.discounts[local.id].filter(
          (discount: IDiscount) => discount.id === data.id
        ).length === 1
          ? true
          : false;
      if (!distinctDiscount && this.state.discounts) {
        const discountCurrent = this.state.discounts[local.id].filter(
          (f) => f.selectable === true
        );

        // Searching other local with same discount
        const sameDiscountLocal = Object.entries(this.state.discounts).find(
          (l) => {
            if (l[1].find((d) => d.id === data.id)) {
              return true;
            }
            return false;
          }
        );

        let newDiscounts: IDiscount[] = [];
        newDiscounts = [
          ...newDiscounts,
          ...this.state.discounts[local.id]!,
          data,
        ];
        newDiscounts = newDiscounts.filter(
          (x) => x.id !== discountCurrent[0]?.id
        );
        eureka.info('New discounts', newDiscounts);

        if (sameDiscountLocal) {
          this.setState({
            mode: 'CHECKOUT',
            discounts: {
              ...this.state.discounts,
              [sameDiscountLocal[0]]: sameDiscountLocal[1].filter(
                (d) => d.id !== data.id
              ),
              [local.id]: newDiscounts,
            },
          });
        } else {
          this.setState({
            mode: 'CHECKOUT',
            discounts: {
              ...this.state.discounts,
              [local.id]: newDiscounts,
            },
          });
        }

        return;
      }
      this.setState({ mode: 'CHECKOUT' });
      return;
    };

    onCouponButtonClick = (local: ILocal) => {
      this.setState({ mode: 'DISCOUNT', localDiscountFilter: local });
    };

    onGoToStore = (local: ILocal) => {
      this.backHistory(false);
      this.setState({ mode: 'STORE', selected_local: local });
    };

    onOpenSupportPage = (payment_intention: IPaymentIntention) => {
      this.pushHistory('SUPPORT', true);
    };

    onSetActivePayIntIndex = (index: number) => {
      this.setState({ active_pay_int_idx: index });
    };

    onSetShowForm = () => {
      this.setState({ showForm: true });
    };

    onSendSupportMessage = async (
      pi: IPaymentIntention,
      user: IUser,
      subject: string,
      message: string,
      cb: () => void
    ) => {
      try {
        let partialData: Partial<IUser> = {};

        partialData.phone = user.phone;
        partialData.meta_data = { ...user.meta_data };

        await UserClient.updatePartial(partialData);

        this.setState((prevState) => ({
          ...prevState,
          user: {
            ...prevState.user!,
            ...partialData,
          },
        }));

        let email = partialData.meta_data.email
          ? partialData.meta_data.email
          : user.email;
        const order_number = lodash.get(
          pi,
          'outcome.result.foodie_order_number'
        );
        const phone = `${partialData.phone!.slice(
          0,
          1
        )} ${partialData.phone!.slice(1, 5)} ${partialData.phone!.slice(5)}`;

        await FoodieClient.sendSupportEmail({
          order_number: order_number,
          email: email,
          phone: phone,
          subject: subject,
          message: message,
        });

        cb();
      } catch (error) {
        eureka.error('Unexpected error while sending support email', error);

        this.setState({
          error_modal: {
            title: 'Ocurrió un problema',
            message: 'No pudimos enviar la información. ¿Deseas reintentar?',
            onRetry: () => {
              this.setState({ error_modal: undefined });

              setTimeout(() => {
                this.onSendSupportMessage(pi, user, subject, message, cb);
              }, ANIMATION_TIME);
            },
            onCancel: () => {
              this.setState({ error_modal: undefined });

              //this.backHistory(true);
            },
          },
        });
      }
    };

    onLoginClickHandler = async (): Promise<void> => {
      await AuthenticationClient.signOut();
      window.location.reload();
    };

    onClickNotificationModal = () => {
      // const { is_first_time } = this.state;

      // if (is_first_time) {
      //   this.pushHistory('ONBOARDING', true);
      // } else {
      this.pushHistory('STORES', true);
      // }
    };

    onChooseCategory = (categoryName: string) => {
      this.setState({ categorySelected: categoryName });

      this.pushHistory('STORES_BY_CATEGORY', true);
    };

    /**
     * Main render
     */
    render() {
      const {
        mode,
        error_modal,
        product_modal,
        selected_local,
        paymentValidationModal,
      } = this.state;

      return (
        <IonPage
          className={`${UNIQUE_CLASS} ${mode
            .replaceAll('_', '-')
            .toLocaleLowerCase()}`}
          ref={this.pageRef}
        >
          {(() => {
            const customRender: Function = (this as any)[`render${mode}`];
            if (!customRender) {
              return <div>{mode}</div>;
            }
            return customRender();
          })()}

          <IonFooter>
            <BottomNavigationBar
              onIndexChanged={(newIndex) => {
                if (newIndex !== 3) {
                  window.location.href = `/mall-home/${localStorage.getItem(
                    'mall-selected'
                  )}?activeTab=${newIndex}`;
                }
              }}
              initialIndex={3}
              items={[
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
                  icon: 'food',
                  text: 'Comida',
                },
                {
                  icon: 'services',
                  text: 'Servicios',
                },
              ]}
            />
          </IonFooter>

          {this.state.menu_is_open ? (
            <>
              {this.state.user?.email === 'invited' ? (
                <RegisterModal
                  type="NEW"
                  userInfo={this.state.user}
                  onClose={() => {}}
                  onClick={this.onLoginClickHandler}
                />
              ) : (
                <UserMenu
                  store={this.props.match.params.id}
                  onClose={() => {
                    this.setState({
                      menu_is_open: false,
                    });
                  }}
                />
              )}
            </>
          ) : null}

          {product_modal.visible && (
            <ProductModal
              onClose={this.onCloseProductModal}
              sourceRef={this.pageRef.current}
              data={product_modal.data!}
              local={selected_local}
            />
          )}
          {error_modal && (
            <ErrorModal
              icon={error_modal.icon}
              title={error_modal.title}
              message={error_modal.message}
              cancelMessage={error_modal.cancelMessage}
              retryMessage={error_modal.retryMessage}
              onRetry={error_modal.onRetry}
              onCancel={error_modal.onCancel}
            />
          )}
          {paymentValidationModal && (
            <ErrorModal
              title={paymentValidationModal.title}
              message={paymentValidationModal.message}
              retryMessage={paymentValidationModal.retryMessage}
              onRetry={paymentValidationModal.onRetry}
            />
          )}
        </IonPage>
      );
    }

    /**
     * RegisterPopup Render
     */
    renderREGISTER_POPUP = () => {
      const { user } = this.state;

      return (
        <RegisterModal
          type="NEW"
          userInfo={user}
          onClose={() => this.backHistory(true)}
          onClick={this.onLoginClickHandler}
        />
      );
    };

    /**
     * Render loading view
     */
    renderLOADING = () => {
      const { loading_message } = this.state;

      return (
        <Fragment>
          <BackdropLoading message={loading_message!} />
        </Fragment>
      );
    };

    renderNOTOTIFICATIONMODAL = () => {
      return (
        <NotificationModal
          image={CellPhoneWithCutlery}
          title="Bienvenido a Comida 1.0"
          description="Ten en cuenta que estamos en periodo de marcha blanca y todo el feedback que nos des nos servirá para mejorar y entregarte una mejor experiencia."
          buttonText="Entendido"
          onClick={this.onClickNotificationModal}
        />
      );
    };

    /**
     * Render onboarding view
     */
    renderONBOARDING = () => {
      const { pending_payments, is_first_time } = this.state;

      return (
        <OnBoardingView
          goBack={() => this.props.history.goBack()}
          onEndOnboarding={() => {
            this.onEndOnboarding();
          }}
          pending_payments={pending_payments}
          onClickPendingItem={this.onClickPendingItem}
          isFirstTime={Boolean(is_first_time)}
        />
      );
    };

    /**
     * Render stores view
     */
    renderSTORES = () => {
      const { locals, foodieCategories, selected_local, products_promotion } = this.state;

      return (
        <StoresView
          openCart={this.onOpenCart}
          footerHidden={!selected_local}
          locals={locals}
          foodieCategories={foodieCategories}
          products_promotion={products_promotion}
          selectedLocal={selected_local}
          onSelectedLocal={this.onSelectedLocal}
          onBack={() => this.props.history.goBack()}
          onShowStoreDetail={this.onShowStoreDetail}
          currentUser={this.state.user}
          onChooseCategory={this.onChooseCategory}
          handleShowUserProfile={() => {
            this.setState({
              menu_is_open: true,
            });
          }}
        />
      );
    };

    /**
     * Render stores view filtered by category chose
     */
    renderSTORES_BY_CATEGORY = () => {
      const { locals, products_promotion, categorySelected } = this.state;

      return (
        <StoresByCategoryView
          locals={locals}
          categorySelected={categorySelected}
          onBack={() => this.backHistory(true)}
          openCart={this.onOpenCart}
          onSelectedLocal={this.onSelectedLocal}
          onShowStoreDetail={this.onShowStoreDetail}
        />
      );
    };

    /**
     * Render store view
     */
    renderSTORE = () => {
      const { selected_local, products, fetching_more_products } = this.state;

      return (
        <StoreView
          openCart={this.onOpenCart}
          local={selected_local!}
          products={products?.data}
          fetching_more={fetching_more_products}
          onBack={() => this.backHistory(true)}
          onClickProduct={this.onOpenProductModal}
          onClickCartButton={this.onOpenCart}
          onFetchMoreProducts={this.onFetchMoreProducts}
        />
      );
    };

    /**
     * Render shopping cart view
     */
    renderSHOPPING_CART = () => {
      const data = ShoppingCartClient.getCartsData().map((d) => {
        return {
          local: this.state.locals!.data.find((l) => l.id === d.localId)!,
          items: d.items,
        };
      });

      return (
        <ShoppingCartView
          data={data}
          goToStore={this.onGoToStore}
          clearShoppingCart={this.onClearShoppingCart}
          goBack={() => {
            this.backHistory(true);
          }}
          onAddMoreToShoppingCart={this.onAddMoreToShoppingCart}
          onClickCartItem={this.onClickCartItem}
          onOpenCheckout={this.onOpenCheckout}
          onRemoved={() => {
            this.forceUpdate();
          }}
          onDeleteItem={this.onDeleteItemFromCart}
        />
      );
    };

    /**
     * Render checkout view
     */
    renderCHECKOUT = () => {
      const { locals_slots, submitted, deliveries, selected_card, discounts } =
        this.state;

      let finalAmount: number = 0;
      let realAmount: number = 0;
      let totalDiscount: number = 0;

      const locals = ShoppingCartClient.getCartsData()
        .filter((d) => d.items.length > 0)
        .map((d) => {
          return this.state.locals!.data.find((l) => l.id === d.localId)!;
        });

      locals.forEach((l) => {
        const data = this.getAmountWithDiscountsByLocal(l);
        finalAmount += data.finalAmount;
        realAmount += data.realAmount;
        totalDiscount += data.totalDiscount;
      });

      return (
        <CheckoutView
          submitted={submitted}
          deliveries={deliveries}
          selected_card={selected_card}
          locals={locals}
          locals_slots={locals_slots}
          discounts={discounts}
          finalAmount={finalAmount}
          amountWithoutDiscount={realAmount}
          totalDiscount={totalDiscount}
          onBack={() => {
            this.backHistory(true);
          }}
          onPayOrder={this.onPayOrder}
          onAddNewCard={this.onAddNewCard}
          onOpenCardManagement={this.onOpenCardManagement}
          onSelectDeliveryMethod={this.onSelectDeliveryMethod}
          onSelectWithdrawAsap={this.onSelectWithdrawAsap}
          onSelectWithdrawScheduled={this.onSelectWithdrawScheduled}
          fetchAllDiscounts={this.fetchAllDiscounts}
          openDiscount={this.onCouponButtonClick}
        />
      );
    };

    /**
     * Render Discount
     */

    renderDISCOUNT = () => {
      const { site, localDiscountFilter } = this.state;

      const store_number = lodash.get(site?.meta_data, 'facilityNumber');

      return (
        <Fragment>
          <DiscountModal
            context={{
              paymentFlow: 'FOODIE',
              storeNumber: store_number,
              restaurants: localDiscountFilter!.restaurant_id,
            }}
            onScan={() => {
              this.onScanHandler();
            }}
            onStop={this.onStopScannerModal}
            onClose={() => {
              this.onCloseDiscountHandler();
            }}
            onCouponClick={(data: IDiscount) =>
              this.onCouponClickHandler(data, localDiscountFilter!)
            }
            onStatus={this.state.status}
          />
        </Fragment>
      );
    };

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
            <div className="message">
              Coloca el código en el centro del recuadro para escanear.
            </div>
          </div>
        </Fragment>
      );
    };

    /**
     * Render search ticket details view
     */
    renderSEARCHING = () => {
      return (
        <Fragment>
          <div className="searching">
            <ImageInTwoMode
              srcLight={qrCodeLightImg}
              srcDark={qrCodeDarkImg}
              alt="QR code"
            />
            <h2>Buscando información...</h2>
          </div>
        </Fragment>
      );
    };

    /**
     * Render add rut view
     */
    renderADD_DOCUMENT_NUMBER = () => {
      return (
        <RutScreen
          title={'Necesitamos que ingreses tu RUT'}
          subtitle={'Esto es necesario para seguir con el proceso'}
          onBack={() => {
            this.backHistory(true);
          }}
          onContinue={this.onSaveDocumentNumber}
          onValue={this.onChangeDocumentNumber}
        />
      );
    };

    /**
     * Render voucher view
     */
    renderVOUCHER = () => {
      const { payment_intention, calificationQuestions, user } = this.state;

      const mall_id = this.props.match.params.id;

      const onSeeOrders = () => {
        this.clearHistory();
        this.props.history.push(`/foodie-orders/${this.props.match.params.id}`);
      };

      if (this.state.showForm) {
        return (
          <ContactFormScreen
            onBack={() => {
              this.setState({
                showForm: false,
              });
            }}
            onEmailSent={() => {
              this.setState({
                showForm: false,
              });
            }}
            phone_enable={true}
            user_email={user?.email}
            user_fullname={user?.full_name}
            user_phone={user?.phone}
          />
        );
      }

      if (payment_intention) {
        return (
          <>
            <VoucherView
              onSetShowForm={this.onSetShowForm}
              payment_intentions={[payment_intention!]}
              active_pay_int_idx={0}
              onSetActivePayIntIndex={this.onSetActivePayIntIndex}
              onGoBack={() => {
                this.backHistory(true);
              }}
              mall_id={mall_id}
              user={user!}
              calificationQuestions={calificationQuestions!}
              onSeeOrders={onSeeOrders}
              onClickFinalizeVoucher={this.onClickFinalizeVoucher}
              onOpenSupportPage={this.onOpenSupportPage}
            />
          </>
        );
      } else {
        return null;
      }
    };

    /**
     * Render multi voucher view
     */
    renderMULTI_VOUCHER = () => {
      const { payment_intentions, user, active_pay_int_idx } = this.state;

      const onSeeOrders = () => {
        this.clearHistory();
        this.props.history.push(`/foodie-orders/${this.props.match.params.id}`);
      };

      const mall_id = this.props.match.params.id;

      if (payment_intentions) {
        return (
          <VoucherView
            onSetShowForm={this.onSetShowForm}
            payment_intentions={payment_intentions}
            active_pay_int_idx={active_pay_int_idx!}
            onSetActivePayIntIndex={this.onSetActivePayIntIndex}
            onGoBack={() => {
              this.backHistory(true);
            }}
            mall_id={mall_id}
            user={user!}
            calificationQuestions={this.state.calificationQuestions!}
            onSeeOrders={onSeeOrders}
            onClickFinalizeVoucher={this.onClickFinalizeVoucher}
            onOpenSupportPage={this.onOpenSupportPage}
          />
        );
      } else {
        return null;
      }
    };

    /**
     * Render Support View
     */
    renderSUPPORT = () => {
      const {
        payment_intentions,
        active_pay_int_idx,
        user,
        payment_intention,
      } = this.state;

      let pI =
        payment_intentions &&
        payment_intentions.length > 0 &&
        active_pay_int_idx
          ? payment_intentions![active_pay_int_idx!]
          : payment_intention;

      return (
        <SupportView
          user={user!}
          payment_intention={pI!}
          onBack={() => {
            this.backHistory(true);
          }}
          submitSupportMsg={this.onSendSupportMessage}
        />
      );
    };
  }
);
