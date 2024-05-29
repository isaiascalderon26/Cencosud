import React, { useEffect, useState } from 'react';
import { ISite } from '../../models/store-data-models/ISite';
import Promotions from '../../pages/new-mall-home/components/promotion-section';
import EmptyModal from '../empty-modal';
import { i18nFactory } from '../i18n';
import localize from './locale';
import sc from 'styled-components';
import { IMerchantPlace, ISitePlace } from '../../models/how-to/place';
import {
  NearMerchantPlace,
  useGetPlaces,
} from '../../hooks/how-to/useGetMerchant';
import iconCheck from '../../assets/media/icon-checked-white-bg.svg'; 
import { IMerchant } from '../../models/merchants/IMerchant';

const I18 = i18nFactory(localize);

interface Props {
  onClose: () => void;
  site: ISite;
  currentLocation: IMerchant;
}

const NearStores = sc.div`
`;

function ArriveModal({ onClose, site, currentLocation }: Props) {
  const [nearStores, setNearStores] = useState<NearMerchantPlace[]>([]);
  const { getNearPlaces } = useGetPlaces();

  async function loadNearStores() {
    const places = await getNearPlaces(site, currentLocation);

    if (!places) return;

    setNearStores(places);
  }

  useEffect(() => {
    loadNearStores();
  }, []);

  return (
    <EmptyModal 
      onClose={onClose}
      title={localize('ARRIVED')} 
      height={'350px'} 
      icon={iconCheck}
      onOkClick={onClose}
      okText={localize('BACK_TO_TOP')}
      hidden={true}
      cssClass={'text-color'}
    >
      {nearStores.length > 0 && (
        <NearStores>
          <I18 variant="span" id={'YOU_CAN_ALSO_VISIT'} />
          {nearStores.map(() => (
            <div></div>
          ))}
        </NearStores>
      )}
    </EmptyModal>
  );
}

export default ArriveModal;
