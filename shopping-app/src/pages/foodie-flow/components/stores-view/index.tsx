import { cartOutline } from 'ionicons/icons';
import {
  IonChip,
  IonIcon,
  IonLabel,
} from '@ionic/react';

import iconUser from './../../../../assets/media/icon-user-2.svg';

import {
  notifications,
  chevronDown,
} from 'ionicons/icons';

/**
 * Styles
 */
import './index.less';

/**
 * Models
 */
import ILocal from '../../../../models/foodie/ILocal';
import { IArrayRestResponse } from '../../../../clients/RESTClient';

/**
 * Components
 */
import Footer from '../footer';
import Page from '../../../../components/page';

import Analytics from '../../../../lib/FirebaseAnalytics';
import SettingsClient from '../../../../clients/SettingsClient';


import ShoppingCartClient from '../../../../clients/ShoppingCartClient';
import { useEffect } from 'react';
import FirebaseAnalytics from '../../../../lib/FirebaseAnalytics';
import IProduct from '../../../../models/foodie/IProduct';
import React from 'react';
import CarrouselV2Widget from '../../widgets/carrousel-v2';
import ListWidget from '../../widgets/list';
import { useHistory } from 'react-router-dom'
import { IUser } from '../../../../models/users/IUser';
import FoodieCategoryList from '../../widgets/foodie-category-list';
import { IFoodieCategory } from '../../../../models/foodie/IFoodieCategory';

interface IProps {
  footerHidden: boolean;
  selectedLocal: ILocal | undefined;
  locals: IArrayRestResponse<ILocal> | undefined;
  products_promotion: IArrayRestResponse<IProduct> | undefined;

  openCart: () => void;
  onBack?: () => void;
  onShowStoreDetail: () => void;
  onSelectedLocal: (local: ILocal) => void;
  handleShowUserProfile: () => void;
  currentUser?: IUser
  foodieCategories: IFoodieCategory[];
  onChooseCategory?: (name: string, values: any) => void;
}

const StoresView: React.FC<IProps> = ({
  locals,
  selectedLocal,
  footerHidden,
  openCart,
  onBack,
  onShowStoreDetail,
  onSelectedLocal,
  products_promotion,
  handleShowUserProfile,
  currentUser,
  foodieCategories,
  onChooseCategory,
}) => {
  const stats = ShoppingCartClient.calculateMultiOrdersStats();

  const history = useHistory();

  let storeName = localStorage.getItem("mall-selected")!.toLocaleLowerCase().replace(/\s/g, '');



  useEffect(() => {

    FirebaseAnalytics.customLogEvent('ionic_app', 'comida');

    const localsWithItems = ShoppingCartClient.getLocalsIdsWithCartItems();

    if (localsWithItems.length === 1) {
      const local = locals?.data.find((l) => l.id === localsWithItems[0]);
      if (local) {
        onSelectedLocal(local);
      }
    }
  }, [locals]);

  const onOpenNotifications = () => {
    Analytics.customLogEventName(
      'button',
      'notificaciones',
      selectedLocal?.name!,
      'home',
      'notificaciones',
      currentUser?.email === 'invited' ? 'invitado' : 'registrado'
    );
    const isInvited = currentUser?.email === 'invited';

    if (isInvited) {
      handleShowUserProfile();
      return;
    }

    history.push(`/notifications`);
  }

  const header = (
    <div id="default-header">
      <div className='top-navbar'>
        {/* User profile btn */}
        <div>
          <IonIcon
            size="12"
            className="icon-user-btn icon-user-btn2"
            src={iconUser}
            onClick={handleShowUserProfile}
          />
        </div>

        {/* Mall selector btn */}
        <div
          onClick={() => {
            SettingsClient.remove('SELECTED_MALL');
            history.push('/?forwardTo=3'); // after select go to Tab #3 (zero-based) Comida
          }}
        >
          <img
            alt=""
            className="day"
            src={`${process.env.REACT_APP_BUCKET_URL}/logo/${storeName}-light.png`}
          ></img>
          <IonIcon className="chevron" src={chevronDown} />
        </div>

        {/* Notificaitons btn */}
        <div>
          <IonIcon
            src={notifications}
            onClick={onOpenNotifications}
          />
        </div>
      </div>

      
      <div className="header-name">
        <div>
          <h3 className="font-bold">Te damos la bienvenida a</h3>
          <h1 className="font-bold">Comida</h1>
        </div>
        {stats.quantity > 0 && (
          // ShoppingCartClient.getLocalsIdsWithCartItems().length > 1 &&
          <IonChip onClick={openCart}>
            <IonIcon icon={cartOutline} className="white-icon" />
            <IonLabel>{stats.quantity}</IonLabel>
          </IonChip>
        )}
      </div>
    </div>
  );

  const content = (
    <>
      <div >
        {foodieCategories?.length ? (
          <FoodieCategoryList
            onChooseCategory={onChooseCategory}
            categories={foodieCategories}
          />
        ) : null}
        {products_promotion?.data.length ? (
          <CarrouselV2Widget
            products={products_promotion.data}
            locals={locals?.data ?? []}
            onSelectedLocal={onSelectedLocal}
            onShowStoreDetail={onShowStoreDetail}
          />
        ) : null}
        {locals && (
          <ListWidget
            locals={locals.data}
            onSelectedLocal={onSelectedLocal}
            onShowStoreDetail={onShowStoreDetail}
          />
        )}
      </div>
    </>
  );

  const footer = (
    <Footer
      btnText="Continuar"
      onClick={onShowStoreDetail}
      btnHidden={footerHidden}
      style={{ ...(footerHidden && { boxShadow: 'none' }) }}
    />
  );

  return <Page header={header} content={content} />;
};

export default StoresView;
