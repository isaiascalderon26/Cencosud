import React from 'react';
// index
import './index.less';

interface IProps {
    cssClass?: string | string[];
    icon?: string;
    text?: string;
    placeholder?: string;
    onClick?: () => void;
    disabled?: boolean;
    formError?: boolean;
}

const SelectInput: React.FC<IProps> = (props) => {

    const _cssClass = ['component-select-input-uy3391'];
    if (props.cssClass) {
        _cssClass.push(...(typeof props.cssClass === 'string' ? [props.cssClass] : props.cssClass));
    }

    const text = props.text && props.text.length > 0 ? <span className='text'>{props.text}</span> : <span className='placeholder'>{props.placeholder}</span>;
    return (
        <div className={`component-select-input-uy3391 ${props.cssClass} ${props.disabled?'disabled':''} ${props.formError?'form-error':''}`} onClick={props.onClick}>
            {props.icon && <img src={props.icon} alt='icon' /> }
            {text}
        </div>
    )
}

export default SelectInput;