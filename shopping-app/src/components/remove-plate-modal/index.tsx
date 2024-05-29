import React, { Fragment } from 'react';
import './index.less';
import { IonModal, IonContent, IonIcon, IonButton, IonSpinner, IonFooter } from '@ionic/react';
import { close } from 'ionicons/icons';
import deleteCardImg from '../../assets/media/delete-card.svg';
import loadingSpin from '../../assets/media/icons/loading-spin.svg';
import i18n from '../../lib/i18n';
import locales from './locales';
import EurekaConsole from '../../lib/EurekaConsole';
import ParkingClient from '../../clients/ParkingClient';

const localize = i18n(locales);

const eureka = EurekaConsole({ label: "delete-card-modal" });

interface IProps {
  onClose: (action: "cancel" | "approved") => void;
  plate: string
}

interface IState {
  mode: "INITIAL_STATE" | "LOADING_STATE",
  loading: boolean
}

export default class RemovePlateModal extends React.Component<IProps, IState> {
  private swiper: any;

  state: IState = {
    mode: "INITIAL_STATE",
    loading: false
  }

  onConfirmModalHandler = async () => {
    const { plate } = this.props

    this.setState({
      loading: true
    })

   await this.removePlate(plate)
  }

  removePlate = async (plate: string) => {
    try {
      await ParkingClient.removePlate(plate);
      setTimeout(() => {
        this.props.onClose("approved");
        this.setState({ loading: false })
      }, 1000);
    } catch (error) {
      eureka.error('An error has ocurred trying to remove a card')
      eureka.debug('removal card error:', error);
      this.setState({ loading: false });
    }
  }

  onCloseModalHandler = async () => {
    this.props.onClose("cancel");
  }

  render() {
    const { mode } = this.state;
    return <IonModal
      onDidDismiss={this.onCloseModalHandler}
      backdropDismiss={true} cssClass={"remove-card-modal " + this.state.mode.toLocaleLowerCase().replace(/_/ig, "-")}
      isOpen={true}
    >
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
    //Analytics.logEvent("remove_card_modal");
    return <Fragment>
      <IonContent>
        <div>
          <div>
          <IonIcon icon={close} onClick={this.onCloseModalHandler} />
          </div>
          <div className='delete-card-icon'>
            <IonIcon icon={deleteCardImg} />
          </div>
          <h1>
            {localize('ACTION_CARD_TITLE')}
          </h1>
          <p>
            {localize('ACTION_CARD_MESSAGE')}
          </p>
          <IonButton className="white-centered" onClick={this.onConfirmModalHandler}>
          {this.state.loading ? <IonIcon icon={loadingSpin}></IonIcon> : localize('CONFIRM_TEXT')}
          </IonButton>
        </div>
      </IonContent>
    </Fragment>
  }
};