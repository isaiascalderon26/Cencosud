import { IonIcon, IonItem, IonSpinner } from '@ionic/react';
import { chevronForward } from 'ionicons/icons';
import React from 'react';
import { IMerchant } from '../../models/merchants/IMerchant';
import { ISite } from '../../models/store-data-models/ISite';
import './merchant-list-item.less';

export interface CustomItem {
  icon: string | React.ReactNode;
  title: string;
  description?: string;
  id: string;
  loading?: boolean;
  __custom__: true;
}

interface Props extends CustomItem {
  site: ISite;
  onMerchantDetailClickHandler?: (item: CustomItem) => void;
}

function CustomMerchantListItem({
  site,
  onMerchantDetailClickHandler,
  loading,
  ...item
}: Props) {
  return (
    <IonItem
      key={item.id}
      onClick={() => {
        onMerchantDetailClickHandler && onMerchantDetailClickHandler(item!);
      }}
    >
      <div>
        <div>
          <div>
            <div className="search-logo">
              {typeof item.icon == 'string' ? (
                <img src={item.icon} />
              ) : (
                item.icon
              )}
            </div>
          </div>
          <div>
            <h1 dangerouslySetInnerHTML={{ __html: item.title }} />
            {item.description && <p>{item.description}</p>}
          </div>
          {loading && (
            <IonSpinner
              name="crescent"
              style={{
                // width: '50px',
                // height: '50px',
                padding: '5px',
                marginRight: '10px',
              }}
            />
          )}
        </div>
      </div>
    </IonItem>
  );
}

export default CustomMerchantListItem;
