import React from "react";

import { IonIcon } from "@ionic/react";
import { trashSharp } from "ionicons/icons";
// index
import './index.less';

interface IProps {
    plate: string;
    onRemove: (plate: string) => void;
}

interface IState {

}

export default class ButtonPlate extends React.Component<IProps, IState> {

    plateDecorator = (plate: any): string => {
        return plate.match(/.{1,2}/g).join(' · ');
    }

    onClickItemRemove = (plate:string):void => {
        this.props.onRemove(plate);
    }

    render() {
        return (
            <div className="component-button-plate component-button-plate-vehicle-plate" onClick={() => this.onClickItemRemove(this.props.plate) }>
                <div className="vehicle-plate-text">{this.plateDecorator(this.props.plate)}</div>
                <div className="trash-icon"><IonIcon icon={trashSharp} /></div>
            </div>
        )
    }
}