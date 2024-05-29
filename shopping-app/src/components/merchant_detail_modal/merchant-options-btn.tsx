import { IonButton, IonIcon, IonSpinner, IonTabButton } from '@ionic/react';
import React, { ForwardRefExoticComponent, MouseEventHandler } from 'react';
import sc from 'styled-components';

interface Props {
  text: string;
  icon?: React.ReactNode | string;
  loading?: boolean;
  onClick?: (e: any) => void;
}

const Button = sc.div`
    font-size: 16px;
    font-weight: 700;

    padding: 16px;
    margin: 12px 20px;
    box-shadow: 0px 0px 3px 3px #00000024;
    border-radius: 50px;

    display: flex;
    flex-direction: row;
    align-items: center;
    align-content: center;

    gap: 12px;

    >ion-icon {
        font-size: 21px;
    }

    >img {
        height: 21px;

    }
`;

function MerchantOptionsBtn({ icon, text, onClick, loading }: Props) {
  return (
    <Button
      className="ion-text-center"
      onClick={(e: any) => {
        onClick && onClick(e);
      }}
    >
      {!icon ? false : typeof icon == 'string' ? <IonIcon src="icon" /> : icon}
      <span style={{ textAlign: 'left', flex: 1 }}>{text}</span>
      {loading && <IonSpinner name="crescent" />}
    </Button>
  );
}

export default MerchantOptionsBtn;
