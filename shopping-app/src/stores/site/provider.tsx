import React, { PropsWithChildren, useReducer } from 'react';
import { SiteContext, siteInitialState } from './context';
import { siteReducer } from './reducer';
import { ISiteState } from './types';

function SiteProvider({
  children,
  initialState,
}: PropsWithChildren<{ initialState?: ISiteState }>) {
  const [state, dispatch] = useReducer(
    siteReducer,
    initialState ? { ...siteInitialState, ...initialState } : siteInitialState
  );

  return (
    <SiteContext.Provider value={{ state, dispatch }}>
      {children}
    </SiteContext.Provider>
  );
}

export default SiteProvider;
