import { useCallback, useEffect, useState } from 'react';

/**
 * Style
 */
import './index.less';

/**
 * Lib
 */
import NumberFormatter from '../../../../lib/formatters/NumberFormatter';

/**
 * Components
 */

import Footer from '../footer';

/**
 * Clients
 */
import ShoppingCartClient from '../../../../clients/ShoppingCartClient';
import { isNumber } from 'lodash';

const UNIQUE_CLASS = 'ktuczfzcpi';

interface ICartButtonProps {
    locals: string[];
    buttonText: string;
    hideIfNotData?: boolean;
    style?: React.CSSProperties;
    onClick?: () => void;
    discount?: {
        prevValue: number,
        discount: number
    }
    amount?:number
    disabled?: boolean
}

const CartButton: React.FC<ICartButtonProps> = ({ locals, buttonText, hideIfNotData = false, style = {}, onClick, discount, amount, disabled }) => {
    const [stats, setStats] = useState(ShoppingCartClient.calculateMultiOrdersStats());

    const onClickFooter = () => {
        onClick && onClick();
    }

    const onChangeCart = useCallback((cart) => {
        setStats(ShoppingCartClient.calculateStats(cart));
    }, []);

    useEffect(() => {
        locals.forEach(local => {
            ShoppingCartClient.onChangeCart(local, onChangeCart);
        })

        return () => {
            locals.forEach(local => {
                ShoppingCartClient.offChangeCart(local, onChangeCart);
            })
        }
    }, [locals, onChangeCart]);

    let customStyle: React.CSSProperties = { display: 'block', ...style };
    if (hideIfNotData) {
        if (stats.quantity <= 0) {
            customStyle = { display: 'none' };
        }
    }

    let discountInfoElement;
    if(discount) {
        discountInfoElement = (
            <div className='discount-info'>
                <div className='discount-row'>
                    <div className='discount-label'>Precio anterior</div>
                    <div className='discount-value line-through'>{NumberFormatter.toCurrency(discount.prevValue)}</div>
                </div>
                <div className='discount-row'>
                    <div className='discount-label'>Cupón de descuento</div>
                    <div className='discount-value'>{NumberFormatter.toCurrency(discount.discount)}</div>
                </div>
            </div>
        )
    }

    return (
        <Footer
            disabled={disabled}
            prevElement={discountInfoElement}
            className={`${UNIQUE_CLASS}`}
            style={customStyle}
            btnText={buttonText}
            startElement={(
                <div className={disabled ? `dark-badge badge` : 'badge' }>
                    <span className='text'>{stats.quantity}</span>
                </div>
            )}
            endElement={(
                <span className='amount'>{NumberFormatter.toCurrency(isNumber(amount) ? amount : stats.amount)}</span> 
            )}
            onClick={onClickFooter}/>
    )
}

export default CartButton;