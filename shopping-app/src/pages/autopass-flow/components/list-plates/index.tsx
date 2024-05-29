import React, { Fragment } from "react";
import ButtonPlate from "../button-plate";
/* index */
import './index.less';
/** models  */
import IVehicle from "../../../../models/vehicles/IVehicles";

interface IProps {
    vehicles: IVehicle[];
    onRemovePlate: (id:string) => void;
}

interface IState {
    
}

export default class ListPlates extends React.Component<IProps, IState> {
    
    render() {
        const { vehicles } = this.props;
        return (
            vehicles.map((item:IVehicle) => {
                return (
                    <Fragment key={item.plate}>
                        <div className="component-list-history">
                            <ButtonPlate plate={item.plate}  onRemove={this.props.onRemovePlate} />
                        </div>
                    </Fragment>
                )
            })
        )
    }
}