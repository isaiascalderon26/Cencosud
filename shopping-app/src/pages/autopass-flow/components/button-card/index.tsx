import React from "react";
import { IonIcon } from "@ionic/react";
import { cardOutline } from 'ionicons/icons';
// index
import './index.less';
/* models */
import ICard from "../../../../models/cards/ICard";
/* assets*/
import isotypeVisaCard from '../../../../assets/media/isotype-visa.svg';
import isotypeMasterCard from '../../../../assets/media/isotype-mastercard.svg';
import logoCard from '../../../../assets/media/button-card.svg';
interface IProps {
    card: ICard;
    onClick: () => void;
}

interface IState {

}

export default class ButtonCard extends React.Component<IProps, IState> {

    cardDecorator  = (type: string): string => {
        let icon = cardOutline;
        
        switch(type) {
            case "Visa":
                icon = isotypeVisaCard;
            break;
            case "MasterCard":
                icon = isotypeMasterCard;
            break;
        }
        return icon;
    }

    cardNumber = (card_number: string): string => {
        return  card_number.replace(/X/g, '');
    }

    render() {

        const iconByCardType = this.cardDecorator(this.props.card.card_type);

        return (
            <div className="component-credit-card-item component-credit-card component-credit-card-selected" key={this.props.card.card_number} onClick={this.props.onClick}>
                <div className="component-card-icon">
                    <IonIcon src={iconByCardType} />
                    <div className="card-hint">{`···· ${this.cardNumber(this.props.card.card_number)}`}</div>
                </div>
                <div className='component-icon-button-card'>
                    <IonIcon icon={logoCard} />
                </div>
            </div>
        )
    }

}