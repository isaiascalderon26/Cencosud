import React, { Fragment } from "react";
/* index */
import './index.less';
/* componets */
import ButtonCard from "../button-card";
/* models */
import ICard from "../../../../models/cards/ICard";

interface IProps {
    cards: ICard[];
    onClick: () => void;
}

interface IState {
    
}

export default class ListCards extends React.Component<IProps, IState> {

    render() {
        return (
            this.props.cards.map((card:ICard) => {
                return (
                    <Fragment key={card.id}>
                        <div className="component-list-card">
                            <ButtonCard card={card} onClick={this.props.onClick}/>
                        </div>
                    </Fragment>
                )
            })
        )
    }
}