import {
  IonIcon,
  IonPage,
  withIonLifeCycle,
  IonSlides,
  IonSlide
} from '@ionic/react';
import React, { Fragment } from 'react';
import { RouteComponentProps } from 'react-router';
import lodash from 'lodash';

/**
 * Style
 */
import './index.less';

/**
 * Components
 */
import Page, { DefaultHeader } from '../../components/page';
import BackdropLoading from '../../components/backdrop-loading';
import ErrorModal, { IErrorModalProps } from '../../components/error-modal';
import OrderItem from '../foodie-flow/components/order-item';
import OrderItemShort from './components/order-item-short';

/**
 * Lib
 */
import EurekaConsole from '../../lib/EurekaConsole';

/**
 * Clients
 */
import { IArrayRestResponse } from '../../clients/RESTClient';
import AuthenticationClient from '../../clients/AuthenticationClient';
import PaymentIntentionClient from '../../clients/PaymentIntentionClient';

/**
 * Models
 */
import IPaymentIntention from '../../models/payments/IPaymentIntention';
import { IOrderDeliveryState } from '../../models/foodie/IOrderIntention';

/**
 * Assets
 */
import emptyOrders from '../../assets/media/foodie/foodie-empty-orders.png';
import ShopIcon from '../../assets/media/foodie/shop-icon.svg'
import ShopIconDark from '../../assets/media/foodie/shop-icon-dark.svg'

const ANIMATION_TIME = 200;
const UNIQUE_CLASS = 'wvojqqptid';
const eureka = EurekaConsole({ label: "foodie-orders-page" });

interface IProps extends RouteComponentProps<{ id: string }> {
}

type IMode = "LOADING" | "ORDERS";

interface IState {
  mode: IMode,
  loading_message?: string,
  payment_intentions?: IArrayRestResponse<IPaymentIntention>,
  error_modal?: IErrorModalProps,
  slideIndex: number
}

export default withIonLifeCycle(class FoodieFlowPage extends React.Component<IProps, IState> {
  private swiper: any;
  state: IState = {
    mode: 'LOADING',
    loading_message: 'Cargando...',
    slideIndex: 0
  }

  onGetSwiperHandler = async (e: any) => {
    this.swiper = e.target.swiper;
  }

  isDarkMode = false

  ionViewDidEnter = () => {
    this.onBootstrap();

    eureka.info(`Prop id: ${this.props.match.params.id}`);
  }

  ionViewDidLeave = () => {
    this.setState(
      {
        mode: 'LOADING',
        loading_message: 'Cargando...',
        slideIndex: 0
      }
    )
  }

  fetchPaymentIntentions = async () => {
    const userId = AuthenticationClient.getInfo().primarysid;
    const payments = await PaymentIntentionClient.list({
      offset: 0,
      limit: 10,
      query: {
        'state.keyword_is': 'APPROVED',
        'payment_flow.keyword_is': 'FOODIE',
        'payment_method.details.user_id.keyword_is': userId,
      },
      sort: { 'updated_at': 'desc' }
    });
    return payments;
  }

  onBootstrap = async () => {
    try {
      this.setState({ mode: 'LOADING', loading_message: 'Cargando...' });

      const paymentIntentions = await this.fetchPaymentIntentions();

      this.setState({  mode: 'ORDERS', payment_intentions: paymentIntentions });
    } catch (error) {
      eureka.error('Unexpected error while bootstrapping', error);

      this.setState({
        error_modal: {
          title: "Ocurrió un problema",
          message: "No pudimos cargar la información. ¿Deseas reintentar?",
          onRetry: () => {
              this.setState({ error_modal: undefined });

              setTimeout(() => {
                this.onBootstrap();
              }, ANIMATION_TIME);
          },
          onCancel: () => {
              this.setState({ error_modal: undefined });

              setTimeout(() => {
                this.onClickBack();
              }, ANIMATION_TIME);
          }
        }
      });
    }
  }

  onClickBack = () => {
    //this.props.history.push(`/mall-home/${this.props.match.params.id}`)
    this.props.history.goBack();
  }

  /**
   * Main render
   */
  render() {
    const { mode, error_modal } = this.state;

    return (
      <IonPage className={`${UNIQUE_CLASS} ${mode.replaceAll("_", "-").toLocaleLowerCase()}`}>
        {(() => {
          const customRender: Function = (this as any)[`render${mode}`];
          if (!customRender) {
            return <div>{mode}</div>;
          }
          return customRender();
        })()}

        {error_modal && <ErrorModal icon={error_modal.icon} title={error_modal.title} message={error_modal.message} cancelMessage={error_modal.cancelMessage} retryMessage={error_modal.retryMessage} onRetry={error_modal.onRetry} onCancel={error_modal.onCancel} />}
      </IonPage>
    )
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
   * Render orders view
   */
  renderORDERS = () => {
    const { payment_intentions } = this.state;

    const getOrdersInProgress = () => {
      return lodash.filter(payment_intentions?.data, (payment: IPaymentIntention) =>
        !['DELIVERED', 'CANCELLED'].includes(lodash.get(payment, 'outcome.result.foodie_order_delivery_state'))
      )
    }
  
    const getOrdersFinished = () => {
      return lodash.filter(payment_intentions?.data, (payment: IPaymentIntention) =>
        ['DELIVERED', 'CANCELLED'].includes(lodash.get(payment, 'outcome.result.foodie_order_delivery_state'))
      )
    }
  
    const renderOrdersInProgress = () => {
      return (
        <div>
          {getOrdersInProgress().length === 1 ? <p>Tienes un pedido en curso</p> : <p>Tienes pedidos en curso</p>}
          {
            <IonSlides onIonSlidesDidLoad={this.onGetSwiperHandler} onIonSlideWillChange={() => this.setState({slideIndex: this.swiper.activeIndex})} options={{ initialSlide: 0, speed: 400, spaceBetween: '-4%' }}>
              {lodash.map(getOrdersInProgress(), (payment_intention: IPaymentIntention) => {
                const type = lodash.get(payment_intention, 'metadata.foodie_delivery.type') as string;
                const detail = type === 'PICKUP' ? 'Pedido para servir' : 'Pedido para llevar';
  
                return (
                  <IonSlide key={payment_intention.id}>
                    <div className='order-in-progress-container'>
                      <OrderItem
                        key={payment_intention.id}
                        localImage={lodash.get(payment_intention, 'metadata.foodie_local.logo') as string}
                        localName={lodash.get(payment_intention, 'metadata.foodie_local.name') as string}
                        pickUpDate={lodash.get(payment_intention, 'outcome.result.foodie_order_delivery_date')}
                        orderState={lodash.get(payment_intention, 'outcome.result.foodie_order_delivery_state') as IOrderDeliveryState}
                        onSeeDetails={() => {
                          this.props.history.push(`/foodie/${this.props.match.params.id}/payment:${payment_intention.id}`)
                        }}
                        orderNumber={lodash.get(payment_intention, 'outcome.result.foodie_order_number') || ' - '}
      
                        // TODO: this info is not present in any place (using other info instead)
                        localDetail={detail}
                      />
                    </div>
                  </IonSlide>
                )
              })}
            </IonSlides>
          }
          <div className="dots">
            {lodash.map(getOrdersInProgress(), (value, index) => {
              return <div key={index} className={index === this.state.slideIndex ? 'selected' : ''}></div>
            })}
          </div>
        </div>
      )
    }

    const renderOrdersFinished = () => {
      return (
        <div className='orders-finished'>
          <p>Historial de pedidos</p>
          {
            getOrdersFinished().length > 0 ? lodash.map(getOrdersFinished(), (payment_intention: IPaymentIntention) => {

              const cancelledDate = lodash.get(payment_intention, 'outcome.result.foodie_order_cancelled_date');
              const deliveryDate = lodash.get(payment_intention, 'outcome.result.foodie_order_delivery_date');

              return (
                <OrderItemShort
                  key={payment_intention.id}
                  localImage={lodash.get(payment_intention, 'metadata.foodie_local.logo') as string}
                  localName={lodash.get(payment_intention, 'metadata.foodie_local.name') as string}
                  date={cancelledDate ? cancelledDate : deliveryDate}
                  state={lodash.get(payment_intention, 'outcome.result.foodie_order_delivery_state')}
                  onSeeDetails={() => {
                    this.props.history.push(`/foodie/${this.props.match.params.id}/payment:${payment_intention.id}`)
                  }}
                />
              )
            }) : (
              <div className='empty-img'>
                <img className='img' src={emptyOrders} alt="empty-orders" />
              </div>
            )
          }
          <div className='empty-message'>
            {payment_intentions?.data.length === 0
              ? 'No tienes pedidos realizados'
              : getOrdersFinished().length === 0 ? 'Aún no tienes un historial de pedidos' : ''}
          </div>
          {payment_intentions?.data.length === 0 && <div className='add-button'>
              <div className='content' onClick={() => {
                this.props.history.push(`/foodie/${this.props.match.params.id}`)
              }}>
                <IonIcon src={!this.isDarkMode ? ShopIcon : ShopIconDark} className="icon" />
                <span className='text'>Realiza tu primer pedido</span>
              </div>
          </div>}
        </div>
      )
    }
  
    const content = (
      <>
        <div className='content-orders'>
          <div>
            <div className='title'>
              <h1>Mis pedidos</h1>
            </div>
          </div>
          <div className='orders-in-progress'>
            {getOrdersInProgress().length > 0 && renderOrdersInProgress()}
          </div>
          <div>
            {renderOrdersFinished()}
          </div>
        </div>
      </>
    )

    return (
      <Page
        header={(
          <DefaultHeader onBack={this.onClickBack}/>
        )}
        content={content}
        />
      )
  }

})
