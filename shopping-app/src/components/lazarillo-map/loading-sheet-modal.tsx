import React from 'react';
import SheetModal from '../sheet-modal';
import BackdropLoading from '../backdrop-loading';
import sc from 'styled-components';
import { IonSpinner } from '@ionic/react';

interface Props {
  text: string;
  size?: number;
}

const Body = sc.div<{ size?: number }>`
    height: 100%;
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 19px;

    ion-spinner {
      width: 100%;
      height: 100%;
      font-size: 50px;
      font-weight: 500;
      color: #4EAEB8;
    }

    span {
        font-weight: 700;
        font-size: 18px;
        line-height: 24px;
        color: #333333;
        margin-top: 30px;
        text-align: center;
    }

    >div {
        width: 100%;
        height: 100%;
    }
`;

function LoadingSheetModal({ text, size = 60 }: Props) {
  return (
    <SheetModal
      isOpen={true}
      expanded={false}
      cssClass="lazarillo-map-sheet-modal show-backdrop"
      minHeight={200}
      backdropDismiss={false}
    >
      <Body size={size}>
        <span>Estamos buscando la mejor manera de llegar a tu destino.</span>
        <div style={{height: "75px", textAlign: "center"}}>
          <IonSpinner name="crescent" color="#53a3bf" />
        </div>
      </Body>
    </SheetModal>
  );
}

export default LoadingSheetModal;
