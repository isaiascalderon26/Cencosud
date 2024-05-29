import React from 'react';

// index
import './index.less';
// assets
import userIcon from '../../../../assets/media/icons/user.png';
import timeIcon from '../../../../assets/media/icons/time.png';
import calendarIcon from '../../../../assets/media/icons/calendar.png';

import userIconWhite from '../../../../assets/media/icons/user-white.svg';
import timeIconWhite from '../../../../assets/media/icons/clock-white.svg';
import calendarIconWhite from '../../../../assets/media/icons/calendar-white.svg';

interface IProps {
    icon: 'user' | 'date' | 'time'
    text?: string;
    placeholder: string;
    onClick: () => void;
    disabled?: boolean;
    formError: boolean
}

interface IState {
}


export default class FakeInput extends React.Component<IProps, IState> {
    state: IState = {
    }

    resolveIcon = () => {
        switch (this.props.icon) {
            case 'date':
                return calendarIcon;
            case 'time':
                return timeIcon;
            default:
                return userIcon;
        }
    }

    render() {
        const icon = this.resolveIcon();
        const text = this.props.text && this.props.text!=="0" ? <span className='text'>{this.props.text}</span> : <span className='placeholder'>{this.props.placeholder}</span>;
        return (
            <div className={`fake-input-21xyz ${this.props.disabled?'disabled':''} ${this.props.formError?'form-error':''}`} onClick={this.props.onClick}>
                <img src={icon} alt='icon' />
                {text}
            </div>
        )
    }
}
