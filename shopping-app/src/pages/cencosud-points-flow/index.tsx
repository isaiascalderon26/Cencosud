import React, { Fragment, useEffect, useState } from 'react';
import {
  IonButton,
  IonIcon,
  IonPage,
  IonRefresher,
  IonRefresherContent,
} from '@ionic/react';
import { RouteComponentProps } from 'react-router';
import axios, { AxiosError } from 'axios';
import moment from 'moment';
import lodash from 'lodash';
import { RefresherEventDetail } from '@ionic/core';
import { ellipsisHorizontalOutline } from 'ionicons/icons';

/**
 * Style
 */
import './index.less';
/**
 * Assets
 */
import BannerTitleImg from '../../assets/media/cencosud-points/banner-title.jpeg';
import LogoPointsImg from '../../assets/media/cencosud-points/logo-points.svg';
import iconMiMallPurple from '../../assets/media/icon-mimall-purple.svg';
import withoutExcchange from '../../assets/media/icons/withoutExcchange.svg';
import LogoInfo from '../../assets/media/info.svg';
import ImageCheckOk from '../../assets/media/icon-checked-white-bg.svg';
import ImageParking from '../../assets/media/parking.png';
import ImageRegister from '../../assets/media/cencosud-points/register.svg';
import ImageReview from '../../assets/media/cencosud-points/review.svg';
import ImageExchange from '../../assets/media/cencosud-points/exchange.svg';
/**
 * Components
 */
import BackdropLoading from '../../components/backdrop-loading';
import Page, { DefaultFooter, DefaultHeader } from '../../components/page';
import ErrorModal, { IErrorModalProps } from '../../components/error-modal';
import RutScreen from '../../components/rut-screen';
import Landing, { IData } from '../../components/landing';
import PartnerScore from './components/partner-score';
import TermsModal from '../../components/terms-condition';
import ExchangedItem from './components/exchanged-item';
import FormUser from './components/form-user';
import TabsButton from './components/tabs-button';
import ExchangedAvailable from './components/exchanged-available';
import Otp from '../../components/otp';
import ModalTermsExchange from './components/modal-terms-exchange';
import RegisterModal from '../../components/register_modal';
/**
 * Clients
 */
import AuthenticationClient, {
  getAuthFromCache,
} from '../../clients/AuthenticationClient';
import { IListParams } from '../../clients/RESTClient';
import UserClient from '../../clients/UserClient';
import CencosudPointsClient from '../../clients/CencosudPointsClient';
import PaymentIntentionClient from '../../clients/PaymentIntentionClient';
/**
 * Models
 */
import IInfoPartner from '../../models/cencosud-points/IInfoPartner';
import IPartner from '../../models/cencosud-points/IPartner';
import { IUser } from '../../models/users/IUser';
import IExchange, {
  IExchangeCategory,
} from '../../models/cencosud-points/IExchange';
import IPaymentIntention from '../../models/payments/IPaymentIntention';
/**
 * Libs
 */
import EurekaConsole from '../../lib/EurekaConsole';
import HeaderBackgroundImage from './components/header-background-image';
import ButtonStyle1 from './components/button-style-1';
import NumberFormatter from '../../lib/formatters/NumberFormatter';
import EventStreamer from '../../lib/EventStreamer';
import FirebaseAnalytics from '../../lib/FirebaseAnalytics';

type IMode =
  | 'LOADING'
  | 'HOME'
  | 'LANDING'
  | 'RUT'
  | 'REGISTER'
  | 'REGISTER_SUCCESS'
  | 'TERM_CONDITIONS'
  | 'CHANGES_AVAILABLE'
  | 'CHANGE_AVAILABLE_REVIEW'
  | 'OTP'
  | 'OTP_SUCCESS';

interface IProps extends RouteComponentProps<{}> {}

const ANIMATION_TIME = 200;
const eureka = EurekaConsole({ label: 'coupons-flow' });

enum ECategoriesKey {
  FOR_ME,
  AVAILABLE,
  TO_FINISH,
}

const CencosudPointsPage: React.FC<IProps> = (props) => {
  let intervalId: NodeJS.Timeout | undefined;
  const phoneNumberWhatsapp = '56968218443';
  const [mode, setMode] = useState<IMode>('LOADING');
  const [loadingMessage, setLoadingMessage] = useState<string>('Cargando ...');
  const [navHistory, setNavHistory] = useState<IMode[]>([]);
  const [error_modal, setStateErrorModal] = useState<IErrorModalProps>();

  const [infoPartner, setInfoPartner] = useState<IInfoPartner>();
  const [user, setUser] = useState<IUser>();
  const [termsAndConditions, setTermsAndConditions] = useState<string[]>([]);
  const [exchangeds, setExchangeds] = useState<IExchange[]>([]);
  const [processedExchanges, setProcessedExchanges] = useState<IExchange[]>([]);
  const [exchangedsStatic, setExchangedsStatic] = useState<IExchange[]>([]);
  const [exchangedSelected, setExchangedSelected] = useState<IExchange>();
  const [exchangedCategories, setExchangedCategories] = useState<
    IExchangeCategory[]
  >([
    { id: '1', key: ECategoriesKey.FOR_ME.toString(), name: 'Para mi' },
    { id: '2', key: ECategoriesKey.AVAILABLE.toString(), name: 'Disponibles' },
    { id: '3', key: ECategoriesKey.TO_FINISH.toString(), name: 'Por vencer' },
  ]);
  const [exchangedCategorySelected, setExchangedCategorySelected] =
    useState<IExchangeCategory>({
      id: '2',
      key: 'available',
      name: 'Disponibles',
    });
  const [userPartner, setUserPartner] = useState<IPartner>();
  const [urlOTP, setUrlOTP] = useState<string>();
  const [paymentIntentionId, setPaymentIntentionId] = useState<string>();
  const [modalTerms, setModalTerms] = useState<boolean>(false);
  const [datePartner, setDatePartner] = useState<{
    year: string;
    month: string;
    day: string;
  }>();
  const [isRegisterApp, setIsRegisterApp] = useState<boolean>(false);

  useEffect(() => {
    FirebaseAnalytics.customLogEvent('ionic_app', 'puntos_cencosud');
    console.info('ionic_app', 'puntos_cencosud');

    async function fetchData() {
      await fetchAll();
    }
    fetchData();
  }, []);

  const fetchAll = async (hiddenLoading?: boolean) => {
    try {
      if (!hiddenLoading) {
        setMode('LOADING');
        setLoadingMessage('Cargando...');
      }

      const [
        infoPartner,
        user,
        termsAndConditions,
        processedExchanges,
        exchangeds,
      ] = await Promise.all([
        fetchInfoPartner(),
        fetchUser(),
        fetchTermsAndConditions(),
        fetchExchangeds(),
        fetchExchange(),
      ]);
      setInfoPartner(infoPartner);
      setUser(user);
      setTermsAndConditions(termsAndConditions);
      setExchangeds(exchangeds);
      setExchangedsStatic(exchangeds);
      setProcessedExchanges(processedExchanges);

      if (
        infoPartner.is_registered &&
        !infoPartner.has_conflict_registry &&
        infoPartner.has_exchange_permission &&
        infoPartner.has_linked &&
        infoPartner.has_document_number &&
        !infoPartner.has_identity_validation
      ) {
        setMode('HOME');
      } else {
        setMode('LANDING');
      }
    } catch (error) {
      eureka.error('Unexpected error fetching all', error);

      setStateErrorModal({
        title: 'Hubo un problema',
        message: 'No pudimos cargar toda la información. ¿Deseas reintentar?',
        onRetry: () => {
          setStateErrorModal(undefined);
          setTimeout(async () => {
            await fetchAll();
          }, ANIMATION_TIME);
        },
        onCancel: () => {
          setStateErrorModal(undefined);
          setTimeout(() => {
            onbackHistory(true);
          }, ANIMATION_TIME);
        },
      });
    }
  };

  const fetchInfoPartner = async () => {
    const response = await CencosudPointsClient.getMeInfo();
    return response;
  };

  const selectExchanged = (exchanged: IExchange) => {
    setExchangedSelected(exchanged);
    setMode('CHANGE_AVAILABLE_REVIEW');
  };

  const selectExchangedCategory = (category: IExchangeCategory) => {
    setExchangedCategorySelected(category);
    switch (category.key) {
      case ECategoriesKey.FOR_ME.toString():
        const forMe = exchangeds.filter(
          (exchange) =>
            infoPartner?.points &&
            infoPartner.points >= exchange.exchange_amount.to
        );
        setExchangeds(forMe);
        break;
      case ECategoriesKey.TO_FINISH.toString():
        const now = new Date();
        const toFinish = exchangeds.filter(
          (exchange) =>
            exchange.validity != null &&
            exchange.validity.end_at != null &&
            moment(exchange.validity.end_at).isSameOrBefore(
              now.setDate(now.getDate() + 3)
            )
        );
        setExchangeds(toFinish);
        break;
      default:
        setExchangeds(exchangedsStatic);
        break;
    }
  };

  const fetchUser = async (): Promise<IUser> => {
    const user = await UserClient.me();
    return user;
  };

  const fetchTermsAndConditions = async (): Promise<string[]> => {
    const response = await CencosudPointsClient.getTermsAndConditions();
    return response;
  };

  const fetchExchangeds = async (): Promise<IExchange[]> => {
    const params: IListParams = {
      query: {
        'payment_method.details.user_id.keyword_is':
          AuthenticationClient.getInfo().primarysid,
      },
      limit: 5,
      sort: { created_at: 'desc' },
    };
    const response = await CencosudPointsClient.listExchanged(params);
    return response.data;
  };

  const fetchExchange = async (): Promise<IExchange[]> => {
    const params: IListParams = {
      query: {},
      limit: 100,
      sort: { created_at: 'desc' },
    };
    const response = await CencosudPointsClient.exchange(params);
    return response.data;
  };

  /**
   * all on functions
   */
  const onbackHistory = (navigate = true): void => {
    navHistory.pop();
    if (navigate) {
      if (!navHistory.length) {
        props.history.goBack();
        return;
      }
      setMode(navHistory[navHistory.length - 1]);
    }
  };

  const onCloseModalTermConditionsHandler = () => {
    setMode('LANDING');
  };

  const onHandlerAcceptTermsAndConditions = async (e: any) => {
    setLoadingMessage('Vinculando...');
    setMode('LOADING');
    try {
      await CencosudPointsClient.linkPartner();
      const infoPartner = await fetchInfoPartner();
      setInfoPartner(infoPartner);
      setMode('HOME');
    } catch (error) {
      setStateErrorModal({
        title: 'Hubo un problema',
        message: 'No pudimos guardar la información. ¿Deseas reintentar?',
        onRetry: () => {
          setStateErrorModal(undefined);
          setTimeout(async () => {
            onHandlerAcceptTermsAndConditions(e);
          }, ANIMATION_TIME);
        },
        onCancel: () => {
          setStateErrorModal(undefined);
          setTimeout(() => {
            onbackHistory(true);
          }, ANIMATION_TIME);
        },
      });
    }
  };

  const onHandlerAcceptTermsAndConditionsRegister = async (e: any) => {
    setMode('LOADING');

    try {
      let partner = { ...userPartner, tyc: true };
      eureka.info('create partenr', partner);
      await CencosudPointsClient.create(partner);

      let fieldsUpdate: Partial<IUser> = {
        full_name: `${partner.contact_first_name} ${partner.contact_last_name}`,
        phone: partner.phone,
        birthday: partner.contact_birth_date,
        email: partner.email,
      };
      //update date user
      await UserClient.updatePartial(fieldsUpdate);
      eureka.info('update user', fieldsUpdate);
      //linked partner
      await CencosudPointsClient.linkPartner();

      setMode('REGISTER_SUCCESS');
    } catch (error) {
      if ((error as AxiosError).response?.status === 400) {
        const errorResponse = (error as AxiosError).response?.data?.message;

        setStateErrorModal({
          title: 'Hubo un problema',
          message: `${errorResponse}`,
          retryMessage: 'Volver al Registro',
          onRetry: () => {
            setStateErrorModal(undefined);
            setTimeout(async () => {
              setMode('REGISTER');
            }, ANIMATION_TIME);
          },
          onCancel: () => {
            setStateErrorModal(undefined);
            setTimeout(() => {
              setMode('REGISTER');
            }, ANIMATION_TIME);
          },
        });
        return;
      } else {
        setStateErrorModal({
          title: 'Hubo un problema',
          message: 'No pudimos guardar la información. ¿Deseas reintentar?',
          onRetry: () => {
            setStateErrorModal(undefined);
            setTimeout(async () => {
              onHandlerAcceptTermsAndConditionsRegister(e);
            }, ANIMATION_TIME);
          },
          onCancel: () => {
            setStateErrorModal(undefined);
            setTimeout(() => {
              setMode('REGISTER');
            }, ANIMATION_TIME);
          },
        });
      }
    }
  };

  const onDataModal = () => {
    let strings: IData[] = [];
    strings.push({
      image: ImageRegister,
      title: 'Regístrate o vincula tu cuenta Puntos Cencosud',
      description: 'Ingresa con tu rut, o regístrate completando tus datos.',
    });
    strings.push({
      image: ImageReview,
      title: 'Revisa los abonos de parking que tenemos disponibles para ti',
      description:
        'Entérate acerca de los canjes exclusivos Mi Mall para usar en el servicio de parking.',
    });
    strings.push({
      image: ImageExchange,
      title: 'Canjea tus puntos y disfruta',
      description:
        'Selecciona el canje de tu preferencia, confírmalo y ya podrás usar tu abono en Escanea tu ticket o Registra tu patente cuando prefieras.',
    });

    return strings;
  };

  const onLoginClickHandler = async () => {
    await AuthenticationClient.signOut();
    window.location.reload();
  };

  const checkStatus = async (id: string) => {
    intervalId = setInterval(async () => {
      try {
        const response = await PaymentIntentionClient.getStatus(id);
        eureka.log('checkStatus', response);

        if (response.status === 'IN_PROGRESS') {
          //status send OTP
          if (
            lodash.get(response, 'outcome.result.cencosudpoints_status') ===
            'USER_AUTHORIZATION_REQUIRED'
          ) {
            const url = lodash.get(
              response,
              'outcome.result.cencosudpoints_authorize_url'
            );
            setUrlOTP(url);
            setMode('OTP');
            setPaymentIntentionId(id);
            intervalId && clearInterval(intervalId);
          }
          return;
        }

        if (response.status === 'SUCCESS') {
          setMode('OTP_SUCCESS');
        } else {
          eureka.info('not success');
          setStateErrorModal({
            title: 'Hubo un problema',
            message: 'No se pudo realizar el canje. ¿Deseas reintentar?',
            onRetry: () => {
              onExecutePaymentIntention();
              setStateErrorModal(undefined);
            },
            onCancel: () => {
              setStateErrorModal(undefined);
            },
          });
        }

        intervalId && clearInterval(intervalId);
      } catch (error) {
        eureka.error(
          'An error has ocurred trying to check payment status',
          error
        );
        eureka.error((error as Error).message, error);

        // clear interval
        intervalId && clearInterval(intervalId);
        // start again
        checkStatus(id);
      }
    }, 3000);
  };

  const checkStatusOTP = async (id: string) => {
    intervalId = setInterval(async () => {
      try {
        const response = await PaymentIntentionClient.getStatus(id);

        if (response.status === 'IN_PROGRESS') {
          return;
        }

        if (response.status === 'SUCCESS') {
          setMode('OTP_SUCCESS');
        } else {
          eureka.info('not success');
          setStateErrorModal({
            title: 'Hubo un problema',
            message: 'No se pudo realizar el canje. ¿Deseas reintentar?',
            onRetry: () => {
              checkStatusOTP(id);
              setStateErrorModal(undefined);
            },
            onCancel: () => {
              setStateErrorModal(undefined);
              setMode('CHANGE_AVAILABLE_REVIEW');
            },
          });
        }

        intervalId && clearInterval(intervalId);
      } catch (error) {
        eureka.error(
          'An error has ocurred trying to check payment status',
          error
        );
        eureka.error((error as Error).message, error);

        // clear interval
        intervalId && clearInterval(intervalId);
        // start again
        checkStatus(id);
      }
    }, 3000);
  };

  const onExecutePaymentIntention = async () => {
    try {
      const created = await PaymentIntentionClient.create({
        payment_flow: 'AUTOBAGS',
        payer: {
          email: user!.email,
          full_name: user!.full_name,
          document_type: 'RUT',
          document_number: user!.document_number?.replaceAll('-', ''),
          country: 'Chile',
        },
        payment_method: {
          kind: 'PTS_CENCO',
          details: {
            card_token: '-',
            card_type: '-',
            user_id: user!.primarysid,
          },
        },
        transaction: {
          amount: {
            total: exchangedSelected?.exchange_amount.from,
            subtotal: exchangedSelected?.exchange_amount.from,
            tax: 0,
          },
          line_items: [
            {
              id: 1,
              description: 'Auto Bags',
              quantity: 1,
              price: exchangedSelected?.exchange_amount.from,
            },
          ],
        },
        metadata: {
          exchange: {
            ...exchangedSelected,
          },
        },
      } as unknown as IPaymentIntention);

      eureka.info('paymentIntention', created);
      //start check
      checkStatus(created.id);
    } catch (error) {
      eureka.error(
        'An error has ocurred trying execute a paymentIntention',
        error
      );
    }
  };

  const onGenerateCode = async () => {
    await onExecutePaymentIntention();
  };

  const onValidOtp = async (code: string): Promise<void> => {
    eureka.info('code', code);
    setLoadingMessage('Validando');
    setMode('LOADING');
    try {
      const auth = await getAuthFromCache();
      const jwt = auth.user;

      const response = await axios.post(
        urlOTP!,
        { code },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `${jwt.token_type.toLowerCase()} ${
              jwt.access_token
            }`,
          },
        }
      );
      eureka.info('response post', response);
      // Verificar el estado de la respuesta antes de continuar
      if (response && response.status === 200) {
        await checkStatusOTP(paymentIntentionId!);
      } else {
        // Manejar caso de respuesta no exitosa
        console.error('La solicitud no tuvo éxito. Respuesta:', response);
      }
    } catch (error) {
      // Manejar errores Axios
      if (axios.isAxiosError(error)) {
        // Acceder a las propiedades específicas de AxiosError
        console.error('Respuesta de error del servidor:', error.response?.data);
      } else {
        // Otros tipos de errores
        console.error('Error desconocido:', error);
      }
    } finally {
      // Restablecer el estado independientemente del resultado
      setLoadingMessage(''); // Puedes proporcionar un mensaje vacío o reiniciar a un valor predeterminado
      setMode('OTP_SUCCESS'); // Ajusta el modo deseado después de la validación del OTP
    }
  };

  const onListExchanges = (exchanges: IExchange[]): IExchange[] => {
    const fixedExchange: IExchange = {
      id: 'awjlhjwppiqepoiqop',
      exchange_method: 'AUTOBAGS',
      exchange_amount: {
        from: 0,
        to: 0,
      },
      content: {
        title: '',
        subtitle: '',
        image: '',
        description: '',
        html_terms: '',
      },
      tags: [],
      metadata: {
        type: 'BANNER',
      },
      created_at: new Date(),
      updated_at: new Date(),
      validity: {
        start_at: new Date(),
        end_at: new Date(),
      },
    };

    let listExchanges = exchanges;
    const exchangesLength = listExchanges.length;
    const exchangesArrayObject: IExchange[] = [];

    if (exchangesLength === 0) {
      return [];
    } else if (exchangesLength === 1) {
      exchangesArrayObject.push(listExchanges[0]);
      exchangesArrayObject.push(fixedExchange);
    } else if (exchangesLength === 2) {
      exchangesArrayObject.push(listExchanges[0]);
      exchangesArrayObject.push(fixedExchange);
      exchangesArrayObject.push(listExchanges[1]);
    } else {
      exchangesArrayObject.push(listExchanges[0]);
      exchangesArrayObject.push(listExchanges[1]);
      exchangesArrayObject.push(fixedExchange);

      listExchanges.map((exchange: IExchange, i: number) => {
        if (i > 1) {
          exchangesArrayObject.push(exchange);
        }
      });
    }

    return exchangesArrayObject;
  };

  const onRefreshHandler = async (event: CustomEvent<RefresherEventDetail>) => {
    try {
      await fetchAll(true);
    } catch (error) {
      eureka.error(
        'An error has occurred trying to refresh cencosud points',
        error
      );
      eureka.debug((error as Error).message);
    } finally {
      event.detail.complete();
    }
  };

  /**
   * Loading Render
   */
  const renderLOADING = () => {
    return (
      <Fragment>
        <BackdropLoading message={loadingMessage!} />
      </Fragment>
    );
  };

  /**
   * Home Render
   */
  const renderHOME = () => {
    const exchanges = onListExchanges(processedExchanges);

    const header = <DefaultHeader onBack={() => onbackHistory(true)} />;
    const content = (
      <>
        <IonRefresher
          slot="fixed"
          pullFactor={1}
          pullMin={100}
          pullMax={200}
          onIonRefresh={onRefreshHandler}
        >
          <IonRefresherContent
            pullingIcon={ellipsisHorizontalOutline}
            refreshingSpinner="dots"
          ></IonRefresherContent>
        </IonRefresher>
        <div className="body-home">
          <div className="body-home-content">
            <div className="home-header">
              <h2 className="title">Estado de cuenta</h2>
              <h3 className="subtitle">
                {user?.full_name}, este es el detalle de tus puntos
              </h3>
              <PartnerScore points={infoPartner?.points ?? 0} />
            </div>
            <div className="home-body">
              {exchanges.length ? (
                exchanges.map((exchanged: IExchange, i: number) => {
                  if (exchanged?.metadata?.type === 'BANNER') {
                    return (
                      <div
                        className="exchange-banner"
                        style={{
                          backgroundImage: `url(${process.env.REACT_APP_BUCKET_URL}/banner_exchange.png)`,
                        }}
                        onClick={() => {
                          EventStreamer.emit('NAVIGATE_TO', `/coupon`);
                        }}
                      ></div>
                    );
                  }
                  return (
                    <ExchangedItem
                      key={`${exchanged.id}-${i.toString()}`}
                      exchanged={exchanged}
                    />
                  );
                })
              ) : (
                <div className="home-without-excchange">
                  <br />
                  <img src={withoutExcchange} alt="" />
                  <br />
                  <b>Aún no tienes canjes</b>
                  <br />
                  <div>
                    Aquí aparecerá tu historial de canjes en Puntos Cencosud.
                    Por el momento aún no haz canjeado ninguno producto y/o
                    servicio.
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </>
    );

    return (
      <Page
        header={header}
        content={content}
        footer={
          <DefaultFooter
            mainActionText="Canjes Disponibles"
            onClickMainAction={() => {
              setMode('LOADING');
              setTimeout(() => {
                setMode('CHANGES_AVAILABLE');
              }, 300);
            }}
          />
        }
      />
    );
  };

  /**
   * Landing Render
   */

  const renderLANDING = () => {
    // text is encode html format
    const text = `
        &lt;p&gt;Ya puedes canjear tus Puntos Cencosud por abonos para usar en parking de nuestros centros comerciales, a través de Escanea tu ticket o Registra tu patente.&lt;/p&gt;&lt;br /&gt;
        &lt;p&gt;Comienza a disfrutar de estos canjes, vinculando tu cuenta Puntos Cencosud con tu rut o regístrate ingresando los datos solicitados.&lt;/p&gt;&lt;br /&gt;
        &lt;p&gt;Sigue los pasos y comienza a canjear.&lt;/p&gt;`;

    const textContinue =
      !infoPartner!.is_registered &&
      !infoPartner!.has_conflict_registry &&
      !infoPartner!.has_identity_validation
        ? 'Crear Cuenta'
        : 'Vincular Cuenta';

    return (
      <Fragment>
        <Landing
          imageTitle={BannerTitleImg}
          imageUnder={LogoPointsImg}
          title={'Puntos Cencosud'}
          textBody={text}
          onBack={() => {
            onbackHistory(true);
          }}
          onContinue={() => {
            if (user?.email === 'invited') {
              setIsRegisterApp(true);
              return;
            }
            if (
              !infoPartner!.is_registered &&
              !infoPartner!.has_conflict_registry &&
              !infoPartner!.has_identity_validation
            ) {
              //no esta registrado y no tiene conflicto de registro
              if (!user?.document_number) {
                setMode('RUT');
              } else {
                setMode('REGISTER');
              }
            }
            if (
              (infoPartner!.is_registered &&
                !infoPartner!.has_exchange_permission) ||
              infoPartner?.has_conflict_registry
            ) {
              //si esta registrado ,pero no tiene permiso de canje mostrar boton whatsapp y llamar
              setStateErrorModal({
                title: 'Termina de validar tus datos',
                displayButtonClose: false,
                onCancel: () => {
                  setStateErrorModal(undefined);
                },
                cssClass: 'modal-error-landing-xvcfr',
                content: (
                  <div className="modal-error-content">
                    <p className="message">
                      Para finalizar tu proceso de inscripción, escribenos al
                      WhatsApp +56 9 6821 8443 o llámanos al 600 360 4000 y
                      comenzarás a canjear.
                    </p>
                    <div className="modal-error-content-buttons">
                      <div className="modal-error-content-buttons-item">
                        <IonButton
                          onClick={() => {
                            const whatsappUrl = `https://api.whatsapp.com/send?phone=${phoneNumberWhatsapp}`;
                            window.open(whatsappUrl, '_blank');
                          }}
                        >
                          Escribir al WhatsApp
                        </IonButton>
                        <IonButton
                          onClick={() => {
                            const phoneNumber = '6003604000';
                            window.open(`tel:${phoneNumber}`, '_blank');
                          }}
                          className="button-call"
                        >
                          Llamar
                        </IonButton>
                      </div>
                    </div>
                  </div>
                ),
              });
            }
            if (
              !infoPartner?.has_conflict_registry &&
              infoPartner?.has_identity_validation
            ) {
              //mostrar boton ir a la web y llamar
              setStateErrorModal({
                title: 'Termina de validar tus datos',
                displayButtonClose: false,
                onCancel: () => {
                  setStateErrorModal(undefined);
                },
                cssClass: 'modal-error-landing-xvcfr',
                content: (
                  <div className="modal-error-content">
                    <p className="message">
                      Para finalizar tu proceso de inscripción, ingresa a{' '}
                      <strong>https://www.puntoscencosud.cl/puntos/</strong>o
                      escribenos al WhatsApp +56 9 6821 8443 o llámanos al 600
                      360 4000 y comenzarás a canjear
                    </p>
                    <div className="modal-error-content-buttons">
                      <div className="modal-error-content-buttons-item">
                        <IonButton
                          onClick={() => {
                            window.open(
                              'https://www.puntoscencosud.cl/puntos/',
                              '_blank'
                            );
                          }}
                        >
                          Ir a la web
                        </IonButton>
                        <IonButton
                          onClick={() => {
                            const whatsappUrl = `https://api.whatsapp.com/send?phone=${phoneNumberWhatsapp}`;
                            window.open(whatsappUrl, '_blank');
                          }}
                        >
                          Escribir al WhatsApp
                        </IonButton>
                      </div>
                    </div>
                  </div>
                ),
              });
            }
            if (
              infoPartner!.is_registered &&
              infoPartner!.has_exchange_permission &&
              !infoPartner!.has_linked &&
              !infoPartner?.has_identity_validation
            ) {
              //esta registrado y tiene permiso de canje y no tiene vinculado
              setMode('TERM_CONDITIONS');
            }
          }}
          textContinue={textContinue}
          onBoarding={onDataModal()}
          cssClass="landing-cencosud-points"
        />

        {isRegisterApp && (
          <RegisterModal
            type="NEW"
            userInfo={user}
            onClose={() => {
              setIsRegisterApp(false);
            }}
            onClick={() => {
              onLoginClickHandler();
            }}
          />
        )}
      </Fragment>
    );
  };

  /**
   * terms and conditions
   */
  const renderTERM_CONDITIONS = () => {
    const content = (
      <TermsModal
        termsAndConditionsDescription={termsAndConditions}
        onClose={onCloseModalTermConditionsHandler}
        onAction={(e) => {
          infoPartner?.is_registered
            ? onHandlerAcceptTermsAndConditions(e)
            : onHandlerAcceptTermsAndConditionsRegister(e);
        }}
      />
    );
    return <Page content={content} />;
  };

  /**
   * Rut Render
   */

  const renderRUT = () => {
    return (
      <RutScreen
        title={'Necesitamos que ingreses tu RUT'}
        subtitle={'Esto es necesario para seguir con el proceso'}
        onBack={() => {
          setMode('LANDING');
        }}
        onContinue={async () => {
          const infoPartner = await fetchInfoPartner();
          setInfoPartner(infoPartner);
          if (infoPartner.is_registered) {
            setMode('TERM_CONDITIONS');
            return;
          }
          setMode('REGISTER');
        }}
        onValue={(rut: string) => {
          eureka.info('Update rut', rut);
          setUser({ ...user!, document_number: rut });
        }}
      />
    );
  };

  /**
   * Home Render
   */
  const renderREGISTER = () => {
    const userData = !userPartner
      ? user
      : ({
          ...user,
          full_name: userPartner?.contact_first_name,
          phone: userPartner?.phone,
          meta_data: {
            lastname: userPartner?.contact_last_name,
            year: datePartner?.year,
            month: datePartner?.month,
            day: datePartner?.day,
          },
        } as IUser);

    return (
      <FormUser
        user={userData}
        onBack={() => {
          if (user?.document_number) {
            setMode('LANDING');
            return;
          }
          setMode('RUT');
        }}
        onContinue={() => {
          setMode('TERM_CONDITIONS');
        }}
        onData={async (data) => {
          const userPartner = {
            contact_birth_date: moment(
              `${data.year.value}${data.month.value}${data.day.value}`,
              'YYYYMMDD'
            ).toDate(),
            contact_first_name: data.firstname.value,
            contact_last_name: data.lastname.value,
            contact_person_uid: data.document_number.value,
            email: data.email.value,
            phone: data.phone.value,
          } as IPartner;

          setUserPartner(userPartner);
          setDatePartner({
            year: data.year.value,
            month: data.month.value,
            day: data.day.value,
          });
        }}
      />
    );
  };

  /**
   * Register in cencosud points success
   */
  const renderREGISTER_SUCCESS = () => {
    const content = (
      <div className="body-home-register">
        <div className="body-home-content">
          <div className="home-header">
            <div className="icon-check-ok">
              <img src={ImageCheckOk} alt="icon-check" />
            </div>
            <h2 className="title">Registro finalizado</h2>
            <h3 className="subtitle">
              <p>Te has registrado satisfactoriamente en puntos Cencosud.</p>
              <p className="text">
                Pronto validaremos tus datos ingresados y podrás disfrutar de
                los beneficios de Puntos Cencosud.
              </p>
            </h3>
          </div>
        </div>
      </div>
    );

    const footer = (
      <DefaultFooter
        mainActionText="Finalizar"
        onClickMainAction={async () => {
          setMode('LOADING');
          const infoPartner = (await fetchInfoPartner()) as IInfoPartner;
          setInfoPartner(infoPartner);
          if (
            infoPartner.is_registered &&
            infoPartner.has_exchange_permission &&
            !infoPartner.has_identity_validation
          ) {
            setMode('HOME');
            return;
          }

          setMode('LANDING');
        }}
      />
    );

    return <Page content={content} footer={footer} />;
  };

  /**
   * Changes available
   */
  const renderCHANGES_AVAILABLE = () => {
    const header = (
      <DefaultHeader
        onBack={() => {
          setMode('HOME');
        }}
      />
    );

    if (!exchangedCategorySelected && exchangedCategories.length > 0) {
      setExchangedCategorySelected(exchangedCategories[0]);
    }

    const content = (
      <div className="body-home">
        <div className="body-home-content">
          <div className="home-header">
            <h2 className="title">Canjes disponibles</h2>
            <h3 className="subtitle">Tenemos la mejor selección para ti:</h3>
          </div>
          <TabsButton
            categories={exchangedCategories}
            selected={exchangedCategorySelected}
            select={selectExchangedCategory}
          />
          <ExchangedAvailable
            selectExchanged={selectExchanged}
            exchanges={exchangeds}
          />
        </div>
      </div>
    );

    return <Page header={header} content={content} />;
  };

  /**
   * Change available review
   */
  const renderCHANGE_AVAILABLE_REVIEW = () => {
    const points = infoPartner?.points ? infoPartner?.points : 0;
    const buttonActivated =
      points < exchangedSelected!.exchange_amount.from ? true : false;
    const header = (
      <div>
        <HeaderBackgroundImage
          background_image={exchangedSelected?.content.image!}
          background_height={232}
          onBack={() => setMode('CHANGES_AVAILABLE')}
        />
      </div>
    );

    const content = (
      <div className="content-change-available-review">
        <div className="title">{`${exchangedSelected?.content.title}`}</div>
        <div className="subtitle">{exchangedSelected?.content.subtitle}</div>
        <div className="points">
          {NumberFormatter.toNumber(exchangedSelected?.exchange_amount.from!)}{' '}
          <span></span> <IonIcon icon={iconMiMallPurple} />
        </div>
        <div className="description">
          {exchangedSelected?.content.description}
        </div>
        {exchangedSelected?.content.html_terms && (
          <>
            <ButtonStyle1
              text="Revisa las condiciones del canje"
              icon={LogoInfo}
              action={() => {
                setModalTerms(true);
              }}
            />
            <ModalTermsExchange
              title="Cupones y descuentos"
              subtitle="Condiciones de uso"
              content={exchangedSelected!.content.html_terms}
              isOpen={modalTerms}
              onClose={() => {
                setModalTerms(false);
              }}
            />
          </>
        )}
      </div>
    );

    const footer = (
      <DefaultFooter
        mainActionText="Canjear"
        onClickMainAction={async () => {
          setMode('LOADING');
          setLoadingMessage('Cargando...');
          await onGenerateCode();
        }}
        mainActionIsDisabled={buttonActivated}
      />
    );

    return <Page header={header} content={content} footer={footer} />;
  };

  /**
   * Render Otp
   */
  const renderOTP = () => {
    return (
      <Otp
        onBack={() => {
          setMode('CHANGES_AVAILABLE');
        }}
        footerText={'Válidar código'}
        onContinue={(code) => {
          onValidOtp(code);
        }}
        titleText={'Valida el ingreso con el código de seguridad'}
        subtitleText={
          'Ingresa el código que te enviamos a tu número de celular asociado a tu cuenta de Puntos Cencosud'
        }
        txtResend={'¿Tienes problemas con tu código?'}
        onResend={() => {
          onGenerateCode();
        }}
        txtResendAction={'Solicitar un nuevo código'}
        onkeyUp={() => {}}
      />
    );
  };

  /**
   * Render Otp Success
   */
  const renderOTP_SUCCESS = () => {
    const flows = ['AUTOPASS', 'AUTOSCAN'];
    const arrFlows = exchangedSelected!.tags;
    const isFlow = arrFlows.every((value: string) => {
      return flows.includes(value);
    });

    const content = (
      <div className="body-success-otp">
        <div className="body-success-content">
          <div className="otp-success-header">
            <div className="icon-check-ok">
              <img src={ImageCheckOk} alt="icon-check" />
            </div>
            <h2 className="title">¡Todo listo, {user?.full_name}!</h2>
            <h3 className="subtitle">
              <p>
                Tus puntos fueron canjeados. Puedes revisar tus canjes en el
                estado de cuenta en el módulo de Puntos Cencosud en tu perfil de
                la App.
              </p>
            </h3>
          </div>
          {isFlow && (
            <div className="icon-flow">
              <img src={ImageParking} alt="icon" />
              <h1 className="text-flow-title">Parking</h1>
            </div>
          )}
        </div>
      </div>
    );

    const footer = (
      <DefaultFooter
        mainActionText="Ver estado de cuenta"
        onClickMainAction={async () => {
          await fetchAll();
        }}
      />
    );

    return <Page content={content} footer={footer} />;
  };

  const renders: Record<typeof mode, () => JSX.Element> = {
    LOADING: renderLOADING,
    HOME: renderHOME,
    LANDING: renderLANDING,
    RUT: renderRUT,
    REGISTER: renderREGISTER,
    REGISTER_SUCCESS: renderREGISTER_SUCCESS,
    TERM_CONDITIONS: renderTERM_CONDITIONS,
    CHANGES_AVAILABLE: renderCHANGES_AVAILABLE,
    CHANGE_AVAILABLE_REVIEW: renderCHANGE_AVAILABLE_REVIEW,
    OTP: renderOTP,
    OTP_SUCCESS: renderOTP_SUCCESS,
  };

  /**
   * Main Render
   */
  const render = (mode: IMode) => {
    return (
      <IonPage
        className={`cencosud-points-flow ${mode
          .replaceAll('_', '-')
          .toLocaleLowerCase()}`}
      >
        {(() => {
          const customRender = renders[mode];
          if (!customRender) {
            return <div>{mode}</div>;
          }
          return customRender();
        })()}
        {error_modal && (
          <ErrorModal
            cssClass={error_modal.cssClass}
            icon={error_modal.icon}
            title={error_modal.title}
            message={error_modal.message}
            content={error_modal.content}
            cancelMessage={error_modal.cancelMessage}
            retryMessage={error_modal.retryMessage}
            onRetry={error_modal.onRetry}
            onCancel={error_modal.onCancel}
            displayButtonClose={error_modal.displayButtonClose}
          />
        )}
      </IonPage>
    );
  };

  return render(mode);
};

export default CencosudPointsPage;
