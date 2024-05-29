import { IonIcon } from '@ionic/react';
import React from 'react';
// index
import './index.less';
//assets 
import iconCheck from '../../../../assets/media/icon-check.svg';
interface IProps {
    cssClass?: string | string[];
    title: string;
    subtitle: string;
    onClick: (value: string) => void;
    value: string;
    selected?: boolean;
    inactive?: boolean;
}

const HourBox: React.FC<IProps> = (props) => {

    const _cssClass = ['component-hour-box-Ytrjk'];
    if (props.cssClass) {
        _cssClass.push(...(typeof props.cssClass === 'string' ? [props.cssClass] : props.cssClass));
    }

    return (
        <div 
            className={`component-hour-box-Ytrjk ${props.selected ? 'selected' : ''} ${props.inactive ? 'inactive' : ''}`} 
            onClick={() => props.onClick(props.value)}
        >
            {props.selected ? <div className="icon-check"><IonIcon src={iconCheck}></IonIcon></div> : null}
            <div className="button">
                <div className="button-content">
                    <span className="title">{props.title}</span> 
                    <div><span className="subtitle">{props.subtitle}</span></div>
                </div>
            </div>
        </div>
    )
}

export default HourBox;