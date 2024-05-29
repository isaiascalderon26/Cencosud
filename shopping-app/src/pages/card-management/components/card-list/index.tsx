import React from 'react';

// style
import './index.less';
// components
import CardItem from '../card-item';
// models
import ICard from '../../../../models/cards/ICard';

export interface ICardListProps {
  cards?: ICard[];
  selectedCard?: string;
  onSelectCard: (card: ICard) => void;
  onRemoveCard: (card: ICard) => void;
}

export default class CardList extends React.Component<ICardListProps, {}> {

  render() {
    const { cards, selectedCard, onSelectCard, onRemoveCard } = this.props;

    if (!cards) {
      return;
    }

    return (
      <div className="card-list">
        {cards.map((card) => {
          const isSelected = selectedCard === card.id;
          return (
            <div key={card.id} className="card-item-container">
              <CardItem card={card} selected={isSelected} onSelect={onSelectCard} onRemove={onRemoveCard}/>
            </div>
          )
        })}
      </div>
    )
  }
}
