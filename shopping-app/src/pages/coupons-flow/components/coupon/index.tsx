import React, { Fragment } from 'react';
import moment from 'moment';
/**
* styles
*/
import './index.less';
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
    onSelected: (id:string) => void;
}

const Coupon: React.FC<IProps> = ({ discount, onSelected }) => { 
    
    const onClickDetail = (id:string) => {
        if(onSelected) {
            onSelected(id);
        }
    }

    const stateName = {
        'AVALAIBLE': 'Disponible',
        'REDEEMED': 'Canjeado',
        'EXPIRED': 'Expirado',
    }

    return (
        <Fragment>
            <div className="component-coupon-discount" onClick={() => onClickDetail(discount.id)}>
                <div className="coupon">
                    <div className="coupon-content-wrapper">
                        <div className="coupon-content">
                            <div className="logo">
                                <img src={discount.url_image} alt="logo-coupon" />
                            </div>
                            <div className="gap-line"></div>
                            <div className="coupon-text">
                                <h3>{StringFormatter.shortText(discount.title,20,20)}</h3>
                            </div>
                            <div className={`coupon-badge ${discount.state_name!.toLowerCase()}`}>
                                <div className="coupon-badge-content">
                                    <div className="coupon-badge-text">
                                        <h3>{stateName[discount.state_name!]}</h3>
                                    </div>
                                </div>
                            </div>
                            <div className="coupon-detail">
                                <h1 dangerouslySetInnerHTML={{__html: Utilities.decorateDiscount(discount)}}></h1>
                                <h3>{StringFormatter.shortText(discount.description,27,27)}</h3>
                                <h2 className="code">Codigo: { discount.code.slice(0,12)}</h2>
                                <h2 className="valid-date">Válido hasta el {moment(discount.validity.end_at).format('DD')} de {moment(discount.validity.end_at).format('MMMM')} {moment(discount.validity.end_at).format('YYYY')}</h2>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Fragment>
    )
}

export default Coupon;