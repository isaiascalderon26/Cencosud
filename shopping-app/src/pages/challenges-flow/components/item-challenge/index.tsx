import React from "react";
import { IonIcon } from "@ionic/react";
import { chevronForward } from "ionicons/icons";
import moment from 'moment';

// index
import './index.less';
//models
import IChallenge from "../../../../models/challenges/IChallenge";
//libs
import NumberFormatter from '../../../../lib/formatters/NumberFormatter';
//assets
import iconMiMallBlack from '../../../../assets/media/icon-mimall-black.svg';
import iconMiMall from '../../../../assets/media/icon-mimall.svg';
import flash from '../../../../assets/media/flash.svg';
import iconGoldMetal from '../../../../assets/media/challenge/gold-medal.svg';
interface IProps {
  challenge: IChallenge;
  onSelect?: (id: string) => void;
}

interface IState {
  style_mode_dark: boolean,
}

export default class ItemChallenge extends React.Component<IProps, IState> {

  media = window.matchMedia('(prefers-color-scheme: dark)');

  state: IState = {
    style_mode_dark: false
  }

  onClickItem = (id: string): void => {
    this.props?.onSelect && this.props?.onSelect(id);
  }

  render() {
    const { style_mode_dark } =  this.state;
    const { challenge, onSelect } = this.props;
    const { id, name, description, reward, start, end } = challenge;

    const diffDays = moment(end).diff(moment(start), 'days');
    const icon = !style_mode_dark ? iconGoldMetal : iconGoldMetal;
    return (
      <div className="component-item-challenge component-item-challenge-record" onClick={() => this.onClickItem(id)}>
        <div className="component-item-challenge-score">
          <div className="component-item-challenge-score-info">
            <IonIcon src={icon} className='icon-mimall' />
            {NumberFormatter.toNumber(reward)}
          </div>
          <div className="component-item-challenge-pts" ></div>
        </div>
        <div className="component-item-challenge-text">
          <div className="component-item-challenge-text-name">{name}</div>
          <div className="component-item-challenge-text-description">{description.substring(0, 80)}
          {description.length > 80 ? '...' : ''}
          </div>
        </div>
        {
          diffDays === 0 ?
            <div className="icon-flash">

              <IonIcon icon={flash} />
            </div>

            : null
        }
        {onSelect && <div className="chevron-icon">
          <IonIcon icon={chevronForward} />
        </div>}
      </div>
    );
  }
}
