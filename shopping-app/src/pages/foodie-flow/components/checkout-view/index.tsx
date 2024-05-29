import moment from 'moment';
import { isNumber } from 'lodash';
import { add } from 'ionicons/icons';
import { IonContent, IonIcon, IonSpinner } from '@ionic/react';
import { Fragment, useEffect, useState } from 'react';

/**
 * Styles
 */
import './index.less';

/**
 * Components
 */
import Image from '../image';
import Accordion from '../accordion';
import OptionBox from './components/option-box';
import CartButton from '../../components/cart-button';
import { DefaultHeader } from '../../../../components/page';
import TimeSchedule, { IInterval } from './components/time-schedule';
import ButtonDiscount from '../../../../components/button-discount';

/**
 * Models
 */
import IDelivery from '../../../../models/foodie/IDelivery';
import { IDiscount } from '../../../../models/discount/IDiscount';
import ILocal, {ILocalSlot, IOrderDeliveryMethod} from '../../../../models/foodie/ILocal';
import ICard, { resolveCardTypeIcon } from '../../../../models/cards/ICard';

/**
 * Assets
 */
import addIcon from '../../../../assets/media/foodie/add.svg';
import cardsIcon from '../../../../assets/media/foodie/cards.svg';
import alertIcon from '../../../../assets/media/foodie/alert.svg';
import mapPinIcon from '../../../../assets/media/foodie/map-pin.svg'
import shoppingBagIcon from '../../../../assets/media/foodie/shopping-bag.svg'
import radioDefaultIcon from '../../../../assets/media/foodie/radio-default-icon.svg';


const UNIQUE_CLASS = "sqzbanihdy";

interface IProps {
  submitted: boolean,
  deliveries?: Record<string,IDelivery>,
  selected_card?: ICard,
  locals: ILocal[],
  locals_slots?: Record<string, ILocalSlot[]>,
  discounts?: Record<string,IDiscount[]>,
  totalDiscount: number,
  amountWithoutDiscount: number
  finalAmount: number,

  onBack: () => void,
  onPayOrder:  () => void,
  openDiscount: (local: ILocal) => void
  onAddNewCard: () => void,
  onOpenCardManagement: () => void,
  onSelectDeliveryMethod: (selected: {local: ILocal, idDeliveryMethodSelected: string}) => void,
  onSelectWithdrawAsap: (local:ILocal) => void,
  onSelectWithdrawScheduled: (slot: ILocalSlot, local:ILocal) => void
  fetchAllDiscounts: (locals:ILocal[]) => Promise<void>
}

const CheckoutView:React.FC<IProps> = ({ submitted, deliveries, selected_card, locals, locals_slots, discounts, totalDiscount, amountWithoutDiscount, finalAmount, onBack, onPayOrder, onAddNewCard, onOpenCardManagement, openDiscount, onSelectDeliveryMethod, onSelectWithdrawAsap, onSelectWithdrawScheduled, fetchAllDiscounts }) => {

  const [localScheduleToShow, setLocalScheduleToShow] = useState<ILocal>();
  const [isLoadingDiscounts, setIsLoadingDiscounts] = useState(true);

  const [scheduledInterval, setScheduledInterval] = useState<Record<string,IInterval|undefined>>(
    () => {
    let data: Record<string,IInterval|undefined> = {};
    locals.forEach(local => {
      if(deliveries && deliveries[local.id] && deliveries[local.id].schedule_info.type === 'SCHEDULED'){
        data[local.id] = locals_slots![local.id].find(slot => moment(slot.start).diff(moment(deliveries[local.id].schedule_info.date), 'minutes'));
      }
      data[local.id] = undefined;
    });
    return data;
  });

  const [rowsByLocalId, setRowsByLocalId] = useState<Record<string,Record<string,any>>>({});
  const handleScheduleClick = (local:ILocal) => {
    setLocalScheduleToShow(local);
  }
  const handleScheduleClose = () => {
    setLocalScheduleToShow(undefined);
  }
  const handlePickInterval = (interval: IInterval) => {
    const local = localScheduleToShow;
    setLocalScheduleToShow(undefined);
    setScheduledInterval({[local!.id]:interval});
    onSelectWithdrawScheduled(interval as ILocalSlot, local!);
  }
  const verifyButtonDiscount = (local: ILocal) => {
    //false = button add
    //true = button most convenient
    if(discounts && discounts[local.id] && discounts[local.id].length > 0){
      const isSelectable = discounts[local.id]!.filter(f => f.selectable === true).length > 0 ? true : false;
      const isNotSelectable = discounts[local.id]!.filter(f => f.selectable === false).length > 0 ? true : false;
      if(isSelectable && isNotSelectable){
        return true;
      }
      if(isSelectable){
        return true;
      }
      if(isNotSelectable){
        return false;
      }
    }else{
      return false;
    }
  }

  let paymentMethod = (
    <div className='add-payment-method' onClick={onAddNewCard}>
      <img className='icon' src={addIcon} alt="add"/>
      <span className='text'>Asignar tarjeta</span>
    </div>
  )
  if (selected_card) {
    paymentMethod = (
      <div className='payment-method' onClick={onOpenCardManagement}>
        <img className='icon' src={resolveCardTypeIcon(selected_card.card_type)} alt="add"/>
        <span className='text'>{`···· ${selected_card.card_number.replace(/X/g, '')}`}</span>
        <div className='space' />
        <img className='cards-icon' src={cardsIcon} alt="cards"/>
      </div>
    )
  }

  const renderRowsDeliveryTypeByLocal = (local: ILocal ) => {
    let rows: JSX.Element[] = [];
    if (Object.keys(rowsByLocalId).length === 0) return rows;
    for (let rowIndex = 0; rowIndex < rowsByLocalId[local.id].countRows; rowIndex++) {
      const optionsDeliveryCapacity = (rowsByLocalId[local.id].countRows * 2)
      const option0onRow: IOrderDeliveryMethod = rowsByLocalId[local.id].enabledMethods[optionsDeliveryCapacity - 2]
      let option1onRow: IOrderDeliveryMethod | undefined;
      if (rowsByLocalId[local.id].enabledMethods.length === optionsDeliveryCapacity){
        option1onRow = rowsByLocalId[local.id].enabledMethods[optionsDeliveryCapacity - 1]
      }
      rows.push(
          <div className='delivery-types' key={'delivery-types-'+rowIndex}>
            <OptionBox key={'delivery-types-'+rowIndex+'-0'}
                       text={option0onRow.name} selected={!!(deliveries && deliveries[local.id]?.type === option0onRow.id)}
                       icon={mapPinIcon} onClick={() => onSelectDeliveryMethod({local, idDeliveryMethodSelected: option0onRow.id})} />
            {option1onRow &&
              <>
                <div className='vertival-space' />
                <OptionBox key={'delivery-types-'+rowIndex+'-1'}
                           text={option1onRow.name}
                           selected={!!(deliveries && deliveries[local.id]?.type === option1onRow.id)}
                           //@ts-ignore
                           icon={shoppingBagIcon} onClick={() => onSelectDeliveryMethod({local, idDeliveryMethodSelected: option1onRow.id})} />
              </>
            }
          </div>
      );
    }
    return rows.map(r=>{return (r)});
  }

  useEffect(() => {
    let rowsByLocal: Record<string,{countRows: number, enabledMethods: IOrderDeliveryMethod[]}> = {}
    locals.forEach((local: ILocal )=> {
      const deliveryTypesCount= local.order_delivery_methods?.length;
      if (!!deliveryTypesCount)
        rowsByLocal[local.id] = {
          countRows: Math.ceil(deliveryTypesCount/2),
          enabledMethods: local.order_delivery_methods.filter(o=>!o.disabled)
        };
      if(!deliveries || !deliveries[local.id]){
        const defaultIdDeliveryMethodSelected = rowsByLocal[local.id].enabledMethods[0].id || 'TAKEAWAY'
        // Selecting by default TAKEAWAY on enter view
        onSelectDeliveryMethod({local, idDeliveryMethodSelected: defaultIdDeliveryMethodSelected});
      }
    });
    setRowsByLocalId(rowsByLocal);
  }, [deliveries])

  useEffect(() => {
    (async () => {
      setIsLoadingDiscounts(true);
      await fetchAllDiscounts(locals);
      setIsLoadingDiscounts(false);
    })();
  }, [])


  return (
    <>
      <DefaultHeader onBack={onBack}/>
      <IonContent id='page-content'>
        <div className={`checkout-${UNIQUE_CLASS}`}>
          <div className='view-title'>
            <h1 className='title'>Opciones de retiro</h1>
            <p className='message'>Elige las opciones de retiro disponibles.</p>
          </div>
          <div className='view-content'>

            {locals.map((local) => {
              return (
                <Fragment key={local.id}>
                  <Accordion
                    headerClick={() => {} }
                    headerImage={<Image type="STORE" src={local.logo} alt="Image" />}
                    //headerSecondaryText="Volver a la tienda"
                    headerTitle={local.name}
                  >
                    <div className='padded'>
                      <h3 className='delivery-types-label'>¿Cómo lo quieres?</h3>
                      {renderRowsDeliveryTypeByLocal(local)}
                      {/* Order scheduling options are hidden because only immediate deliveries are made at the moment */}
                      
                      {/* <h3  className='delivery-types-label'>¿Cuándo lo quieres?</h3>
                      <div  className='withdraw-types'>
                        <OptionBox text='Lo antes posible' selected={deliveries && deliveries[local.id]?.schedule_info.type === 'ASAP' ? true : false} icon={radioDefaultIcon} onClick={() => onSelectWithdrawAsap(local)} />
                        <div className='horizontal-space' />
                        <OptionBox
                        text='Programar retiro'
                       secondaryText={deliveries && deliveries[local.id]?.schedule_info.type === 'SCHEDULED' ? `${moment(scheduledInterval[local.id]?.start).format('HH[h]mm')} a ${moment(scheduledInterval[local.id]?.end).format('HH[h]mm')}` : undefined }
                        selected={deliveries && deliveries[local.id]?.schedule_info.type === 'SCHEDULED'? true : false}
                        icon={radioDefaultIcon} onClick={() => handleScheduleClick(local)} />
                      </div> */}

                      <h3 className='coupon-label'>Aplicar cupón</h3>
                      { isLoadingDiscounts//isLocalLoadingDiscounts[local.id]
                        ?
                          <div className='payment-method coupon'>
                            <IonSpinner name="crescent" />
                          </div>
                        : verifyButtonDiscount(local)
                          ?
                            discounts && discounts[local.id] && discounts[local.id].length > 0 && discounts[local.id].map(item => {
                              if(item.selectable){
                                return (
                                  <Fragment key={item.id}>
                                    <ButtonDiscount onClick={() => { openDiscount(local) }} code={item.code} />
                                  </Fragment>
                                )
                              }
                            })
                          :
                            <div className='payment-method coupon' onClick={() => { openDiscount(local) }}>
                              <IonIcon src={add} />
                              <span className='text'>Ver cupones disponibles</span>
                              <div className='space' />
                            </div>
                      }
                    </div>
                  </Accordion>
                  <div className='separator' />
                </Fragment>
              )
            })}

            <div className='padded'>
              <h3 className='payment-methods-label'>Pagar con</h3>
              {paymentMethod}
              {!submitted && <div className='bottom-card-text'>Gestiona tus tarjetas presionando el botón a la derecha.</div>}
              <div className='error-message' style={{ display: submitted && !selected_card ? '': 'none' }} >
                <img className='img' src={alertIcon} alt="alert"/>
                <span className='text'>Debes agregar un medio de pago</span>
              </div>
            </div>
          </div>
        </div>
      </IonContent>
      <CartButton
        discount={ totalDiscount  > 0 ? {
          prevValue: amountWithoutDiscount,
          discount: totalDiscount
        } : undefined}
        amount={isNumber(finalAmount) ? finalAmount : 0 }
        buttonText='Pagar'
        locals={locals.map(l => l.id)}
        hideIfNotData={true}
        onClick={onPayOrder}
        style={totalDiscount > 0 ? {padding: '24px', paddingTop: '0'}: {}}



      />

      { localScheduleToShow &&
        <TimeSchedule
          intervals={(locals_slots![localScheduleToShow.id] as IInterval[])/*.filter(s => moment(s.start).isAfter(moment(), 'minutes'))*/}
          onClose={handleScheduleClose}
          onPick={handlePickInterval}/>
      }
    </>
  );
}

export default CheckoutView;
