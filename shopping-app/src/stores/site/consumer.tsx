import React, { PropsWithChildren } from 'react';
import { SiteContext } from './context';

const SiteConsumer = ({ children }: PropsWithChildren<{}>) => {
  return <SiteContext.Consumer>{() => <div></div>}</SiteContext.Consumer>;
};

export default SiteConsumer;
