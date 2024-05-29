import { IonProgressBar } from "@ionic/react";
import moment from "moment";
import { useMemo } from "react";

const isDate = (date?: string) => date && moment(date).isValid();

const extractTime = (date?: string) => {
  if (isDate(date)) {
    return `${moment(date).format("LT")} hrs.`;
  } else {
    return "-";
  }
};

const extractDate = (date?: string) => {
  if (isDate(date)) {
    return moment(date).format("L");
  } else {
    return "-";
  }
};

interface IProps {
  beingPrepareDate: string;
  deliveryDate: string;
  deliveryState: string;
  hasAutomaticFlow: boolean;
}

const OrderInfo: React.FC<IProps> = ({
  beingPrepareDate,
  deliveryDate,
  deliveryState,
  hasAutomaticFlow,
}) => {
  const isDelivered = deliveryState === "DELIVERED";
  const isCancelled = useMemo(() => deliveryState === "CANCELLED", [deliveryState])
  let progressValue = 0;

  if (isDate(beingPrepareDate) && isDate(deliveryDate)) {
    const now = moment();
    const startPreparing = moment(beingPrepareDate);
    const delivery = moment(deliveryDate);
    const totalTime = delivery.diff(startPreparing);
    const timeElapsed = now.diff(startPreparing);

    progressValue = timeElapsed / totalTime;
    progressValue = Math.max(0, Math.min(1, progressValue));
    if (isDelivered) {
      progressValue = 1;
    }
  }

  return (
    <div className="info-section">
      <div className="info-row-section">
        <div className="info-label text-secondary-text-color">
          Hora de retiro aprox.
        </div>
        <div className="data-label">{extractTime(deliveryDate)}</div>
      </div>
      {(!hasAutomaticFlow || isDelivered) && (
        <div className="info-row-section">
          <div className="info-label text-secondary-text-color">
            Fecha de retiro
          </div>
          <div className="data-label">{extractDate(deliveryDate)}</div>
        </div>
      )}
      {(hasAutomaticFlow && !isDelivered && !isCancelled) && (
        <IonProgressBar className="delivery-progress" value={progressValue} />
      )}
    </div>
  );
};

export default OrderInfo;
