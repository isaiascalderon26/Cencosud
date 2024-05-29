import React from 'react';
import { chevronForward } from 'ionicons/icons';
import { IonContent, IonSkeletonText, IonIcon, IonGrid, IonRow, IonCol} from '@ionic/react';

/**
 * Styles
 */
import './index.less';

/**
 * Locales
 */
import locales from './locales';

/**
 * Libs
 */
import i18n from '../../lib/i18n';
import EventStreamer from '../../lib/EventStreamer';

/**
 * Models
 */
import { IService } from '../../models/services/IService'
import { ISite } from '../../models/store-data-models/ISite';

/**
 * Clients
 */
import ServicesClient from '../../clients/ServicesClient';
import UserClient from '../../clients/UserClient';
import FoodieClient from '../../clients/FoodieClient';

/**
 * Components
 */
import ServiceDetail from '../service_detail_modal';

/**
 * Assets
 */
import Parking from '../../assets/media/parking.png'
import foodieIcon from '../../assets/media/foodie/foodie-icon.svg'

//import AlgoliaSearch from '../../lib/AlgoliaSearch';
//import RemoteConfigClient from '../../clients/RemoteConfigClient';

const localize = i18n(locales);

interface IProps {
  store: string,
  site: ISite
};

interface IState {
  mode: "INITIAL_STATE" | "HOME_SERVICES",
  popover: boolean,
  event?: any
  services?: Array<IService>
  levels: string
  service_info_modal: boolean,
  service?:IService,
  foodieAvailable: boolean,
}

export default class StoreServicesDetail extends React.Component<IProps, IState> {

  state: IState = {
    mode: 'INITIAL_STATE',
    popover: false,
    levels: 'PB',
    service_info_modal: false,
    foodieAvailable: false
  }

  componentDidMount() {
    this.getAllServices();
  }

  getAllServices = async () => {
    let services: Array<IService> = [];
    try {
      //const index = RemoteConfigClient.get('ALGOLIA_INDEX_SHOPPING_SERVICES_INFO', process.env.REACT_APP_ALGOLIA_INDEX_SHOPPING_SERVICES_INFO);
      //services = await AlgoliaSearch.searchExact(this.props.store, [`store:${this.props.store}`], 10,index) || []
      //if (!services) {
      //  return
      //}

      const services = await ServicesClient.list({
        limit: 100,
        offset: 0,
        query: {
          "store.keyword_is": this.props.store
        }
      });

      const isFoodieAvailable = await this.isFoodieAvailable();

      this.setState({ mode: 'HOME_SERVICES', services: services.data, foodieAvailable: isFoodieAvailable })
    } catch (error) {
      console.log(error)
    }
  }
  onCloseModalHandler = () => {
    this.setState({
      service_info_modal: false
    });
  }


  onOpenModalHandler = (service:IService) => {
    this.setState({
      service_info_modal: true,
      service:service
    })
  }

  goToParkingPage = () => {
    EventStreamer.emit('NAVIGATE_TO', `/parking/${this.props.store}`)
  }

  goToGastronomicoPage = () => {
    EventStreamer.emit('NAVIGATE_TO_PUSH', `/foodie/${this.props.store}`)
  }

  isFoodieAvailable = async () => {
    const whiteList = await FoodieClient.listWhitelist()
    console.log('whiteList for foodie: ', whiteList)
    const currentUser = await UserClient.me();
    console.log('current user email: ', currentUser.email)
    if (whiteList.includes('*') || whiteList.includes(currentUser.email)) {
      return true;
    }
    return false;
  }

  render() {

    const { mode, service_info_modal,service } = this.state;
    const { site } = this.props;
    return <IonContent className={`store-services-detail ${mode.replaceAll("_", "-").toLocaleLowerCase()}`}>
      {(() => {
        const customRender: Function = (this as any)[`render${mode}`];
        if (!customRender) {
          return <div>{mode}</div>;
        }
        return customRender();
      })()}


      {service_info_modal ? <ServiceDetail site={site} service={service!} onClose={() => { this.onCloseModalHandler() }}></ServiceDetail> : null}
    </IonContent>
  }

  renderINITIAL_STATE = () => {
    return <div style={{ width: '100%', padding: '0 24px' }}>
      <IonSkeletonText style={{ height: "24px", width: "65%", borderRadius: "12px", margin: "30px 0 0" }} animated={true}></IonSkeletonText>
      <IonSkeletonText style={{ height: "100px", width: "100%", borderRadius: "12px", margin: "25px 0" }} animated={true}></IonSkeletonText>
    </div>
  }

  renderHOME_SERVICES = () => {
    const { services } = this.state
    const { site } = this.props
    return <div className='services'>
      <div>
        <h1>{localize('TITLE')}</h1>
      </div>
      <div>
        {/* <div onClick={() => {this.goToParkingPage()}}>
          <div>
            <img src={Locate}/>
            <h1>{localize('LOCATE_CAR_TITLE')}</h1>
          </div>
          <IonIcon icon={chevronForward}></IonIcon>
        </div> */}

        {/* <div onClick={() => {this.goToParkingPage()}}>
          <div>
            <img src={Turnera}/>
            <h1>{localize('TURNERA_TITLE')}</h1>
          </div>
          <IonIcon icon={chevronForward}></IonIcon>
        </div> */}

        { /* Gastronomico */ }
        {/* { this.state.foodieAvailable &&
          <div onClick={() => { this.goToGastronomicoPage()}}>
            <div>
              <img src={foodieIcon}/>
              <h1>{localize('GASTRONOMICO_TITLE')}
              </h1>
            </div>
            <IonIcon icon={chevronForward}></IonIcon>
          </div>
        } */}
      </div>
      <div>
        <IonGrid>
          <IonRow>
            {services!.map((service) => {
              let title = service.name.replace('SERVICIO DE', '')
              return (
                <IonCol size="6" size-sm key={service.objectID} onClick={() => this.onOpenModalHandler(service)}>
                  <div>
                    <div>
                      <img src={`${site.web}${service.image}`}></img>
                      <h1>{title}</h1>
                    </div>
                    <p dangerouslySetInnerHTML={{__html: service.location}}></p>
                  </div>
                </IonCol>
              )
            })}
          </IonRow>
        </IonGrid>
      </div>
    </div>
  }
}
