import React, { Fragment } from "react";
/* index */
import './index.less';


interface IProps {
    title: string;
    subtitle?: string;
    image: string;
    opacity?: string;
}

interface IState {
    
}

export default class Info extends React.Component<IProps, IState> {

    render() {
        const opacity:string = this.props.opacity ? `${this.props.opacity}%` : "100%";
        return (      
            <Fragment>
                <div className="component-info">
                    <div className="component-info-image">
                        <img src={this.props.image} />
                    </div>
                    <div className="component-info-title" style={{ 'opacity': opacity}}>
                        <h2 className="font-bold">{this.props.title}</h2>
                    </div>
                    {this.props.subtitle ?
                    <div className="component-info-subtitle" style={{ 'opacity': opacity}}>
                        <h3>{this.props.subtitle}</h3>
                    </div> : null}
                </div>
            </Fragment>  
        )
    }
}