import React, { Fragment } from "react";
/* index */
import './index.less';
/* componets */
import ButtonHistory from "../button-history";
/* models */
import IPaymentIntention from "../../../../models/payments/IPaymentIntention";

interface IProps {
    paymentIntention:IPaymentIntention[];
    onSelectHistory: (id:string) => void;
}

interface IState {
    
}

export default class ListHistory extends React.Component<IProps, IState> {

    render() {
        return (
            this.props.paymentIntention.map((payment:IPaymentIntention) => {
                return (
                    <Fragment key={payment.id}>
                        <div className="component-list-history">
                            <ButtonHistory paymentIntention={payment} onSelect={this.props.onSelectHistory} />
                        </div>
                    </Fragment>
                )
            })
        )
    }
}