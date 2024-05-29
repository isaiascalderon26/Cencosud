import React, { Fragment } from 'react';
import './index.less';
import { IonModal, IonContent, IonSpinner, IonIcon } from '@ionic/react';
import { atCircleSharp, close, timeOutline } from 'ionicons/icons';
import BackgroundDummy from './../../assets/media/dummy/background-dummy-1.png';
import { IActivity } from '../../models/activities/IActivity';


interface IProps {
  onClose: (action: "close") => void;
  activity?: IActivity;
  store: string;
  site: string;
}

interface IState {
  mode: "INITIAL_STATE" | "PAGE_LOADED",
}

export default class ActivityDetailModal extends React.Component<IProps, IState> {
  state: IState = {
    mode: "PAGE_LOADED",
  }

  ionViewWillEnter = async () => {
    await this.onLoadActivity();
  }

  onLoadActivity = async () => {
    this.setState({ 
      mode:'PAGE_LOADED'
    });
  }

  onCloseModalHandler = async () => {
    this.props.onClose("close");
  }

  getImage(url: string) {
    const imgRex = /<img.*?src="(.*?)"[^>]+>/g;
    const images = [];
      let img;
      while ((img = imgRex.exec(url))) {
        images.push(img[1]);
      }
      return images[0];
  }

  youtubeParser(url: string){
    var regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    var match = url.match(regExp);
    return (match&&match[7].length==11)? match[7] : false;
  }

  render() {
    const { mode } = this.state;
    return <IonModal swipeToClose={false} backdropDismiss={false} cssClass={`activity-detail-modal ${mode.replaceAll("_", "-").toLocaleLowerCase()}`} isOpen={true}>
      {(() => {
        const customRender: Function = (this as any)[`render${mode}`];
        if (!customRender) {
          return <div>{mode}</div>;
        }
        return customRender();
      })()}
    </IonModal>
  }

  renderINITIAL_STATE = () => {
    return <Fragment>
      <IonContent scrollY={false}>
        <div>
          <IonSpinner name="crescent" ></IonSpinner>
          <div>
            Cargando información...
          </div>
        </div>
      </IonContent>
    </Fragment>
  }

  renderPAGE_LOADED = () => {
    const { activity, store, site } = this.props
    let image = activity?.image;
    let url = '';

    if (activity?.video) {
      const idYoutube = this.youtubeParser(activity.video);
      url = `https://www.youtube.com/embed/${idYoutube}`;
    }

    return <Fragment>
      <IonContent>
        <div>
          {/* CLOSE BUTTON */}
          <div onClick={this.onCloseModalHandler}>
            <IonIcon icon={close}></IonIcon>
          </div>
          {/* TITLE */}
          <div>
            <h1 dangerouslySetInnerHTML={{__html: activity?.title!}}></h1>
          </div>
          {/* EXPIRE DATE */}
          <div>
            {/*
            <div>
              <IonIcon icon={timeOutline} />
              <p>{`Desde ${activity?.validity_start_date} · Hasta ${activity?.validity_end_date}`}</p>
            </div>
            */}
          </div>
          {/* VIDEO */}
          <div>
            {activity?.video ?
              <iframe placeholder={BackgroundDummy} src={url} width="100%" height="208" allowFullScreen={true}></iframe> : ''
            }
          </div>
          {/* IMAGE */}
          <div>
            <img src={`${site}/${image}`} onError={(event) => event.currentTarget.style.display = 'none'}></img>
          </div>
          {/* DESCRIPTION */}
          <div>
            {activity && !activity.description.includes('sites/') ? 
            <p dangerouslySetInnerHTML={{__html: activity?.description!}}></p> : ''}
          </div>
          {activity && activity.description_html ?
          <div className="acquia-info">
            {<img src={site + '/' + this.getImage(activity.description_html)} onError={(event) => event.currentTarget.style.display = 'none'}/>}
          </div> : ''}
        </div>
      </IonContent>
    </Fragment>
  }
};