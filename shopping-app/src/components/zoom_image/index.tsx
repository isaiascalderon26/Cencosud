import React, {Fragment} from "react";
import { IonModal, IonContent, IonIcon, createAnimation } from '@ionic/react';
import { closeCircleSharp } from 'ionicons/icons';
import BackdropLoading from '../backdrop-loading';
// index
import './index.less';

interface IProps{
    modal_open: boolean,
    image_url: string,
    onClose: () => void;
    outside_close_button?: boolean
}

interface IState{
    show_loading: boolean
}

export default class ZoomImage extends React.Component<IProps, IState> {

    state: IState = {
        show_loading: true,
    }

    onCloseModalHandler = async () => {
        setTimeout(() => {
          this.props.onClose();
        }, 500) 
    }

    enterAnimation = (baseEl: any) => {
        const backdropAnimation = createAnimation()
          .addElement(baseEl.querySelector('ion-backdrop')!)
          .fromTo('opacity', '0.01', 'var(--backdrop-opacity)');
    
        const wrapperAnimation = createAnimation()
          .addElement(baseEl.querySelector('.modal-wrapper')!)
          .keyframes([
            { offset: 0, transform: 'scale(0)' },
            { offset: 1, transform: 'scale(1)' }
          ]);
    
        return createAnimation()
          .addElement(baseEl)
          .easing('ease-in')
          .duration(300)
          .addAnimation([backdropAnimation, wrapperAnimation]);
    }

    leaveAnimation = (baseEl: any) => {
        const wrapperAnimation = createAnimation()
          .addElement(baseEl.querySelector('.modal-wrapper')!)
          .keyframes([
            { offset: 0, opacity: 1 , transform: 'scale(1)' },
            { offset: 1, opacity: 0,  transform: 'scale(0)' }
          ]);
    
        return createAnimation()
          .addElement(baseEl)
          .easing('ease-out')
          .duration(300)
          .addAnimation(wrapperAnimation);
      }

    render(){
        const { show_loading} = this.state;
        const { outside_close_button } = this.props;
        return (
            <Fragment>
              <IonModal enterAnimation={this.enterAnimation} leaveAnimation={this.leaveAnimation} swipeToClose={false} backdropDismiss={false} cssClass={`zoom-image-modal`} isOpen={this.props.modal_open}>
                <div className={`container ${outside_close_button ? 'medium' : ''}`}>
                    <div onClick={(e) => {this.onCloseModalHandler()}} className={`close-button ${outside_close_button ? 'outside' : ''}`}>
                    <IonIcon icon={closeCircleSharp}></IonIcon>
                    </div>
                    <IonContent>
                        <img src={this.props.image_url}></img>  
                    </IonContent>
                </div>
              </IonModal>
            </Fragment>
          )
    }
        
    

}