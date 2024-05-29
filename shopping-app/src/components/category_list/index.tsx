import './index.less';
import { IonContent, IonHeader, IonIcon, IonItem, IonLabel, IonList, IonListHeader, IonModal, IonSkeletonText } from '@ionic/react';
import { arrowBack, chevronForward } from 'ionicons/icons';
import React, { Fragment } from 'react';
import { IMerchant } from '../../models/merchants/IMerchant';
import UserClient from '../../clients/UserClient';
import SearchModal from '../search-store-modal';
import MerchantDetailModal from '../merchant_detail_modal';
import ComponentAnimations from '../../lib/Animations/ComponentAnimations';
import { ISite } from '../../models/store-data-models/ISite';

interface IProps {
  onClose: (action: 'close') => void;
  onMerchantDetail: (merchant: IMerchant) => void;
  merchants: IMerchant[],
  store: string,
  subCategory?: string
  site: ISite
}

interface IState {
  mode: 'INITIAL_STATE' | 'CATEGORIES' | 'SUBCATEGORIES',
  categories: Record<string, string[]>,
  subCategories: ISubCategories,
  searchToShow: boolean,
  searchQuery: string,
  merchant?: IMerchant,
}

interface ISubCategories {
  parent: string,
  child: string[]
}

export default class CategoryList extends React.Component<IProps, IState> {
  _isMounted = false;

  state: IState = {
    mode: 'INITIAL_STATE',
    categories: {},
    subCategories: { parent: '', child: [] },
    searchToShow: false,
    searchQuery: ''
  }

  componentDidMount = async () => {
    this._isMounted = true;
    if (this._isMounted) {
      const { subCategory } = this.props;

      setTimeout(async () => {
        const categories = await this.getAllCategories();

        this.setState({ categories: categories });

        // display target subcategory if pre-selected
        if (subCategory) {
          const selected = { parent: subCategory, child: categories[subCategory] };
          this.setState({ mode: 'SUBCATEGORIES', subCategories: selected });
        } else {
          // display all subcategories
          this.setState({ mode: 'CATEGORIES' });
        }

      }, 170);
    }
  }

  componentWillUnmount = () => {
    this._isMounted = false;
  }

  async getAllCategories(): Promise<any> {
    try {
      const categories = await UserClient.getAllCategories();
      categories["Patio de comidas"] = ["Patio de comidas"];
      categories["Farmacias"] = ["Farmacias"];
      return categories;
    } catch (error) {
      console.log(error);
    }
  }

  onCloseModalHandler = async () => {
    this.props.onClose('close');
  }

  onMerchantDetailClickHandler = async (merchant: IMerchant) => {
    this.props.onMerchantDetail(merchant);
  };

  render() {
    const { mode, searchToShow, searchQuery, merchant } = this.state;
    return <Fragment>
      <IonModal enterAnimation={ComponentAnimations.enterAnimation} leaveAnimation={ComponentAnimations.leaveAnimation} swipeToClose={false} showBackdrop={false} backdropDismiss={false} cssClass={`category-list ${mode.replaceAll("_", "-").toLocaleLowerCase()}`} isOpen={true}>
        {(() => {
          const customRender: Function = (this as any)[`render${mode}`];
          if (!customRender) {
            return <div>{mode}</div>;
          }
          return customRender();
        })()}
      </IonModal>
      { searchToShow ? <SearchModal site={this.props.site}  searchText={ searchQuery } merchants={ this.props.merchants } onClose={ () => this.setState({ searchToShow: false }) } onMerchantDetail={ (e) => { this.onMerchantDetailClickHandler(e) } }></SearchModal> : null}
    </Fragment>
  }

  renderINITIAL_STATE = () => {
    return (
      <Fragment>
        <IonHeader>
          <IonIcon icon={ arrowBack } onClick={ this.onCloseModalHandler }></IonIcon>
          <IonListHeader>
            <IonLabel style={{marginBottom: "30px"}}>Categorías</IonLabel>
          </IonListHeader>
        </IonHeader>
        <IonContent>
          <div style={{ padding: '0px 24px' }}>
            <IonSkeletonText style={{ height: "60px", width: "100%", borderRadius: "24px" }} animated={true}></IonSkeletonText>
            <IonSkeletonText style={{ height: "60px", width: "100%", borderRadius: "24px", marginTop: '24px' }} animated={true}></IonSkeletonText>
          </div>
        </IonContent>
      </Fragment>
    )
  }

  renderCATEGORIES = () => {
    const categoryList = Object.entries(this.state.categories);

    return <Fragment>
      <IonHeader>
        <IonIcon icon={ arrowBack } onClick={ this.onCloseModalHandler }></IonIcon>
        <IonListHeader>
          <IonLabel style={{marginBottom: "30px"}}>Categorías</IonLabel>
        </IonListHeader>
      </IonHeader>
      <IonContent>
      <IonList> { categoryList && categoryList.map((category, i) => {
        const catName = category[0].toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        const dynamicImgUrl = `${process.env.PUBLIC_URL}/assets/icon/${catName}.svg`
        return (
          <IonItem key={ i } onClick={ () => { this.setState({ mode: 'SUBCATEGORIES', subCategories: { parent: category[0], child: category[1] } }) }}>
            <IonIcon icon={ dynamicImgUrl } className='category-icon'></IonIcon>
            <IonLabel>{ category[0] }</IonLabel>
            <IonIcon className='chevron-icon' icon={ chevronForward }></IonIcon>
          </IonItem>
        )})
        }</IonList>
      </IonContent>
    </Fragment>
  }

  renderSUBCATEGORIES = () => {
    const { subCategories } = this.state;

    return <Fragment>
      <IonHeader>
       <IonIcon icon={ arrowBack } onClick={ () => this.setState({ mode: 'CATEGORIES' }) }></IonIcon>
      <IonListHeader>
        <IonLabel style={{marginBottom: "30px"}}>
          { subCategories.parent }
        </IonLabel>
      </IonListHeader>
      </IonHeader>
      <IonContent>
      <IonList> { subCategories.child && subCategories?.child.map((category: string, i: number) => {
        return (
          <IonItem key={ i } onClick={ () => { this.setState({ searchQuery: category, searchToShow: true }) }}>
            <IonLabel>{ category }</IonLabel>
            <IonIcon className='chevron-icon' icon={ chevronForward }></IonIcon>
          </IonItem>
        )})
        }</IonList>
      </IonContent>
    </Fragment>
  }
}
