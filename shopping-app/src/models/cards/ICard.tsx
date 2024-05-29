import { cardOutline } from 'ionicons/icons';

import { ILink } from "../ILink";

/**
 * Assets
 */
import visaCardIcon from '../../assets/media/isotype-visa.svg';
import masterCardIcon from '../../assets/media/isotype-mastercard.svg';

export default interface ICard {
    id: string;
    active: boolean;
    card_number: string;
    card_token: string;
    card_type: string;
    default: boolean;
    links: ILink[];
    meta_data: Record<string, unknown>
    provider: string;
}

/**
 * Resolve card type icon
 * @param cardType 
 * @returns {string}
 */
export const resolveCardTypeIcon = (cardType: string) => {
    switch(cardType) {
        case "Visa":
           return visaCardIcon;
        case "MasterCard":
            return masterCardIcon;
        default:
            return cardOutline;
    }
}