import React from 'react';
import { checkmarkOutline, chevronForward } from 'ionicons/icons';
/**
* Styles
*/
import './index.less';
import { IonIcon } from '@ionic/react';

export interface IProps {
    avatar?: string;
    title: string;
    subtitle?: string;
    tag?: { text: string; isComplete: boolean }
    onContinue?: () => void;
    cssClass?: string | string[];
    backGroundColor?: string;
    heightPx?: number;
    widthPercent?: number;
    marginLeftPx?: number;
    marginRightPx?: number;
    marginTopPx?: number;
    marginBottomPx?: number;
}

const ListItem: React.FC<IProps> = (props) => {

    const { avatar, title, subtitle, cssClass, onContinue } = props;
 
    const _cssClass = ['component-list-item-lkjmf'];
    if (cssClass) {
        _cssClass.push(...(typeof cssClass === 'string' ? [cssClass] : cssClass));
    }

    return (
        <div 
            className={`component-list-item-lkjmf ${cssClass}`} 
            onClick={() => props.onContinue && props.onContinue()}
            style={{
                backgroundColor: `${props.backGroundColor}`,
                height: `${props.heightPx}px`,
                width: `${props.widthPercent}%`,
                marginLeft: `${props.marginLeftPx}px`,
                marginRight: `${props.marginRightPx}px`,
                marginTop: `${props.marginTopPx}px`,
                marginBottom: `${props.marginBottomPx}px`
            }}
        >
            <div className="avatar-image">{avatar && <img src={avatar} className="avatar" />} </div>
            <div className="body-text">
                {
                    props.tag &&
                        <div className={`tag ${props.tag.isComplete ? 'complete' : ''}`}>
                            {props.tag.isComplete && <div className="icon-check"> <IonIcon src={checkmarkOutline} /></div>}
                            <p className={`tag-text ${props.tag.isComplete ? 'complete' : ''}`}> {props.tag.text}</p>
                        </div>
                }
                <div className="title">{title}</div>
                <div className="subtitle">{subtitle}</div>
            </div>
            {onContinue ? <div className="icon-next"><IonIcon src={chevronForward} /></div>: null}
        </div>
    )
}

export default ListItem;
