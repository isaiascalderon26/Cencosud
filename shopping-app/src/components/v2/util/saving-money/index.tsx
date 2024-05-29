import { IonIcon } from '@ionic/react';
import React from 'react';
import './index.less';

//assets
import iconWallet from '../../../../assets/media/wallet.svg';

interface IProps {
    cssClass?: string | string[];
    height?: string;
    marginTop?: string;
    marginBottom?: string;
    marginLeft?: string;
    marginRight?: string;
    title: string;
    subtitle: string;
    money: string;
}

const SavingMoney: React.FC<IProps> = (props) => {

    const _cssClass = ['component-saving-money-jqhwejkqh'];
    if (props.cssClass) {
        _cssClass.push(...(typeof props.cssClass === 'string' ? [props.cssClass] : props.cssClass));
    }

    const height = props.height || '100%'; 
    const marginTop = props.marginTop || '0px';
    const marginBottom = props.marginBottom || '0px';
    const marginLeft = props.marginLeft || '0px';
    const marginRight = props.marginRight || '0px';
    
    return (
        <div 
            className={`component-saving-money-jqhwejkqh ${props.cssClass ? props.cssClass : ''}`} 
            style={{
                height: height,
                marginTop: marginTop,
                marginBottom: marginBottom,
                marginLeft: marginLeft,
                marginRight: marginRight
            }}
        >
            <div className="content">
                <div className="data">
                    <div className="title">{props.title}</div>
                    <div className="subtitle">{props.subtitle}</div>
                </div>
                <div className="money">
                    <div className="icon">
                        <IonIcon src={iconWallet} />
                    </div>
                    <div className="value">
                        {props.money}
                    </div>
                </div>
            </div>
        </div> 
    )
    
}

export default SavingMoney;