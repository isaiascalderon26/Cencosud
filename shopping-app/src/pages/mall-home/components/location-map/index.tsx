import React, { Fragment } from 'react';
import './index.less';
import { IonModal, IonContent, IonSpinner, IonHeader, IonIcon } from '@ionic/react';
import { arrowBack } from 'ionicons/icons';
import { MapContainer, TileLayer } from 'react-leaflet'
import 'leaflet/dist/leaflet.css';


interface IProps {
  onClose: (action: "close") => void;
  store: string;
}

interface IState {
  mode: "INITIAL_STATE" | "PAGE_LOADED",
}

export default class LocationMap extends React.Component<IProps, IState> {
  state: IState = {
    mode: "PAGE_LOADED",
  }
  onCloseModalHandler = async () => {
    this.props.onClose("close");
  }

  render() {
    const { mode } = this.state;
    return <IonModal swipeToClose={false} backdropDismiss={false} cssClass={`location-map-detail ${mode.replaceAll("_", "-").toLocaleLowerCase()}`} isOpen={true}>
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
    return <Fragment>
      <IonContent scrollY={false}>
        <div>
          <IonSpinner name="crescent" ></IonSpinner>
          <div>
            Cargando información...
          </div>
        </div>
      </IonContent>
    </Fragment>
  }

  renderPAGE_LOADED = () => {
    return <Fragment>
      <IonHeader>
        <div onClick={() => this.onCloseModalHandler() }>
          <IonIcon icon={arrowBack}></IonIcon>
        </div>
      </IonHeader>
      <IonContent>
        <MapContainer center={[-33.41799043636642, -70.60630076290002]} zoom={17} scrollWheelZoom={false}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
        </MapContainer>
      </IonContent>
    </Fragment>
  }
};