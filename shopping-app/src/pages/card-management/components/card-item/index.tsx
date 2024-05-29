import {
  IonIcon,
} from '@ionic/react';
import React from 'react';

// style
import './index.less';
// models
import ICard from '../../../../models/cards/ICard'
// assets
import removeImg from '../../../../assets/media/remove.svg';
import visaLogo from '../../../../assets/media/visa-logo.svg';
import defaultCardLogo from '../../../../assets/media/default-card.svg';
import masterCardLogo from '../../../../assets/media/mastercard-logo.svg';

export interface ICardItemProps {
  card: ICard;
  selected: boolean;
  onSelect: (card: ICard) => void;
  onRemove: (card: ICard) => void;
}

export default class CardItem extends React.Component<ICardItemProps, {}> {

  getRelatedToType = (cardType: string) => {
    const type = cardType.toLowerCase();
    switch (type) {
      case 'visa':
        return {
          className: type,
          imageSrc: visaLogo,
        }
      case 'mastercard':
        return {
          className: type,
          imageSrc: masterCardLogo,
        }
      default:
        return {
          className: 'other',
          imageSrc: defaultCardLogo,
        }
    }
  }

  formatCardNumber = (cardNumber: string) => {
    return cardNumber.replace(/X/g, '');
  }

  onClickItem = () => {
    this.props.onSelect(this.props.card);
  }

  onClickRemove = (event: any) => {
    // avoid propagation to parent
    event.stopPropagation();

    this.props.onRemove(this.props.card);
  }

  render() {
    const { card, selected } = this.props;

    const selectedClass = selected ? 'selected' : '';
    const relatedToType = this.getRelatedToType(card.card_type);
    const cardNumber = this.formatCardNumber(card.card_number);
    return (
      <div className={`card-item ${selectedClass} ${relatedToType.className}`} onClick={this.onClickItem}>
        <img className="card-logo" src={relatedToType.imageSrc} alt="card type" />
        <div className="bottom-container">
          <div className="card-number-container">
            <span className="dots">····</span>
            <span className="number">{cardNumber}</span>
          </div>
          <div className="remove-card-container" onClick={this.onClickRemove}>
            <IonIcon className="remove-card-button" src={removeImg} />
          </div>
        </div>
      </div>
    )
  }
}
