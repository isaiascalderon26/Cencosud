import { IonIcon } from '@ionic/react';
import { arrowBack } from 'ionicons/icons';
import React from 'react';
import './index.less';

interface Props {
  handler: () => void;
}

function BackButton({ handler }: Props) {
  return (
    <div
      onClick={() => {
        handler();
      }}
      className="back-button"
    >
      <IonIcon icon={arrowBack}></IonIcon>
    </div>
  );
}

export default BackButton;
