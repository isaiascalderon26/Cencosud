import {
  IonIcon, IonPage,
} from '@ionic/react';
import React, { Fragment } from 'react';
import PlayerClient from '../../../../clients/PlayerClient';
import BackdropLoading from '../../../../components/backdrop-loading';
import IPlayer from '../../../../models/challenges/IPlayer';

// style
import './index.less';


export interface IListPlayerProps {

}

type IMode = 'LOADING' | 'USERS';

interface IState {
  mode: IMode,
  loading_message?: string,
  players?: IPlayer[],

}

export default class ListPlayer extends React.Component<IListPlayerProps, IState> {

  state: IState = {
    mode: 'LOADING',
    loading_message: 'Cargando...',
  }

  //getPlayers
  getPlayers = async () => {
    const response = await PlayerClient.list({
      query: {},
      limit: 10,
    });

    this.setState({
      mode: 'USERS',
      players: response.data,
    });
  }



  componentDidMount = async () => {
    this.getPlayers();
  }



  /**
   * Main render
   */
  render() {
    const { mode } = this.state;

    return <IonPage className={`card-management ${mode.replace(/_/ig, '-').toLowerCase()}`}>
      {(() => {
        const customRender: Function = (this as any)[`render${mode}`];
        if (!customRender) {
          return <div>{mode}</div>;
        }
        return customRender();
      })()}

    </IonPage>
  }

  /**
   * Render loading view
   */
  renderLOADING = () => {
    const { loading_message } = this.state;

    return (
      <Fragment>
        <BackdropLoading message={loading_message!} />
      </Fragment>
    )
  }
  /**
   * Render loading view
   */
  renderUSERS = () => {
    const { players } = this.state;
    console.log(players);
    //iterate players
    return (
      <Fragment>
        <div className="list-players">
          {players!.map((player: IPlayer) => {
            return <div className="player" key={player.id}>

              <div className="player-name">{player.email}</div>
              <div className="player-name">{player.stats.total_rewards}</div>
            </div>
          })}
        </div>
      </Fragment>
    )
  }




}
