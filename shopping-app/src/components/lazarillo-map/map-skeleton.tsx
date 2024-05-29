import { IonContent, IonSkeletonText } from '@ionic/react';
import React from 'react';
import sc from 'styled-components';

const Body = sc.div`
    position: absolute;
    background-color: white;
    height: 100%;
    width:100%;
    z-index: 2;
    visibility: visible;

    >div{
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 12px 24px 0px 24px;
        height: 100%;
        gap: 24px;

        ion-skeleton-text {
            border-radius: 24px;
        }

        >ion-skeleton-text:first-child {
            height: 40px;
            width: 60%;
        }

        >ion-skeleton-text:nth-child(2) {
            flex: 1;
            width: 100%;
            marginTop: 20px;
        }

        >ion-skeleton-text:last-child {
            height: 140px;
            border-bottom-left-radius: 0px;
            border-bottom-right-radius: 0px;
        }
    }
`;

function MapSkeleton() {
  return (
    <Body>
      <div>
        <IonSkeletonText animated={true}></IonSkeletonText>
        <IonSkeletonText animated={true}></IonSkeletonText>
        <IonSkeletonText animated={true}></IonSkeletonText>
      </div>
    </Body>
  );
}

export default MapSkeleton;
