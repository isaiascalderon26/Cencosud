import Lottie, { LottieProps } from "react-lottie";
/**
 * Styles
 */
import "./index.less";

/**
 * Models
 */
import { IOrderDeliveryState } from "../../../../../../models/foodie/IOrderIntention";

/**
 * Components
 */
import Stepper from "./components/stepper";
import spoonStepperAnimation from "../../../../../../assets/media/foodie/lottie-animations/stepper-1.json";

const UNIQUE_CLASS = "tsdvlriaje";

const getLootieProps = (animationJson: any): LottieProps => {
  return {
    width: 40,
    height: 40,
    options: {
      loop: true,
      autoplay: true,
      animationData: animationJson,
      rendererSettings: {
        preserveAspectRatio: "xMidYMid slice",
      },
    },
  };
};

interface IOrderStateStepperData {
  title: string;
}
const OrderDeliveryStateMap = new Map<
  IOrderDeliveryState,
  IOrderStateStepperData
>([
  [
    "ACCEPTED",
    {
      title: "¡Pedido ingresado!",
    },
  ],
  [
    "BEING_PREPARED",
    {
      title: "¡Pedido en preparación!",
    },
  ],
  [
    "READY_FOR_PICKUP",
    {
      title: "¡Pedido listo!",
    },
  ],
  [
    "DELIVERED",
    {
      title: "¡Pedido entregado!",
    },
  ],
  [
    "CANCELLED",
    {
      title: "¡Pedido cancelado!",
    },
  ],
]);

interface IProps {
  step: IOrderDeliveryState;
  hasAutomaticFlow: boolean;
}

const OrderStateStepper: React.FC<IProps> = ({ step, hasAutomaticFlow }) => {
  return (
    <div className={`order-state-stepper-${UNIQUE_CLASS}`}>
      <div className="stepper-section">
        <div className="stepper-title">
          {OrderDeliveryStateMap.get(step)?.title || "¡Pedido por confirmar!"}
        </div>
        {!hasAutomaticFlow ? (
          <Stepper state={step} />
        ) : (
          <div>
            <Lottie {...getLootieProps(spoonStepperAnimation)} />
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderStateStepper;
