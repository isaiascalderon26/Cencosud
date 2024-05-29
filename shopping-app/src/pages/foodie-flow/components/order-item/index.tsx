import moment from "moment";

/**
 * Styles
 */
import './index.less';

/**
 * Components
 */
import Image from "../image";
import CustomChip, { IProps as ChipProps } from "../custom-chip";
import { IOrderDeliveryState } from "../../../../models/foodie/IOrderIntention";

const UNIQUE_CLASS = 'wnghqnlwrt';

const convertPickUpDate = (date?: string) => {
  if (date && moment(date).isValid()) {
    const datetime = moment(date);
    return `Retirarlo el ${datetime.format('L')} a las ${datetime.format('LT')} hrs.`;
  } else {
    return 'Fecha de retiro por definir';
  }
}

const getChipProps = (type: IOrderDeliveryState): ChipProps => {
  const mapper = new Map<IOrderDeliveryState, ChipProps>([
    ["ACCEPTED", { text: 'Confirmando...', type: 'SUCCESS' }],
    ["BEING_PREPARED", { text: 'Preparando...', type: 'SUCCESS' }],
    ["READY_FOR_PICKUP", { text: 'Listo', type: 'SUCCESS', icon: true }],
    ["DELIVERED", { text: 'Entregado', type: 'SUCCESS', icon: true }],
    ["CANCELLED", { text: 'Rechazado', type: 'DANGER', icon: true }],
  ]);
  return mapper.get(type)!;
}

interface IProps {
  orderState?: IOrderDeliveryState,
  localImage: string,
  localName: string,
  localDetail: string,
  orderNumber: string,
  pickUpDate?: string,
  onSeeDetails?: () => void
}

const OrderItem: React.FC<IProps> = ({ localDetail, localImage, localName, orderNumber, pickUpDate, orderState, onSeeDetails }) => {

  return (
    <div className={`order-item-${UNIQUE_CLASS}`} onClick={onSeeDetails}>

      <div className="logo">
        <Image type="STORE" src={localImage} alt="Image" />
      </div>

      <div className="main-region">
        <div className="content">

          <div className="flex-row-space-between margin-bottom-6 flex-start">
            <div className="flex-column" style={{ alignItems: 'flex-start' }}>
              <div className="content-title">{localName}</div>
              <div className="item-text margin-top-4">{localDetail}</div>
            </div>
            {orderState && <CustomChip {...getChipProps(orderState)} />}
          </div>


          <div className="flex-row-space-between margin-top-4 margin-bottom-12">
            <div className="item-text">N° del pedido:</div>
            <div className="order-number-text">{orderNumber}</div>
          </div>

        </div>

        <div className="inner-divider" />

        <div className="flex-row-space-between item-text margin-top-12">
          {convertPickUpDate(pickUpDate)}
          <div className="icon-arrow-next">
            <div className="arrow"></div>
          </div>
        </div>
      </div>
    </div>
  )

};

export default OrderItem;