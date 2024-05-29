import { IonImg } from '@ionic/react';

/**
 * Styles
 */
import './index.less';

/**
 * Models
 */
import { IOrderDeliveryState } from '../../../../../../models/foodie/IOrderIntention';

/**
 * Assets
 */
 import canceledOrderImage from '../../../../../../assets/media/foodie/ilustration-order-cancel.svg';
 import deliveredOrderImage from '../../../../../../assets/media/foodie/ilustration-order-deliver.svg';
 import scheduledOrderImage from '../../../../../../assets/media/foodie/ilustration-order-scheduled.svg';

 const UNIQUE_CLASS = "nornnypeyt";

 export type IOrderState = IOrderDeliveryState | 'SCHEDULED';
interface IProps {
  orderState: IOrderState
}

type MapType = {
  title: string,
  image:string,
  text: string
}
const cmpMap = new Map<IOrderState, MapType>([
  ['DELIVERED', {
    title: '¡Pedido entregado!',
    image: deliveredOrderImage,
    text: 'Tu pedido ha sido entregado sin problemas. ¡Esperamos que lo hayas disfrutado!'
  }],
  ['CANCELLED', {
    title: '¡Pedido cancelado!',
    image: canceledOrderImage,
    text: 'Lo sentimos el local tuvo un inconveniente y no pudo completar tu pedido.'
  }],
  ['SCHEDULED', {
    title: '¡Pedido programado!',
    image: scheduledOrderImage,
    text: `Tu pedido ha sido programado exitosamente
    ¡Te avisaremos cuando tu pedido se esté preparando!`
  }]
]) 

const OrderStateImage:React.FC<IProps> = ({orderState}) => {
  
  if(orderState !== 'DELIVERED' && orderState !== 'CANCELLED' && orderState !== 'SCHEDULED') {
    return (
      null
    );
  }

  return (
    <div className={`order-state-image-wrapper-${UNIQUE_CLASS}`}>
      <div className='order-state-image-title'>{cmpMap.get(orderState)?.title}</div>
      <div className='order-state-image-image'>
        <IonImg src={cmpMap.get(orderState)?.image } alt='Imagen' />
      </div>
      <div className='order-state-image-text'>{cmpMap.get(orderState)?.text}</div>
    </div>
  );
}

export default OrderStateImage;