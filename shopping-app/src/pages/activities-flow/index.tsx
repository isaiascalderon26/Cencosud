import moment from 'moment';
import React, { Fragment } from 'react';
import { arrowBack } from 'ionicons/icons';
import { RouteComponentProps } from 'react-router';
import { withIonLifeCycle, IonPage, IonContent, IonIcon, IonSkeletonText, IonHeader } from '@ionic/react';

/**
 * Styles
 */
import './index.less';

/**
 * Models
 */
import { ISite } from '../../models/store-data-models/ISite';
import { IActivity } from '../../models/activities/IActivity';

/**
 * Clients
 */
import UserClient from '../../clients/UserClient';
import ActivitiesClient from '../../clients/ActivitiesClient';

/**
 * Components
 */
import ActivityDetailModal from '../../components/activity_detail_modal';


interface IProps extends RouteComponentProps<{
  id: string
}> {}

interface IState {
  mode: "INITIAL_STATE" | "PAGE_LOADED",
  activities?: Array<IActivity>,
  activity?: IActivity,
  activity_modal: boolean;
  site?: ISite
}

export default withIonLifeCycle(class ActivitiesPage extends React.Component<IProps, IState> {

  state: IState = {
    mode: "INITIAL_STATE",
    activity_modal: false
  }

  ionViewWillEnter = async () => {
    this.setState({
      activity_modal: false,
      activities: []
    });
    await this.onGetMerchantActivities();
  }

  onGetMerchantActivities = async () => {
    let name = this.props.match.params.id;
    try {
      const sites = await UserClient.getSites();
      const site = sites.data.find((site: ISite) => { return site.name === name });
      //const index = RemoteConfigClient.get('ALGOLIA_INDEX_SHOPPING_ACTIVITY_INFO', process.env.REACT_APP_ALGOLIA_INDEX_SHOPPING_ACTIVITY_INFO);
      //let activities1 : Array<IActivity> = await AlgoliaSearch.searchExact(this.props.match.params.id, [`store:${this.props.match.params.id}`], 100, index) || [];
      
      
      //console.log(activities1, 'activities');
      
      const activities = await ActivitiesClient.list({
        offset: 0,
        limit: 50,
        query: {
          "store.keyword_is": this.props.match.params.id,
          "type.keyword_is_not": "video",
          "validity_end_date_range_gte": moment()
        }
      });
      
      this.setState({
        mode: 'PAGE_LOADED',
        activities: activities.data,
        site
      })
    } catch (error) {
      console.log(error);
    }
  }

  onActivityModalOpen(activity: IActivity) {
    this.setState({
      activity_modal: true,
      activity
    });

    let store = this.props.match.params.id;
    let title = activity.title.toLocaleLowerCase().replace( /\s+/g, '-');

    //this.props.history.push(`/mall-home/${this.props.match.params.id}`)
    this.props.history.push(`/activities/${store}/${title}`);
  }
  onCloseModalHandler() {
    this.setState({
      activity_modal: false
    })

    let store = this.props.match.params.id;
    this.props.history.push(`/activities/${store}`);
  }

  onCloseActivities() {
    let store = this.props.match.params.id;
    this.props.history.push(`/mall-home/${store}`);
  }

  render() {
    const { mode, activity_modal } = this.state;
    return <IonPage className={`activities-flow ${mode.replace(/_/ig, '-').toLowerCase()}`}>
      {(() => {
        const customRender: Function = (this as any)[`render${mode}`];
        if (!customRender) {
          return <div>{mode}</div>;
        }
        return customRender();
      })()}
      {activity_modal ? <ActivityDetailModal 
        onClose={() => {this.onCloseModalHandler()}} 
        activity={this.state.activity}
        site={this.state.site ? this.state.site.web : ''}
        store={this.props.match.params.id}></ActivityDetailModal> : null}
    </IonPage>
  }
  renderINITIAL_STATE = () => {
    return <Fragment>
      <IonHeader>
        <div onClick={()=> {this.onCloseModalHandler()}} >
          <IonIcon icon={arrowBack}></IonIcon>
        </div>
      </IonHeader>
      <IonContent>
        <div style={{padding:'0 24px', width:'100%'}}>
          <IonSkeletonText style={{height: "32px", width: "75%", borderRadius: "12px", marginTop: "24px"}} animated={true}></IonSkeletonText>
          <IonSkeletonText style={{height: "164px", width: "100%", borderRadius: "12px", marginTop: "32px"}} animated={true}></IonSkeletonText>
          <IonSkeletonText style={{height: "164px", width: "100%", borderRadius: "12px", marginTop: "16px"}} animated={true}></IonSkeletonText>
        </div>
      </IonContent>
    </Fragment>
  }
  renderPAGE_LOADED = () => {
    const { activities, site } = this.state
    
    const { id } = this.props.match.params
    return <Fragment>
      <IonHeader>
        <div onClick={()=> {this.onCloseActivities()}} >
          <IonIcon icon={arrowBack}></IonIcon>
        </div>
      </IonHeader>
      <IonContent className='activities-init'>
        <div>
          <h1>Revisa nuestras actividades</h1>
        </div>
        <div>
          {activities?.map((activity: IActivity)=> {
            //let countDownDate = new Date(activity.validity_end_date!).getTime();
            let web = site ? site.web: '';
            let image = activity? activity.image : '';
            
            let exclude = activity ? (activity.title.includes('APP') ? true : false) : false;

            if(/*activity.type !== 'video' && countDownDate > new Date().getTime() &&*/ !exclude) {
              return (
                <div key={activity.objectID} onClick={()=>{this.onActivityModalOpen(activity)}}>
                  <img src={`${web}${image}`} onError={(event) => event.currentTarget.style.display = 'none'}></img>
                </div>
              )
            }
          })}
        </div>
      </IonContent>
    </Fragment >
  }
})
