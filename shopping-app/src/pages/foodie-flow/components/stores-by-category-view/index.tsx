import React, { useEffect, useMemo } from 'react';

import { cartOutline, arrowBack } from 'ionicons/icons';
import { IonChip, IonIcon, IonLabel } from '@ionic/react';

import './index.less';

import ILocal from '../../../../models/foodie/ILocal';
import { IArrayRestResponse } from '../../../../clients/RESTClient';

import Page from '../../../../components/page';
import ShoppingCartClient from '../../../../clients/ShoppingCartClient';
import ListWidget from '../../widgets/list';

interface IProps {
  categorySelected: string
  locals: IArrayRestResponse<ILocal> | undefined;
  openCart: () => void;
  onShowStoreDetail: () => void;
  onBack: () => void;
  onSelectedLocal: (local: ILocal) => void;
}

const _QUANTITY_OF_LOCAL_ITEMS = 1

const StoresByCategoryView: React.FC<IProps> = ({
  categorySelected,
  locals,
  openCart,
  onBack,
  onShowStoreDetail,
  onSelectedLocal,
}) => {
  const stats = ShoppingCartClient.calculateMultiOrdersStats();

  const filteredLocals = useMemo(() => {
    return locals?.data.filter((local) => local?.categories?.some(category => category.name === categorySelected))
  }, [categorySelected, locals])

  useEffect(() => {
    const localsWithItems = ShoppingCartClient.getLocalsIdsWithCartItems();

    if (localsWithItems.length === _QUANTITY_OF_LOCAL_ITEMS) {
      const local = locals?.data.find(
        (local) => local.id === localsWithItems[0]
      );

      if (local) onSelectedLocal(local);
    }
  }, [locals]);

  const header = (
    <div id="default-header">
      <div className="header-buttons">
        <IonIcon icon={arrowBack} onClick={onBack} />
        <IonChip onClick={openCart}>
          <IonIcon icon={cartOutline} className="white-icon" />
          <IonLabel>{stats.quantity}</IonLabel>
        </IonChip>
      </div>

      <h2 className="font-bold">{categorySelected}</h2>
    </div>
  );

  const content = (
    <div>
      {filteredLocals && (
        <ListWidget
          locals={filteredLocals}
          onSelectedLocal={onSelectedLocal}
          onShowStoreDetail={onShowStoreDetail}
        />
      )}
    </div>
  );


  return <Page header={header} content={content} />;
};

export default StoresByCategoryView;
