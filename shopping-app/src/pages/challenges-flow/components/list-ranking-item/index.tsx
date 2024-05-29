import React, { Fragment } from 'react';
import { IonCol, IonIcon, IonRow } from '@ionic/react';
import iconMiMallBlack  from '../../../../assets/media/icon-mimall-black.svg';
import iconMiMallWhite  from '../../../../assets/media/icon-mimall-white.svg';
import iconRankingFirstPositions  from '../../../../assets/media/icon-ranking-first-positions.svg';
import './index.less';
import SeparationLine from '../../../sky-costanera-flow/components/separation-line';
import IPlayer from '../../../../models/challenges/IPlayer';



export interface IListRankingItemProps {
  players: IPlayer[];
  player_logged: IPlayer;
  media: boolean;
}

export default class ListRankingItem extends React.Component<IListRankingItemProps, {}> {

  render() {
    const { players, player_logged, media } = this.props;
    return (

      <Fragment>
        <div id="list-ranking-item">
          {
            players.map((player, index) => {
              return (
                <IonRow key={index} className={`${player.id===player_logged.id?'player-logged':'player'}`}>
                  <RankingItem player_selected={player.id===player_logged.id} media={media} firsts_positions={index<3} player={player} player_ranking={index+1} class_name=""/>
                </IonRow>
              )
            }
          )}
        </div>
      </Fragment>

    )
  }
}

export interface IRankingItemProps {
  class_name: string;
  player_ranking?: number;
  player: IPlayer;
  firsts_positions: boolean;
  media: boolean;
  player_selected: boolean;
}

class RankingItem extends React.Component<IRankingItemProps, {}> {

  render() {
    const {class_name, player_ranking, player, firsts_positions, media, player_selected} = this.props;
    return (
      <>
        <div id="ranking-item" className={class_name}>
          <div className="user-information">
            <div className={firsts_positions?'icon-ranking-first-positions':'icon-ranking-positions'}>
              <div className="position-number">
                {player_ranking}
              </div>
            </div>
            <div className="player-name">
              {player.email}
            </div>
          </div>
          <div className="user-points">
            <div className="title">Puntos</div>
            <div className="points"><IonIcon icon={player_selected?iconMiMallBlack:media?iconMiMallWhite:iconMiMallBlack}/><span>{player.stats.total_rewards}</span></div>
          </div>
        </div>
      </>
    )
  }
}

export {RankingItem}




