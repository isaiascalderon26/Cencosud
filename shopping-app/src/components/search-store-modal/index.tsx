import React, { Fragment } from 'react';
import './index.less';
import {
  IonModal,
  IonContent,
  IonIcon,
  IonHeader,
  IonSearchbar,
  createAnimation,
} from '@ionic/react';
import Expr from '../../lib/Expr';
import { IMerchant } from '../../models/merchants/IMerchant';
import { arrowBack } from 'ionicons/icons';
import SearchBackground from './../../assets/media/backgrounds/search-background.png';
import { ISite } from '../../models/store-data-models/ISite';
import MerchantList from '../merchant-list';
import { debounce } from '../../utils';
import IEvent from '../../models/events/IEvent';
import EventClient from '../../clients/EventClient';
import UserClient from '../../clients/UserClient';
import { IUser } from '../../models/users/IUser';
import { Keyboard } from '@capacitor/keyboard';

interface IProps {
  onClose: (action: 'close') => void;
  onMerchantDetail: (merchant: IMerchant) => void;
  merchants: Array<IMerchant>;
  searchText?: string;
  autofocus?: boolean;
  site: ISite;
  className?: string;
  title?: string;
  paragraph?: string;
}

interface IState {
  mode: 'INITIAL_STATE' | 'PAGE_LOADED';
  searchText?: string;
  filtered_search?: Array<IMerchant>;
  list_open: boolean;
  user?: IUser
}

export default class SearchModal extends React.Component<IProps, IState> {
  _isMounted = false;
  state: IState = {
    mode: 'INITIAL_STATE',
    list_open: false
  };

  componentDidMount = () => {
    this.loadUserData();
    this._isMounted = true;
    const { autofocus } = this.props;
    if (this._isMounted) {
      autofocus &&
        setTimeout(() => {
          const searchbar = document.getElementById('stores-searchbar');
          if (searchbar) {
            const input = searchbar.getElementsByTagName('input')[0];
            input?.focus();
          }
        }, 600);
    }
    if (this.props.searchText) {
      this.onSearchFilterHandler(this.props.searchText);
    }
  };
  componentWillUnmount = () => {
    this._isMounted = false;
  };

  loadUserData = async () => {
    try {
      const user = await UserClient.me();
      this.setState({ ...this.state, user });
    } catch (e) {
        // todo!
    }
  }

  onCloseModalHandler = async () => {
    this.props.onClose('close');
  };

  onMerchantDetailClickHandler = async (merchant: IMerchant) => {
    await Keyboard.hide();
    this.props.onMerchantDetail(merchant);
  };

  handleSearchChange = debounce((search: string) => this.onSearchFilterHandler(search), 1)


  onSearchFilterHandler = (search: string) => {
    const { merchants } = this.props;

    let input_search = search
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z ]/g, '')
      .replace(/\s/g, '')
      .trim()
      .toLowerCase();

    let filterSearch = merchants?.filter((fil) => {
      // category = "stores,shop" ["store", "shop"]
      //let category = fil.category.normalize("NFD").replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z ]/g, '').replace(/\s/g, '').toLowerCase();
      const categories = fil.category.map((cat) => {
        return cat
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^a-zA-Z ]/g, '')
          .replace(/\s/g, '')
          .toLowerCase();
      });

      let name = fil.name
        .replaceAll('&amp;', '&')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-zA-Z ]/g, '')
        .replace(/\s/g, '')
        .toLowerCase();

      return name.includes(input_search) || categories.filter((cat) => cat.includes(input_search)).length > 0;
    });

    // save only if have text
    if (search.length) {
      EventClient.create({
        type: "store.search",
        details: {
          search,
          user_id: this.state.user?.primarysid,
          mall: this.state.user?.mall_selected,
          created_at: new Date()
        }
      } as IEvent);
    }

    filterSearch = filterSearch.sort((a, b) => (a.name > b.name ? 1 : -1));

    this.setState({
      searchText: search,
      filtered_search: filterSearch!,
      list_open: search.length > 1,
    });
  };

  enterAnimation = (baseEl: any) => {
    const backdropAnimation = createAnimation()
      .addElement(baseEl.querySelector('ion-backdrop')!)
      .fromTo('opacity', '0.01', 'var(--backdrop-opacity)');

    const wrapperAnimation = createAnimation()
      .addElement(baseEl.querySelector('.modal-wrapper')!)
      .keyframes([
        { offset: 0, opacity: 0, transform: 'scale(1)' },
        { offset: 1, opacity: 1, transform: 'scale(1)' },
      ]);

    return createAnimation()
      .addElement(baseEl)
      .easing('ease-in')
      .duration(200)
      .addAnimation([backdropAnimation, wrapperAnimation]);
  };

  leaveAnimation = (baseEl: any) => {
    const wrapperAnimation = createAnimation()
      .addElement(baseEl.querySelector('.modal-wrapper')!)
      .keyframes([
        { offset: 0, opacity: 1, transform: 'scale(1)' },
        { offset: 1, opacity: 0, transform: 'scale(1)' },
      ]);

    return createAnimation()
      .addElement(baseEl)
      .easing('ease-out')
      .duration(200)
      .addAnimation(wrapperAnimation);
  };

  render() {
    const { mode } = this.state;
    return (
      <IonModal
        enterAnimation={this.enterAnimation}
        leaveAnimation={this.leaveAnimation}
        swipeToClose={false}
        showBackdrop={false}
        backdropDismiss={false}
        cssClass={`search-modal ${mode
          .replaceAll('_', '-')
          .toLocaleLowerCase()} ${this.props.className}`}
        isOpen={true}
      >
        {(() => {
          const customRender: Function = (this as any)[`render${mode}`];
          if (!customRender) {
            return <div>{mode}</div>;
          }
          return customRender();
        })()}
      </IonModal>
    );
  }

  renderINITIAL_STATE = () => {
    const { searchText, list_open, filtered_search } = this.state;
    const { site } = this.props;
    return (
      <Fragment>
        <div className="search_body">
          <IonHeader>
            <div onClick={() => this.onCloseModalHandler()}>
              <IonIcon icon={arrowBack}></IonIcon>
            </div>
          </IonHeader>
          <IonContent>
            {
              this.props.title &&
              <h2 style={{margin: "15px 15px", fontSize: "24px", fontWeight: "700", color:"#000000", textAlign: "left"}}>{this.props.title}</h2>
            }
            {
              this.props.paragraph &&
              <p style={{margin: "5px 15px", fontSize: "14px", fontWeight: "400", color:"#808080", textAlign: "left"}}>{this.props.paragraph}</p>
            }
            <div id={"searchbar-container"}>
              <IonSearchbar
                id="stores-searchbar"
                placeholder="Buscar tienda"
                value={searchText}
                onIonChange={(e) => {
                  this.handleSearchChange(e.detail.value!);
                }}
              ></IonSearchbar>
            </div>

            {!list_open ? (
              <div className="search-modal-background">
                <img
                  alt={""}
                  src={SearchBackground}
                />
              </div>
            ) : null}

            {/*{filtered_search && filtered_search.length === 0 ? (*/}
            {/*  <div className="no-stores-large">*/}
            {/*    <IonIcon src={NoNotificationsSvg}></IonIcon>*/}
            {/*    <h2>Nada que mostrarte</h2>*/}
            {/*    <p>No hay comercios bajo esta categoría</p>*/}
            {/*  </div>*/}
            {/*) : null}*/}
            {Expr.whenConditionRender(list_open, () => {
              return filtered_search ? (
                <MerchantList
                  site={site}
                  merchants={filtered_search}
                  onMerchantClick={(m) => {
                    this.onMerchantDetailClickHandler(m as IMerchant);
                  }}
                />
              ) : (
                ''
              );
              // <IonList className="search-list">
              //   {filtered_search?.map((search: IMerchant) => {
              //     return (
              //       <IonItem
              //         key={search.objectID}
              //         onClick={() => this.onMerchantDetailClickHandler(search!)}
              //       >
              //         <div>
              //           <div>
              //             <div>
              //               <div className="search-logo">
              //                 <img src={site.web + search.logo} />
              //               </div>
              //             </div>
              //             <div>
              //               <h1
              //                 dangerouslySetInnerHTML={{ __html: search.name }}
              //               />
              //               <p>
              //                 {search.category.join(", ") /*search.category*/}
              //               </p>
              //             </div>
              //             <div>
              //               <p>Nivel {search.level}</p>
              //             </div>
              //           </div>
              //           <div>
              //             <IonIcon icon={chevronForward}></IonIcon>
              //           </div>
              //         </div>
              //       </IonItem>
              //     );
              //   })}
              // </IonList>
            })}
          </IonContent>
        </div>
      </Fragment>
    );
  };

  renderPAGE_LOADED = () => {
    return <Fragment></Fragment>;
  };
}
