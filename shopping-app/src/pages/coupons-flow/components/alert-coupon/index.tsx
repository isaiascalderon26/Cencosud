import React, { Fragment, useEffect, useState } from 'react';
/**
* styles
*/
import './index.less';

/**
* Assets
*/
import successImage from '../../../../assets/media/coupons-discounts/img-success.svg';
import closeImage from '../../../../assets/media/coupons-discounts/close.svg';

interface IProps {
    type: "success" | "error";
}

const AlertCoupon: React.FC<IProps> = ({ type }) => { 

    const [close, setClose] = useState<boolean>(false);

    useEffect(() => {
        setTimeout(() => {
            setClose(true);
        }, 2000);
    }, []);

    const data = [{
        "success": {
            image: successImage,
            text: 'Cupón activado'
        },
        "error": {
            image: successImage,
            text: 'Error Cupón no activado'
        }
    }] as [{[key: string]: { image: string, text:string  }}];

    const handlerClose = () => {
        setClose(true);
    }

    return (
        <Fragment>
            <div className={`component-alert-coupon ${type} ${close && 'hidden'}`}>
                <div className="image">
                    <img src={data[0][type].image} alt="image" />
                </div>
                <div className="text">
                    {data[0][type].text}
                </div>
                <div className="close" onClick={() => handlerClose()}>
                    <img src={closeImage} alt="close" />
                </div>
            </div>
        </Fragment>
    )
}

export default AlertCoupon;