import React, { SyntheticEvent, useCallback, useEffect, useState } from 'react';

/**
 * Style
 */
import './index.less';

/**
 * Clients
 */
import ShoppingCartClient from '../../../../clients/ShoppingCartClient';


/**
 * Components
 */
import Image from '../image';
import IncDecInput from '../inc-dec-input';
import Price from '../price';

/**
 * Models
 */
import IItem from '../../../../models/foodie/IItem';
import { resolveImage } from '../../../../models/foodie/IProduct';

/**
 * Assets
 */
import editIcon from '../../../../assets/media/foodie/edit-icon.svg';
import trashIcon from '../../../../assets/media/foodie/trash-icon.svg';
import ILocal from '../../../../models/foodie/ILocal';

const UNIQUE_CLASS = 'mbzmskajgx';

export interface IShoppingCartItemProps {
    local: ILocal;
    data: IItem;
    onClick: (data: IItem) =>  void;
    onRemoved: () => void;
    
}

const ShoppingCartItem: React.FC<IShoppingCartItemProps> = ({ local, data, onClick, onRemoved }) => {
    const [item, setItem] = useState(data);
    const [stats, setStats] = useState(ShoppingCartClient.calculateItemStats(data))

    const onDecrement = async (cant?: number) => {
        const update = { ...item };
        update.quantity = Math.max(0, update.quantity - (cant ? cant : 1));
        await ShoppingCartClient.updateItem(local.id, update);
    }

    const onIncrement = async () => {
        const update = { ...item };
        update.quantity = update.quantity + 1;

        await ShoppingCartClient.updateItem(local.id, update);
    }

    const onChangeItem = useCallback((update) => {
        setItem(update);
        setStats(ShoppingCartClient.calculateItemStats(update))
    }, []);

    const onClickItem = (event: SyntheticEvent) => {
        event.preventDefault();

        onClick(data);
    }

    useEffect(() => {
        ShoppingCartClient.onChangeItem(local.id, item.id, onChangeItem);

        return () => {
            ShoppingCartClient.offChangeItem(local.id, item.id, onChangeItem)
        }
    }, [local, item, onChangeItem]);

    useEffect(() => {
        if (stats.quantity <= 0) {
            onRemoved();
        }
    }, [stats.quantity, onRemoved])
    
    const image = resolveImage(item.images);
    return (
        <div className={UNIQUE_CLASS}>
            <div className='content'>
                <>
                    { data.enable === false || local.state === 'CLOSED' ? (
                        <div className='item-image'>
                            <div className="unavailable-wrapper">
                                <div className="unavailable-badge">
                                    <span className="value">No disponible</span>
                                </div>
                                <div className='opaque'>
                                    <Image src={image} alt={item.name} type="PRODUCT"/>
                                </div>
                            </div>
                        </div>
                        ) :
                        <div className='item-image' onClick={onClickItem}>
                            
                            <div className='edit-icon'>
                                <img className='edit-img' src={editIcon} alt="edit"/>
                            </div>
                            <Image src={image} alt={item.name} type="PRODUCT"/>

                        </div>
                    }
                </>
                
                
                
                <div className='item-info'>
                    <h3 className='name'>{item.name}</h3>
                    <p className='description'>{item.description}</p>
                    <Price data={data} />
                    <div className='item-info-bottom'>
                        <IncDecInput 
                            removeOnly={data.enable === false && local.state === 'CLOSED'}
                            value={stats.quantity} 
                            onDecrement={onDecrement} 
                            onIncrement={onIncrement} 
                            minValue={0} 
                            disableLeftOnMin={false} 
                            leftIconBeforeMin={trashIcon}
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ShoppingCartItem;