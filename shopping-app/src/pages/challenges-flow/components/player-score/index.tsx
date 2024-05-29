import React, { Fragment } from 'react';
import { IonIcon } from '@ionic/react';
//styles
import './index.less';
//assets
import iconGoldMetal from '../../../../assets/media/challenge/gold-medal.svg';
//models
import IPlayer from '../../../../models/challenges/IPlayer';
import IChallengeTablePoints from '../../../../models/challenges/IChallengeTablePoints';
//libs
import NumberFormatter from '../../../../lib/formatters/NumberFormatter';
//components
import ProgressBar from '../../../../components/progress-bar';
export interface IPlayerScoreProps {
  player: IPlayer;
  info_bar: IChallengeTablePoints
}
export default class PlayerScore extends React.Component<IPlayerScoreProps, {}> {
  render() {
    const { player, info_bar } = this.props;
    return (
      <Fragment>
          <div className="player-score-components">
            <div className="title-header">
              Te encuentras en el nivel:
            </div>
            <div className="title-level">
              <h1>Nivel {info_bar.level}</h1>
            </div>
            <div className="text-next-level">
              Te faltan <img src={iconGoldMetal} /> {NumberFormatter.toNumber(info_bar.points_next_level) } para el siguiente nivel
            </div>
            <div className="player-score-bar">
              <ProgressBar 
                bgcolor="145.07deg, #CE57D3 15.63%, #9454E6 47.2%, #6A6CE9 72.99%, #47BAD8 105.9%" 
                completed={info_bar.percentage}
                showPercentage={false}
              />
            </div>
            <div className="footer-points">
              <div className="flex-item">{NumberFormatter.toNumber(info_bar.from_points)}</div>
              <div className="flex-item"></div>
              <div className="flex-item points-end">{NumberFormatter.toNumber(info_bar.to_points)}</div>
            </div>
          </div>
      </Fragment>
    )
  }
}
