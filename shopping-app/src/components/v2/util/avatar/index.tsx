import { IonIcon } from '@ionic/react';
import React from 'react';
import './index.less';

//assets
import iconAvatarDefault from '../../../../assets/media/avatar-icon-user.svg';

interface IProps {
    cssClass?: string | string[];
    icon?: string;
    marginTop?: string;
    marginBottom?: string;
    marginLeft?: string;
    marginRight?: string;
    title: string;
    subtitle: string;
}

const Avatar: React.FC<IProps> = (props) => {

    const _cssClass = ['component-avatar-iyadnanm'];
    if (props.cssClass) {
        _cssClass.push(...(typeof props.cssClass === 'string' ? [props.cssClass] : props.cssClass));
    }

    const icon = props.icon || iconAvatarDefault; 
    const marginTop = props.marginTop || '0px';
    const marginBottom = props.marginBottom || '0px';
    const marginLeft = props.marginLeft || '0px';
    const marginRight = props.marginRight || '0px';
    
    return (
        <div 
            className={`component-avatar-iyadnanm ${props.cssClass ? props.cssClass : ''}`}
            style={{
                marginTop: marginTop,
                marginBottom: marginBottom,
                marginLeft: marginLeft,
                marginRight: marginRight
            }}
        >
            <div className="content">
                <div className="image-body">
                    <div className="image">
                        <img src={icon} />
                    </div>
               </div>
               <div className="text">
                    <div className="title">{props.title}</div>
                    <div className="subtitle">{props.subtitle}</div>
               </div>
            </div>
        </div> 
    )
    
}

export default Avatar;