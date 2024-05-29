import moment from 'moment';
import React, { Fragment } from 'react';
import { Clipboard } from '@capacitor/clipboard';
import { IonModal, IonContent, IonIcon, createAnimation, IonButton, IonFooter } from '@ionic/react';

import './index.less';
import locales from './locales';
import i18n from '../../lib/i18n';
import { IUser } from '../../models/users/IUser';
import { closeCircleSharp } from 'ionicons/icons';
import UserClient from '../../clients/UserClient';
import EurekaConsole from '../../lib/EurekaConsole';
import { IPromotion, IPromotionMetaData } from '../../models/promotions/IPromotion';
import DiscountCodeClient from '../../clients/DiscountCodeClient';
import IDiscountCode from '../../models/discount-codes/IDiscountCode';
import AuthenticationClient from '../../clients/AuthenticationClient';
import loadingSpin from './../../assets/media/icons/loading-spin.svg';
import { ISite } from '../../models/store-data-models/ISite';
import RegisterModal from '../register_modal';
import DniFormatter from '../../lib/formatters/DniFormatter';
import PromotionsClient from '../../clients/PromotionsClient';
import FirebaseAnalytics from "../../lib/FirebaseAnalytics";

const localize = i18n(locales);

const eureka = EurekaConsole({ label: "promotion-detail-modal" });

interface IProps {
  onClose: (action: "close") => void;
  promotion?: IPromotion;
  site: ISite;
  onUpdateRut?: (rut: string) => void;
}

interface IState {
  mode: 'INITIAL_STATE' | 'DISCOUNT_CODE' | 'RUT'
  time?: any
  seconds: number
  timer: any
  user?: IUser;
  modal_open: boolean,
  discount_code?: IDiscountCode;
  code_button_state: 'LOADING' | 'ENABLED' | 'DISABLED' | 'HIDDEN',
  register_is_open: boolean,
  document_number: string;
  isValidStatesInputs: {
    document_number: boolean,
  };
  document_number_actived: boolean;
  loading_rut: boolean;
  promotionMetaData?: IPromotionMetaData;
}

export default class PromotionDetailModal extends React.Component<IProps, IState> {
  _isMounted = false;
  state: IState = {
    mode: "INITIAL_STATE",
    seconds: 100,
    timer: 0,
    modal_open: true,
    code_button_state: 'LOADING',
    register_is_open: false,
    document_number: '',
    isValidStatesInputs: {
      document_number: false
    },
    document_number_actived: true,
    loading_rut: false,
    promotionMetaData: {}
  }

  componentDidMount = async () => {
    this._isMounted= true;
    if(this._isMounted) {
      await this.onTakePromotion();
    }

    // try to resolve current user
    this.tryToResolveCurrentUser()

    // try to resolve code
    this.tryToResolveCode();

    // try to resolve promotions metadata
    this.tryGetPromotionMetadata();
  }

  componentWillUnmount = async () => {
    this._isMounted= false;
  }

  onTakePromotion = async () => {
    let countDownDate = new Date(this.props.promotion?.validity_end_date!).getTime();
    let distance = countDownDate - new Date().getTime()
    let timeLeftVar = this.secondsToTime(distance);
    if(this._isMounted) {
      this.setState({
        seconds: distance,
        time: timeLeftVar,
      });
      this.startTimer();
    }
  }

  onCloseModalHandler = async () => {
    this.setState({modal_open: false})
    setTimeout(() => {
      this.props.onClose("close");
    }, 500)
  }

  onShowDiscountCode = async () => {
    const { user } = this.state;

    //if user is not guess and has not rut
    if(!user?.document_number){
      this.setState({ mode: "RUT" });
      return;
    }

    try {
      this.setState({ code_button_state: 'LOADING' });

      let discountCode = this.state.discount_code;
      if (!discountCode) {
        const assigned = await this.assignDiscountCode();
        if (!assigned) {
          this.setState({ code_button_state: 'DISABLED' });
          return;
        }
        discountCode = assigned;
      }

      this.setState({ mode: "DISCOUNT_CODE", discount_code: discountCode });
    } catch (error) {
      eureka.error('An error has ocurred trying to resolve the current user', error);

      // if there is an error
      // resolve problem as the code is not available
      this.setState({
        code_button_state: 'DISABLED',
      });
    }
  }

  onCopyCode = async () => {
    try {
      const { discount_code } = this.state;
      if (discount_code) {
        await Clipboard.write({ string: discount_code.code });
      }
    } catch (error) {
      eureka.error('An error has ocurred trying to copy the code', error);
    }
  }

  onLoginClickHandler = async () => {
    await AuthenticationClient.signOut();
    window.location.reload();
  }

  startTimer() {
    if (this.state.timer == 0 && this.state.seconds > 0 && this._isMounted) {
      this.state.timer = setInterval(this.countDown, 1000);
    }
  }

  countDown = () => {
    let seconds = this.state.seconds - 1;
    if(this._isMounted) {
      this.setState({
        time: this.secondsToTime(seconds),
        seconds
      });

      if (seconds == 0) {
        clearInterval(this.state.timer);
      }
    }
  }

  secondsToTime(secs: number) {

    let hours = Math.floor((secs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    let days = Math.floor(secs / (1000 * 60 * 60 * 24));
    let minutes = Math.floor((secs % (1000 * 60 * 60)) / (1000 * 60));

    let obj = {
      "dias": days,
      "horas": hours,
      "min": minutes,
    };
    return obj;
  }

  enterAnimation = (baseEl: any) => {
    const backdropAnimation = createAnimation()
      .addElement(baseEl.querySelector('ion-backdrop')!)
      .fromTo('opacity', '0.01', 'var(--backdrop-opacity)');

    const wrapperAnimation = createAnimation()
      .addElement(baseEl.querySelector('.modal-wrapper')!)
      .keyframes([
        { offset: 0, transform: 'scale(0)' },
        { offset: 1, transform: 'scale(1)' }
      ]);

    return createAnimation()
      .addElement(baseEl)
      .easing('ease-in')
      .duration(250)
      .addAnimation([backdropAnimation, wrapperAnimation]);
  }

  leaveAnimation = (baseEl: any) => {
    const wrapperAnimation = createAnimation()
      .addElement(baseEl.querySelector('.modal-wrapper')!)
      .keyframes([
        { offset: 0, opacity: 1 , transform: 'scale(1)' },
        { offset: 1, opacity: 0,  transform: 'scale(0)' }
      ]);

    return createAnimation()
      .addElement(baseEl)
      .easing('ease-out')
      .duration(250)
      .addAnimation(wrapperAnimation);
  }

  tryGetPromotionMetadata= async () => {
    try {
      const currentDate = new Date().toISOString();
      const listParams = { query: {'banners.id_is':  this.props.promotion!.objectID, "disabled_is":"false", "validity_start_date_range_lt": currentDate, "validity_end_date_range_gt": currentDate } };
      //{"validity_start_date_range_lt":"2022-12-28T19:01:45.304Z","validity_end_date_range_gt":"2022-12-28T19:01:45.304Z","disabled_is":false}
      const promotionMetaData = await PromotionsClient.listMetadata(listParams)


      this.setState({ promotionMetaData: promotionMetaData.data[0] });
    } catch (error) {
      eureka.error('An error has ocurred trying to resolve the promotion metadata', error);
    }

  }

  tryToResolveCurrentUser = async () => {
    try {
      const user = await UserClient.me() as IUser;
      this.setState({ user });
    } catch (error) {
      eureka.error('An error has ocurred trying to resolve the current user', error);
    }

  }

  getAlreadyAssignedCode = async (): Promise<IDiscountCode | undefined> => {
    FirebaseAnalytics.customLogEvent("ionic_app", "promociones");

    const currentDate = new Date();
    const jwtEntity = AuthenticationClient.getInfo();

    const response = await DiscountCodeClient.list({
      query: {
        'banners_is': this.props.promotion!.objectID,
        'disabled_is': false,
        'assigned.user.id.keyword_is': jwtEntity.primarysid,
        'assigned.assignment_date_range_lte': currentDate,
        'assigned.expiration_date_range_gt': currentDate,
        'validity_start_date_range_lte': currentDate,
        'validity_end_date_range_gt': currentDate,
      },
      offset: 0,
      limit: 1,
      sort: { created_at: 'desc' },
    });

    if (!response.data.length) {
      return undefined;
    }
    return response.data[0];
  }

  thereIsCodeAvailable = async (): Promise<boolean> => {
    const currentDate = new Date();

    const response = await DiscountCodeClient.list({
      query: {
        'banners_is': this.props.promotion!.objectID,
        'disabled_is': false,
        'does_not_exist': 'assigned',
        'validity_start_date_range_lte': currentDate,
        'validity_end_date_range_gt': currentDate,
      },
      offset: 0,
      limit: 0,
      sort: { created_at: 'desc' },
    });
    return response.total > 0;
  }

  thereIsBannerAvailable = async (): Promise<boolean> => {

    const response = await DiscountCodeClient.list({
      query: {
        'banners_is': this.props.promotion!.objectID,
      },
      offset: 0,
      limit: 0,
      sort: { created_at: 'desc' },
    });
    return response.total > 0;
  }

  assignDiscountCode = async (): Promise<IDiscountCode | undefined> => {
    const jwtEntity = AuthenticationClient.getInfo();

    const response = await DiscountCodeClient.asssign({
      banner: this.props.promotion!.objectID,
      user: {
        id: jwtEntity.primarysid,
        email: this.state.user?.email,
        full_name: this.state.user?.full_name,
        document_number: this.state.user?.document_number
      }
    });

    return response;
  }

  tryToResolveCode = async () => {
    try {
      const [assignedCode, isCodeAvailable, isBannerAvailable] = await Promise.all([
        this.getAlreadyAssignedCode(),
        this.thereIsCodeAvailable(),
        this.thereIsBannerAvailable()
      ]);
      // already assigned
      if (assignedCode) {
        this.setState({
          discount_code: assignedCode,
          code_button_state: 'ENABLED',
        });
        return;
      }
      // code available
      if (isCodeAvailable) {
        this.setState({
          code_button_state: 'ENABLED',
        });
        return;
      }
      if (!isBannerAvailable){
        this.setState({
          code_button_state: 'HIDDEN',
        });
        return;
      }

      // no code available
      this.setState({
        code_button_state: 'DISABLED',
      });
    } catch (error) {
      eureka.error('An error has ocurred trying to resolve a code', error);

      // if there is an error
      // resolve the problem as the code is not available
      this.setState({
        code_button_state: 'HIDDEN',
      });
    }
  }

  htmlDecode = (input:string) => {
    const doc = new DOMParser().parseFromString(input, "text/html");
    return doc.documentElement.textContent;
  }

  onInputChangeHandler = (key: string, value: string): void => {
    //evaluate if rut has (-) delimiter
    const has_delimeter = value.includes('-');
    const { isValidStatesInputs } = this.state;
    const isValids = Object.assign(isValidStatesInputs, {});
    if (value !== undefined) {
      switch (key) {
        case "document_number":
            isValids.document_number = DniFormatter.isRutValid(value);
          break;
        default:
          return;
      }
    }

    if(!isValids.document_number && has_delimeter) {
        this.setState({ document_number_actived : false });
    }

    if(!isValids.document_number && !has_delimeter) {
        this.setState({ document_number_actived : true });
    }

    const newState:any = { isValidStatesInputs: isValids };
    newState[key] = value;
    this.setState(newState)
  }

  onSaveRutHandler = async () => {
    this.setState({ loading_rut: true });
    if(this.state.isValidStatesInputs.document_number) {
      try {
          await UserClient.update('document_number', this.state.document_number);

          this.setState((prev: any) => ({ ...prev, user: { ...prev.user, document_number: this.state.document_number } }));
          this.setState({ loading_rut : false });
          this.onShowDiscountCode();
          if(this.props.onUpdateRut){
            this.props.onUpdateRut!(this.state.document_number);
          }

      } catch (error) {
          eureka.error('Unexpected error in save rut handler', error);
      }
      return;
    }
    setTimeout(() => {
      this.setState({ loading_rut: false });
    } , 1000);
  }

  render() {
    const { mode, modal_open } = this.state;
    return <IonModal enterAnimation={this.enterAnimation} leaveAnimation={this.leaveAnimation} swipeToClose={false} backdropDismiss={false} cssClass={`promotion-detail-modal ${mode.replaceAll("_", "-").toLocaleLowerCase()}`} isOpen={modal_open}>
      {(() => {
        const customRender: Function = (this as any)[`render${mode}`];
        if (!customRender) {
          return <div>{mode}</div>;
        }
        return customRender();
      })()}
    </IonModal>
  }

  renderINITIAL_STATE = () => {
    const { promotion, site } = this.props
    const { time, code_button_state, register_is_open, user, promotionMetaData } = this.state;
    const brandName = promotion?.brand_name.toLocaleUpperCase();
    const description = this.htmlDecode(promotion?.description!);
     return <Fragment>
      <div className='background-modal' style={{backgroundImage:`url(${site.web}/${promotion?.image})`}}></div>
      { register_is_open === false && <IonContent>
        <div onClick={this.onCloseModalHandler}>
          <IonIcon icon={closeCircleSharp}></IonIcon>
        </div>
        <div>
          <img src={`${site.web}/${promotion?.image}`} alt="promotion"/>
        </div>
        <div>
          <h1 dangerouslySetInnerHTML={{__html: promotion?.brand_name!}}></h1>
          <p dangerouslySetInnerHTML={{__html: promotion?.title!}}></p>
        </div>
        {promotionMetaData?.display_disclaimer
          ?
            <div className="promotion">
              <p className="description" dangerouslySetInnerHTML={{__html: description!}}></p>
            </div>
          :
          <div>
            <h1>{localize('PROMOTION_END')}</h1>
            <div>
              <p className="time">
                <span>{time?.dias}</span>
                <span>:</span>
                <span>{time?.horas}</span>
                <span>:</span>
                <span>{time?.min}</span>
              </p>
              <p><span>días</span><span>horas</span><span>min</span></p>
            </div>
          </div>
        }
        <div className='divBotton'>
          {code_button_state !== 'HIDDEN' ?
          <IonButton className='white-centered' onClick={ () => {user?.email === 'invited' ? this.setState({register_is_open: true}) : this.onShowDiscountCode()}} disabled={code_button_state === 'DISABLED'}>
            {code_button_state === 'LOADING' ? <IonIcon icon={loadingSpin}></IonIcon> : code_button_state === 'ENABLED'? promotionMetaData?.name_button ?? 'Código de descuento': 'Códigos agotados'  }
          </IonButton>
          : null }
        </div>
      </IonContent> }
      { user?.email==='invited' && register_is_open === true && <RegisterModal type="NEW" userInfo={user} onClose={() => { this.setState({register_is_open: false}) }}
            onClick={() => { this.onLoginClickHandler() }} />}
    </Fragment>
  }

  renderDISCOUNT_CODE = () => {
    const { promotion, site } = this.props
    const { discount_code } = this.state;
    const brandName = promotion?.brand_name.toLocaleUpperCase();
    const description = this.htmlDecode(promotion?.description!);
    return (
      <Fragment>
        <div className='background-modal'  />
        <IonContent>
          <div onClick={this.onCloseModalHandler}>
            <IonIcon icon={closeCircleSharp}></IonIcon>
          </div>
          <div className='detail-container'>
            <img className='brand' src={`${site.web}/${promotion!.brand_logo}`} alt="brand" />
            <h1 className='title'>Este es tu código:</h1>
            <div className='code-container'>
              <span>{discount_code!.code}</span>
            </div>
            {brandName === 'LOLLAPALOOZA'
            ?
              <div className="promotion">
                <p className="description" dangerouslySetInnerHTML={{__html: description!}}></p>
              </div>
            :
              <p className='instructions'>Preséntalo en caja al momento de hacer <br/> la compra y disfruta tu descuento.</p>
            }
            {discount_code!.assigned?.expiration_date && brandName != 'LOLLAPALOOZA' && <span className='expiration'>{`El código vencerá el ${moment(discount_code!.assigned!.expiration_date).format('LL')}`}</span>}
          </div>
        </IonContent>
        <IonFooter>
          <div className='pad-buttons'>
            {discount_code?.promotion_url && <IonButton className='white-centered space-between-bottom' onClick={() => { window.open(discount_code.promotion_url)}}>Ir al detalle del evento</IonButton>}
            <IonButton className='copy' onClick={this.onCopyCode}>Copiar código</IonButton>
          </div>
        </IonFooter>
      </Fragment>
    )
  }

  renderRUT = () => {
    const { document_number_actived, isValidStatesInputs, loading_rut } = this.state;
    return (
      <Fragment>
        <IonContent>
          <div onClick={this.onCloseModalHandler} className="icon">
            <IonIcon icon={closeCircleSharp}></IonIcon>
          </div>
          <div className="body-promotion-rut">
            <div className="promotion-rut-text">
                <h1>Necesitamos que ingreses tu RUT</h1>
                <p>Est dato es necesario para generar tu codigo de descuento.</p>
            </div>
            <div className="promotion-rut-input">
                <input placeholder={'12345678-9'} onChange={e => {
                    this.onInputChangeHandler('document_number', e.currentTarget.value?.toString()!)
                }} />
            </div>
            <div className="promotion-rut-text-error">
                {document_number_actived ? <p>Debes ingresarlo sin puntos y con guión</p> : !isValidStatesInputs.document_number ? <p>Debes ingresar un RUT válido</p> : null}
            </div>
          </div>
        </IonContent>
        <IonFooter>
          <div className="pad-buttons">
            <IonButton className="white-centered space-between-bottom"
              onClick={() => {this.onSaveRutHandler()}}
            >
              {loading_rut && <IonIcon icon={loadingSpin}></IonIcon>} <span className={loading_rut ? 'continue' : ''}>Continuar</span>
            </IonButton>
          </div>
        </IonFooter>
      </Fragment>
    )
  }
};
