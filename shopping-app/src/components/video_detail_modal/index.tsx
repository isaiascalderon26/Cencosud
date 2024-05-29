import React, { Fragment } from 'react';
import './index.less';
import { IonModal, IonContent, IonIcon, createAnimation } from '@ionic/react';
import { closeCircleSharp } from 'ionicons/icons';
import { IActivity } from '../../models/activities/IActivity';
import BackdropLoading from '../backdrop-loading';
import VideoDummy from './../../assets/media/dummy/background-dummy.png'
import FirebaseAnalytics from '../../lib/FirebaseAnalytics';

interface IProps {
  onClose: (action: "close") => void;
  activity?: IActivity;
}

interface IState {
  fav: boolean,
  show_loading: boolean
  modal_open: boolean
}

export default class VideoDetailModal extends React.Component<IProps, IState> {
  state: IState = {
    fav: false,
    show_loading: true,
    modal_open: true
  }

  componentDidMount() {
    FirebaseAnalytics.customLogEvent("ionic_app", "actividades");
  }

  onCloseModalHandler = async () => {
    this.setState({modal_open: false})
    setTimeout(() => {
      this.props.onClose("close");
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

  onVideoLoaded = async (video: HTMLVideoElement) => {
    this.setState({
      show_loading: false
    })
    video.play()
  }

  render() {
    const { activity } = this.props
    const { show_loading, modal_open } = this.state;
    return (
      <Fragment>
        <IonModal enterAnimation={this.enterAnimation} leaveAnimation={this.leaveAnimation} swipeToClose={false} backdropDismiss={false} cssClass={`video-detail-modal`} isOpen={modal_open}>
          <div onClick={(e) => {this.onCloseModalHandler()}} className="close-button">
            <IonIcon icon={closeCircleSharp}></IonIcon>
          </div>
          <IonContent>
            <video poster={VideoDummy} playsInline id={activity!.objectID} preload="auto" onLoadStart={() => this.setState({show_loading: true})}
            src={`${activity!.video}`} onLoadedData={() => this.setState({show_loading: false})} autoPlay loop></video>
          </IonContent>
          {show_loading ? <BackdropLoading message="Cargando..."></BackdropLoading> : null}
        </IonModal>
      </Fragment>
    )
  }
};