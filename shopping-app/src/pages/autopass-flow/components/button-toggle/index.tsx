import React from "react";
import { IonIcon, IonToggle } from "@ionic/react";
import { ToggleChangeEventDetail } from "@ionic/core";

/* index */
import './index.less';
/* assets */
import ImageInTwoMode from "../../../../components/image-in-two-modes";
import logoEnableServiceActiveDark from '../../../../assets/media/logo-enable-service-active-dark.svg';
import logoEnableServiceActiveWhite from '../../../../assets/media/logo-enable-service-active-white.svg';

interface IProps {
    label: string;
    value?: boolean;
    disabled?: boolean;
    onChange: (value: boolean) => void;
}

export default class ButtonToggle extends React.Component<IProps, {}> {

    onChange = (e: CustomEvent<ToggleChangeEventDetail>): void => {
        this.props.onChange(e.detail.checked);
    }

    render() {
        const { label, disabled, value } = this.props;
        return (
            <div className="component-toggle-button">
                <div className={`component-toggle-button-body-text ${this.props.disabled?'disabled':''}`}>
                    <div>
                        <ImageInTwoMode srcLight={logoEnableServiceActiveDark} srcDark={logoEnableServiceActiveDark} alt="logo"/>
                    </div>
                    <IonIcon src={logoEnableServiceActiveWhite} /> 
                    <div className="label">{label}</div>
                </div>
                <div className="component-toggle-button-element-toggle">
                    <IonToggle color="success" checked={value} disabled={disabled} onIonChange={this.onChange} />
                </div>
            </div>
        )
    }
}
