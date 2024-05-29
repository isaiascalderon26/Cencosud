import React from 'react';
import { close } from 'ionicons/icons';
import {
  IonModal,
  IonContent,
  IonIcon,
  IonButton,
  IonFooter,
  IonHeader,
} from '@ionic/react';
import styled from 'styled-components';

// index
import './index.less';
import { runInThisContext } from 'vm';

export interface EmptyModalProps {
  title?: string;
  description?: string;
  okText?: string;
  height?: string;
  onOkClick?: () => void;
  onClose?: () => void;
  icon?: any;
  cssClass?: string;
  marginX?: string;
  marginB?: string;
  marginT?: string;
  hidden?: boolean;
}

interface IState {}

export default class EmptyModal extends React.Component<
  EmptyModalProps,
  IState
> {
  ionModal = styled(IonModal)`
    --height: ${this.props.height};
    --margin-x: ${this.props.marginX ?? '40px'};
    --margin-b: ${this.props.marginB ?? '15px'};
    --margin-t: ${this.props.marginT ?? '0'};
    visibility: visible;
  `;

  state: IState = {};

  renderFooter = () => {
    if (!this.props.onOkClick) {
      return null;
    }

    return (
      
      <IonFooter>
        <div className="footer">
          <IonButton className="white-centered" onClick={this.props.onOkClick}>
            <span style={{ color: "#FFFFFF" }}>{this.props.okText}</span>
          </IonButton>
        </div>
      </IonFooter>
    );
  };

  render() {
    const footer = this.renderFooter();

    return (
      <this.ionModal
        swipeToClose={false}
        backdropDismiss={false}
        cssClass={`empty-modal-xyz21 ${this.props.cssClass}`}
        isOpen={true}
      >
        {this.props.onClose && (
          <IonHeader>
            <div className="header">
              <div className="close-button">
                {this.props.hidden != undefined && this.props.hidden === false   && (<IonIcon icon={close} onClick={this.props.onClose} />)}
              </div>
            </div>
          </IonHeader>
        )}
        <IonContent>
          <div className="content">
            {this.props.icon && (
              <IonIcon className="icon" icon={this.props.icon} />
            )}
            {this.props.title && <h1>{this.props.title}</h1>}
            {this.props.children}
          </div>
        </IonContent>
        {this.props.okText && footer}
      </this.ionModal>
    );
  }
}
