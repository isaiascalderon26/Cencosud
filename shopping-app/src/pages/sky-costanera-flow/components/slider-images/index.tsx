import React from 'react';
import { close } from 'ionicons/icons';
import { IonSlides, IonSlide, IonModal, IonContent, IonIcon, IonButton, IonFooter, IonHeader } from '@ionic/react';
import styled from 'styled-components';

// index
import './index.less';

interface IProps {
    images: string[];
    zoom_image: (image_url: string) => void
}

interface IState {
}

const slideOpts = {
    initialSlide: 0,
    speed: 400,
    autoplay:true
};

export default class SliderImages extends React.Component<IProps, IState> {

    state: IState = {
    }
    
    render() {
        return (
            <div className="ion-slider-container">
                <IonSlides pager={true} options={slideOpts}>
                {this.props.images.map((url) => {
                    return (
                        <IonSlide key={url}>
                            <img onClick={ ()=> this.props.zoom_image(url)} src={url}></img>
                        </IonSlide>
                    )
                })}
                </IonSlides>
            </div>
        )
    }
}
