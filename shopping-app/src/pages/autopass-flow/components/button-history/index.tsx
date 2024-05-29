import React from "react";
import { IonIcon } from "@ionic/react";
import { chevronForward } from "ionicons/icons";
import moment from 'moment';
// index
import './index.less';
//models
import IPaymentIntention from "../../../../models/payments/IPaymentIntention";
//libs
import Formatters from "../../lib/Formatters";
interface IProps {
    paymentIntention: IPaymentIntention;
    onSelect: (id: string) => void;
}

interface IState {

}

export default class ButtonHistory extends React.Component<IProps, IState> {

    onClickItem = (id:string):void => {
        this.props.onSelect(id);
    }

    render() {
        const { paymentIntention } = this.props;
        const { created_at, metadata, state, id } = paymentIntention;
        const payment = moment(created_at);
        return (
            <div className="component-button-history-record component-button-history" onClick={() => this.onClickItem(id)}>
                <div className="component-button-history-date-time">
                    <div className="component-button-history-day">{payment.format('D')}</div>
                    <div className="component-button-history-detail-month-year">
                        <span>{payment.format('MMM')}</span>
                        <span>{payment.format('YYYY')}</span>
                    </div>
                </div>
                <div className="plate">{Formatters.plateDecorator(metadata.plate as string)}</div>
                <div className="component-button-history-check-ticket">
                    <div className={`status ${Formatters.stateDecorator(state).cssClass}`}>
                        {Formatters.stateDecorator(state).text}
                    </div>
                    <IonIcon icon={chevronForward} />
                </div>
            </div>
        );
    }
}