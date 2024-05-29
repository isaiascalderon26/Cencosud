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
import { IPromotion } from '../../../../models/promotions/IPromotion';
import PromotionDetailModal from '../../../../components/promotion_detail_modal';
import RemoteConfigClient from '../../../../clients/RemoteConfigClient';
import { ISite } from '../../../../models/store-data-models/ISite';

const localize = i18n(locales);

interface IProps extends RouteComponentProps <{id: string}> {
  site:ISite,
  onUpdateRut?: (rut:string) => void
}

interface IState {
  mode: "INITIAL_STATE" | "PAGE_LOADED",
  promotions: Array<IPromotion>
  promotion?: IPromotion
  promotion_is_open: boolean
}

export default class Promotions extends React.Component<IProps, IState> {
  state: IState = {
    mode: "INITIAL_STATE",
    promotions: [],
    promotion_is_open: false
  }

  componentDidMount = async () => {
    await this.getAllActivities();
  }

  getAllActivities = async () => {
    const name = this.props.match.params.id;

    try {
      const index = RemoteConfigClient.get('ALGOLIA_INDEX_SHOPPING_PROMOTION_INFO', process.env.REACT_APP_ALGOLIA_INDEX_SHOPPING_PROMOTION_INFO);

      let promotions: Array<IPromotion> = await AlgoliaSearch.searchExact(name, [`store:${name}`], 8, index) || [];
      this.setState({
        mode: 'PAGE_LOADED',
        promotions
      })
    } catch (error) {
      console.log(error)
    }
  }
  onOpenPromotionHandler = (promotion: IPromotion) => {
    this.setState({
      promotion,
      promotion_is_open: true
    });
    let brand = promotion.brand_name.toLocaleLowerCase().replace( /\s+/g, '-');
    let title = promotion.title.toLocaleLowerCase().replace( /\s+/g, '-');

    window.history.pushState('', '', `/promotions/${this.props.match.params.id}/${brand}-${encodeURI(title)}`);
  }
  onCloseModalHandler = () => {
    this.setState({
      promotion_is_open: false
    })

    window.history.pushState('', '', `/mall-home/${this.props.match.params.id}`);

  }

  checkDateLimit = (promotions: Array<IPromotion>) => {
    let promosChecked: Array<IPromotion> = [];

    promotions?.map((promo) => {
      let startTime = new Date(promo.validity_start_date!).getTime();
      let endTime = new Date(promo.validity_end_date!).getTime();

      let today = new Date().getTime();
      if(startTime <= today && endTime >= today){
        promosChecked.push(promo);
      }
    });

    return promosChecked;
  }

  onUpdateRut = (rut:string) => {
    this.props.onUpdateRut!(rut)
  }

  render() {
    const { mode, promotion_is_open, promotion } = this.state;
    return <div className={`promotion-home-section ${mode.replaceAll("_", "-").toLocaleLowerCase()}`}>
      {(() => {
        const customRender: Function = (this as any)[`render${mode}`];
        if (!customRender) {
          return <div>{mode}</div>;
        }
        return customRender();
      })()}
      {promotion_is_open ? <PromotionDetailModal onClose={this.onCloseModalHandler} promotion={promotion} site={this.props.site} onUpdateRut={this.onUpdateRut}></PromotionDetailModal> : null}
    </div>
  }

  renderPAGE_LOADED = () => {
    const slideOpts = {
      slidesPerView: 'auto',
      zoom: false,
      grabCursor: true
    };

    const {site} = this.props;
    const promotions = this.checkDateLimit(this.state.promotions);
    return <div>
      {Expr.whenConditionRender(promotions!.length > 0, () => {
        return (
          <Fragment>
            <div>
              <h3 className="font-bold">{localize('PROMOTIONS')}</h3>
            </div>
            <IonSlides options={slideOpts} key={promotions?.map(slide => slide.objectID).join('_')}>
              {promotions?.map((promotion) => {
                return <IonSlide style={({ width: '232px', paddingLeft: '8px' })} key={promotion.objectID}>
                  <div onClick={() => this.onOpenPromotionHandler(promotion)}>
                    <img id={promotion.objectID} src={`${site.web}${promotion.image}`}></img>
                  </div>
                </IonSlide>
              })}
              <IonSlide style={({ width: '232px', height: '112px', margin: '0 8px' })} className='extend-info' onClick={() => this.props.history.push(`/promotions/${this.props.match.params.id}`)}>
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
