import React from 'react';

// index
import './index.less';
// components
import FakeInput from '../fake-input';
import EmptyModal from '../empty-modal';
import { IReservationSlotDate } from '../../../../models/reservation-slot/IReservationSlotDate';
import moment from 'moment';

interface IProps {
    onChange: (value: any) => void;
    reservationSlogDate: IReservationSlotDate[]
    formError: boolean,
    selectedSlogDate?: string
}

interface IState {
    modal: boolean;
    selectedSlogDate?: Date;
}

export default class SelectDate extends React.Component<IProps, IState> {
    state: IState = {
        modal: false
    }

    render() {
        return (
            <div className='select-tickets-21xyz' >
                <FakeInput formError={this.props.formError} text={this.props.selectedSlogDate?moment(this.state.selectedSlogDate).format('LL'):undefined} icon="date" placeholder="Fecha" onClick={() => this.setState({ modal: true })}/>

                {this.state.modal && (
                    <EmptyModal height="100%" title= "Fecha" onOkClick={() => null} onClose={() => this.setState({ modal: false })}>
                        <p>Selecciona una fecha para tu visita. </p>
                        <div className="container-days">
                            {
                                this.props.reservationSlogDate.map((item) => {
                                    return (
                                        <div key={item.date.toString()} className={`element-day${item.date.toString()===this.props.selectedSlogDate?' active':''}`} onClick={ ()=> {this.setState({modal:false, selectedSlogDate:item.date});this.props.onChange(item.date);}}>
                                            <div className="day-title">{item.dayText}</div>
                                            <div className="day-number">{item.dayNum}</div>
                                        </div>
                                    )
                                })
                            }
                        </div>
                    </EmptyModal>
                )}
            </div>
        )
    }
}
