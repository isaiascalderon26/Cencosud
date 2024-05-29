import React, { Fragment } from 'react';
import { IonIcon } from '@ionic/react';

import iconMiMall from '../../../../assets/media/icon-mimall.svg';
import NumberFormatter from '../../../../lib/formatters/NumberFormatter';

import './index.less';
import moment from 'moment';


export interface IPartnerScoreProps {
  points: number;
}

export default class PartnerScore extends React.Component<IPartnerScoreProps, {}> {

  render() {
    const { points } = this.props;


    return (

      <Fragment>
        <div className="partner-score-components">
          <div className="text-title">
            Acumulado total
            <div className="text-subtitle">Al día de {moment().format('DD/MM/YYYY')}</div>
          </div>
          <div className="score-pts">
            <IonIcon src={iconMiMall}  className='icon-mimall' />
            <span className="text-point">{NumberFormatter.toNumber(points) + ' pts'}</span>
          </div>
        </div>
      </Fragment>
    )
  }
}
