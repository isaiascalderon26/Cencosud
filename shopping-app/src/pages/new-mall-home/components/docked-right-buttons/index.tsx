import React, { useEffect, useState } from 'react'
import './index.less'
import IPaymentIntention from '../../../../models/payments/IPaymentIntention';
import lodash from 'lodash';
import Image from '../../../foodie-flow/components/image';
import AuthenticationClient from '../../../../clients/AuthenticationClient';
import PaymentIntentionClient from '../../../../clients/PaymentIntentionClient';

import { useHistory } from "react-router-dom";

import foodieIcon from '../../../../assets/media/foodie/booking-food.svg';


function DockedRightButton() {

    const history = useHistory();

    const UNIQUE_CLASS = "home-right-docked";

    const [intentions, setIntentions] = useState<IPaymentIntention[]>([]);

    const getLocalLogo = (pi: IPaymentIntention) => lodash.get(pi, 'metadata.foodie_local.logo') as string;

    const handleActivePaymentIntentionClick = async (pi?: IPaymentIntention) => {

        const mall = localStorage.getItem("mall-selected");

        history.push({
            pathname: `/foodie/${mall}`,
            state: {
                ...(pi ? { paymentIntentionId: pi.id } : {}) // append paymentIntentionid only if present
            }
        });

    }

    const fetchPendingPayments = async () => {
        const userId = AuthenticationClient.getInfo().primarysid;
        const pending = await PaymentIntentionClient.list({
            offset: 0,
            limit: 10,
            query: {
                'state.keyword_is': 'APPROVED',
                'payment_flow.keyword_is': 'FOODIE',
                'payment_method.details.user_id.keyword_is': userId,
                'outcome.result.foodie_order_delivery_state.keyword_is_not_one_of': [
                    'DELIVERED',
                    'CANCELLED',
                ],
            },
        });
        setIntentions(pending.data)
    };

    useEffect(() => {
        fetchPendingPayments();
    }, []);

    // Max items before show List Orders Buttons
    const MAX_ITEMS = 4;

    // tells if must show btn
    const showExtraBtn = intentions.length >= MAX_ITEMS;

    return (
        <div className="right-docked">
            {
                intentions.length > 1 &&
                <div className={`voucher-sticky-order-selector-${UNIQUE_CLASS}`}>
                    {intentions.slice(0, 2).map(pi => {
                        return (
                            <div style={{ position: 'relative' }} key={pi.id}>
                                <div className={`selectable-logo`} onClick={() => handleActivePaymentIntentionClick(pi)}>
                                    <Image type='STORE' src={getLocalLogo(pi)} />
                                </div>
                            </div>
                        )
                    })}
                    {
                        showExtraBtn && <div style={{ position: 'relative' }}>
                            <div className='badge'>{intentions.length}</div>
                            <div className='selectable-logo' onClick={() => handleActivePaymentIntentionClick()}>
                                <img src={foodieIcon} alt="go to orders" />
                            </div>
                        </div>
                    }

                </div>

            }
        </div>
    )
}

export default DockedRightButton