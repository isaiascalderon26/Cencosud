import { IonList } from '@ionic/react';
import React, { useState } from 'react';
import { IMerchant } from '../../models/merchants/IMerchant';
import { ISite } from '../../models/store-data-models/ISite';
import MerchantListItem from './merchant-list-item';
import sc from 'styled-components';
import CustomMerchantListItem, {
  CustomItem,
} from './custom-merchant-list-item';

interface Props {
  merchants: IMerchant[];
  site: ISite;
  onMerchantClick?: (merchant: IMerchant | CustomItem) => void | Promise<void>;
  customItems?: CustomItem[];
}

const List = sc(IonList)`
    animation-name: search-fade;
    animation-duration: 600ms;
    animation-iteration-count: 1;
    background-color: var(--ion-background-color);
    width: 100%;
    border-radius: 30px 30px 0 0;
    z-index: 10;
    overflow-y: scroll;        
`;

function MerchantList({
  merchants,
  site,
  onMerchantClick,
  customItems,
}: Props) {
  const [waiting, setWaiting] = useState<string | undefined>();

  const onClick = async (item: IMerchant | CustomItem) => {
    if (!onMerchantClick) return;
    setWaiting(item.id);
    await onMerchantClick(item);
    setWaiting(undefined);
  };

  return (
    <List>
      {customItems &&
        customItems.map((i) => (
          <CustomMerchantListItem
            key={i.id}
            {...i}
            site={site}
            loading={!!(waiting && waiting === i.id)}
            onMerchantDetailClickHandler={onClick}
          />
        ))}
      {merchants.map((m: IMerchant) => {
        return (
          <MerchantListItem
            key={m.objectID}
            merchant={m}
            site={site}
            loading={!!(waiting && waiting === m.id)}
            onMerchantDetailClickHandler={onClick}
          />
        );
      })}
    </List>
  );
}

export default MerchantList;
