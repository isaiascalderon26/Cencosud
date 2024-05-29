import lodash from 'lodash';
import { useState } from 'react';

/**
 * Styles
 */
import './index.less';

/**
 * Models
 */
import { IArrayRestResponse } from '../../../../clients/RESTClient';
import IPaymentIntention from '../../../../models/payments/IPaymentIntention';
import { IOrderDeliveryState } from '../../../../models/foodie/IOrderIntention';

/**
 * Components
 */
import Footer from '../footer';
import OrderItem from '../order-item';
import Page, { DefaultHeader } from '../../../../components/page';
import HelpRegisterModal from '../../../../components/help-register-modal';

/**
 * Assets
 */
import foodieIcon from '../../../../assets/media/foodie/ilustration-welcome-foodie.png';
import OnBoardingOne from '../../../../assets/media/foodie/onboarding-step-01.svg';
import OnBoardingTwo from '../../../../assets/media/foodie/onboarding-step-02.svg';
import OnBoardingTree from '../../../../assets/media/foodie/onboarding-step-03.svg';
import OnBoardingFour from '../../../../assets/media/foodie/onboarding-step-04.svg';
import InfoImg from '../../../../assets/media/info-blue.svg';
import { IonButton } from '@ionic/react';

const UNIQUE_CLASS = 'jjiszvkcaz';

interface IModalOnboarding {
  image: string;
  title: string;
  description: string;
}

const modalDataOnboarding = (): IModalOnboarding[] => {
  let strings: IModalOnboarding[] = [];

  strings.push({
    image: OnBoardingOne,
    title: 'Elige tu restaurante favorito',
    description:
      'Selecciona el restaurante que más te guste dentro de nuestro listado.',
  });
  strings.push({
    image: OnBoardingTwo,
    title: 'Personaliza tu pedido a tu gusto',
    description:
      'Agrega o quita productos como quieras y vive una mejor experiencia con nosotros.',
  });
  strings.push({
    image: OnBoardingTree,
    title: 'Utiliza Multi Pedido para maximizar tu tiempo',
    description:
      'Puedes solicitar diferentes productos de distintos locales y paga una sola vez.',
  });
  strings.push({
    image: OnBoardingFour,
    title: 'Retira tu pedido',
    description:
      'Disfruta tu tiempo y mi mall te avisará cuando esté listo.',
  });

  return strings;
};

interface IProps {
  pending_payments?: IArrayRestResponse<IPaymentIntention>;
  onEndOnboarding: () => void;
  goBack: () => void;
  onClickPendingItem: (payment_intention: IPaymentIntention) => void;
  isFirstTime: boolean;
}

const OnBoardingView: React.FC<IProps> = ({
  pending_payments,
  isFirstTime,
  onEndOnboarding,
  goBack,
  onClickPendingItem,
}) => {
  const [showOnboardingModal, setShowOnboardingModal] =
    useState<boolean>(false);
  const withPendingPayments =
    pending_payments && pending_payments.data.length > 0;

  const onContinue = () => {
    // if (/*isFirstTime && */ !withPendingPayments) {
    //   setShowOnboardingModal(true);
    // } else {
    onEndOnboarding();
    // }
  };

  const handleOnClickInfo = () => {
    setShowOnboardingModal(true);
  };

  const content = (
    <>
      <div className={`body-${UNIQUE_CLASS}`}>
        <header>
          <img src={foodieIcon} alt="comida logo" />
          <h3 className="font-bold">Bienvenido a </h3>
          <span className="font-bold">Comida</span>
          <p>
            Disfruta de la <strong>mejor gastronomía</strong> en nuestros
            centros comerciales{' '}
            <strong>sin tener que hacer filas. Explora</strong> nuestras alternativas, elige el que más te guste y haz tu pedido sin
            tener que esperar.
          </p>
        </header>

        <button onClick={handleOnClickInfo}>
          <img src={InfoImg} alt="info icon" />
          Conoce más de Comida
        </button>
        <IonButton onClick={onContinue}>
          Haz tu pedido ahora y disfruta
        </IonButton>

        {withPendingPayments && (
          <div className="list">
            <h2>Pedidos en curso</h2>
            {pending_payments!.data.map((payment_intention) => {
              const type = lodash.get(
                payment_intention,
                'metadata.foodie_delivery.type'
              ) as string;
              const detail =
                type === 'PICKUP' ? 'Pedido para servir' : 'Pedido para llevar';

              return (
                <OrderItem
                  key={payment_intention.id}
                  localImage={
                    lodash.get(
                      payment_intention,
                      'metadata.foodie_local.logo'
                    ) as string
                  }
                  localName={
                    lodash.get(
                      payment_intention,
                      'metadata.foodie_local.name'
                    ) as string
                  }
                  pickUpDate={lodash.get(
                    payment_intention,
                    'outcome.result.foodie_order_delivery_date'
                  )}
                  orderState={
                    lodash.get(
                      payment_intention,
                      'outcome.result.foodie_order_delivery_state'
                    ) as IOrderDeliveryState
                  }
                  onSeeDetails={() => {
                    onClickPendingItem(payment_intention);
                  }}
                  orderNumber={
                    lodash.get(
                      payment_intention,
                      'outcome.result.foodie_order_number'
                    ) || ' - '
                  }
                  // TODO: this info is not present in any place (using other info instead)
                  localDetail={detail}
                />
              );
            })}
          </div>
        )}
      </div>
      {showOnboardingModal && (
        <>
          <HelpRegisterModal
            onClose={onEndOnboarding}
            modal_is_open={showOnboardingModal}
            content={modalDataOnboarding()}
          />
        </>
      )}
    </>
  );
  // const footer = (
  //   <Footer
  //     onClick={onContinue}
  //     btnText={
  //       withPendingPayments ? 'Continuar' : 'Haz tu pedido ahora y disfruta'
  //     }
  //   />
  // );
  return (
    <Page
      // header={<DefaultHeader onBack={goBack} />}
      content={content}
      // footer={footer}
    />
  );
};

export default OnBoardingView;
