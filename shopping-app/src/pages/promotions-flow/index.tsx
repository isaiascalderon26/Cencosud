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
import { IPromotion } from '../../models/promotions/IPromotion';

/**
 * Clients
 */
import UserClient from '../../clients/UserClient';
import PromotionsClient from '../../clients/PromotionsClient';

/**
 * Components
 */
import PromotionDetailModal from '../../components/promotion_detail_modal';
import moment from 'moment';

// import AlgoliaSearch from '../../lib/AlgoliaSearch';
// import RemoteConfigClient from '../../clients/RemoteConfigClient';

interface IProps extends RouteComponentProps<{ id: string }> { }
interface IState {
  mode: "INITIAL_STATE" | "PAGE_LOADED",
  promotions?: Array<IPromotion>,
  promotion?: IPromotion,
  promotion_modal: boolean;
  site?: ISite;
}

export default withIonLifeCycle(class PromotionsPage extends React.Component<IProps, IState> {

  state: IState = {
    mode: "INITIAL_STATE",
    promotion_modal: false
  }

  ionViewWillEnter = async () => {

    const sites = await UserClient.getSites();
    const site = sites.data.find((site: ISite) => { return site.name === this.props.match.params.id });


    this.setState({
      promotions: [],
      site
    });
    await this.onGetMerchantActivities();
    window.history.pushState('', '', `/promotions/${this.props.match.params.id}`);
  }

  onGetMerchantActivities = async () => {
    try {
      //const index = RemoteConfigClient.get('ALGOLIA_INDEX_SHOPPING_PROMOTION_INFO', process.env.REACT_APP_ALGOLIA_INDEX_SHOPPING_PROMOTION_INFO);
      //let alg_promotions : Array<IPromotion> = await AlgoliaSearch.searchExact(this.props.match.params.id, [`store:${this.props.match.params.id}`], 100, index) || [];

      const promotions = await PromotionsClient.list({
        offset: 0,
        limit: 50,
        query: {
          "store.keyword_is": this.props.match.params.id
        },
        sort: {
          "order": "asc"
        }
      });

      this.setState({
        mode: 'PAGE_LOADED',
        promotions: promotions.data
      })
    } catch (error) {
      console.log(error);
    }
  }

  onPromotionModalOpen(promotion: IPromotion) {
    this.setState({
      promotion_modal: true,
      promotion
    })

    let brand = promotion.brand_name.toLocaleLowerCase().replace(/\s+/g, '-');
    let title = promotion.title.toLocaleLowerCase().replace(/\s+/g, '-');

    window.history.pushState('', '', `/promotions/${this.props.match.params.id}/${brand}-${encodeURI(title)}`);
  }
  onCloseModalHandler() {
    this.setState({
      promotion_modal: false
    })
    window.history.pushState('', '', `/promotions/${this.props.match.params.id}`);
  }

  render() {
    const { mode, promotion_modal, site } = this.state;
    return <IonPage className={`promotions-flow ${mode.replace(/_/ig, '-').toLowerCase()}`}>
      {(() => {
        const customRender: Function = (this as any)[`render${mode}`];
        if (!customRender) {
          return <div>{mode}</div>;
        }
        return customRender();
      })()}
      {promotion_modal ? <PromotionDetailModal
        onClose={() => { this.onCloseModalHandler() }}
        promotion={this.state.promotion}
        site={site!}
      ></PromotionDetailModal> : null}
    </IonPage>
  }
  renderINITIAL_STATE = () => {
    return <Fragment>
      <IonHeader>
        <div onClick={() => { this.props.history.push(`/mall-home/${this.props.match.params.id}`) }} >
          <IonIcon icon={arrowBack}></IonIcon>
        </div>
      </IonHeader>
      <IonContent>
        <div style={{ padding: '0 24px', width: '100%' }}>
          <IonSkeletonText style={{ height: "32px", width: "75%", borderRadius: "12px", marginTop: "24px" }} animated={true}></IonSkeletonText>
          <IonSkeletonText style={{ height: "164px", width: "100%", borderRadius: "12px", marginTop: "32px" }} animated={true}></IonSkeletonText>
          <IonSkeletonText style={{ height: "164px", width: "100%", borderRadius: "12px", marginTop: "16px" }} animated={true}></IonSkeletonText>
        </div>
      </IonContent>
    </Fragment>
  }

  removeTags(str: string) {
    if ((str === null) || (str === ''))
      return "";
    else
      str = str.toString();
    return str.replace(/(<([^>]+)>)/ig, '');
  }

  stripHtml(html: string): string {
    let tmp = document.createElement("DIV");
    tmp.innerHTML = html;
    return this.removeTags(tmp.textContent || tmp.innerText || "");
  }

  renderPAGE_LOADED = () => {
    const { promotions, site } = this.state
    const { id } = this.props.match.params
    return <Fragment>
      <IonHeader>
        <div onClick={() => { this.props.history.push(`/mall-home/${this.props.match.params.id}`) }}>
          <IonIcon icon={arrowBack}></IonIcon>
        </div>
      </IonHeader>
      <IonContent className='promotions-init'>
        <div>
          <h1>Ofertas y promociones</h1>
          <p>Descubre las mejores y exclusivas promociones que tiene App Mi Mall para ti</p>
        </div>
        <div>
          {promotions?.map((promotion: IPromotion) => {
            /*
            This was removed because in the extractor this validation is already made

            let startTime = new Date(promotion.validity_start_date!).getTime();
            let endTime = new Date(promotion.validity_end_date!).getTime();

            let today = new Date().getTime();
             if(!(startTime <= today && endTime >= today)) {
               return;
            }
            */

            return (
              <div key={promotion.objectID || promotion.id} onClick={() => { this.onPromotionModalOpen(promotion) }}>
                <div className='promotions-image-wrapper'>
                  <img src={`${site?.web}${promotion.image}`}></img>
                </div>
                <div className='promotion-text'>
                  <h5>{promotion.title}</h5>
                  <p>{this.stripHtml(promotion.description)}</p>
                  <p className='valid-dateend'>Valida hasta el <span>{moment(promotion.validity_end_date).format('D [de] MMMM')}</span></p>
                </div>
              </div>
            )
          })}
        </div>
      </IonContent>
    </Fragment >
  }
})
