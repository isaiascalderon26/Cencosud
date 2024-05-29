import React, { Fragment } from 'react';
import { IonIcon } from '@ionic/react';

import iconMiMall from '../../../../assets/media/icon-mimall-purple.svg';
import NumberFormatter from '../../../../lib/formatters/NumberFormatter';

import './index.less';
import IExchange from '../../../../models/cencosud-points/IExchange';


export interface IExchangedItemProps {
  exchanged: IExchange;
}

export default class ExchangedItem extends React.Component<IExchangedItemProps, {}> {

  render() {
    const { exchanged } = this.props;

    return (

      <Fragment>
        <div className="exchanged-components">
          <div className='image'>
            <img src={exchanged.content.image} alt='img' />
          </div>
          <div className="container-info">
            <div className="text">
              <div className="text-row">
                <div className="text-right">
                  {exchanged.content.title}
                </div>
                <div className="text-left">
                  Canjeado
                </div>
              </div>
              <div className="text-subtitle">
                {exchanged.content.subtitle}
              </div>
            </div>
            <div className="amount-point">
              <IonIcon src={iconMiMall} className='icon-mimall' />
              <span>{NumberFormatter.toNumber(exchanged.exchange_amount.from)} pts</span>
            </div>
          </div>
        </div>
      </Fragment >
    )
  }
}
