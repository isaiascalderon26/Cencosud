import React from 'react';
import { close } from 'ionicons/icons';
import { IonModal, IonContent, IonIcon, IonButton, IonFooter, IonHeader } from '@ionic/react';
import styled from 'styled-components';

// index
import './index.less';
import { runInThisContext } from 'vm';

interface IProps {
    title?: string;
    description?: string;
    okText?: string;
    height?: string;
    onOkClick?: () => void;
    onClose: () => void;
}

interface IState {
}

export default class EmptyModal extends React.Component<IProps, IState> {

    ionModal = styled(IonModal)`
        --height: ${this.props.height};
    `;

    state: IState = {
    }

    renderFooter = () => {
        if (!this.props.onOkClick) {
            return null;
        }

        return (
            <IonFooter>
                <div className='footer'>
                    <IonButton className='white-centered' onClick={this.props.onOkClick}>
                        {this.props.okText}
                    </IonButton>
                </div>
            </IonFooter>
        )
    }

    render() {
        const footer = this.renderFooter();
        return (
            <this.ionModal swipeToClose={false} backdropDismiss={false} cssClass="empty-modal-xyz21" isOpen={true} >
                <IonHeader>
                    <div className="header">
                        <div className="close-button">
                            <IonIcon icon={close} onClick={this.props.onClose} />
                        </div>
                    </div>
                </IonHeader>
                <IonContent>
                    <div className="content">
                        {this.props.title && (<h1>{this.props.title}</h1>)}    
                        {this.props.children}
                    </div>
                </IonContent>
                {this.props.okText && footer}
            </this.ionModal>
        )
    }
}
