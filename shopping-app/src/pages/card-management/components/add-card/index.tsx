import {
  IonIcon,
} from '@ionic/react';
import React from 'react';

// style
import './index.less';
// assets
import addCardImg from '../../../../assets/media/add-card.svg';

export interface IAddCardProps {
  onAddCard: () => void;
}

export default class AddCard extends React.Component<IAddCardProps, {}> {

  onClickAdd = () => {
    this.props.onAddCard();
  }

  render() {
    const { } = this.props;

    return (
      <div className="add-card" onClick={this.onClickAdd}>
        <img src={addCardImg} alt="add card"/>
      </div>
    )
  }
}
