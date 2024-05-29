import React from 'react';

// index
import './index.less';
// components
import FakeInput from '../fake-input';
import EmptyModal from '../empty-modal';
import { IReservationSlot } from '../../../../models/reservation-slot/IReservationSlot';
import moment from 'moment';
import { IonCol, IonRow } from '@ionic/react';

interface IProps {
    onChange: (value: any) => void;
    disabled: boolean;
    reservationSlogs?: IReservationSlot[];
    formError: boolean;
    selectedSlog?: IReservationSlot
}

interface IState {
    modal: boolean;
    selectedReservationSlog?: IReservationSlot;
}

export default class SelectTime extends React.Component<IProps, IState> {
    state: IState = {
        modal: false
    }

    onClick = () => {

        if(this.props.disabled!=null && this.props.disabled!==true){
            this.setState({modal:true});
        }
    }


    render() {
        return (
            <div className="select-tickets-21xyz">
                <FakeInput formError={this.props.formError} text={this.props.selectedSlog?`${moment(this.props.selectedSlog.start).format('HH')}:${moment(this.props.selectedSlog.start).format('mm')} a ${moment(this.props.selectedSlog.end).format('HH')}:${moment(this.props.selectedSlog.end).format('mm')}`:undefined} disabled={this.props.disabled} icon="time" placeholder="Hora" onClick={() => this.onClick()}/>
                {this.state.modal && this.props.reservationSlogs!=null && this.props.reservationSlogs.length>0 && this.props.disabled!=null && this.props.disabled!==true &&
                    (<EmptyModal height="700px" title= "Hora" onOkClick={() => null} onClose={() => this.setState({ modal: false })}>
                        <p>Selecciona un rango horario para tu visita del {moment(this.props.reservationSlogs?this.props.reservationSlogs[0].start:'').format('LL')}</p>
                        <div className="container-times">
                            {this.props.reservationSlogs.map((item)=>{
                                return (
                                    <div key={item.start.toString()} onClick={ ()=> {this.setState({modal:false, selectedReservationSlog:item});this.props.onChange(item);}}>
                                        <div className={`element-time${item.start===this.props.selectedSlog?.start?' active':''}`}>
                                            <div className="time-start">{`${moment(item.start).format('HH')}:${moment(item.start).format('mm')}`}</div>
                                            <div className="time-end">a {`${moment(item.end).format('HH')}:${moment(item.end).format('mm')}`}</div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </EmptyModal>)}
            </div>
        )
    }
}
