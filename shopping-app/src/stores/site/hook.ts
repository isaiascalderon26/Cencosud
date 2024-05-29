import { useContext } from 'react';
import { SiteContext } from './context';

export const useSiteContext = () => {
  const ctx = useContext(SiteContext);
  return ctx;
};
