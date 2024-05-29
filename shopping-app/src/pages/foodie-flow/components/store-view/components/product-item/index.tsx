import { useCallback, useEffect, useState } from 'react';

/**
 * Style
 */
import './index.less';

/**
 * Components
 */
import Image from '../../../image';

/**
 * Lib
 */

/**
 * Clients
 */
import ShoppingCartClient from '../../../../../../clients/ShoppingCartClient';

/**
 * Models
 */
import IProduct, {
  resolveImage,
} from '../../../../../../models/foodie/IProduct';
import Price from '../../../price';

/**
 * Assets
 */

export interface IProductItemProps {
  local: string;
  data: IProduct;
  onClick: (product: IProduct) => void;
}

const ProductItem: React.FC<IProductItemProps> = ({ local, data, onClick }) => {
  const [quantity, setQuantity] = useState(
    ShoppingCartClient.getProductQty(local, data.id)
  );

  const onChangeQuantity = useCallback((quantity: number) => {
    setQuantity(quantity);
  }, []);

  useEffect(() => {
    ShoppingCartClient.onChangeProductQty(local, data.id, onChangeQuantity);
    return () => {
      ShoppingCartClient.offChangeProductQty(local, data.id, onChangeQuantity);
    };
  }, [local, data.id, onChangeQuantity]);

  const image = resolveImage(data.images);
  return (
    <div className="product-item-xyz" onClick={() => onClick(data)}>
      <div className="info">
        <h2 className="name">{data.name}</h2>
        <p className="description">{data.description}</p>
        <Price data={data} />
      </div>
      <div className="image">
        {quantity > 0 && (
          <div className="badge">
            <span className="value">{quantity}</span>
          </div>
        )}
        {data.enable === false ? (
          <div className='unavailable-wrapper'>
            <div className="unavailable-badge">
              <span className="value">No disponible</span>
            </div>
            <div className='opaque'>
              <Image src={image} alt={data.name} type="PRODUCT" />
            </div>
          </div>
        ) : 
        <Image src={image} alt={data.name} type="PRODUCT" />
      }
      </div>
    </div>
  );
};

export default ProductItem;
