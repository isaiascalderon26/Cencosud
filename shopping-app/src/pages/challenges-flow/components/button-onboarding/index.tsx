import React, { Fragment } from "react";
import { IonIcon } from "@ionic/react";
import { add } from "ionicons/icons";
// index
import './index.less';

interface IProps {
    text: string;
    onOnClick: () => void;
    icon?: string;
}

interface IState {

}

export default class ButtonOnboarding extends React.Component<IProps, IState> {

    onClickButton = (): void => {
        this.props.onOnClick();
    }

    render() {
        const icon = this.props.icon ? this.props.icon : add;
        return (
            <Fragment>
                <button className="component-button-onboarding listing-component-button-onboarding" onClick={this.onClickButton}>
                    <div className="logo-component-button-onboarding">
                        <img src={icon} alt="logo" />
                    </div>
                    <div className="text-component-button-onboarding" dangerouslySetInnerHTML={{ __html: this.props.text }}></div>
                </button>
            </Fragment>
        )
    }
}


