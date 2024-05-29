import { createContext } from 'react';
import { IContext } from '../store';
import { ISiteActions, ISiteState } from './types';

type ISiteContext = IContext<ISiteState, ISiteActions>;

export const siteInitialState = {};

export const siteContextInitialValue: ISiteContext = {
  state: siteInitialState,
  dispatch: (s) => s,
};

export const SiteContext = createContext<ISiteContext>(siteContextInitialValue);
