import React, { useEffect, useState } from 'react';
// index
import './index.less';

interface IProps {
    type?: string;
    name: string;
    icon?: string;
    placeholder: string;
    onValueChange?: (value: string) => void;
    error?: string;
    disabled?: boolean;
    defaultValue?: string;
    cssClass?: string | string[];
    onClick?: () => void;
}

const InputText: React.FC<IProps> = (props) => {

    const { cssClass } = props;

    const _cssClass = ['component-input-text'];
    if (cssClass) {
        _cssClass.push(...(typeof cssClass === 'string' ? [cssClass] : cssClass));
    }

    const _type = props.type || 'text';

    const [value, setValue] = useState<string>('');

    const onChange = (value: string): void => {
        setValue(value);
        props.onValueChange!(value);
    }

    useEffect(() => {
        setValue(props.defaultValue || '');
    }, [props.defaultValue]);

    return (
        <div className={`component-input-text ${cssClass}`}>
            <div className={`input-container ${props.error && 'error'}`}>
                {props.icon && <img src={props.icon} alt="icon-image" />}
                <input
                    name={props.name}
                    type={_type}
                    placeholder={props.placeholder}
                    onChange={(e) => onChange(e.target.value)}
                    value={value}
                    disabled={props.disabled}
                    onClick={props.onClick}
                />
            </div>
            {props.error &&
                <div className="error-message">
                    {props.error}
                </div>
            }
        </div>
    );
}

export default InputText;