import { IonIcon } from '@ionic/react';
import React from 'react';
import { arrowBack } from 'ionicons/icons';
import styled from 'styled-components';


// index
import './index.less';

interface IProps {
    background: string;
    logo: string;
    title: string;
    isOpen: boolean;
    closeOpenText: string;
    goBack: () => void
}

interface IState {
}

export default class MerchantDetailHeader extends React.Component<IProps, IState> {

    DivCompanyImage = styled.div`
        background-image: url(${this.props.background});
        background-repeat: no-repeat;
        background-size: cover;
    `;

    state: IState = {
    }

    render() {
        return (
        <div className="merchant-detail-header">
            <this.DivCompanyImage className="merchant-photo">
            </this.DivCompanyImage>
            <div onClick={this.props.goBack}>
                <IonIcon icon={arrowBack}></IonIcon>
            </div>
            <div>
                <div>
                    <img src={this.props.logo}/>
                </div>
            </div>
            <div>
            <h1 dangerouslySetInnerHTML={{__html: this.props.title}} />
            { this.props.isOpen ? <p><span style={{color: '#1bb542'}}>Abierto</span> · {this.props.closeOpenText}.</p>
                : <p><span style={{color: '#FF3B30'}}>Cerrado</span> · {this.props.closeOpenText}.</p>
            }
            </div>
        </div>
        )
    }
}