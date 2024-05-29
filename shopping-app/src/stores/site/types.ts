import { IMerchant } from '../../models/merchants/IMerchant';
import { ISite } from '../../models/store-data-models/ISite';

export type ISiteActions =
  | {
      type: 'setSite';
      payload: ISite;
    }
  | { type: 'setMerchants'; payload: IMerchant[] };

export interface ISiteState {
  site?: ISite;
  merchants?: IMerchant[];
}
