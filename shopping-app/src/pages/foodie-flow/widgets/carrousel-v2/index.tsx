import { addCircleOutline, fastFood, star } from 'ionicons/icons';

/**
 * Styles
 */
import './index.less';

/**
 * Models
 */
import { IonIcon, IonSlides } from '@ionic/react';
import IProduct from '../../../../models/foodie/IProduct';
import CarrouselItem from './components/carrousel-item';
import ILocal from '../../../../models/foodie/ILocal';
import merchantHeaderIcon from './../../../../assets/media/svg/illustrated/merchant-header-icon.svg';

const UNIQUE_CLASS = 'foodie-items-asslljka';

interface IProps {
  products: IProduct[] | undefined;
  locals: ILocal[] | undefined;
  onSelectedLocal: (local: ILocal) => void;
  onShowStoreDetail: () => void;
}

const CarrouselV2Widget: React.FC<IProps> = ({
  products,
  locals,
  onSelectedLocal,
  onShowStoreDetail,
}) => {
  const slideOpts = {
    slidesPerView: 'auto',
    zoom: false,
    grabCursor: true,
  };

  // Calcula el porcentaje de descuento y agrega un nuevo campo al objeto
  products?.forEach((product) => {
    product.discountPercentage = product.reference_price
      ? Math.round(100 - (product.price * 100) / product.reference_price)
      : 0;
  });

  // Ordena el array de productos de mayor a menor porcentaje de descuento
  const sortedProducts = products?.sort(
    (a, b) => (b?.discountPercentage ?? 0) - (a?.discountPercentage ?? 0)
  );

  return (
    <div className={`${UNIQUE_CLASS} carrousel`}>
      <div>
        <h3 className="font-bold section-title">
          {/* <Icon variant="illustrated" name={iconName} />
           */}
          <IonIcon
            size="22"
            className="carousel-header-icon"
            src={merchantHeaderIcon}
            color="white"
          />
          Promos Exclusivas de App Mi Mall
        </h3>
      </div>
      <IonSlides
        options={slideOpts}
        style={{ padding: '10px', display: 'flex', height: '260px' }}
      >
        {sortedProducts &&
          sortedProducts.map((product) => {
            if (product.images && product.images.length > 0) {
              return (
                <CarrouselItem
                  product={product}
                  locals={locals}
                  onSelectedLocal={onSelectedLocal}
                  onShowStoreDetail={onShowStoreDetail}
                />
              );
            } else return null;
          })}
      </IonSlides>
    </div>
  );
};

export default CarrouselV2Widget;
