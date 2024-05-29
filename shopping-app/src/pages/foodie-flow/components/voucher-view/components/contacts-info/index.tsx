import { useState } from 'react';
import { close } from 'ionicons/icons';
import { IonButton, IonCol, IonContent, IonGrid, IonHeader, IonIcon, IonImg, IonModal, IonRow } from '@ionic/react';

/**
 * Styles
 */
import './index.less';

/**
 * Components
 */

/**
 * Lib
 */

/**
 * Clients
 */

/**
 * Models
 */
import ILocalContact from '../../../../../../models/foodie/ILocalContact';

/**
 * Assets
 */
import supportImage from '../../../../../../assets/media/foodie/support-image.svg';
import mailContactIcon from '../../../../../../assets/media/foodie/mail-contact.svg';
import phoneContactIcon from '../../../../../../assets/media/foodie/phone-contact.svg';
import whatsappContactIcon from '../../../../../../assets/media/foodie/whatsapp-contact.svg';

const UNIQUE_CLASS = 'efnxgudcde';

interface IProps {
  showSupportButton: boolean,
  displayContactModal: boolean,
  isSlideIndex?: number,
  contactsInfo: ILocalContact[],

  handleClose: () => void
  openSupportPage: () => void,
  onSetShowForm: () => void,
}



const ContactsInfo: React.FC<IProps> = ({ showSupportButton, displayContactModal, contactsInfo, isSlideIndex, handleClose, openSupportPage, onSetShowForm }) => {

  const [slideIndex, setSlideIndex] = useState(isSlideIndex ?? 0);

  const onClose = () => {
    setSlideIndex(isSlideIndex ?? 0);
    handleClose();
  }

  const headers = [
    (
      <IonHeader>
        <div className="header">
          <div className='title'>¿Necesitas ayuda?</div>
          <div className="close-button">
            <IonIcon icon={close} onClick={onClose} />
          </div>
        </div>
        <div className='header-description'>Comunícate con el local a través de cualquiera de los siguientes canales:</div>
      </IonHeader>
    ),
    (
      <IonHeader>
        <div className="header-support">
          <IonImg src={supportImage} className={'image-support'}/>
          <div className="close-button-support">
            <IonIcon icon={close} onClick={onClose} />
          </div>
        </div>
      </IonHeader>
    ),
    (
      <IonHeader>
        <div className="header">
          <div className='title'>¿Necesitas ayuda?</div>
          <div className="close-button">
            <IonIcon icon={close} onClick={onClose} />
          </div>
        </div>
        <div className='header-description'>Si tienes algún problema con tu pedido acércate directamente al local donde realizaste el pedido para recibir ayuda.
       </div>
      </IonHeader>
    ),
  ];
  const bodies = [
    (
      <IonContent>
        <IonGrid className='contacts-container'>
          <IonRow>
            {contactsInfo.map((contact, idx) => {
              switch (contact.type) {
                case 'EMAIL':
                  return (
                    <IonCol key={idx}>
                      <a className='contact' href={`mailto:${contact.value}`}>
                        <div className='icon-container'>
                          <img src={mailContactIcon} alt="mail del local" />
                        </div>
                        <div>Correo</div>
                      </a>
                    </IonCol>
                  )
                case 'PHONE':
                  return (
                    <IonCol key={idx}>
                      <a className='contact' href={`tel:{{${contact.value}}}`}>
                        <div className='icon-container'>
                          <img src={phoneContactIcon} alt="teléfono del local" />
                        </div>
                        <div>Teléfono</div>
                      </a>
                    </IonCol>
                  )
                case 'WHATSAPP':
                  return (
                    <IonCol key={idx}>
                      <a className='contact' href={`https://api.whatsapp.com/send?phone=${contact.value}`}>
                        <div className='icon-container'>
                          <img src={whatsappContactIcon} alt="whatsapp del local" />
                        </div>
                        <div>Whatsapp</div>
                      </a>
                    </IonCol>
                  )
                default:
                  return null;
              }
            })}
          </IonRow>
          {showSupportButton &&
            <>
              <IonRow>
                <IonCol>
                  <div className='support-separator'>
                    <span className='support-separator-text'>O también puedes</span>
                  </div>
                </IonCol>
              </IonRow>
              <IonRow>
                <IonCol>
                  <div className='support-link' onClick={() => setSlideIndex(1)}>
                    Comunicate con soporte
                  </div>
                </IonCol>
              </IonRow>
            </>

          }
        </IonGrid>
      </IonContent>
    ),
    (
      <IonContent>
        <div className='content-support'>
          <div className='title-support'>¿Aún necesitas ayuda?</div>
          <div className='text-support'>Escribe a nuestro equipo de soporte y cuéntanos qué pasó con tu pedido </div>
          <IonButton onClick={openSupportPage}>Enviar una solicitud</IonButton>
        </div>
      </IonContent>
    ),
    (
      <IonContent>
        <div className='content-help'>
          <IonButton className='button-help-1' onClick={onClose}>Entendido</IonButton>
          <IonButton  color='white' className='button-help-2' onClick={onSetShowForm} >Mi problema persiste</IonButton>
        </div>
      </IonContent>
    )
  ]


  return (
    <IonModal
      isOpen={displayContactModal}
      cssClass={`contact-support-${UNIQUE_CLASS} ${showSupportButton && 'taller'}`}
      swipeToClose={true}
      mode='ios'
      showBackdrop={false}
      onWillDismiss={handleClose}
    >
      {headers[slideIndex]}
      {bodies[slideIndex]}
    </IonModal>
  );
}

export default ContactsInfo;