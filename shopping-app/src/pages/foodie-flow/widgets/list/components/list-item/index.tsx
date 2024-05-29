import { IonCard, IonIcon } from '@ionic/react';

import './index.less';
import { heart, star, time } from 'ionicons/icons';
import ILocal from '../../../../../../models/foodie/ILocal';

interface IProps {
  local: ILocal;
  onShowStoreDetail: () => void;
  onSelectedLocal: (local: ILocal) => void;
}

const ListItem: React.FC<IProps> = ({
  local,
  onShowStoreDetail,
  onSelectedLocal,
}) => {
  const onNavigateProduct = async () => {
    onSelectedLocal(local);
    onShowStoreDetail();
  };

  return (
    <>
      <IonCard
        className={`custom-card ${local.state === 'CLOSED' ? 'closed' : ''}`}
        onClick={() => {
          if (local.state !== 'CLOSED') {
            onNavigateProduct();
          }
        }}
      >
        {/* Elemento de corazón en la esquina superior derecha */}
        {/* <div className="heart-element">
          <IonIcon
            icon={heart}
            style={{
              fontSize: '14px',
              width: '14px',
              height: '14px',
              color: '#ffffff',
            }}
          />
        </div> */}

        {/* Imagen */}
        <div className="container-img">
          {local.image?.length ? (
            <img className="img-grand" src={local.image[0].src} alt="Local" />
          ) : (
            <img
              className="img-grand"
              src={
                'https://www.altolascondes.cl/sites/altolascondes/files/styles/convert_webp/public/fotos-tienda/Captura.PNG.webp?itok=GulfF6Ge'
              }
              alt="Local"
            />
          )}

          {local.state === 'CLOSED' && (
            <>
              <div className="closed-overlay">Cerrado</div>
              <div className="background-overlay" />
            </>
          )}
        </div>

        {/* Contenedor debajo de la imagen */}
        <div className="info-container">
          {/* Círculo a la izquierda */}
          <div className="circle">
            {/* Imagen circular */}
            <img src={local.logo} alt="Circular" />
          </div>

          {/* Texto debajo del círculo */}
          <div className="text-container">
            {/* Primer texto */}
            <div className="product-name">{local.name.slice(0, 25)}</div>

            {/* Segundo texto */}
            <div className="category">Comida Rápida</div>

            {/* Contenedor de tiempos */}
            {/* <div className="time-container">
              <IonIcon
                icon={time}
                style={{
                  fontSize: '14px',
                  width: '14px',
                  height: '14px',
                  color: '#696969',
                }}
              /> */}

              {/* Texto de tiempo */}
              {/* <div className="time">10 a {local.cooking_time} minutos</div> */}
            {/* </div> */}
          </div>
          {/* Elemento en la parte superior derecha debajo de la imagen */}
          {/* <div className="top-right-element">
            <IonIcon
              icon={star}
              style={{
                fontSize: '14px',
                width: '14px',
                height: '14px',
                color: '#FEB423',
              }}
            />

            {/* Texto de calificación */}
            {/* <div className="rating">4.9</div> */}
          {/* </div>  */}
        </div>
      </IonCard>
    </>
  );
};

export default ListItem;
