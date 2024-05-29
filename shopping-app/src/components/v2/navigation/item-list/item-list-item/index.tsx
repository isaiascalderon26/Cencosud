import React, { FC } from 'react'
import ItemListItemStyle from './ItemListItemStyle'
import { IonIcon } from '@ionic/react'
import { chevronForward } from 'ionicons/icons';
import { Icon } from '../../../display-data/Icon';


export interface ItemListItemProps {
    icon?: string;
    text: string;
    badge?: string,
    onTap?: () => void;
}

const ItemListItem: FC<ItemListItemProps> = ({
    icon,
    text,
    badge,
    onTap
}) => {
    return (
        <ItemListItemStyle onClick={onTap}>
            <div className='item-wrapper'>
                <div>
                    {
                        icon && <Icon variant="solid" name={icon} />
                    }
                    {text}
                </div>
                {
                    badge && <span className='item-badge'>{badge}</span>
                }
            </div>
            <IonIcon icon={chevronForward} />
        </ItemListItemStyle>
    )
}

export default ItemListItem