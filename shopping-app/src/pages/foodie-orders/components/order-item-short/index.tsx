import moment from "moment";

/**
 * Styles
 */
import './index.less';

/**
 * Components
 */
import Image from "../../../foodie-flow/components/image";

const UNIQUE_CLASS = 'diouwqahii';

const convertPickUpDate = (state: IEndStates, date?: string) => {
  if (date && moment(date).isValid()) {
    const datetime = moment(date);
    return `${state === 'DELIVERED' ? 'Entregado el ' : 'Rechazado el'} ${datetime.format('L')} a las ${datetime.format('LT')} hrs.`
  } else {
    if(state === 'DELIVERED'){
      return 'Fecha de retiro por definir';
    } else {
      return `Rechazado`;
    }
  }
}

type IEndStates = 'DELIVERED' | 'CANCELLED';
interface IProps {
  localImage: string,
  localName: string,
  date?: string,
  state: IEndStates
  onSeeDetails?: () => void
}

const OrderItemShort: React.FC<IProps> = ({ localImage, localName, date, state, onSeeDetails }) => {

  return (
    <>
      <div className={`order-item-short-${UNIQUE_CLASS}`} onClick={onSeeDetails}>
        <div className="logo">
          <Image type="STORE" src={localImage} alt="Image" />
        </div>
        <div className="main-region">
          <div className="content">
            <div className="flex-row-space-between margin-bottom-6 flex-start">
              <div className="flex-column">
                <div className="content-title">{localName}</div>
                <div className="item-text margin-top-4">{convertPickUpDate(state, date)}</div>
              </div>
            </div>
          </div>
        </div>
        <div className="inner-divider" />
        <div className="icon-arrow-next">
          <div className="arrow"></div>
        </div>
      </div>
    </>
  )

};

export default OrderItemShort;