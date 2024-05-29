import { IonIcon } from '@ionic/react';
import React from 'react';
import { arrowBack } from 'ionicons/icons';
import styled from 'styled-components';


// index
import './index.less';

interface IProps {
    icon: string;
    title: string;
    text: string;
}

interface IState {
}

export default class InformationItem extends React.Component<IProps, IState> {

    state: IState = {
    }

    render() {
        return (
        <div className="information-item">
            <div>
                <img src={this.props.icon}></img>
                <h1>{this.props.title}</h1>
            </div>               
            <p dangerouslySetInnerHTML={{__html: this.props.text}}></p>
        </div>
        )
    }
}