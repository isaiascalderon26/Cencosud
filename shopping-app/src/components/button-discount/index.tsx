import React, { Fragment } from 'react';
import { IonIcon } from '@ionic/react';

// index
import './index.less';

/**
* Assets
*/
import iconButtonCard from '../../assets/media/button-card.svg';
import iconCouponDiscount from '../../assets/media/coupons-discounts/icon-coupon-discount.svg';

export interface IProps {
    onClick: () => void;
    code: string;
}

const ButtonDiscount: React.FC<IProps> = (props) => { 

    const onClickButton = () => {
        props.onClick();
    }

    return (
        <Fragment>
            <div className="component-button-discount-item component-button-discount" onClick={onClickButton}>
                <div className="icon-discount">
                    <IonIcon src={iconCouponDiscount} />
                    <div className="text-code"><h3>{props.code}</h3></div>
                </div>
                <div className='component-icon-button-card'>
                    <IonIcon icon={iconButtonCard} />
                </div>
            </div>
        </Fragment>
    );

}

export default ButtonDiscount;
