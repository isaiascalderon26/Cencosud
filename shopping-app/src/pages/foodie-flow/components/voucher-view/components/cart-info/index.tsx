import { IonCol, IonGrid, IonRow } from '@ionic/react';
import { disc } from 'ionicons/icons';

/**
 * Lib
 */
import NumberFormatter from '../../../../../../lib/formatters/NumberFormatter';

/**
 * Models
 */
import IItem from '../../../../../../models/foodie/IItem';

interface IProps {
  foodieCartItems: IItem[]
  totalAmount: number
  discount?: number
}

const CartInfo: React.FC<IProps> = ({ foodieCartItems, totalAmount, discount }) => {
  return (
    <div className='detail-section'>
      <div className='detail-title'>Detalle del pedido</div>
      <IonGrid>
        {foodieCartItems.map(item => {
          const qty = item.quantity > 99 ? '99+' : item.quantity;
          const divItem = (
            <IonRow className='text-secondary-text-color rows' key={item.id}>
              <IonCol size='1.2'>{qty}</IonCol>
              <IonCol className='name' size='7.8'>{item.name}</IonCol>
              <IonCol className='price' size='3'>{`${NumberFormatter.toCurrency(item.price)}`}</IonCol>
            </IonRow>
          )
          return divItem;
        })}
        {discount ?
          <IonRow className='text-secondary-text-color rows'>
            <IonCol size='1.2' />
            <IonCol className='name' size='7.8'>Cupón de descuento</IonCol>
            <IonCol className='price' size='3'>{`-${NumberFormatter.toCurrency(discount)}`}</IonCol>
          </IonRow>
          : null
        }
        <IonRow className='padded'>
          <IonCol size='1.2'></IonCol>
          <IonCol className='name total label' size='3'>Total</IonCol>
          <IonCol className='price total amount' size='7.8'>{`${NumberFormatter.toCurrency(totalAmount)}`}</IonCol>
        </IonRow>
      </IonGrid>
    </div>
  );
}

export default CartInfo;