import React, { Fragment } from 'react';
import './index.less';
import { RouteComponentProps, withRouter } from 'react-router';
import {
  IonPage,
  IonHeader,
  IonContent,
  IonIcon,
  IonFooter,
  IonButton,
} from '@ionic/react';
import {
  arrowBack,
  chevronForward,
  checkmarkCircleOutline,
  alertCircleOutline,
  mail,
  ticket,
  flaskOutline,
} from 'ionicons/icons';
import i18n from '../../lib/i18n';
import locales from './locales';
import moment from 'moment';
import lodash from 'lodash';
//components
import PurchaseTicket from '../../components/purchase-ticket';
import BackdropLoading from '../../components/backdrop-loading';
import Alert from '../sky-costanera-flow/components/alert';
import CalificationModal from '../../components/califications';
import flowQualificationImg from '../../assets/media/icon-flow-qualification.svg';
//assets
import ImageSkyCostanera from '../../assets/media/sky-costanera-ticket-detail/sky-costanera.png';
import loadingSpin from './../../assets/media/icons/loading-spin.svg';
import PaymentIntentionClient from '../../clients/PaymentIntentionClient';
//models
import { IUser } from '../../models/users/IUser';
import ITicketPayment from '../../models/tickets/ITicketPayment';
import IPaymentIntention from '../../models/payments/IPaymentIntention';
import EmptyModal from '../../components/empty-modal';
//clients
import UserClient from '../../clients/UserClient';
import CalificationClient from '../../clients/CalificationClient';
//libs
import EurekaConsole from '../../lib/EurekaConsole';
import { elementAt } from 'rxjs';
import ErrorModal from '../../components/error-modal';
import { async } from '@firebase/util';

const localize = i18n(locales);
const eureka = EurekaConsole({ label: 'signin-page' });
interface IProps extends RouteComponentProps {
  onClose: (action: 'close') => void;
  store: string;
  user?: IUser;
}

enum ETicketStatus {
  EXPIRED,
  USED,
  ACTIVE,
  PROGRESS,
  INITIAL,
  REFUND,
}

interface IState {
  mode:
    | 'INITIAL_STATE'
    | 'LIST_TICKETS_STATE'
    | 'PURCHASE_TICKET_STATE'
    | 'REFUND_SUCESS_STATE'
    | 'ADD_EMAIL_STATE'
    | 'CONFIRM_REFUND_TICKETS_STATE'
    | 'END_FLOW_STATE';
  tickets: ITickets[];
  paymentIntentionData?: IPaymentIntention[];
  paymentIntentionSelected?: IPaymentIntention;
  ticketSelected?: ITicketPayment;
  ticketSelectedState?: IStatus;
  displayAlert: boolean;
  typeAlert: string;
  textAlert: string;
  isApple?: boolean;
  showConfirmRefundTicket: boolean;
  user_has_email: boolean;
  user?: IUser;
  email: string;
  email_error: boolean;
  loading: boolean;
  button_disabled: boolean;
  error_modal?: {
    title: string;
    message: string;
    retryMessage?: string;
    cancelMessage?: string;
    onRetry?: () => void;
    onCancel?: () => void;
  };
  is_visible_califications: boolean;
  has_questions: boolean;
  is_qualificable: boolean;
}

interface ITickets {
  id: string;
  merchant: string;
  date: Date;
  state: string;
  result: Record<string, unknown>;
  status: string;
  created_at?: string;
}
interface IStatus {
  cssClass: string;
  text: string;
  status: ETicketStatus;
  textAlert?: string;
  displayAlert: boolean;
}
export default withRouter(
  class TicketsPage extends React.Component<IProps, IState> {
    intervalId: NodeJS.Timeout | undefined;
    state: IState = {
      mode: 'INITIAL_STATE',
      tickets: [],
      displayAlert: false,
      typeAlert: '',
      textAlert: '',
      showConfirmRefundTicket: false,
      user_has_email: false,
      loading: false,
      email: '',
      email_error: false,
      button_disabled: false,
      is_visible_califications: false,
      has_questions: false,
      is_qualificable: false,
    };

    componentDidMount = () => {
      this.loadData();
    };

    //load all the payment intentions and create list of tickets
    loadData = async () => {
      setTimeout(async () => {
        const tickets = await this.listTickets();
        const user = await this.getUser();

        this.setState({
          mode: 'LIST_TICKETS_STATE',
          tickets: tickets,
          user: user,
          user_has_email: !!user.email,
          isApple: this.isAppleRelay(this.props.user?.email as string),
        });
      }, 170);
    };

    //Get user info
    getUser = async (): Promise<IUser> => {
      try {
        const user = (await UserClient.me()) as IUser;
        return user;
      } catch (error) {
        throw error;
      }
    };

    sortByDate = (data: any) => {
      return data.sort(
        (d1: any, d2: any) =>
          new Date(d2.metadata.reservation_date).getTime() -
          new Date(d1.metadata.reservation_date).getTime()
      );
    };

    listTickets = async () => {
      const response = (await PaymentIntentionClient.list({
        query: {
          'payment_flow.keyword_is': 'SKY-COSTANERA',
          'payment_method.details.user_id.keyword_is':
            this.props.user?.primarysid,
          'state.keyword_is_one_of': ['APPROVED', 'REFUNDED'],
        },
        offset: 0,
        limit: 7,
        sort: { created_at: 'desc' },
      })) as any;

      this.setState({ paymentIntentionData: this.sortByDate(response.data) });
      let data: ITickets[] = [];
      response.data.forEach((element: Record<string, any>) => {
        data.push({
          id: element.id,
          merchant: element.payment_flow,
          date: element.metadata.reservation_date,
          state: element.metadata.ticket_status,
          result: element.outcome.result,
          status: element.state,
          created_at: element.created_at ? element.created_at : '',
        });
      });

      return data;
    };

    getCalification = async (payment_intention_id: string) => {
      try {
        //is qualificable payment survey
        const questions = await CalificationClient.list({
          offset: 0,
          limit: 5,
          query: {
            'calification_question.flow.keyword_is': 'SKY-COSTANERA',
            'payment_intention_id.keyword_is': payment_intention_id,
          },
        });

        return questions.data.length === 0 ? true : false;
      } catch (error) {
        throw error;
      }
    };

    getUpdatedTicket = async (): Promise<ITickets> => {
      let paymentIntentionData = (await PaymentIntentionClient.getById(
        this.state.paymentIntentionSelected!.id
      )) as Record<string, any>;
      let tickets = {
        id: paymentIntentionData.id,
        merchant: paymentIntentionData.payment_flow,
        date: paymentIntentionData.metadata.reservation_date,
        state: paymentIntentionData.metadata.ticket_status,
        result: paymentIntentionData.outcome.result,
        status: paymentIntentionData.state,
        created_at: paymentIntentionData.created_at
          ? paymentIntentionData.created_at
          : '',
      } as ITickets;

      return tickets;
    };

    //Update list of tickets and refresh ticket info view (PURCHASE_TICKET_STATE)
    onUpdateData = async (ticket: ITickets, mode: any) => {
      const tickets = await this.listTickets();
      //Updating list of tickets
      this.setState((prev: any) => ({
        ...prev,
        tickets: tickets,
        showConfirmRefundTicket: undefined,
        error_modal: undefined,
      }));
      this.ticketInfo(ticket);
    };

    getAlertCss = (status?: ETicketStatus): string => {
      switch (status) {
        case ETicketStatus.ACTIVE:
          return 'alert-active';
        case ETicketStatus.EXPIRED:
          return 'alert-expired';
        case ETicketStatus.PROGRESS:
          return 'alert-progress';
        case ETicketStatus.USED:
          return 'alert-used';
        case ETicketStatus.REFUND:
          return 'alert-refund';
        default:
          return '';
      }
    };

    decoratorStatus = (tickets: ITickets): IStatus => {
      let result = tickets.result as Record<string, unknown>;
      let status = tickets.status;
      const {
        ticket_max_to_burn,
        ticket_total_burned,
        ticket_expiration_time,
      } = result as Record<string, any>;
      const today = moment();
      const expirationDate = moment(ticket_expiration_time as string);
      let data: IStatus;
      if (status === 'REFUNDED') {
        let created_at = tickets.created_at ? tickets.created_at : null;
        data = {
          cssClass: 'status refund',
          text: 'Reembolsado',
          status: ETicketStatus.REFUND,
          textAlert: `La validez de este ticket expiró debido a que su reembolso fue solicitado ${moment(
            created_at
          ).format('DD')} ${moment(created_at).format('MMM')} ${moment(
            created_at
          ).format('YYYY')}.`,
          displayAlert: true,
        };
        return data;
      }
      if (expirationDate < today && ticket_total_burned === 0) {
        data = {
          cssClass: 'status expired',
          text: 'Expirado',
          status: ETicketStatus.EXPIRED,
          textAlert:
            'La validez de este ticket expiró debido a que no fue utilizado.',
          displayAlert: true,
        };
        return data;
      }
      if (ticket_total_burned === 0) {
        data = {
          cssClass: 'status active',
          text: 'Activo',
          status: ETicketStatus.ACTIVE,
          displayAlert: false,
        };
        //data = { cssClass :  "status used", text: "Utilizado", status: ETicketStatus.USED, textAlert: "Este ticket fue utilizado el 10 de marzo de 2022 a las 18h02", displayAlert: true};
        return data;
      } else if (ticket_total_burned < ticket_max_to_burn) {
        data = {
          cssClass: 'status progress',
          text: 'En Curso',
          status: ETicketStatus.PROGRESS,
          displayAlert: false,
        };
        return data;
      } else if (ticket_max_to_burn === ticket_total_burned) {
        let { date_burned } = result as Record<string, any>;
        let dates_burned_array = date_burned as Array<string>;
        let moment_burned = moment(
          dates_burned_array
            .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
            .pop()
        );
        data = {
          cssClass: 'status used',
          text: 'Utilizado',
          status: ETicketStatus.USED,
          textAlert: `Este ticket fue utilizado el ${moment_burned.format(
            'LL'
          )} a las ${moment_burned.format('h')}h${moment_burned.format('mm')}`,
          displayAlert: true,
        };
        return data;
      }
      data = {
        cssClass: 'status default',
        text: '-',
        status: ETicketStatus.INITIAL,
        displayAlert: false,
      };
      return data;
    };

    ticketInfo = async (tickets: ITickets) => {
      const data = this.state.paymentIntentionData?.find(
        (element: IPaymentIntention) => element.id === tickets.id
      ) as IPaymentIntention as any;
      const list_tickets = data.outcome.result.gateway.transaction.line_items;
      const payment = {
        reservation_code: lodash.get(data, 'outcome.result.ticket_code'),
        reservation_slot: data.metadata.reservation_slot,
        tickets: {
          list_tickets: list_tickets,
          total_tickets: data.total_tickets,
          total_price: data.outcome.result.gateway.transaction.amount.total,
        },
        date: data.metadata.reservation_date,
        name: data.payer.full_name,
        rut: data.payer.document_number,
        code_qr: lodash.get(data, 'outcome.result.ticket_qr_code_url'),
        code_qr_data: data.id,
        total_discount: data.transaction.amount.discount,
      } as ITicketPayment;

      this.setState((prev: any) => ({
        ...prev,
        mode: 'PURCHASE_TICKET_STATE',
        paymentIntentionSelected: data,
        ticketSelected: payment,
        ticketSelectedState: this.decoratorStatus(tickets),
      }));

      const is_qualificable = await this.getCalification(data.id);

      this.setState({ is_qualificable: is_qualificable });
    };

    //Verify if the ticket could be refunded
    verifyIfRefundTicket = (tickets: ITickets): boolean => {
      let result = tickets.result as Record<string, unknown>;
      let status = tickets.status;
      const {
        ticket_max_to_burn,
        ticket_total_burned,
        ticket_expiration_time,
      } = result as Record<string, any>;
      const today = moment();
      const expirationDate = moment(ticket_expiration_time as string);
      if (status === 'REFUNDED') {
        return false;
      }
      if (expirationDate < today && ticket_total_burned === 0) {
        return false;
      }
      if (ticket_total_burned === 0) {
        return true;
      } else if (ticket_total_burned < ticket_max_to_burn) {
        return false;
      } else if (ticket_max_to_burn === ticket_total_burned) {
        return false;
      } else return true;
    };

    //Function to refund ticket
    onRefundTicketHandler = async () => {
      if (
        this.state.user_has_email &&
        this.isAppleRelay(this.state.user?.email)
      ) {
        //Refund ticket
        this.setState({ mode: 'ADD_EMAIL_STATE' });
      } else {
        let tickets = await this.getUpdatedTicket();

        if (this.verifyIfRefundTicket(tickets)) {
          this.setState({ mode: 'INITIAL_STATE' });
          const meta_data = {
            ...this.state.paymentIntentionSelected?.metadata,
            payment_to_refund: this.state.paymentIntentionSelected?.id,
          };
          const payers = {
            email:
              this.state.email != ''
                ? this.state.email
                : this.state.paymentIntentionSelected?.payer.email,
            full_name: this.state.paymentIntentionSelected?.payer.full_name,
            document_type:
              this.state.paymentIntentionSelected?.payer.document_type,
            document_number:
              this.state.paymentIntentionSelected?.payer.document_number,
            country: this.state.paymentIntentionSelected?.payer.country,
          };
          const created = await PaymentIntentionClient.create({
            payment_flow: 'SKY-COSTANERA-REFUND',
            payer: payers,
            payment_method: this.state.paymentIntentionSelected?.payment_method,
            transaction: this.state.paymentIntentionSelected?.transaction,
            metadata: meta_data,
          } as unknown as IPaymentIntention);
          this.checkPaymentStatus(created.id);
        } else {
          this.setState({
            error_modal: {
              title: 'Este ticket fue utilizado',
              message:
                'No podemos tramitar este reembolso debido a que el ticket fue utilizado.',
              retryMessage: 'Entiendo',
              onRetry: async () => {
                await this.onUpdateData(tickets, 'PURCHASE_TICKET_STATE');
              },
            },
          });
        }
      }
    };

    //Function to check the state of the payment
    checkPaymentStatus = async (id: string) => {
      this.intervalId = setInterval(async () => {
        try {
          const response = await PaymentIntentionClient.getStatus(id);

          if (response.status === 'IN_PROGRESS') {
            return;
          }
          if (response.status === 'SUCCESS') {
            const paymentIntentionData = await PaymentIntentionClient.getById(
              id
            );
            if (paymentIntentionData.state === 'REFUNDED') {
              let tickets = await this.getUpdatedTicket();

              this.setState({
                error_modal: {
                  title: 'Este ticket fue utilizado',
                  message:
                    'No podemos tramitar este reembolso debido a que el ticket fue utilizado.',
                  onRetry: async () => {
                    await this.onUpdateData(tickets, 'PURCHASE_TICKET_STATE');
                  },
                  retryMessage: 'Entiendo',
                },
              });
            } else {
              setTimeout(() => {
                this.setState({ mode: 'REFUND_SUCESS_STATE' });
              }, 1000);
            }
          } else {
            if (
              response.error?.code === 'ERROR_REFUND_ALREADY_IN_PROGRESS' ||
              response.error?.code === 'ERROR_REFUND_ALREADY_EXIST'
            ) {
              let tickets = await this.getUpdatedTicket();
              this.setState({
                error_modal: {
                  title: 'Solicitud en proceso o finalizada',
                  message:
                    'No podemos tramitar este reembolso debido a que cuentas con una solicitud en proceso o esta ya fue finalizada.',
                  onRetry: async () => {
                    await this.onUpdateData(tickets, 'PURCHASE_TICKET_STATE');
                  },
                  retryMessage: 'Entiendo',
                },
              });
            } else {
              this.setState({
                error_modal: {
                  title: 'Hubo un problema',
                  message: 'No se pudo realizar el pago. ¿Deseas reintentar?',
                  onRetry: () => {
                    this.setState({ error_modal: undefined });
                    this.onRefundTicketHandler();
                  },
                  onCancel: () => {
                    this.setState({
                      error_modal: undefined,
                      mode: 'LIST_TICKETS_STATE',
                    });
                  },
                },
              });
            }
          }
          this.intervalId && clearInterval(this.intervalId);
        } catch (error) {
          // clear interval
          this.intervalId && clearInterval(this.intervalId);
          // start again
          this.checkPaymentStatus(id);
        }
      }, 3000);
    };

    //email contain domain
    isAppleRelay = (email?: string): boolean => {
      const domain = '@privaterelay.appleid.com';
      return email!.includes(domain);
    };

    onInputChangeHandler = (key: string, value: string) => {
      const newState: any = {};
      newState[key] = value.toLocaleLowerCase();
      newState[`${key}_error`] = '';
      this.setState(newState);
      if (value != this.state.email) {
        this.setState({ button_disabled: false });
      }
    };

    validateEmail = (email: string) => {
      const re =
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      return re.test(String(email).toLowerCase());
    };

    registerEmail = async () => {
      if (this.state.loading) return;

      if (this.state.email === '') {
        this.setState({ email_error: true });
        return false;
      }
      if (!this.validateEmail(this.state.email)) {
        this.setState({ email_error: true });
        return false;
      }
      this.setState({ loading: true });

      try {
        let data = {
          ...this.state.user?.meta_data,
          email_sac: this.state.email,
        };

        const user = await UserClient.update('meta_data', data);

        if (user) {
          this.onRefundTicketHandler();
          setTimeout(() => {
            this.setState({
              mode: 'REFUND_SUCESS_STATE',
              email_error: false,
              button_disabled: true,
              loading: false,
            });
          }, 2000);
        }
      } catch (error) {
        eureka.debug(error as string);
        this.setState({ loading: false });
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

    render() {
      const { mode, error_modal } = this.state;
      const dynamicClassName = `sky-costanera-ticket-detail ${mode
        .replace(/_/gi, '-')
        .toLowerCase()}`;

      return (
        <IonPage className={dynamicClassName}>
          {(() => {
            const customRender: Function = (this as any)[`render${mode}`];
            if (!customRender) {
              return <div>{mode}</div>;
            }
            return customRender();
          })()}

          {error_modal && (
            <ErrorModal
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

    renderINITIAL_STATE = () => {
      return (
        <Fragment>
          <BackdropLoading message="Cargando..."></BackdropLoading>
        </Fragment>
      );
    };

    renderLIST_TICKETS_STATE = () => {
      const { tickets } = this.state;
      return (
        <Fragment>
          <IonHeader>
            <div
              onClick={() => {
                this.props.onClose('close');
              }}
            >
              <IonIcon icon={arrowBack} />
            </div>
          </IonHeader>
          <IonContent>
            <div className="slide-content">
              <h2 className="font-bold">{localize('LIST_TICKETS_TITLE')}</h2>
              <h3 className="feature-disclaimer">
                {localize('LIST_TICKETS_SUBTITLE')}
              </h3>
              {tickets.length > 0 ? (
                tickets.map((data: ITickets) => {
                  const status = this.decoratorStatus(data);
                  return (
                    <div
                      className="body-list list-item"
                      key={data.id}
                      onClick={() => {
                        this.ticketInfo(data);
                      }}
                    >
                      <div className="icon">
                        <img src={ImageSkyCostanera} alt="sky" />
                      </div>
                      <div className="date-time">
                        <div>{moment(data.date).format('D')}</div>
                        <div>
                          <span>{moment(data.date).format('MMM')}</span>
                          <span>{moment(data.date).format('YYYY')}</span>
                        </div>
                      </div>
                      <div className="check-ticket">
                        <div className={`${status?.cssClass}`}>
                          {status?.text}
                        </div>
                        <IonIcon icon={chevronForward} />
                      </div>
                    </div>
                  );
                })
              ) : (
                <h3 className="feature-disclaimer">
                  {localize('LIST_TICKETS_NOT_FOUND')}
                </h3>
              )}
            </div>
          </IonContent>
        </Fragment>
      );
    };

    renderPURCHASE_TICKET_STATE = () => {
      const {
        has_questions,
        is_qualificable,
        is_visible_califications,
        paymentIntentionSelected,
        user,
      } = this.state;
      return (
        <Fragment>
          <IonHeader>
            <div
              onClick={() => {
                this.setState({
                  mode: 'LIST_TICKETS_STATE',
                });
              }}
            >
              <IonIcon icon={arrowBack} />
            </div>
          </IonHeader>
          <IonContent>
            <div className="purchase-ticket-component">
              <PurchaseTicket data={this.state.ticketSelected} />
            </div>
            <div className="alert-component">
              <Alert
                type={this.getAlertCss(this.state.ticketSelectedState?.status)}
                text={
                  this.state.ticketSelectedState?.textAlert
                    ? this.state.ticketSelectedState?.textAlert
                    : ''
                }
                show={this.state.ticketSelectedState?.displayAlert}
              />
            </div>
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
                flow="SKY-COSTANERA"
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
                payment_intention_id={paymentIntentionSelected!.id}
                payment_date={paymentIntentionSelected!.created_at.toString()}
                user={user}
                metadata={{
                  mall_id: paymentIntentionSelected!.metadata
                    .facility_id as string,
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
                isDisabledOnboarding={true}
              >
                <div>
                  Cuéntanos cómo fue tu experiencia utilizando el servicio de
                  Escanea tu ticket.
                </div>
                <div>Te tomará menos de un minuto.</div>
              </CalificationModal>
            </>
            {!this.state.ticketSelectedState?.displayAlert &&
              this.state.ticketSelectedState?.status ===
                ETicketStatus.ACTIVE && (
                <div className="refund-ticket">
                  <IonButton
                    className="white-centered"
                    onClick={() => {
                      this.setState({ showConfirmRefundTicket: true });
                    }}
                  >
                    Solicitar reembolso
                  </IonButton>
                </div>
              )}
            {this.state.showConfirmRefundTicket && (
              <div className="select-tickets-21xyz">
                <EmptyModal
                  icon={alertCircleOutline}
                  height="420px"
                  okText="Solicitar"
                  title="Solicitar reembolso"
                  onOkClick={this.onRefundTicketHandler}
                  onClose={() => {
                    this.setState({ showConfirmRefundTicket: false });
                  }}
                >
                  <p>
                    ¿Estás seguro que deseas solicitar el reembolso? Al hacerlo,
                    tu ticket quedará anulado y nos pondremos en contacto
                    contigo mediante correo electrónico.
                  </p>
                </EmptyModal>
              </div>
            )}
          </IonContent>
        </Fragment>
      );
    };

    renderADD_EMAIL_STATE = () => {
      const { email, email_error, button_disabled } = this.state;

      return (
        <Fragment>
          <div className="refund-email-register">
            <IonHeader>
              <div
                onClick={() => {
                  this.setState({
                    mode: 'PURCHASE_TICKET_STATE',
                    showConfirmRefundTicket: true,
                  });
                }}
              >
                <IonIcon icon={arrowBack}></IonIcon>
              </div>
            </IonHeader>
            <IonContent className="email-insert">
              <div>
                <h1>Necesitamos que ingreses tu correo</h1>
                <p>Esto es necesario para poder contactarte</p>
              </div>
              <div>
                <IonIcon icon={mail}></IonIcon>
                <input
                  type="email"
                  value={email}
                  placeholder={email ? email : 'Correo electrónico'}
                  onChange={(e) => {
                    this.onInputChangeHandler(
                      'email',
                      e.currentTarget.value?.toString()!
                    );
                  }}
                ></input>
                {email_error ? (
                  <span className="error">Debes ingresar un correo válido</span>
                ) : null}
              </div>
            </IonContent>
            <IonFooter>
              <div className="pad-buttons">
                <IonButton
                  className="white-centered"
                  onClick={() => this.registerEmail()}
                  disabled={button_disabled}
                >
                  {this.state.loading ? '' : 'Continuar'}
                  {this.state.loading ? (
                    <IonIcon icon={loadingSpin}></IonIcon>
                  ) : (
                    ''
                  )}
                </IonButton>
              </div>
            </IonFooter>
          </div>
        </Fragment>
      );
    };

    renderREFUND_SUCESS_STATE = () => {
      const { email } = this.props.user as IUser;
      return (
        <Fragment>
          <IonContent className="refund-success">
            <div className="content">
              <div>
                <IonIcon icon={checkmarkCircleOutline} />
                <h1 className="font-bold">
                  ¡Todo listo!
                  <br />
                  Procesaremos el reembolso de tu ticket.
                </h1>
              </div>
              <div>
                <h3>
                  Nos comunicaremos contigo a la brevedad al correo{' '}
                  {this.state.email != '' ? this.state.email : email}
                </h3>
              </div>
              <div>
                <h3>
                  Si no lo visualizas, por favor encuéntralo en tu bandeja de
                  SPAM.
                </h3>
              </div>
            </div>
          </IonContent>
          <IonFooter>
            <div className="pad-buttons">
              <IonButton
                onClick={() => {
                  this.setState({ mode: 'END_FLOW_STATE' });
                }}
              >
                Finalizar
              </IonButton>
            </div>
          </IonFooter>
        </Fragment>
      );
    };

    renderEND_FLOW_STATE = () => {
      const textAlert = `La validez de este ticket expiró debido a que su reembolso fue solicitado ${moment().format(
        'DD'
      )} ${moment().format('MMM')} ${moment().format('YYYY')}.`;
      return (
        <Fragment>
          <IonHeader>
            <div
              onClick={() => {
                this.setState(
                  { mode: 'INITIAL_STATE', showConfirmRefundTicket: false },
                  this.loadData
                );
              }}
            >
              <IonIcon icon={arrowBack} />
            </div>
          </IonHeader>
          <IonContent>
            <div className="purchase-ticket-component">
              <PurchaseTicket data={this.state.ticketSelected} />
            </div>
            <div className="alert-component">
              <Alert type={'alert-expired'} text={textAlert} show={true} />
            </div>
          </IonContent>
        </Fragment>
      );
    };
  }
);
