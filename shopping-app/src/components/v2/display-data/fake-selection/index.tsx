import { IonIcon } from '@ionic/react';
import React from 'react';

interface IProps {
    cssClass?: string | string[];
    width?: string;
    height?: string;
    backgroundColor?: string;
    imageContent: string;
    imageSelected?: string;
    onClick?: () => void;
}

const FakeSelection: React.FC<IProps> = (props) => {

    const _cssClass = ['component-fake-selection-y2k9xc'];
    if (props.cssClass) {
        _cssClass.push(...(typeof props.cssClass === 'string' ? [props.cssClass] : props.cssClass));
    }

    const width = props.width || '100%';
    const height = props.height || '100%'; 
    const backgroundColor = props.backgroundColor || 'transparent';
    
    return (
        <div 
            className={`component-fake-selection-y2k9xc ${props.cssClass}`} 
            style={{ 
                background: backgroundColor,
                width: width,
                height: height
            }}
            onClick={props.onClick || props.onClick}
        >
            <img src={props.imageContent} />
            {props.imageSelected ? <IonIcon className="chevron" src={props.imageSelected} /> : null}
        </div> 
    )
    
}

export default FakeSelection;