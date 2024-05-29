import { IonImg } from '@ionic/react';

/**
 * Styles
 */
import './index.less';

/**
 * Models 
 */
import { IOrderDeliveryState } from '../../../../../../../../models/foodie/IOrderIntention';

/**
 * Components
 */
import StepUnit from './components/unit-step';

/**
 * Assets
 */

import canceledOrderImage from '../../../../../../../../assets/media/foodie/ilustration-order-cancel.svg';


const UNIQUE_CLASS = 'tsemmqbvny';

interface IProps {
  state: IOrderDeliveryState  //IStepState
}

const Stepper:React.FC<IProps> = ({state}) => {
  return (
    <div className={`stepper-wrapper-${UNIQUE_CLASS}`}>
      <div className='stepper'>
        <StepperCase state={state} />
      </div>
    </div>
  );
}


const StepperCase:React.FC<IProps> = ({state}) => {
  switch (state) {
    case 'ACCEPTED': return (
      <>
        <StepUnit isFirst text='Confirmado' type='READY' completed/>
        <StepUnit text='Preparación' />
        <StepUnit isLast text='Pedido listo' />
      </>
    );
    case 'BEING_PREPARED': return (
      <>
        <StepUnit isFirst text='Confirmado' type='READY' completed/>
        <StepUnit text='Preparación' type='COOKING'/>
        <StepUnit isLast text='Pedido listo' />
      </>
    );
    case 'READY_FOR_PICKUP': return (
      <>
        <StepUnit isFirst text='Confirmado' type='READY' completed/>
        <StepUnit text='Preparado' type='READY' completed/>
        <StepUnit isLast text='Pedido listo' type='READY'/>
      </>
    );
    case 'DELIVERED': return (
      <>
        <StepUnit isFirst text='Confirmado' type='READY' completed/>
        <StepUnit text='Preparado' type='READY' completed/>
        <StepUnit isLast text='Entregado' type='READY'/>
      </>
    );
    case 'CANCELLED': return (
      <IonImg src={canceledOrderImage} alt='Imagen orden cancelada' />
    );
    default: return ( 
      <>
        <StepUnit isFirst text='Confirmando' type='SPOON'/>
        <StepUnit text='Preparación' />
        <StepUnit isLast text='Pedido listo' />
      </>
     );
  }
};




export default Stepper;