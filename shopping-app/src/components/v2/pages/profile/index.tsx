import React from 'react';
import {
  IonButton,
  IonFooter,
  IonHeader,
  IonIcon,
  IonPage,
} from '@ionic/react';
import { useHistory } from 'react-router-dom';

/**
 * Styles
 */
import './index.less';
import { IonContent } from '@ionic/react';
import { arrowBack } from 'ionicons/icons';

const profile: React.FC = () => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const history = useHistory();

  const volver = () => {
    history.goBack();
  };

  const cerrarSesion = () => {
    // Aquí puedes agregar el código necesario para cerrar sesión
  };

  return (
    <IonPage>
      <IonHeader>
        <div className="back-button" onClick={volver}>
          <IonIcon icon={arrowBack} />
        </div>
      </IonHeader>
      <IonContent></IonContent>
      <IonFooter>
        <IonButton
          className="cancel-button"
          expand="block"
          onClick={cerrarSesion}
        >
          Cerrar sesión
        </IonButton>
      </IonFooter>
    </IonPage>
  );
};

export default profile;
