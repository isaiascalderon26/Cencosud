import lodash from 'lodash';
import React, { useCallback, useReducer, useState } from "react";
import { call, mail } from 'ionicons/icons'
import { IonButton, IonContent, IonIcon, IonSpinner } from "@ionic/react";
/**
 * Styles
 */
import './index.less';


/**
 * Components
 */
import InputText from "../../../../components/input-text";
import { DefaultHeader } from "../../../../components/page";

/**
 * Models
 */
import { IUser } from "../../../../models/users/IUser";
import IPaymentIntention from "../../../../models/payments/IPaymentIntention";

/**
 * Assets
 */
import orderIcon from '../../../../assets/media/foodie/foodie-order-icon.svg';
import checkIcon from '../../../../assets/media/icon-checked-white-bg.svg';

const UNIQUE_CLASS = "kkttmtnmcz";

type InputType = 'email' | 'phone' | 'subject' | 'message';

interface IState {
  valid: boolean,
  items: {
    phone: {
      type: 'phone',
      value: string,
      error?: string
    },
    email: {
      type: 'email',
      value: string,
      error?: string
    },
    subject: {
      type: 'subject',
      value: string,
      error?: string
    },
    message: {
      type: 'message',
      value: string,
      error?: string
    }
  },
}

const createInitialState = (email: string, phone?: string): IState => {
  return {
    valid: false,
    items: {
      phone: {
        type: "phone",
        value: phone || '',
      },
      email: {
        type: 'email',
        value: email,
      },
      subject: {
        type: 'subject',
        value: '',
      },
      message: {
        type: 'message',
        value: '',
      },
    }
  }
}

interface CHANGE_INPUT_VALUE {
  type: 'CHANGE_INPUT_VALUE',
  payload: { type: InputType, value: string }
}

type IAction = CHANGE_INPUT_VALUE

const isFormValid = (state: IState) => Object.values(state.items)
  .filter(it => (it.error && it.error !== "") || (it.value === "")).length === 0;

const reducer: React.Reducer<IState, IAction> = (prevState, action) => {
  switch (action.type) {
    case 'CHANGE_INPUT_VALUE':
      if (checkConstraint(action.payload.type, action.payload.value)) {
        const newState: IState = {
          ...prevState,
          items: {
            ...prevState.items,
            [action.payload.type]: {
              type: action.payload.type,
              value: action.payload.value,
              error: undefined
            }
          }
        }

        return {
          ...newState,
          valid: isFormValid(newState)
        };
      } else {
        return {
          ...prevState,
          valid: false,
          items: {
            ...prevState.items,
            [action.payload.type]: {
              type: action.payload.type,
              value: action.payload.value,
              error: 'Campo incorrecto!'
            }
          }
        }
      }
    default:
      return prevState;
  }
}

const checkConstraint = (type: InputType, value: string) => {
  if (value === "") {
    return true;
  }
  switch (type) {
    case "message":
    case "subject":
      return /^[a-zA-Z ñ]+$/.test(value);
    case "email":
      return /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
        value
      );
    case "phone":
      return value.length === 9 && /^9[0-9]+$/.test(value);
  }
  //return true;
};

type MODE = 'FORM' | 'SAVED_FORM';
interface IProps {
  user: IUser
  payment_intention: IPaymentIntention
  onBack: () => void,
  submitSupportMsg: (pi: IPaymentIntention, user:IUser, subject: string, message: string, cb: () => void) => Promise<void>
}
const SupportView: React.FC<IProps> = ({ user, payment_intention, onBack, submitSupportMsg }) => {

  const [state, dispatch] = useReducer(reducer, createInitialState(user.email, user.phone))
  const [mode, setMode] = useState<MODE>('FORM');
  const [saving, setSaving] = useState(false);

  const orderNumber = lodash.get(payment_intention, 'outcome.result.foodie_order_number');

  const onInputChange = (type: InputType, value: string) => {
    dispatch({ type: 'CHANGE_INPUT_VALUE', payload: { type, value } })
  }

  const handleSubmit = async () => {
    const phone = state.items.phone.value;
    const subject = state.items.subject.value;
    const message = state.items.message.value;
    const email = state.items.email.value;
    
    let userData = user;
    if(!user.phone){
      userData.phone = phone;
    }

    if(isAppleRelay(user.email)){
      userData.meta_data = { ...userData.meta_data, email: email }
    }

    setSaving(true);

    const cb = () => {
      setMode('SAVED_FORM');  
    }
    
    await submitSupportMsg(payment_intention, userData, subject, message, cb);
    setSaving(false);
  }

  const handleFinish = () => {
    onBack();
  }

  const isAppleRelay = (email?:string):boolean => {
    const domain = "@privaterelay.appleid.com";
    return email!.includes(domain);
  }

  const getFormView = useCallback(() => {
    
    const FormView = (
      <>
        <DefaultHeader onBack={onBack} />
        <IonContent>
          <div className={`support-content-${UNIQUE_CLASS}`}>
            <div className="title label">¿En qué te podemos ayudar?</div>
            <div className="message label">Completa tus datos de contacto para poder realizar tu solicitud</div>

            <div className="input order-input">
              <IonIcon src={orderIcon} />
              <div className="input-body">
                <div className="order-number-label">Número de pedido</div>
                <div className="order-number-value">{`#${orderNumber}`}</div>
              </div>
            </div>

            <InputText
              cssClass={'input'}
              placeholder="Teléfono"
              defaultValue={user.phone || ''}
              onValueChange={(value) => onInputChange('phone', value)}
              disabled={false}
              error={state.items.phone.error}
              icon={call}
              name={'phone'}
            />

            <InputText
              cssClass={'input'}
              placeholder="Correo"
              defaultValue={isAppleRelay(user.email) ? '' : user.email}
              onValueChange={(value) => onInputChange('email', value)}
              disabled={!isAppleRelay(user.email)}
              error={state.items.email.error}
              icon={mail}
              name={'email'}
            />

            <div className="how-to-help-text label">Y ahora, cuéntanos el motivo </div>

            <InputText
              cssClass={'input'}
              placeholder="Asunto"
              defaultValue=""
              onValueChange={(value) => onInputChange('subject', value)}
              disabled={false}
              error={state.items.subject.error}
              name={'subject'}
            />

            <textarea
              className="text-area"
              placeholder="Escribe un mensaje"
              value={state.items.message.value}
              onChange={(e) => onInputChange('message', e.target.value)}
              rows={6}
            />
          </div>
        </IonContent>

        <div className={`pad-buttons footer-${UNIQUE_CLASS}`}>
          { saving 
            ? 
              <IonButton className='white-centered' disabled={!state.valid} onClick={handleSubmit}>
                <IonSpinner name="crescent" />
              </IonButton>
            :
              <IonButton className='white-centered' disabled={!state.valid} onClick={handleSubmit}>
                Enviar solicitud
              </IonButton>
          }
        </div>
      </>
    )
    return FormView
  }, [state, saving])

  
  const SAVED_FORM_VIEW = (
    <>
      <div className={`support-send-content-${UNIQUE_CLASS}`}>
        <div>
          <IonIcon src={checkIcon} className={'check-icon'} />
        </div>
        <div className='title'>Solicitud recibida</div>
      
        <div className='text'>Hemos recibido tu mensaje y procesaremos tu solicitud. En breve recibirás un correo con todos los detalles.</div>

        <div className='text'>¡Pronto nos comunicaremos contigo!</div>
        
      </div>
      <div className={`pad-buttons footer-${UNIQUE_CLASS}`}>    
        <IonButton className='white-centered' onClick={handleFinish}>
          Volver al inicio
        </IonButton>
      </div>
    </>
  );

  if (mode === "FORM") {
    return getFormView();
  }
  return SAVED_FORM_VIEW;
}

export default SupportView;