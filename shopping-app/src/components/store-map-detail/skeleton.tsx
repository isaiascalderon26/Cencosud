import { IonContent, IonSkeletonText } from '@ionic/react';
import React from 'react';

export const Skeleton = () => {
  return (
    <IonContent>
      <div style={{ padding: '20px 24px' }}>
        <IonSkeletonText
          style={{ height: '40px', width: '100%', borderRadius: '24px' }}
          animated={true}
        ></IonSkeletonText>
        <IonSkeletonText
          style={{
            height: '60vh',
            width: '100%',
            borderRadius: '24px',
            marginTop: '24px',
          }}
          animated={true}
        ></IonSkeletonText>
      </div>
    </IonContent>
  );
};

export default Skeleton;
