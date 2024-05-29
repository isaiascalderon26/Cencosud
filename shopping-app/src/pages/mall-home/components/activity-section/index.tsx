import React, { Fragment } from 'react';
import './index.less';
import { IonIcon, IonSlides, IonSlide } from '@ionic/react';
import { IActivity } from '../../../../models/activities/IActivity';
import VideoDummy from '../../../../assets/media/dummy/background-dummy.png'
import AlgoliaSearch from '../../../../lib/AlgoliaSearch';
import Expr from '../../../../lib/Expr';
import { addCircleOutline } from 'ionicons/icons';
import i18n from '../../../../lib/i18n';
import locales from './locales';
import { RouteComponentProps } from 'react-router';
import VideoDetailModal from '../../../../components/video_detail_modal';
import RemoteConfigClient from '../../../../clients/RemoteConfigClient';
import Analytics from '../../../../lib/FirebaseAnalytics';

const localize = i18n(locales);

interface IProps extends RouteComponentProps <{
  id: string
}> {}

interface IState {
  mode: "INITIAL_STATE" | "PAGE_LOADED",
  activities: Array<IActivity>
  activity?: IActivity
  video_is_open: boolean
}

export default class Activities extends React.Component<IProps, IState> {
  state: IState = {
    mode: "INITIAL_STATE",
    activities: [],
    video_is_open: false
  }

  componentDidMount = async () => {
    await this.getAllActivities();
  }

  getAllActivities = async () => {
    const name = this.props.match.params.id;

    try {
      const index = RemoteConfigClient.get('ALGOLIA_INDEX_SHOPPING_ACTIVITY_INFO', process.env.REACT_APP_ALGOLIA_INDEX_SHOPPING_ACTIVITY_INFO);
      let activities: Array<IActivity> = await AlgoliaSearch.searchExact(name!, [`store:${name}`], 30, index) || [];
      this.setState({
        mode: 'PAGE_LOADED',
        activities
      })
    } catch (error) {
      console.log(error)
    }
  }
  onOpenVideoModal = (activity: IActivity) => {
    this.setState({
      activity,
      video_is_open: true
    })
    Analytics.customLogEventName("video", activity.title, activity.store, "home", "actividades");
  }
  onVideoLoad = async (video: HTMLVideoElement) => {
    try {
      video.setAttribute('class', 'video-loading');
    } catch (error) {
      console.log(error);
    }
  }
  onCloseModalHandler = () => {
    this.setState({
      video_is_open: false
    })
  }

  checkDateLimit = (activities: Array<IActivity>) => {
    let activityChecked: Array<IActivity> = [];

    activities?.map((activity) => {
      let startTime = new Date(activity.validity_start_date!).getTime();
      let endTime = new Date(activity.validity_end_date!).getTime();

      let today = new Date().getTime();
      if(startTime <= today && endTime >= today){
        activityChecked.push(activity);
      }
    });

    return activityChecked;
  }

  render() {
    const { mode, video_is_open, activity } = this.state;
    return <div className={`activities-home-section ${mode.replaceAll("_", "-").toLocaleLowerCase()}`}>
      {(() => {
        const customRender: Function = (this as any)[`render${mode}`];
        if (!customRender) {
          return <div>{mode}</div>;
        }
        return customRender();
      })()}
      {video_is_open ? <VideoDetailModal onClose={this.onCloseModalHandler} activity={activity}></VideoDetailModal> : null}
    </div>
  }

  renderPAGE_LOADED = () => {
    const slideOpts = {
      slidesPerView: 'auto',
      zoom: false,
      grabCursor: true
    };
    const activities = this.checkDateLimit(this.state.activities);
    return <div>
      {Expr.whenConditionRender(activities!.length > 0, () => {
        return (
          <Fragment>
            <div>
              <h3 className="font-bold">{localize('ACTIVITIES')}</h3>
            </div>
            <IonSlides  options={slideOpts} key={activities?.map(slide => slide.objectID).join('_')}>
              {activities?.map((activity: IActivity) => {
                if (activity.type === 'video') {
                  return <IonSlide key={activity.objectID} style={({ width: '128px', paddingLeft: '8px' })} onClick={() => this.onOpenVideoModal(activity)}>
                    <div>
                      <video autoPlay={false} loop poster={VideoDummy} placeholder={VideoDummy} playsInline muted id={activity.objectID} preload="auto" onLoadStart={(e) => this.onVideoLoad(e.currentTarget)}
                      style={{ objectFit: 'cover', borderRadius: '16px' }} width={119} height={212} src={`${activity.video}#t=1,14`} onLoadedData={(e) => e.currentTarget.play()}></video>
                    </div>
                  </IonSlide>
                }
              })}
              <IonSlide style={({ width: '119px', height: '212px', margin: '0 8px' })} className='extend-info' onClick={() => this.props.history.push(`/activities/${this.props.match.params.id}`)}>
                <div>
                  <IonIcon icon={addCircleOutline}></IonIcon>
                  <h3 className='font-bold'>Ver más</h3>
                </div>
              </IonSlide>
            </IonSlides>
          </Fragment>
        )
      })}
    </div>
  }
};
