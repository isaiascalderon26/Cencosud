import React, { Fragment } from 'react';
import './index.less';
import jwt from 'jsonwebtoken';
import { debounce } from 'lodash';
import {
  IonApp,
  IonButton,
  IonContent,
  IonFooter,
  IonHeader,
  IonIcon,
  IonPage,
  IonSearchbar,
  IonSlide,
  IonSlides,
  IonToolbar,
} from '@ionic/react';
import IJwt from '../../models/IJwt';
import i18n from '../../lib/i18n';
import locales from './locales';
import IJwtEntity from '../../models/IJwtEntity';
import UserClient from '../../clients/UserClient';
import { Device } from '@capacitor/device';
import Expr from '../../lib/Expr';
import { FCM } from '@capacitor-community/fcm';
import { onSignInCallbackHandler } from '../sign-in';
import EurekaConsole from '../../lib/EurekaConsole';
import {
  addCircleOutline,
  arrowForward,
  checkmarkCircle,
} from 'ionicons/icons';
import ShapeUser from './../../assets/media/shape.png';
import ShapeEmail from './../../assets/media/email-icon.png';
import axios from 'axios';
import BackdropLoading from '../../components/backdrop-loading';

const eureka = EurekaConsole({ label: 'apply-flow' });

const localize = i18n(locales);

interface IProps {
  data: {
    jwt: IJwt;
  };
  onRegistrationCompleted: onSignInCallbackHandler;
}

interface IPrefilledState {
  full_name?: string;
  email?: string;
}

interface IState {
  full_name?: string;
  email?: string;
  interests: Array<string>;
  isValidStatesInputs: {
    full_name: boolean;
    email: boolean;
    interests: boolean;
  };
  interestsFilter: Array<string>;
  categories?: any;
  searchText?: string;
}

export default class ApplyFlowApp extends React.Component<IProps, IState> {
  private swiper: any;
  private screenView = false;
  state: IState = {
    interests: [],
    isValidStatesInputs: {
      full_name: true,
      email: true,
      interests: false,
    },
    interestsFilter: [],
  };

  static getDerivedStateFromProps(props: IProps, state: IState) {
    if (!(state.full_name === undefined)) {
      return null;
    }

    const basicInfo = jwt.decode(props.data.jwt.access_token) as IJwtEntity;

    let result: IPrefilledState = {
      full_name: basicInfo.unique_name,
      email: basicInfo.email,
    };

    return result;
  }

  onGetSwiperHandler = async (e: any) => {
    this.swiper = e.target.swiper;
    setTimeout(() => {
      this.swiper.update();
    }, 250);
  };

  componentDidMount() {
    if (!this.screenView) {
      this.screenView = true;
    }
    setTimeout(async () => {
      await this.onCategoryDataMap();
      Object.keys(this.state).forEach((key, value) => {
        this.onInputChangeHandler(
          key as keyof IState,
          this.state[key as keyof IState] as any
        );
      });
    }, 300);
  }

  onCategoryDataMap = async () => {
    // Mapping the category list
    let categories;
    try {
      categories = await axios.get(
        `${process.env.REACT_APP_API_ENDPOINT}/categories`,
        {
          headers: {
            Authorization: `Bearer ${this.props.data.jwt.access_token}`,
          },
        }
      );
      this.setState({
        categories: categories.data,
      });
    } catch (error: any) {
      eureka.debug(error);
    }
  };

  onRegisterClickHandler = async () => {
    // Back to defaults
    const deviceId = await Device.getId();
    let deviceToken = '';
    const register = async () => {
      const jwtInfo = jwt.decode(
        this.props.data.jwt.access_token
      ) as IJwtEntity;

      this.swiper.slideTo(3);
      const debounced = debounce((r) => {
        this.props.onRegistrationCompleted(r);
      }, 700);

      try {
        const response = await UserClient.register(
          {
            full_name: this.state.full_name!,
            IMEI: deviceId.identifier,
            device_token: deviceToken,
            primarysid: jwtInfo.primarysid,
            email: jwtInfo.email,
            interests: this.state.interests,
            avatar: jwtInfo.avatar,
          },
          this.props.data.jwt
        );

        debounced(response);
      } catch (error) {
        eureka.debug(error as string);
      }
    };

    Expr.whenInNativePhone(async () => {
      const FCMResponse = await FCM.getToken();
      deviceToken = FCMResponse.token;
      register();
    });
    Expr.whenNotInNativePhone(() => {
      deviceToken = 'fake_token_when_browser';
      register();
    });
  };
  onContinueToEmailInfoHandler = async () => {
    this.swiper.slideTo(1);
  };

  onContinueToInterestsInfoHandler = async () => {
    try {
      await this.onCategoryDataMap();
      this.swiper.slideTo(2);
    } catch (error: any) {
      eureka.debug(error);
    }
  };

  onSearchFilterHandler = async (search: string) => {
    const { categories } = this.state;
    let subCategories: Array<string> = [];
    try {
      for (let category in categories) {
        let cat = categories[category].filter((fil: any) => {
          return fil.toLowerCase().includes(search.toLowerCase());
        });
        let setSubCategories = cat.filter((fil: string) => {
          subCategories.push(fil);
        });
      }
      this.setState({
        searchText: search,
        interestsFilter: subCategories!,
      });
    } catch (error) {
      console.log(error);
    }
  };

  onInputChangeHandler = async (name: keyof IState, value: any) => {
    // Validate according to the field
    const isValids = Object.assign(this.state.isValidStatesInputs, {});
    const newState: any = {
      isValidStatesInputs: isValids,
    };
    newState[name] = value;

    this.setState(newState);
  };
  onSelectHandler = async (category: string) => {
    const intereses = this.state.interests;
    let interes = intereses.indexOf(category);
    intereses.push(category);
    if (interes !== -1) {
      intereses.splice(interes, 1);
    }
    this.setState({
      interests: intereses,
    });
  };

  render() {
    return (
      <IonApp>
        <IonSlides
          onIonSlidesDidLoad={this.onGetSwiperHandler}
          className="root-apply-flow"
        >
          <IonSlide className="swiper-no-swiping">
            {this.renderFULLNAME_INFORMATION_FORM()}
          </IonSlide>
          <IonSlide className="swiper-no-swiping">
            {this.renderINTERESTS_INFORMATION_FORM()}
          </IonSlide>
          <IonSlide className="swiper-no-swiping">
            {this.renderCREATION_PROCESS()}
          </IonSlide>
        </IonSlides>
      </IonApp>
    );
  }

  renderFULLNAME_INFORMATION_FORM() {
    const { isValidStatesInputs } = this.state;
    return (
      <Fragment>
        <IonPage className="basic-information-page">
          <IonHeader className="ion-no-border">
            <IonToolbar></IonToolbar>
          </IonHeader>
          <IonContent>
            <div className="welcome">
              <h2
                className="font-bold"
                dangerouslySetInnerHTML={{ __html: localize('NAME_TITLE') }}
              />
              <span
                dangerouslySetInnerHTML={{
                  __html: localize('NAME_DESCRIPTION'),
                }}
              />
              <div className="input-container">
                <img src={ShapeUser} />
                <input
                  placeholder="Nombre"
                  value={this.state.full_name}
                  onChange={(e) =>
                    this.onInputChangeHandler(
                      'full_name',
                      e.currentTarget.value
                    )
                  }
                ></input>
              </div>
            </div>
          </IonContent>
          <IonFooter>
            <div className="next-button">
              <IonButton
                className="tag"
                disabled={!isValidStatesInputs.full_name}
                onClick={this.onContinueToEmailInfoHandler}
              >
                <IonIcon icon={arrowForward}></IonIcon>
              </IonButton>
            </div>
          </IonFooter>
        </IonPage>
      </Fragment>
    );
  }

  renderEMAIL_INFORMATION_FORM() {
    const { isValidStatesInputs } = this.state;
    return (
      <Fragment>
        <IonPage className="basic-information-page">
          <IonHeader className="ion-no-border">
            <IonToolbar></IonToolbar>
          </IonHeader>
          <IonContent>
            <div className="welcome">
              <h2 className="font-bold">¿Cuál es tu e-mail?</h2>
              <span>
                Esta información nos permitirá identificar tus preferencias
              </span>
              <div className="input-container">
                <input
                  type="email"
                  placeholder="Correo electrónico"
                  value={this.state.email}
                  onChange={(e) =>
                    this.onInputChangeHandler('email', e.currentTarget.value)
                  }
                >
                  <img src={ShapeEmail} />
                </input>
              </div>
            </div>
          </IonContent>
          <IonFooter>
            <div className="next-button">
              <IonButton
                className="tag"
                disabled={!isValidStatesInputs.email}
                onClick={this.onContinueToInterestsInfoHandler}
              >
                <IonIcon icon={arrowForward}></IonIcon>
              </IonButton>
            </div>
          </IonFooter>
        </IonPage>
      </Fragment>
    );
  }

  renderINTERESTS_INFORMATION_FORM() {
    const { searchText, interestsFilter, interests } = this.state;
    return (
      <Fragment>
        <IonPage className="interests-selection-page">
          <IonHeader className="ion-no-border">
            <IonToolbar></IonToolbar>
          </IonHeader>
          <IonContent>
            <div>
              <h2
                className="font-bold"
                dangerouslySetInnerHTML={{
                  __html: localize('SELECT_INTERESTS'),
                }}
              />
              <div>
                <IonSearchbar
                  value={searchText}
                  onIonChange={(e) => {
                    this.onSearchFilterHandler(e.detail.value!);
                  }}
                  placeholder="Filtra los intereses aquí"
                ></IonSearchbar>
              </div>
            </div>
            <div>
              <h2
                className="font-bold"
                dangerouslySetInnerHTML={{
                  __html: localize('INTERESTS_TITLE'),
                }}
              />
              <span>
                Elegiste {!interests?.length ? '0' : interests?.length}{' '}
                intereses
              </span>
            </div>
            <div>
              <div>
                {interestsFilter.map((category) => {
                  return (
                    <div
                      className={
                        interests.includes(category) ? 'selected_interest' : ''
                      }
                      onClick={() => {
                        this.onSelectHandler(category);
                      }}
                      key={category}
                    >
                      <p>{category}</p>
                      <IonIcon
                        icon={
                          interests.includes(category)
                            ? checkmarkCircle
                            : addCircleOutline
                        }
                      ></IonIcon>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="next-button">
              <IonButton className="tag" onClick={this.onRegisterClickHandler}>
                <IonIcon icon={arrowForward}></IonIcon>
              </IonButton>
            </div>
          </IonContent>
        </IonPage>
      </Fragment>
    );
  }

  renderCREATION_PROCESS() {
    return (
      <Fragment>
        <BackdropLoading message="Cargando..."></BackdropLoading>
      </Fragment>
    );
  }
}
