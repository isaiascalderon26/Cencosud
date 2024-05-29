import { ISiteActions, ISiteState } from './types';

export const siteReducer = (
  state: ISiteState,
  action: ISiteActions
): ISiteState => {
  switch (action.type) {
    case 'setMerchants':
      return { ...state, merchants: action.payload };
    case 'setSite':
      return { ...state, site: action.payload };
    default:
      return state;
  }
};
