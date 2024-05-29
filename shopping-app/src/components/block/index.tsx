import React, { useState } from 'react';
// index
import './index.less';

interface IProps {
    cssClass?: string | string[];
    title: string;
    subtitle?: string;
    value?: string;
    onChange?: (value:string) => void;
    disabled?: boolean;
}

const Block: React.FC<IProps> = (props) => {

    const _cssClass = ['component-block-kLj3p'];
    if (props.cssClass) {
        _cssClass.push(...(typeof props.cssClass === 'string' ? [props.cssClass] : props.cssClass));
    }

    const [selected , setSelected] = useState(false);

    return (
        <div 
            className={`component-block-kLj3p ${_cssClass} element ${selected ? 'selected' : ''} ${props.disabled ? 'disabled': ''}`} 
            onClick={()=> { 
                if(props.disabled){
                    return;
                }
                setSelected(true);
                props.onChange && props.value && props.onChange(props.value);
            }}
        >
            {props.subtitle && <div className="subtitle">{props.subtitle}</div>}
            <div className="title">{props.title}</div>
        </div> 
    )
    
}

export default Block;