import { IonIcon, IonItem, IonSpinner } from '@ionic/react';
import { chevronForward } from 'ionicons/icons';
import React from 'react';
import { IMerchant } from '../../models/merchants/IMerchant';
import { ISite } from '../../models/store-data-models/ISite';
import './merchant-list-item.less';

interface Props {
  merchant: IMerchant;
  site: ISite;
  loading?: boolean;
  onMerchantDetailClickHandler?: (merchant: IMerchant) => void;
}
interface Props {
  site: ISite;
}

function MerchantListItem({
  merchant,
  site,
  onMerchantDetailClickHandler,
  loading,
}: Props) {
  return (
    <IonItem
      key={merchant.objectID}
      onClick={() => {
        onMerchantDetailClickHandler && onMerchantDetailClickHandler(merchant!);
      }}
    >
      <div>
        <div>
          <div>
            <div className="search-logo">
              <img src={site.web + merchant.logo} />
            </div>
          </div>
          <div>
            <h1 dangerouslySetInnerHTML={{ __html: merchant.name }} />
            <p>{merchant.category.join(', ') /*merchant.category*/}</p>
          </div>
          {loading ? (
            <IonSpinner
              name="crescent"
              style={{
                // width: '40px',
                // height: '40px',
                padding: '5px',
                marginRight: '10px',
              }}
            />
          ) : (
            <div>
              <p>Nivel {merchant.level}</p>
            </div>
          )}
        </div>
        <div>
          <IonIcon icon={chevronForward}></IonIcon>
        </div>
      </div>
    </IonItem>
  );
}

export default MerchantListItem;
