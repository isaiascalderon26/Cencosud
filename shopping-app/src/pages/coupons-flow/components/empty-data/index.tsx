import React, { Fragment } from 'react';
/**
* styles
*/
import './index.less';

/**
* Assets
*/
import emptyStateImage from '../../../../assets/media/coupons-discounts/empty-state.svg';

const EmptyDataCoupons: React.FC<{}> = () => { 
    return (
        <Fragment>
            <div className="component-coupon-empty-data">
                <div className="body-coupon-empty-data">
                    <img src={emptyStateImage} alt="img" />
                </div>
                <div className="footer-text">Aún no tienes cupones disponibles</div>
            </div>
        </Fragment>
    )
}

export default EmptyDataCoupons;