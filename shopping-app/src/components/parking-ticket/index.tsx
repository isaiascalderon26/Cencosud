import React, { Fragment } from 'react';

import './index.less';

import processingImg from '../../assets/media/atom/icon/timing-process.svg';
import checkedImg from '../../assets/media/atom/icon/checked.png';
import discountSelectableImg from '../../assets/media/discount-selectable.svg';
import Utilities from '../../pages/coupons-flow/lib/Utilities';
import StringFormatter from '../../lib/formatters/StringFormatter';
// import { RouteComponentProps } from 'react-router';

interface IState {
  mode: "INITIAL_STATE",
  selectedHistory: Record<string, any>,
  cardPaymentMethods: Array<any>,
}

interface IProps {
  selectedHistory: Record<string, any>,
}

export default class FancyTicket extends React.Component<IProps, IState> {
  state: IState = {
    mode: "INITIAL_STATE",
    selectedHistory: {},
    cardPaymentMethods: [],
  }

  componentWillMount() {
    const parkingRecord = this.props.selectedHistory;
    const exitTime = isNaN(Date.parse(parkingRecord.exitDateTime)) ? new Date() : parkingRecord.exitDateTime;
    const elapsedTime = this.timeDiffCalc(exitTime, parkingRecord.entranceDateTime);

    parkingRecord.elapsedTime = elapsedTime;
    this.setState({
      selectedHistory: parkingRecord,
    });
  }

  componentDidMount() {
  }

  formatMoney = (num: Number): string => {
    var p = Number(num).toFixed(2).split(".");
    return "$" + p[0].split("").reverse().reduce(function (acc, num, i, orig) {
      return num == "-" ? acc : num + (i && !(i % 3) ? "." : "") + acc;
    }, "");
  }

  getMonthNameShort = (date: Date): string => {
    const monthNames = ["Ene", "Feb", "Mar", "Abr", "May", "Jun",
      "Jul", "Ago", "Sept", "Oct", "Nov", "Dic"
    ];

    return monthNames[date.getMonth()];
  }

  getMonthName = (date: Date): string => {
    const monthNames = ["January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];

    return monthNames[date.getMonth()];
  }

  timeDiffCalc = (dateFuture: Date, dateNow: Date) => {

    const dateDiff = dateFuture.getTime() - dateNow.getTime();
    let diffInMilliSeconds = Math.abs(dateDiff) / 1000;
    let days = Math.floor(diffInMilliSeconds / 86400);
    diffInMilliSeconds -= days * 86400;
    let hours = Math.floor(diffInMilliSeconds / 3600) % 24;
    diffInMilliSeconds -= hours * 3600;
    let minutes = Math.floor(diffInMilliSeconds / 60) % 60;
    diffInMilliSeconds -= minutes * 60;

    let difference = '';
    if (days > 0) {
      difference += (days === 1) ? `${days} día, ` : `${days} días, `;
    }
    difference += (hours >= 0 && hours < 10) ? `0${hours}:` : `${hours}:`;
    difference += (minutes >= 0 && minutes < 10) ? `0${minutes}` : `${minutes}`;

    if(hours) {
      difference += ' hrs';
    } else {
      difference += ' min';
    }
    
    return difference;
  }

  render() {
    const { mode , selectedHistory} = this.state;
    const payment = this.state.selectedHistory.payment;

    const amount = payment?.fee?.amount ? this.formatMoney(payment.fee?.amount) : this.formatMoney(0);
    const quantityAmount = payment?.fee?.amount ? payment?.fee?.amount : 0;
    const quantityDiscount = payment?.fee?.discount ? payment?.fee?.discount  : 0;
    const amountAfter = this.formatMoney(parseInt(quantityAmount)+parseInt(quantityDiscount));
    return <Fragment>
      <div className="autopass-ticket">
        <div className="history-item ticket-section">
          <h2>Detalle de parking</h2>
          <div className="fancy-ticket">
            <div className="record-details">
              <div className="info-piece plate">
                <div className="label">
                  Patente
                </div>
                <div>
                  {this.state.selectedHistory.plate}
                </div>
              </div>
              <div className="info-piece time">
                <div className="label">Duración</div>
                <div>
                  {this.state.selectedHistory.elapsedTime}
                </div>
              </div>
              <div className="info-piece location">
                <div className="label">Mall</div>
                <div>
                  {this.state.selectedHistory.locationName.toLowerCase()}
                </div>
              </div>
              <div className="info-piece date">
                <div className="label">Fecha</div>
                <div className="date-data">
                  <div className="day-of-month principal">
                    {this.state.selectedHistory.entranceDateTime.getDate()}
                  </div>
                  <div className="date-month-year secondary">
                    <div className="month">
                      {this.getMonthNameShort(this.state.selectedHistory.entranceDateTime)}.
                    </div>
                    <div className="year">
                      {this.state.selectedHistory.entranceDateTime.getFullYear()}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="ticket-cut-out">
              <div className="ticket-cutout" />
              <div className="ticket-cutout ticket-cutout--right" />
            </div>

            <div className="paid-amount">
              <div className="info-piece date">
                <div className="content-amounts">
                  <div className="label">Monto pagado</div>
                  {selectedHistory.state === "APPROVED" && selectedHistory.discounts?.length > 0 ? <div className="after">Antes: {`${amountAfter}`}</div>: null}
                </div>
              </div>
              <div className="amount">
                {selectedHistory.state === 'CREATED' ?   '---': amount}
              </div>
              <div className="discounts">
                {selectedHistory.discounts?.map((item:Record<string,any>) => {
                  if(item.selectable === false){
                    return (
                      <div className="collaborator">{item.title}: {item.description}</div>
                    )
                  }
                  if(item.selectable === true){
                    return (
                      <div className="selectable">
                        <img src={discountSelectableImg} alt="icon"/>
                        Cupon: {StringFormatter.shortText(item.title.toUpperCase(), 29, 29)}
                      </div>
                    )
                  }
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Fragment>
  }
};

