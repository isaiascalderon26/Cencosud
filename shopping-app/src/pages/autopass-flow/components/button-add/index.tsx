import React from "react";
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

export default class ButtonAdd extends React.Component<IProps, IState> {

    onClickButton = (): void => {
        this.props.onOnClick();
    }

    render() {
        const icon = this.props.icon ? this.props.icon : add;
        return (
            <div className="component-button-add" onClick={() => { this.onClickButton() }}>
                <div className="component-button-add-icon"><IonIcon icon={icon} /></div>
                <h3 className="component-button-add-text">{this.props.text}</h3>
            </div>
        )
    }
}