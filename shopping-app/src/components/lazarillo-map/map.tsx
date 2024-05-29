import React, { MutableRefObject } from 'react';

const LazarilloMapCt = React.memo(
  ({ ref }: { ref: MutableRefObject<HTMLElement | undefined> }) => {
    return <capacitor-lazarillo-map ref={ref}></capacitor-lazarillo-map>;
  }
);

export default LazarilloMapCt;
