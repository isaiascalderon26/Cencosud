import React, { Fragment } from 'react';
import './index.less';
import { IonModal, IonContent, IonSpinner, IonIcon } from '@ionic/react';
import i18n from '../../lib/i18n';
import locales from './locales';
import {close, location } from 'ionicons/icons';
import { IService } from '../../models/services/IService';
import StringFormatter from '../../lib/formatters/StringFormatter'
import { ISite } from '../../models/store-data-models/ISite';

interface IProps {
  service: IService;
  onClose: (action: "close") => void;
  site: ISite
}

interface IState {
  mode: "INITIAL_STATE" | "PAGE_LOADED",
}

export default class ServiceDetail extends React.Component<IProps, IState> {
  state: IState = {
    mode: "INITIAL_STATE",
  }

  onCloseModalHandler = async () => {
    this.props.onClose("close");
  }

  render() {
    const { mode } = this.state;
    const { service, site} = this.props;
    return <IonModal swipeToClose={false} cssClass={`service-detail-modal ${mode.replaceAll("_", "-").toLocaleLowerCase()}`} isOpen={true} onDidDismiss={this.onCloseModalHandler}>
      <IonContent>
        {/* CLOSE ICON */}
        <div>
          <IonIcon icon={close} onClick={this.onCloseModalHandler} size="large"/>
        </div>
        {/* TODO: acá falta colocar el dominio donde estan las imagenes */}
        <div>
          <img src={`${site.web}${service?.image}`} alt='service'></img>
        </div>
        <div>
          <h1>{StringFormatter.capFirstLetter(service.name.replace('SERVICIO DE ', '').toUpperCase())}</h1>
          <p>
            <IonIcon icon={location} />
            <span>{service.location}</span>
          </p>
        </div>
       <div>
         <p dangerouslySetInnerHTML={{__html: service.description}}></p>
       </div>
      </IonContent>
    </IonModal>
  }
};
