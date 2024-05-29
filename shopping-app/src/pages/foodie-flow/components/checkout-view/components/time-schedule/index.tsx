import { close } from 'ionicons/icons';
import moment from 'moment';
import { IonCol, IonContent, IonGrid, IonHeader, IonIcon, IonModal, IonRow } from '@ionic/react';

/**
 * Styles
 */
import './index.less';

const UNIQUE_CLASS = "lnuptjzplv";

export interface IInterval {
  start: Date 
  end: Date
}

interface IProps {
  intervals?: IInterval[],
  
  onPick: (interval: IInterval) => void
  onClose: () => void,
}

const TimeSchedule:React.FC<IProps> = ({intervals, onPick, onClose }) => {
  
  return (
    <IonModal
      isOpen={true}
      cssClass={`time-schedule-modal-${UNIQUE_CLASS}`} 
      swipeToClose={true}
      mode='ios'
      showBackdrop={false}
      onWillDismiss={onClose}
    >
      <IonHeader>
          <div className="header">
              <div className='title'>Horario del local</div>
              <div className="close-button">
                  <IonIcon icon={close} onClick={onClose} />
              </div>
          </div>
          <div className='header-description'>{`Selecciona un horario para recoger tu pedido el día de hoy ${moment().format('dddd D [de] MMMM')}.`}</div>
      </IonHeader>
      <IonContent>
          <div className="content">
            <IonGrid>
              <IonRow>
                {
                  intervals?.map((interval, idx) => {
                    return (
                      <IonCol size='6' key={idx}>
                        <div onClick={() => onPick(interval)} >
                          <ButtonBox mainText={moment(interval.start).format('HH[h]mm')} secondaryText={moment(interval.end).format('[a] HH[h]mm')} />
                        </div>
                      </IonCol>
                    )
                  })
                }
              </IonRow>
            </IonGrid>
          </div>
      </IonContent>
    </IonModal> 
  )
} 

const ButtonBox:React.FC<{mainText: string, secondaryText: string}> = ({mainText, secondaryText}) => {
  return (
    <div className='time-button'>
      <div className='main-text'>{mainText}</div>
      <div className='secondary-text'>{secondaryText}</div>
    </div>
  )
}

export default TimeSchedule;