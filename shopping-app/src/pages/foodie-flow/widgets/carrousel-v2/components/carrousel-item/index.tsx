import './index.less';
import IProduct from '../../../../../../models/foodie/IProduct';
import { IonSlide } from '@ionic/react';
import NumberFormatter from '../../../../../../lib/formatters/NumberFormatter';
import ILocal from '../../../../../../models/foodie/ILocal';

interface IProps {
  product: IProduct;
  locals: ILocal[] | undefined;
  onShowStoreDetail: () => void;
  onSelectedLocal: (local: ILocal) => void;
}

const CarrouselItem: React.FC<IProps> = ({
  product,
  locals,
  onSelectedLocal,
  onShowStoreDetail,
}) => {
  function findLocalById(
    arr: ILocal[] | undefined,
    idToFind: string
  ): ILocal | undefined {
    return arr?.find((local) => local.id === idToFind);
  }

  const onNavigateProduct = async () => {
    
    const foundLocal = findLocalById(locals, product.local_id);
    if (foundLocal) {
      onSelectedLocal(foundLocal);
      onShowStoreDetail();
    }
  };

  return (
    <>
      <IonSlide className="slide-container" onClick={onNavigateProduct}>
        <div className="image-container">
          {/* Elemento de descuento */}
          <div className="discount-badge">
            -
            {product.reference_price
              ? Math.round(
                  100 - (product.price * 100) / product.reference_price
                )
              : 0}
            %
          </div>
          {product.images && product.images.length > 0 ? (
            <img src={product.images[0]} alt="Imagen del Producto" />
          ) : (
            <p>No hay imagen disponible</p>
          )}
        </div>

        <div className="info-container">
          {/* Contenedor de texto */}
          <div className="text-container">
            <div className="item-text-title">{product.name.slice(0, 15)}</div>
            <div className="item-text-description">
              {product.description
                ? product.description.slice(0, 50)
                : ''}
            </div>
            {/* Contenedor de precios */}
            <div className="price-container">
              {/* Primer precio */}
              <div className="old-price">{`${NumberFormatter.toCurrency(
                product.reference_price || product.price
              )}`}</div>

              {/* Segundo precio */}
              <div className="discount-price">{`${NumberFormatter.toCurrency(
                product.price
              )}`}</div>
            </div>
          </div>
        </div>
      </IonSlide>
    </>
  );
};

export default CarrouselItem;
