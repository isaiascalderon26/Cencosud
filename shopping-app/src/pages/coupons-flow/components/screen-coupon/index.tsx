import React, { Fragment } from 'react';
import { AxiosError } from 'axios';
/**
 * styles
 */
import './index.less';

/**
* Assets
*/
import imgScreenCoupon from '../../../../assets/media/coupons-discounts/screen-coupon.svg';

/**
* Components
*/
import AddCoupon from './components/add-coupon';
import ButtonScan from './components/button-scan';

interface IProps {
    onClickScan: () => void;
    onClickCoupon: (coupon:string) => Promise<boolean|AxiosError>;
}

const ScreenCoupon: React.FC<IProps> = ({ onClickScan, onClickCoupon }) => {
    return (
        <Fragment>
            <div className="component-screen-coupon">
                <div className="component-screen-coupon-header">
                    <div className="component-screen-coupon-title">
                        <img src={imgScreenCoupon} alt="logo-screen-coupon" /> 
                        <h3>¿Tienes un cupón?</h3>
                    </div>
                    <div className="component-screen-coupon-content">
                        <div className="component-add-boutton">
                            <AddCoupon onClickCoupon={onClickCoupon} />
                        </div>
                        <div className="component-button-scan">
                            <ButtonScan onClickScan={onClickScan} />
                        </div>
                    </div>
                </div>
            </div>
        </Fragment>
    )
}

export default ScreenCoupon;



