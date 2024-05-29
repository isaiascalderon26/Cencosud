import { isEmpty } from "lodash";

interface IProps {
  name: string,
  orderNumber: string
}

const UserOrderInfo: React.FC<IProps> = ({ name, orderNumber }) => {

  return (
    <div className='user-order-info-section'>
      <div className="text">Pedido a nombre de:</div>
      <div className="name">{name}</div>
      <div className={`order-number ${!isEmpty(orderNumber) && 'order-number-text'}`}>{`${isEmpty(orderNumber) ? '' : `#${orderNumber}`}`}</div>
    </div>
  );
}

export default UserOrderInfo;