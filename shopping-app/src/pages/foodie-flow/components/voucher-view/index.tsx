import { useEffect, useRef, useState } from "react";
import moment from "moment";
import lodash from "lodash";
import { arrowBack, helpCircleOutline } from "ionicons/icons";
import {
  IonButton,
  IonContent,
  IonHeader,
  IonIcon,
  IonSlide,
  IonSlides,
} from "@ionic/react";

/**
 * Styles
 */
import "./index.less";

/**
 * Clients
 */
import FoodieClient from "../../../../clients/FoodieClient";
import CalificationClient from "../../../../clients/CalificationClient";

/**
 * Models
 */
import IItem from "../../../../models/foodie/IItem";
import { IUser } from "../../../../models/users/IUser";
import { IScheduleInfo } from "../../../../models/foodie/IDelivery";
import ILocalContact from "../../../../models/foodie/ILocalContact";
import IPaymentIntention from "../../../../models/payments/IPaymentIntention";
import { IOrderDeliveryState } from "../../../../models/foodie/IOrderIntention";
import ICalificationQuestion from "../../../../models/calification/ICalificationQuestion";

/**
 * Components
 */
import Image from "../image";
import Footer from "../footer";
import CartInfo from "./components/cart-info";
import OrderInfo from "./components/order-info";
import StoreInfo from "./components/store-info";
import ContactsInfo from "./components/contacts-info";
import LocationInfo from "./components/location-info";
import UserOrderInfo from "./components/user-order-info";
import OrderStateStepper from "./components/order-state-stepper";
import CalificationModal from "../../../../components/califications";
import OrderStateImage, { IOrderState } from "./components/order-state-image";

/**
 * Assets
 */
import foodieQualification from "../../../../assets/media/foodie/qualification-image.svg";
import CodeValidationModal from "../../../../components/code-validation-modal";

const UNIQUE_CLASS = "vpmswpcqwb";

const isValidName = (name?: string): boolean =>
  name !== undefined && name !== "-";
const isOrderEndStep = (state: IOrderDeliveryState): boolean =>
  state === "CANCELLED" || state === "DELIVERED";
const isRecentlyScheduled = (
  schedule_info: IScheduleInfo,
  state?: IOrderDeliveryState
) => {
  if (!state && schedule_info.type === "SCHEDULED") {
    return true;
  }
  return false;
};
const showStepper = (
  schedule_info: IScheduleInfo,
  state: IOrderDeliveryState
) => !isOrderEndStep(state) && !isRecentlyScheduled(schedule_info, state);

const convertToOrderState = (
  schedule_info: IScheduleInfo,
  state: IOrderDeliveryState
): IOrderState => {
  if (!state && schedule_info.type === "SCHEDULED") {
    return "SCHEDULED";
  }
  return state;
};

interface IProps {
  payment_intentions: IPaymentIntention[];
  active_pay_int_idx: number;
  user: IUser;
  calificationQuestions: ICalificationQuestion[];
  mall_id: string;

  onGoBack: () => void;
  onSetShowForm: () => void;
  onSeeOrders: () => void;
  onClickFinalizeVoucher: () => void;
  onOpenSupportPage: (pi: IPaymentIntention) => void;
  onSetActivePayIntIndex: (index: number) => void;
}

const VoucherView: React.FC<IProps> = ({
  user,
  calificationQuestions,
  mall_id,
  payment_intentions,
  active_pay_int_idx,
  onGoBack,
  onSetShowForm,
  onSeeOrders,
  onClickFinalizeVoucher,
  onOpenSupportPage,
  onSetActivePayIntIndex,
}) => {
  const [mapsUrl, setMapUrls] = useState<Record<string, string>>({});
  const [displayContactModal, setDisplayContactModal] = useState(false);
  const [showQualification, setShowQualification] = useState(false);
  const [paymentsCalificated, setPaymentCalificated] = useState<string[]>([]);
  const [buttons, setButtos] = useState<any[]>([]);
  const [validationModalInfo, setValidationModalInfo] = useState({
    show: false,
    isLoading: false,
    hasError: false,
  });
  const [codeValidationResponseStatus, setCodeValidationResponseStatus] =
    useState(0);

  const slideRef = useRef<HTMLIonSlidesElement>(null);

  const getLocalLogo = (pi: IPaymentIntention) =>
    lodash.get(pi, "metadata.foodie_local.logo") as string;
  const getLocalName = (pi: IPaymentIntention) =>
    lodash.get(pi, "metadata.foodie_local.name") as string;
  const getLocalId = (pi: IPaymentIntention) =>
    lodash.get(pi, "metadata.foodie_local.id") as string;
  const getOrderNumber = (pi: IPaymentIntention) =>
    lodash.get(pi, "outcome.result.foodie_order_number");
  const getOrderId = (pi: IPaymentIntention) =>
    lodash.get(pi, "outcome.result.foodie_order_id");
  const getDeliveryState = (pi: IPaymentIntention) =>
    lodash.get(pi, "outcome.result.foodie_order_delivery_state");
  const getCancelledDate = (pi: IPaymentIntention) =>
    lodash.get(pi, "outcome.result.foodie_order_cancelled_date");
  const getSchedule_info = (pi: IPaymentIntention) =>
    lodash.get(pi, "metadata.foodie_delivery.schedule_info");
  const getLocalContact = (pi: IPaymentIntention) =>
    lodash.get(pi, "metadata.foodie_local.contacts") as ILocalContact[];
  const getCookingFlow = (pi: IPaymentIntention) =>
    lodash.get(
      pi,
      "metadata.foodie_local.cooking_time_settings.flow"
    );
  const getDeliveryFlow = (pi: IPaymentIntention) =>
    lodash.get(pi, "metadata.foodie_local.delivery_settings.flow");

  const getType = (pi: IPaymentIntention) =>
    lodash.get(pi, "metadata.foodie_delivery.type");
  const getDetail = (pi: IPaymentIntention) =>
    getType(pi) === "PICKUP" ? "Pedido para servir" : "Pedido para llevar";
  const getFoodie_cart_items = (pi: IPaymentIntention) =>
    lodash.get(pi, "metadata.foodie_cart") as IItem[];
  const getName = (pi: IPaymentIntention) =>
    isValidName(pi.payer.full_name) ? pi.payer.full_name : pi.payer.email;

  const isOrderCalificable = () => {
    if (
      !paymentsCalificated.find(
        (piId) => piId === payment_intentions[active_pay_int_idx].id
      )
    ) {
      if (
        payment_intentions[active_pay_int_idx] &&
        calificationQuestions &&
        calificationQuestions?.length > 0
      ) {
        if (
          calificationQuestions.filter((q) => {
            return (
              moment(payment_intentions[active_pay_int_idx].created_at).add(
                "days",
                q.availability
              ) > moment()
            );
          }).length > 0
        ) {
          return true;
        }
      }
    }
    return false;
  };

  const handleActivePaymentIntentionClick = async (pi: IPaymentIntention) => {
    const nextIndex = payment_intentions.findIndex((p) => p.id === pi.id);

    if (active_pay_int_idx < nextIndex) {
      // slide next
      await slideRef.current?.slideNext();
    } else if (active_pay_int_idx > nextIndex) {
      // slide prev
      await slideRef.current?.slidePrev();
    }

    onSetActivePayIntIndex(nextIndex);
  };

  const isPaymenteSelected = (id: string) =>
    payment_intentions[active_pay_int_idx].id === id;

  const onBootstrap = async () => {
    const ids = payment_intentions.map(
      (pi) => lodash.get(pi, "metadata.foodie_local.id") as string
    );
    const response = await FoodieClient.listLocals({
      offset: 0,
      limit: 10,
      query: {
        _id_is_one_of: ids,
      },
    });

    setMapUrls(
      response.data.reduce((acum, local) => {
        return {
          ...acum,
          [local.id]: local.map_url,
        };
      }, {})
    );

    const calificationsResp = await Promise.all(
      payment_intentions.map((pi) => {
        return CalificationClient.list({
          offset: 0,
          limit: 1,
          query: {
            payment_intention_id_is: pi.id,
          },
        });
      })
    );

    const califiatedPIs: string[] = [];
    for (const iterator of calificationsResp) {
      if (iterator.data.length > 0) {
        califiatedPIs.push(iterator.data[0].payment_intention_id);
      }
    }
    setPaymentCalificated((state) => {
      return [...state, ...califiatedPIs];
    });
  };

  const onSaveCalification = (pi: IPaymentIntention) => {
    setPaymentCalificated((state) => {
      return [...state, pi.id];
    });
  };

  const onShowCalificationModal = () => {
    setShowQualification(true);
  };

  const getButtons = () => {
    const isCalificable = isOrderCalificable();

    let buttons: { text: string; onClick: () => void }[] = [];
    if (
      lodash.get(
        payment_intentions[active_pay_int_idx],
        "outcome.result.foodie_order_delivery_state"
      ) === "DELIVERED" &&
      isCalificable
    ) {
      buttons.push({
        text: "Calificar experiencia",
        onClick: onShowCalificationModal,
      });
    }
    buttons.push({ text: "Volver al inicio", onClick: onClickFinalizeVoucher });
    buttons.push({ text: "Ver mis pedidos", onClick: onSeeOrders });

    return buttons;
  };

  useEffect(() => {
    onBootstrap();
  }, []);

  useEffect(() => {
    if (payment_intentions.length) {
      const deliveryState = getDeliveryState(
        payment_intentions[active_pay_int_idx]
      );
      const deliveryFlow = getDeliveryFlow(
        payment_intentions[active_pay_int_idx]
      );
      if (
        deliveryState === "READY_FOR_PICKUP" &&
        deliveryFlow === "DELIVERY_CODE"
      ) {
        setValidationModalInfo((modalInfo) => ({ ...modalInfo, show: true }));
      }
    }
    setButtos(getButtons());
  }, [active_pay_int_idx, payment_intentions, paymentsCalificated]);

  // this useEffect is used to change the states of the code validation modal, 
  // this logic is not done in the execution of the handleValidateCode function because
  //  you have to wait until the deliverystate changes to hide the modal
  useEffect(() => {
    if (payment_intentions.length) {
      const deliveryState = getDeliveryState(
        payment_intentions[active_pay_int_idx]
      );
      if (
        codeValidationResponseStatus &&
        codeValidationResponseStatus !== 200 &&
        deliveryState === "READY_FOR_PICKUP"
      ) {
        setValidationModalInfo({
          show: true,
          isLoading: false,
          hasError: true,
        });
      } else if (
        codeValidationResponseStatus === 200 &&
        deliveryState === "DELIVERED"
      ) {
        setValidationModalInfo({
          show: false,
          isLoading: false,
          hasError: false,
        });
      }
    }
  }, [codeValidationResponseStatus, active_pay_int_idx, payment_intentions]);

  // Setting date-time approximately date and time scheduled for the user.
  const getDeliveryDate = (pi: IPaymentIntention) =>
    isRecentlyScheduled(getSchedule_info(pi), getDeliveryState(pi))
      ? getSchedule_info(pi).date
      : lodash.get(pi, "outcome.result.foodie_order_delivery_date");

  const getCreateAt = (pi: IPaymentIntention) =>
    lodash.get(pi, "created_at") as unknown as string;

  const onDismissQualificationModal = () => {
    setShowQualification(false);
  };

  const handleValidateCode = async (code: string) => {
    try {
      setValidationModalInfo({ show: true, isLoading: true, hasError: false });
      const orderId = getOrderId(payment_intentions[active_pay_int_idx]);
      const response = await FoodieClient.sendValidationCode(orderId, code);
      setCodeValidationResponseStatus(response.status);
    } catch (error) {
      setCodeValidationResponseStatus(500);
    }
  };

  const slides = (
    <IonSlides ref={slideRef} class="swiper-no-swiping">
      {payment_intentions.map((pi) => {
        return (
          <IonSlide key={pi.id}>
            <div>
              <OrderStateImage
                orderState={convertToOrderState(
                  getSchedule_info(pi),
                  getDeliveryState(pi)
                )}
              />
              {getDeliveryState(pi) === "DELIVERED" ? (
                <>
                  <UserOrderInfo
                    name={getName(pi)}
                    orderNumber={getOrderNumber(pi)}
                  />
                  <OrderInfo
                    beingPrepareDate={getCreateAt(pi)}
                    deliveryDate={getDeliveryDate(pi)}
                    deliveryState={getDeliveryState(pi)}
                    hasAutomaticFlow={getCookingFlow(pi) === "PATIO_COMIDA"}
                  />
                </>
              ) : (
                <>
                  {getDeliveryState(pi) && (
                    <OrderInfo
                      beingPrepareDate={getCreateAt(pi)}
                      deliveryDate={getDeliveryDate(pi)}
                      deliveryState={getDeliveryState(pi)}
                      hasAutomaticFlow={getCookingFlow(pi) === "PATIO_COMIDA"}
                    />
                  )}
                  <UserOrderInfo
                    name={getName(pi)}
                    orderNumber={getOrderNumber(pi)}
                  />
                </>
              )}
              <StoreInfo
                localName={getLocalName(pi)}
                detail={getDetail(pi)}
                localLogo={getLocalLogo(pi)}
              />
              <CartInfo
                foodieCartItems={getFoodie_cart_items(pi)}
                totalAmount={
                  payment_intentions[active_pay_int_idx].transaction.amount
                    .total
                }
                discount={
                  payment_intentions[active_pay_int_idx].transaction.amount
                    .discount
                }
              />
              <LocationInfo
                map_url={
                  mapsUrl[getLocalId(payment_intentions[active_pay_int_idx])] ||
                  ""
                }
              />

              {buttons[0] && (
                <Footer
                  onClick={buttons[0].onClick}
                  btnText={buttons[0].text}
                  style={{ padding: "24px" }}
                >
                  {buttons[1] && (
                    <IonButton
                      onClick={buttons[1].onClick}
                      className={`footer-second-btn-${UNIQUE_CLASS} white`}
                    >
                      {buttons[1].text}
                    </IonButton>
                  )}
                  {buttons[2] && (
                    <IonButton
                      onClick={buttons[2].onClick}
                      className={`footer-second-btn-${UNIQUE_CLASS} white`}
                    >
                      {buttons[2].text}
                    </IonButton>
                  )}
                </Footer>
              )}
            </div>
          </IonSlide>
        );
      })}
    </IonSlides>
  );

  const contactsInfo = getLocalContact(payment_intentions[active_pay_int_idx]);

  const isOnTimeRange = (pi: IPaymentIntention) => {
    const foodie_order_delivery_state = getDeliveryState(pi);
    if (foodie_order_delivery_state === "DELIVERED") {
      const foodie_order_delivery_date = getDeliveryDate(pi);
      const now = moment();
      const diff = now.diff(moment(foodie_order_delivery_date), "hours");
      if (diff >= 24) {
        return false;
      } else {
        return true;
      }
    } else if (foodie_order_delivery_state === "CANCELLED") {
      const foodie_order_cancelled_date = getCancelledDate(pi);
      const now = moment();
      const diff = now.diff(moment(foodie_order_cancelled_date), "hours");
      if (diff >= 24) {
        return false;
      } else {
        return true;
      }
    }
    return false;
  };

  return (
    <>
      <IonHeader className={`voucher-header-${UNIQUE_CLASS}`}>
        <div className="first-header">
          <IonIcon icon={arrowBack} className="arrow-back" onClick={onGoBack} />
          <IonButton
            className="help-button"
            color="white"
            onClick={() => setDisplayContactModal(true)}
          >
            <IonIcon slot="start" icon={helpCircleOutline}></IonIcon>
            Ayuda
          </IonButton>
        </div>
        {showStepper(
          lodash.get(
            payment_intentions[active_pay_int_idx],
            "metadata.foodie_delivery.schedule_info"
          ),
          lodash.get(
            payment_intentions[active_pay_int_idx],
            "outcome.result.foodie_order_delivery_state"
          )
        ) && (
          <OrderStateStepper
            step={lodash.get(
              payment_intentions[active_pay_int_idx],
              "outcome.result.foodie_order_delivery_state"
            )}
            hasAutomaticFlow={
              getCookingFlow(payment_intentions[active_pay_int_idx]) ===
              "PATIO_COMIDA"
            }
          />
        )}
      </IonHeader>
      <IonContent className={`voucher-content-${UNIQUE_CLASS}`}>
        {slides}
        <CodeValidationModal
          isOpen={validationModalInfo.show}
          isLoading={validationModalInfo.isLoading}
          hasError={validationModalInfo.hasError}
          validateCode={handleValidateCode}
        />
      </IonContent>
      {payment_intentions.length > 1 && (
        <div className={`voucher-sticky-order-selector-${UNIQUE_CLASS}`}>
          {payment_intentions.map((pi) => {
            return (
              <div style={{ position: "relative" }} key={pi.id}>
                <div
                  className={`selectable-logo ${
                    isPaymenteSelected(pi.id) ? "selected" : ""
                  }`}
                  onClick={() => handleActivePaymentIntentionClick(pi)}
                >
                  <Image type="STORE" src={getLocalLogo(pi)} />
                </div>
                {!isPaymenteSelected(pi.id) && !getDeliveryState(pi) && (
                  <div className="badge">
                    <div className="dots">
                      <div className="dot" />
                      <div className="dot" />
                      <div className="dot" />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
      <ContactsInfo
        onSetShowForm={onSetShowForm}
        showSupportButton={isOnTimeRange(
          payment_intentions[active_pay_int_idx]
        )}
        isSlideIndex={2}
        displayContactModal={displayContactModal}
        contactsInfo={contactsInfo}
        handleClose={() => setDisplayContactModal(false)}
        openSupportPage={() =>
          onOpenSupportPage(payment_intentions[active_pay_int_idx])
        }
      />

      <CalificationModal
        flow="FOODIE"
        show={showQualification}
        initialPage={{
          mainText: `${
            user?.full_name === "" || user?.full_name === "-"
              ? "Hola"
              : user?.full_name
          }, ya tienes tu pedido`,
          mainImage: foodieQualification,
        }}
        cancelButtonText={"Ahora no"}
        payment_intention_id={payment_intentions[active_pay_int_idx]!.id}
        payment_date={payment_intentions[
          active_pay_int_idx
        ]!.created_at.toString()}
        user={user}
        fixed_questions={calificationQuestions}
        metadata={{
          local_name: lodash.get(
            payment_intentions[active_pay_int_idx]?.metadata,
            "foodie_local.name"
          )! as string,
          local_id: lodash.get(
            payment_intentions[active_pay_int_idx]?.metadata,
            "foodie_local.id"
          )! as string,
          mall_id: mall_id,
        }}
        onClose={() => {
          onDismissQualificationModal();
        }}
        onSaveCalification={() =>
          onSaveCalification(payment_intentions[active_pay_int_idx])
        }
      >
        <div>
          Cuéntanos cómo fue tu experiencia eligiendo y comprando tu pedido.
        </div>
        <div>Te tomará menos de un minuto.</div>
      </CalificationModal>
    </>
  );
};

export default VoucherView;
