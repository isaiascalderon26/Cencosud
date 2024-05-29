import moment, { Moment } from 'moment';
import memoize from 'fast-memoize';
import { ContentRect } from 'react-measure';
import { useScroll } from 'react-use-gesture';
import { IonCol, IonGrid, IonRow, IonSkeletonText, isPlatform } from '@ionic/react';
import React, { useState, useRef, useEffect } from 'react';

/**
 * Style
 */
import './index.less';

/**
 * Components
 */


/**
 * Models
 */
import ExchangedAvailableItem from './components/exchanged-available-item';
import IExchange from '../../../../models/cencosud-points/IExchange';

export interface IExchangedAvailableProps {
  exchanges: IExchange[];
  selectExchanged: (exchanged: IExchange) => void 
}

const ExchangedAvailable: React.FC<IExchangedAvailableProps> = ({ exchanges, selectExchanged }) => {
  
  const renderContent = () => {
    return (
      <div className='content'>
        <IonGrid>
          <IonRow>
            {exchanges!.map((exchange, key) => {
              return (
                <IonCol key={key} size="6" size-sm onClick={ () => selectExchanged(exchange)}>
                  <ExchangedAvailableItem exchange={exchange}/>
                </IonCol>
              )
            })}
          </IonRow>
        </IonGrid>
      </div>
    )
  }

  return (
    <div className="exchange-available">
      {renderContent()}
    </div>
  )
}

export default ExchangedAvailable;
