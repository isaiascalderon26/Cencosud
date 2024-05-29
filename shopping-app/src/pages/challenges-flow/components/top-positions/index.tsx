import React, { Fragment } from 'react';
import { IonCol, IonIcon, IonRow } from '@ionic/react';
import iconMiMallDarkGray  from '../../../../assets/media/icon-mimall-dark-gray.svg'
import './index.less';
import IPlayer from '../../../../models/challenges/IPlayer';



export interface ITopPositionsProps {
  players: IPlayer[];
}

export default class TopPositions extends React.Component<ITopPositionsProps, {}> {

  render() {
    const { players } = this.props;
    return (
      <Fragment>
        <div id="top-positions" className="top-positions">
          <IonRow>
            <IonCol size="4" className="ion-text-center"><TopPositionsItem player={players[1]} class_name="silver" number_digit="2" number_label="do"/></IonCol>
            <IonCol size="4" className="ion-text-center"><TopPositionsItem player={players[0]} class_name="gold" number_digit="1" number_label="er"/></IonCol>
            <IonCol size="4" className="ion-text-center"><TopPositionsItem player={players[2]} class_name="bronze" number_digit="3" number_label="er"/></IonCol>
          </IonRow>
        </div>
      </Fragment>

    )
  }
}

export interface ITopPositionsItemProps {
  player: IPlayer;
  class_name: string;
  number_digit: string;
  number_label: string;
}

class TopPositionsItem extends React.Component<ITopPositionsItemProps, {}> {

  render() {
    const { class_name, number_digit, number_label, player } = this.props;
    return (
      <div id="top-positions-item" className={class_name}>
        <div className="position">
          <div className="letter-number">{number_digit}<span>{number_label}</span></div>
          <div>Lugar</div>
        </div>
        <div id="player-name">{player.email}</div>
        <div id="container-points">
          <IonIcon className="icon-points" icon={iconMiMallDarkGray} />
          <span>{player.stats.total_rewards}</span>
          pts
        </div>
      </div>
    )
  }
}

export {TopPositionsItem}




