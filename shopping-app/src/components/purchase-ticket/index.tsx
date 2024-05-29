import moment from 'moment';
import QRCode from "react-qr-code";
import React, { Fragment } from 'react';
import { Share } from '@capacitor/share';

import locales from './locales';
// styles
import './index.less';
// assets
import imgShare from '../../assets/media/purchase-ticket/share-icon.svg';
import imgSky from '../../assets/media/sky-costanera-ticket-detail/sky-costanera-logo.svg';
import imgTicket from  '../../assets/media/sky-costanera-ticket-detail/ticket-background.png';
// libs
import i18n from '../../lib/i18n';
import EurekaConsole from '../../lib/EurekaConsole';
import DniFormatter from '../../lib/formatters/DniFormatter';
import PluralizeFormatter from '../../lib/formatters/PluralizeFormatter';

const localize = i18n(locales);
const eureka = EurekaConsole({ label: "purchase-ticket-component" });

interface ILineItem {
    id: string,
    description: string,
    price: number,
    quantity: number
}
interface IProps {
    data: any;
}
export default class PurchaseTicket extends React.Component<IProps> {

    formatMoney = (num: Number): string => {
        var p = Number(num).toFixed(2).split(".");
        return "$" + p[0].split("").reverse().reduce(function (acc, num, i, orig) {
          return num == "-" ? acc : num + (i && !(i % 3) ? "." : "") + acc;
        }, "");
    }

    share = async () => {
        try {
            const canShare = Share.canShare();
            if (!canShare) {
                eureka.warn('Share is not supported in this device');
                return;
            }

            await Share.share({
                text: `Hola, estos son los datos de tu ticket de Sky Costanera:\n\n👤 ${this.props.data.name}\n🎟 Reserva ${this.props.data.reservation_code}\n🗓 ${moment(this.props.data.date).format('D [de] MMMM [de] YYYY')}\n⏰ Función de ${moment(this.props.data.reservation_slot.start).format('hh[h]mm')} a ${moment(this.props.data.reservation_slot.end).add(1, 'minutes').format('hh[h]mm')}\n\nRevisa el QR aquí 👉 ${this.props.data.code_qr}\n\n¡Feliz visita!\n\n-\n\n¿Cómo llegar?: https://goo.gl/maps/j4cV3qC2UMr6n9KD9`,
            });
        } catch (error) {
            eureka.error('Unexpected error while sharing', error);
        }
    }

    render() {
        return (
            <Fragment>
                <div className="purchase-ticket-component">
                    <div className="parent-content" style={{ backgroundImage : `url(${imgTicket})`}}>
                        <div className="header-purcharse">
                            <div className="header-img">
                                <img className='logo' src={imgSky} />
                                <img src={imgShare} onClick={this.share} style={{ display: 'none'}}/>
                            </div>
                        </div>
                        <div className="body-info-purcharse">
                            <div className="reserve">
                                <div className="barcode-purchase">
                                    <QRCode value={this.props.data.code_qr_data} size={180}/>
                                </div>
                                <div className="text-body-purchase">
                                <div>
                                    <span className="titles">{localize('NAME_TITLE')}</span>
                                </div>
                                <div>
                                    <span className="subtitles">{this.props.data.name}</span>
                                </div>
                                <div>
                                    <span className="subtitles">
                                        {this.props.data.rut}
                                    </span>
                                </div>
                                </div>
                            </div>
                            <div className="flex-container">
                                <div className="flex-items">
                                    <div>
                                        <span className="titles">{localize('VISITORS_TITLE')}</span>
                                    </div>
                                    <div>
                                        <span className="subtitles">
                                            <ul className="list-visitors">
                                                {this.props.data.tickets.list_tickets.map((data: ILineItem, i:number) => {
                                                    return (
                                                        data.quantity > 0 ? <li key={i}>{data.quantity} {data.description}</li> : null
                                                    )
                                                })}
                                            </ul>
                                        </span>
                                    </div>
                                </div>
                                <div className="flex-items">
                                    <div>
                                        <span className="titles">{localize('DATE_TITLE')}</span>
                                    </div>
                                    <div className="info-piece date">
                                        <div className="date-data">
                                        <div className="day-of-month principal">
                                            {moment(this.props.data.date).date()}
                                        </div>
                                        <div className="date-month-year secondary">
                                            <div className="month">
                                                {moment(this.props.data.date).format('MMMM').substring(0,3)}
                                            </div>
                                            <div className="year">
                                                {moment(this.props.data.date).year()}
                                            </div>
                                        </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex-items">
                                    <div>
                                        <span className="titles">{localize('HOUR_TITLE')}</span>
                                    </div>
                                    <div>
                                        <span className="subtitles">
                                            {`${moment(this.props.data.date).format('HH')}h${moment(this.props.data.date).format('mm')}`}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex-container">
                                <div className="flex-items">
                                    <div>
                                        <span className="titles">{localize('RESERVATION_CODE_TITLE')}</span>
                                    </div>
                                    <div>
                                        <span className="reservation-code-text">{this.props.data.reservation_code}</span>
                                    </div>
                                </div>
                                <div className="flex-items">
                                    <div>
                                        <span className="titles">
                                            {localize('TOTAL_TITLE')}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="subtitles">
                                            {this.formatMoney(this.props.data.tickets.total_price)}
                                        </span>
                                    </div>
                                </div>
                                {this.props.data.total_discount 
                                    ? <div className="flex-items">
                                        <div>
                                            <span className="titles">
                                                {localize('DISCOUNT_TITLE')}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="subtitles">
                                                {this.formatMoney(this.props.data.total_discount)}
                                            </span>
                                        </div>
                                    </div>
                                    : null
                                }
                            </div>
                        </div>
                    </div>
                </div>
            </Fragment>
        )
    }
}
