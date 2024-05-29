import React, { Fragment } from 'react';
import './index.less';
import { IonButton, IonContent, IonFooter, IonHeader, IonIcon, IonItem, IonList } from '@ionic/react';
import i18n from '../../lib/i18n';
import locales from './locales';
import { arrowBack, checkmarkCircleOutline, chevronForward } from 'ionicons/icons';
import { IUser } from '../../models/users/IUser';
import UserClient from '../../clients/UserClient';
import DniFormatter from '../../lib/formatters/DniFormatter';
import BackdropLoading from '../backdrop-loading';
import { RouteComponentProps, withRouter } from 'react-router';
import ErrorModal from '../error-modal';
import SettingsClient from '../../clients/SettingsClient';
import EurekaConsole from '../../lib/EurekaConsole';
import AuthenticationClient from '../../clients/AuthenticationClient';
import RutScreen from '../rut-screen';
import RemoteConfigClient from '../../clients/RemoteConfigClient';

const localize = i18n(locales);
const documentNumberMinLength = 7;
const phoneNumberMinLength = 9;
const fullNameMinLength = 3; // considering luz, ana, and so on
const validPhoneNumberFormat = /^(\+\d{2})*\d{9}$/;
const eureka = EurekaConsole({ label: "event-client" });

interface IProps extends RouteComponentProps {
  onClose: (action: "close") => void;
}

interface IState {
  mode: "INITIAL_STATE" | "PAGE_LOADED" | "EDIT_NAME" | "EDIT_RUT" | "EDIT_PHONE" | "SAVING" | "SAVED",
  full_name?: string,
  document_number?: string,
  phone?: string,
  loading: boolean
  isValidStatesInputs: {
    document_number: boolean,
    full_name: boolean,
    phone: boolean,
  }
  user?: IUser,
  allow_user_delete_account: boolean
  error_modal?: { title: string, message: string, retryMessage?: string, cancelMessage?: string, onRetry?: () => void, onCancel?: () => void }
}

export default withRouter(class ProfileDetail extends React.Component<IProps, IState> {
  _isMounted = false;
  state: IState = {
    mode: "INITIAL_STATE",
    loading: false,
    isValidStatesInputs: {
      full_name: true,
      document_number: false,
      phone: false,
    },
    allow_user_delete_account: false
  }

  componentDidMount = async () => {
    await this.getUserData();  
  }

  onCloseModalHandler = async () => {
    this.props.onClose("close");
  }

  getUserData = async () => {

    const [user, allow_user_delete_account] = await Promise.all([UserClient.me(), RemoteConfigClient.getBoolean('ALLOW_USER_DELETE_ACCOUNT', false)]);
    this.setState({
      user,
      allow_user_delete_account,
      full_name: user.full_name,
      document_number : user.document_number,
      phone: user.phone,
      mode: 'PAGE_LOADED',
      isValidStatesInputs: {
        full_name: true,
        document_number: false,
        phone: false
      }
    });
  }
  getChangeType = ():string => {
    const isValids = Object.assign(this.state.isValidStatesInputs, {});
    if (isValids.document_number) {
      return localize('RUT');
    }

    if (isValids.phone) {
      return localize('PHONE');
    }

    return localize('NAME');
  };

  onInputChangeHandler = async (name: keyof IState, value: any) => {
    // Validate according to the field
    const isValids = Object.assign(this.state.isValidStatesInputs, {});

    if(value !== undefined) {
      switch (name) {
        case "full_name":
          isValids.full_name = (value)
          break;
        case "phone":
          isValids.phone = validPhoneNumberFormat.test(value);
          break;
        default:
          isValids.full_name = value.length >= fullNameMinLength;
      }
    }

    const newState: any = {
      isValidStatesInputs: isValids
    };
    newState[name] = value;

    this.setState(newState)
  }
  onChangePostHandler = async (name: keyof IState, value: string ) => {

    try {
      this.setState({mode: 'SAVING'})
      const response = await UserClient.update(name, value)
      const user = await UserClient.me();
      setTimeout(() => {
        this.setState({mode: 'SAVED', user})
      }, 400);
    } catch (error) {
      console.log(error);
    }
  }

  startDeleteUser = async () => {
    const showErrorModal = () => {
      this.setState({
        error_modal: {
          title: "Hubo un problema",
          message: "No pudimos registrar tu tarjeta. ¿Deseas reintentar?",
          onRetry: () => {
            this.setState({ error_modal: undefined });

            //start again card registration
            setTimeout(() => {
              this.startDeleteUser();
            }, 1000);
          },
          onCancel: () => {
            this.setState({ error_modal: undefined, mode: "PAGE_LOADED" })
          }
        }
      });
    }

    try {
      await UserClient.delete();
      await AuthenticationClient.signOut();
      window.location.reload();
    } catch (error) {
      eureka.error('An error has ocurred starting card registration', error);
      showErrorModal();
    }
  }

  onShowConfirmationModal = () => {
    this.setState({
      error_modal: {
        title: "¿Quieres eliminar tu cuenta?",
        message: "Esta acción eliminará tu cuenta de usuario y tus datos personales",
        onRetry: () => {
          this.setState({ error_modal: undefined });

          //start again card registration
          setTimeout(() => {
            this.startDeleteUser();
          }, 1000);
        },
        retryMessage: 'Eliminar cuenta',
        onCancel: () => {
          this.setState({ error_modal: undefined, mode: "PAGE_LOADED" })
        },
        cancelMessage: 'Volver al inicio'
      }
    });
  }

  render() {
    const { mode } = this.state;
    return <Fragment>
      {(() => {
        const customRender: Function = (this as any)[`render${mode}`];
        if (!customRender) {
          return <div>{mode}</div>;
        }
        return customRender();
      })()}
    </Fragment>
  }
  renderINITIAL_STATE = () => {
    return (
      <Fragment>
        <BackdropLoading message='Cargando...'></BackdropLoading>
      </Fragment>
    )
  }
  renderPAGE_LOADED = () => {
    const { user, allow_user_delete_account, error_modal } = this.state
    return (
    <Fragment>
      <IonHeader>
        <div onClick={() => this.onCloseModalHandler()}>
          <IonIcon icon={arrowBack}></IonIcon>
        </div>
      </IonHeader>
      <IonContent className='initial-state'>
        <div>
          <img src={user!.avatar}></img>
          <h1>{user!.full_name}</h1>
          <p>{user!.email}</p>
        </div>
        <div>
          <p>{localize('EDIT_PROFILE')}</p>
        </div>
        <div>
          <IonList>
            <IonItem onClick={() => this.setState({mode: 'EDIT_NAME'})}>
              <div>
                <p>{localize('EDIT_NAME')}</p>
                <IonIcon icon={chevronForward}></IonIcon>
              </div>
            </IonItem>
            <IonItem onClick={() => this.setState({mode: 'EDIT_RUT'})}>
              <div>
                <p>{localize('EDIT_RUT')}</p>
                <IonIcon icon={chevronForward}></IonIcon>
              </div>
            </IonItem>
            <IonItem onClick={() => this.setState({mode: 'EDIT_PHONE'})}>
              <div>
                <p>{localize('EDIT_PHONE')}</p>
                <IonIcon icon={chevronForward}></IonIcon>
              </div>
            </IonItem>
            {allow_user_delete_account && <IonItem onClick={this.onShowConfirmationModal}>
              <div>
                <p>Eliminar cuenta</p>
                <IonIcon icon={chevronForward}></IonIcon>
              </div>
            </IonItem>}
          </IonList>
        </div>
      </IonContent>
      {error_modal && <ErrorModal title={error_modal.title} message={error_modal.message} cancelMessage={error_modal.cancelMessage} retryMessage={error_modal.retryMessage} onRetry={error_modal.onRetry} onCancel={error_modal.onCancel} />}
    </Fragment>
    )
  }
  renderEDIT_NAME = () => {
    return (<Fragment>
      <IonHeader>
        <div onClick={() => this.getUserData()}>
          <IonIcon icon={arrowBack}></IonIcon>
        </div>
      </IonHeader>
        <IonContent className='edit-name'>
          <div>
            <h1>{localize('NAME_TITLE')}</h1>
            <p>{localize('NAME_DESCRIPTION')}</p>
          </div>
          <div>
            <input value={this.state.full_name} placeholder={'Nombre'} onChange={e => {this.onInputChangeHandler('full_name', e.currentTarget.value)}}></input>
          </div>
        </IonContent>
        <IonFooter>
          <div className='pad-buttons'>
            <IonButton disabled={this.state.full_name!.length < 3} className='white-centered' onClick={() => {this.onChangePostHandler('full_name', this.state.full_name!)}}>
              Continuar
            </IonButton>
          </div>
        </IonFooter>
      </Fragment>
    )
  }
  renderEDIT_RUT = () => {
    return (
      <Fragment>
          <RutScreen
              title={'Necesitamos que ingreses tu RUT'}
              subtitle={'Esto es necesario para seguir con el proceso'}
              onBack={() => { this.getUserData() }}
              onContinue={() => {
                  this.setState({ mode: 'SAVED' });              
              }}
              onValue={(rut: string) => {
                  eureka.info("Update rut", rut)
                  this.setState((prev: any) => ({ ...prev, user: { ...prev.user, document_number: rut } }));
                  this.setState((prev: any) => ({ ...prev, isValidStatesInputs: { ...prev.isValidStatesInputs, document_number: true } }));
              }}
              valueDefault={this.state.document_number}
          />
      </Fragment>
  )
  }
  renderEDIT_PHONE = () => {
    const { isValidStatesInputs, phone = "" } = this.state
    return (<Fragment>
      <IonHeader>
        <div onClick={() => this.getUserData()}>
          <IonIcon icon={arrowBack}></IonIcon>
        </div>
      </IonHeader>
        <IonContent className='edit-name'>
          <div>
            <h1>{localize('PHONE_TITLE')}</h1>
            <p>{localize('PHONE_DESCRIPTION')}</p>
          </div>
          <div>
            <input value={this.state.phone} type="tel" placeholder={'Número de teléfono'} onChange={e => {this.onInputChangeHandler('phone', e.currentTarget.value?.toString()!)}}></input>
          </div>
          { !validPhoneNumberFormat.test(phone) && phone.length >= phoneNumberMinLength ?  <div>{localize('NOT_VALID_PHONE')}</div> : null }

        </IonContent>
        <IonFooter>
          <div className='pad-buttons'>
            <IonButton disabled={!(isValidStatesInputs.phone)} className='white-centered' onClick={() => {this.onChangePostHandler('phone', this.state.phone!)}}>
              Continuar
            </IonButton>
          </div>
        </IonFooter>
      </Fragment>
    )
  }
  renderSAVING = () => {
    return(
      <IonContent className='loading'>
        <div className="loader-circle">
          <div className="loader"></div>
          <div className="text-inside">
            <p>Cargando...</p>
          </div>
        </div>
      </IonContent>
    )
  }
  renderSAVED= () => {
    return( <Fragment>
      <IonContent className='saved'>
        <div>
          <div>
            <IonIcon icon={checkmarkCircleOutline}> </IonIcon>
            <h1>{`¡Todo listo,`}<br/>{this.state.full_name}!</h1>
            <p>{`${this.getChangeType()} ingresado`}</p>
          </div>
        </div>
      </IonContent>
      <IonFooter>
        <div className='pad-buttons'>
          <IonButton className='white-centered' onClick={() => this.getUserData()}>
            Finalizar
          </IonButton>
        </div>
      </IonFooter>
    </Fragment>
    )
  }
});
