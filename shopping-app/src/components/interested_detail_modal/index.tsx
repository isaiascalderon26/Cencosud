import React, { Fragment } from 'react';
import './index.less';
import { IonButton, IonContent, IonFooter, IonHeader, IonIcon, IonPage,IonSearchbar } from '@ionic/react';
import i18n from '../../lib/i18n';
import locales from './locales';
import { arrowBack, checkmarkCircle, addCircleOutline } from 'ionicons/icons';
import { IUser } from '../../models/users/IUser';
import UserClient from '../../clients/UserClient';
import BackdropLoading from '../backdrop-loading';

const localize = i18n(locales);

interface ICategory {
  [key: string]: string[] 
}

interface IProps {
  onClose: (action: "close") => void;
}

interface IState {
  loading: boolean,
  interests?: any,
  interestsFilter: Array<string>,
  categories?: any,
  searchText?: string,
  full_name?: string,
  user?: IUser
}

function _getListOfInterests (categories: ICategory, search: string = ''): Array<string> {
  let interests: Array<string> = [];

  try {
    for(let categoryItem in categories) {
      let subCategories = categories[categoryItem].filter((subCategoryItem: string) => {
        return subCategoryItem.toLowerCase().includes(search.toLowerCase());
      })

      subCategories.filter((subCategoryItem: string) => {
        interests.push(subCategoryItem);
        return null;
      })
    }
  } catch (error) {
    console.log(error);
  }

  return interests
}

export default class InterestedDetail extends React.Component<IProps, IState> {
  state: IState = {
    loading: false,
    interestsFilter: [],
    searchText: '',
  }

  async componentDidMount() {
    this.setState({
      loading: true
    })
    await this.getDataToMatch();
  }
  
  getDataToMatch = async () => {
    const categories = await UserClient.getAllCategories();
    const user = await UserClient.me();

    const filteredInterests = _getListOfInterests(categories);

    this.setState({
      categories: categories,
      user,
      interests: user.interests,
      interestsFilter: filteredInterests,
      loading: false
    })
  }

  onCloseModalHandler = async () => {
    this.props.onClose("close");
  }

  onInputChangeHandler = (key: string, value: string) => {
    const newState: any = {};
    newState[key] = value;
    this.setState(newState)
  }

  onSelectHandler = async (category: string) => {
    if(!this.state.interests.includes(category)){
        this.setState({
            interests: [...this.state.interests, category]
        })
    }else{
        //remove element array 
        let arrayinterests = this.state.interests;
        let arrayindex = arrayinterests.indexOf(category);
        if (arrayindex !== -1) {
            arrayinterests.splice(arrayindex, 1);
            
        }
        this.setState({
            interests : arrayinterests
        })
    }
  }

  onSearchFilterHandler = async (search: string) => {
    const { categories } = this.state

    const filteredInterests = _getListOfInterests(categories, search);

    this.setState({
      searchText: search, 
      interestsFilter: filteredInterests,
    });
  }

  onUpdateClickHandler = async (key:string) => {
    try {
      await UserClient.update(key, this.state.interests)
      setTimeout(() => {
        this.props.onClose("close");
      }, 400);

    } catch (error) {
      console.log(error);
    }
  }
  
  render() {
    const { searchText, interestsFilter, interests, loading } = this.state
    return (
      <Fragment>
        <IonPage className="interests-selection-page">
          <IonHeader>
            <div onClick={() => this.onCloseModalHandler()}>
            <IonIcon icon={arrowBack}></IonIcon>
            </div>
          </IonHeader>
          <IonContent>
            {loading ? <BackdropLoading message="Cargando..."></BackdropLoading> : null}
              <div>
                <h2 className="font-bold" dangerouslySetInnerHTML={{ __html: localize('SELECT_INTERESTS') }}/>
                <div>
                  <IonSearchbar
                    value={searchText}
                    onIonChange={(e: any) => {
                      this.onSearchFilterHandler(e.detail.value!)}
                    }
                    placeholder='Filtra los intereses aquí'
                  ></IonSearchbar>        
                </div>
              </div>
              <div>
                <h2 className="font-bold" dangerouslySetInnerHTML={{ __html: localize('INTERESTS_TITLE') }} />
                <span>Elegiste {!interests?.length ? '0' : interests?.length } intereses</span>
              </div>
              <div>
                <div>
                  {interestsFilter.map((category) => {
                  return (
                    <div className={interests.includes(category) ? 'selected_interest' : ''} onClick={() => {this.onSelectHandler(category)}} key={category}>
                      <p>{category}</p>
                      <IonIcon icon={interests.includes(category) ? checkmarkCircle : addCircleOutline}></IonIcon>
                    </div>
                  )
                  })}
                </div>
              </div>
              <IonFooter>
                <div className='pad-buttons'>
                  <IonButton className='white-centered' onClick={() => {this.onUpdateClickHandler('interests')}}>
                    Seleccionar
                  </IonButton>
                </div>
              </IonFooter>
          </IonContent>
        </IonPage>
    </Fragment>
    )
  }
};