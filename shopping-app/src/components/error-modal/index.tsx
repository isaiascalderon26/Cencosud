import React from 'react';
import { close } from 'ionicons/icons';
import { IonModal, IonContent, IonIcon, IonButton, IonFooter, IonHeader } from '@ionic/react';

// index
import './index.less';
// assets
import alertSvg from '../../assets/media/delete-card.svg';

export interface IErrorModalProps {
  title: string;
  message?: string;
  altText?: string;
  content?: React.ReactNode;
  retryMessage?: string;
  cancelMessage?: string;
  onRetry?: () => void;
  onCancel?: () => void;
  cssClass?: string | string[];
  icon?: any;
  displayButtonClose?: boolean;
}

interface IState { }

export default class ErrorModal extends React.Component<IErrorModalProps, IState> {
  state: IState = {
  }

  onCloseModalHandler = () => {
    this.props.onCancel && this.props.onCancel();
  }

  onRetryHandler = () => {
    this.props.onRetry && this.props.onRetry();
  }

  onCancelHandler = () => {
    this.props.onCancel && this.props.onCancel();
  }

  render() {
    const { title, message, altText, content, retryMessage, cancelMessage, onCancel, onRetry, cssClass, icon, displayButtonClose = true } = this.props;

    const _cssClass = ['error-modal'];
    if (cssClass) {
      _cssClass.push(...(typeof cssClass === 'string' ? [cssClass] : cssClass));
    }



    return (
      <IonModal swipeToClose={false} backdropDismiss={false} cssClass={_cssClass} isOpen={true} >
        <IonHeader>
          <div className="header">
            {onCancel && (
              <div className="close-button">
                <IonIcon icon={close} onClick={this.onCloseModalHandler} />
              </div>
            )}
          </div>
        </IonHeader>
        <IonContent>
          <div className="content">
            {icon
              ? <IonIcon className="icon" icon={icon} />
              : <IonIcon className="icon" src={alertSvg} />}
            <h1 className="title"  >{title}</h1>
            {message && <p className="message">{message}</p>}
            {content}
            {altText}
          </div>
        </IonContent>
        <IonFooter>
          {
            altText && <div className='caption-text'><span>{altText}</span></div>
          }
          <div className='footer'>
            {onRetry && <IonButton className='ok-button white-centered' onClick={this.onRetryHandler}>
              {retryMessage || 'Reintentar'}
            </IonButton>}
            {onCancel && displayButtonClose && (
              <IonButton className='cancel-button white' onClick={this.onCancelHandler}>
                {cancelMessage || 'Cancelar'}
              </IonButton>
            )}
          </div>
        </IonFooter>
      </IonModal>
    )
  }
};
