import { IonIcon } from '@ionic/react'
import { person, warningOutline } from 'ionicons/icons';
/**
 * Components
 */
import Footer from '../footer';
import Page, { DefaultHeader } from "../../../../components/page";

/**
 * Styles
 */
import './index.less';

const UNIQUE_CLASS = 'mzcertkico';

interface IProps {
  value: string; 
  is_valid: boolean;
  onChangeValue: (value:string) => void;
  onBackClick: () => void;
  onContinueClick: () => void;
}

const DocumentNumber:React.FC<IProps> = ({value, is_valid, onChangeValue, onContinueClick, onBackClick}) => {
  return (
    <Page
            header={(
              <DefaultHeader onBack={onBackClick}/>
            )}
            content={(
              <div className={`content-${UNIQUE_CLASS}`}>
                <div className='title'>Necesitamos que ingreses tu RUT</div>
                <div className='sub-title'>Esto es necesario para poder gestionar tu reserva</div>
                <div className="input-container">
                    <IonIcon icon={person} />
                    <input value={value} placeholder={'Ingresa tu RUT'} onChange={e => {
                        onChangeValue(e.currentTarget.value?.toString()!)
                    }} />
                </div>
                
                {value !== '' && 
                  !is_valid 
                    ? value.includes('-') 
                      ? <ErrorMsg msg='Debes ingresar un RUT válido' /> 
                      : <ErrorMsg msg='Debes ingresarlo sin puntos y con guión' /> 
                    : null}
              </div>
            )}
            footer={(
              <Footer onClick={onContinueClick} btnText="Continuar"/>
            )}
        />
  )
}


const ErrorMsg:React.FC<{msg:string}> = ({msg}) => {
  return (
    <div className="onboarding-rut-text-error">
      <IonIcon icon={warningOutline} size='small'/>
      <p>{msg}</p>
    </div>
  )
}

export default DocumentNumber;
