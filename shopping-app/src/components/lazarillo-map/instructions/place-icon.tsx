import { IonIcon } from '@ionic/react';
import { location } from 'ionicons/icons';
import React from 'react';
import sc from 'styled-components';

const Icon = sc.div`
    background: linear-gradient(to right, #609ADF, #E476DA);
    height: 40px;
    width: 40px;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    border-radius: 13px;
    color: white;
    font-size: 16px;
`;

function PlaceIcon() {
  return (
    <Icon>
      <IonIcon icon={location} />
    </Icon>
  );
}

export default PlaceIcon;
