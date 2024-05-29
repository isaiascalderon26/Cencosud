import React from 'react';
import { close } from 'ionicons/icons';
import { IonModal, IonContent, IonIcon, IonButton, IonFooter, IonHeader } from '@ionic/react';
// index
import './index.less';
interface IProps {
    title: string;
    subtitle: string;
    content: string;
    isOpen: boolean;
    onClose: () => void;
}

const ModalTermsExchange: React.FC<IProps> = (props) => {

    const { title, subtitle, content, isOpen } = props;

    const onCloseModalHandler = () => {
        props.onClose();
    }

    const onHtmlDecode = (input:string) => {
        const doc = new DOMParser().parseFromString(input, "text/html");
        return doc.documentElement.textContent as string;
    }

    return (
        <IonModal swipeToClose={false} backdropDismiss={false} isOpen={isOpen} cssClass={'modal-terms-exchanged'}>
        <IonHeader>
          <div className="header">
              <div className="close-button">
                <IonIcon icon={close} onClick={onCloseModalHandler} />
              </div>
          </div>
        </IonHeader>
        <IonContent>
          <div className="content">
            <h3 className="title">{title}</h3>
            <p className="subtitle">{subtitle}</p>
            <div dangerouslySetInnerHTML={{ __html: onHtmlDecode(content) }} className="text-body"></div>
          </div>
        </IonContent>
        <IonFooter>
          <div className='footer'>
            <IonButton className='ok-button white-centered' onClick={onCloseModalHandler}>
              Volver atrás
            </IonButton>
          </div>
        </IonFooter>
      </IonModal>
    )
};

export default ModalTermsExchange;
