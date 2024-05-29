import { IonPage } from '@ionic/react';
import { State } from 'ionicons/dist/types/stencil-public-runtime';
import React from 'react';
import styled from 'styled-components';

// index
import './index.less';

interface IProps {
    background: string;
    darkBackground: string;
    height: string;
    marginTop: string;
    marginBottom: string;
}

interface IState {
    displayDarkMode: boolean;
}

export default class SeparationLine extends React.Component<IProps, IState> {

    state: IState = {
        displayDarkMode: false
    }

    Div = styled.div`
        margin-top: ${this.props.marginTop};
        margin-bottom: ${this.props.marginBottom};
        background: ${this.state.displayDarkMode? this.props.darkBackground: this.props.background};
        height: ${this.props.height};
        width: 100%;
    `;
    render() {
        return (
            <this.Div/>
        )
    }
}