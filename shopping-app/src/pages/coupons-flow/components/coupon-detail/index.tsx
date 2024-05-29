import React, { Fragment, useState } from 'react';
import moment from 'moment';
import { IonButton } from '@ionic/react';
/**
* styles
*/
import './index.less';
/**
* components
*/
import AlertCoupon from '../alert-coupon';
/**
* assets
*/
import imgCalendar from '../../../../assets/media/coupons-discounts/calendar.svg';
/**
* models 
*/
import { IDiscount } from '../../../../models/discount/IDiscount';
/**
* libs
*/
import Utilities from '../../lib/Utilities';
import StringFormatter from '../../../../lib/formatters/StringFormatter';

interface IProps {
    discount: IDiscount;
}

const CouponDetail: React.FC<IProps> = ({ discount }) => { 

    const [actived, setActived] = useState(false);
    const clickHandler = () => {
        console.log("clickHandler");
        setActived(true);
    }

    const stateName = {
        'AVALAIBLE': 'Disponible',
        'REDEEMED': 'Canjeado',
        'EXPIRED': 'Expirado',
    }

    return (
        <Fragment>
            <div className="component-coupon-discount-detail">
                <div className="coupon-discount-detail">
                    <div className="coupon-content-wrapper-detail">
                        <div className="coupon-content">
                            <div className="logo">
                                <img src={discount.url_image} alt="logo-coupon" />
                            </div>
                            <div className="gap"></div>
                            <div className="coupon-text">
                                <h3>{StringFormatter.shortText(discount.title,20,20)}</h3>
                            </div>
                            <div className={`coupon-detail-badge ${discount.state_name!.toLowerCase()}`}>
                                <div className="coupon-badge-content">
                                    <div className="coupon-badge-text">
                                        <h3>{stateName[discount.state_name!]}</h3>
                                    </div>
                                </div>
                            </div>
                            <div className="coupon-info-detail">
                                <h1 dangerouslySetInnerHTML={{__html: Utilities.decorateDiscount(discount)}}></h1>
                                <h3>{StringFormatter.shortText(discount.description,27,27)}</h3>
                                <h2 className="code">Codigo: {discount.code.slice(0,12)}</h2>
                            </div>
                        </div>
                        <div className="coupon-discount-info">
                            <div className="text-description" dangerouslySetInnerHTML={{__html: `Con este cupón obtén ${Utilities.decorateDiscount(discount)} en ${discount.description}`}}></div>
                        </div>
                        <div className="coupon-dates-range">
                            <div><img src={imgCalendar} alt="calendar" /></div>
                            <div>Cupón valido desde el {moment(discount.validity.start_at).format('DD/MM/YYYY')} hasta el {moment(discount.validity.end_at).format('DD/MM/YYYY')}</div>
                        </div>
                        <div className="line-dotted"></div>
                        {/*actived 
                        ?   <div className="activated-coupon">
                                <AlertCoupon type="success" />
                            </div>
                        :   <div className="activate-coupon" onClick={()=>clickHandler()}>
                                <IonButton>Aplicar cupón</IonButton>
                            </div>
                        */}
                    </div>
                </div>
            </div>
        </Fragment>
    )
}

export default CouponDetail;