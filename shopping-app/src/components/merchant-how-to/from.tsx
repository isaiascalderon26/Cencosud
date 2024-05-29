import { IonSearchbar } from '@ionic/react';
import React, { useEffect, useState } from 'react';
import { IMerchant } from '../../models/merchants/IMerchant';
import { useSiteContext } from '../../stores/site';
import { i18nFactory } from '../i18n';
import MerchantList from '../merchant-list';
import localize from './locale';
import { sortBy } from 'lodash';
import sc from 'styled-components';
import { CustomItem } from '../merchant-list/custom-merchant-list-item';
import { Keyboard } from '@capacitor/keyboard';

const I18 = i18nFactory(localize);

export type How2Origin = IMerchant | CustomItem;

interface Props {
  merchant: IMerchant;
  onSelect: (merchant: IMerchant | CustomItem) => void;
  customItems?: CustomItem[];
}

const level = ({ level }: IMerchant): number => {
  const l = +level[0];
  return isNaN(l) ? 0 : l;
};

const Content = sc.div`
    height: 100%;
    display: flex;
    flex-direction: column;
    padding: 0 24px;

    > ion-list {
      flex-grow: 1;
      flex-basis: 0;
    }
`;

const Gps = sc.div``;

export const isCustomItem = (item: How2Origin) =>
  (item as CustomItem).__custom__ === true;

function From({
  merchant,
  onSelect,
  customItems = [],
}: Props) {
  const [search, setSearch] = useState('');
  const sitesStore = useSiteContext();

  const merchants = sortBy(
    sitesStore.state.merchants
      ? sitesStore.state.merchants.filter(
          ({ name, id }) =>
            merchant.id !== id &&
            (search.trim() === '' ||
              name.toLocaleLowerCase().indexOf(search.toLocaleLowerCase()) !==
                -1)
        )
      : [],
    [
      (l) => {
        const ll = level(l);
        const ml = level(merchant);

        return ll === ml ? -1 : ll;
      },
    ]
  );

  async function onMerchantSelected(merchant: How2Origin) {
    await Keyboard.hide()
    if (isCustomItem(merchant)) {
      await onSelect(merchant as CustomItem);
    } else {
      onSelect(merchant);
    }
  }

  return sitesStore.state.site && sitesStore.state.merchants ? (
    <Content>
      <I18
        id={'WHERE_ARE_YOU'}
        style={{
          fontWeight: 700,
          fontSize: 24,
        }}
      />
      <p
        style={{
          marginTop: "10px",
          marginBottom: "10px",
          color: "#808080"
        }}
      >
        Selecciona la tienda donde te encuentras como punto de inicio
      </p>
      <IonSearchbar
        // placeholder={localize('SEARCH_FIELD_HINT')}
        placeholder={"Busca aquí una tienda o restaurante"}
        value={search}
        onIonChange={(e) => {
          setSearch(e.detail.value ?? '');
        }}
        className="searchbar-stores"
        style={{ padding: 0 }}
      ></IonSearchbar>
      <MerchantList
        merchants={merchants}
        site={sitesStore.state.site}
        onMerchantClick={onMerchantSelected}
        customItems={customItems}
      />
    </Content>
  ) : (
    <></>
  );
}

export default From;
