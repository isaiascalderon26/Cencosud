import React, { Fragment } from 'react';
import './index.less';
import {
  withIonLifeCycle,
  IonPage,
  IonButton,
  IonIcon,
  IonFooter,
} from '@ionic/react';
import { RouteComponentProps } from 'react-router';
import i18n from '../../lib/i18n';
import locales from './locales';
import Expr from '../../lib/Expr';
import { IonSlides, IonSlide, IonContent } from '@ionic/react';
import SettingsClient from '../../clients/SettingsClient';
import { PushNotifications, Token } from '@capacitor/push-notifications';
import { OpenNativeSettings } from '@ionic-native/open-native-settings';
import OnboardingZero from './../../assets/media/onboarding/on-0.webp';
import OnboardingOne from './../../assets/media/onboarding/on-1.webp';
import OnboardingTwo from './../../assets/media/onboarding/on-2.webp';
import OnboardingThree from './../../assets/media/onboarding/on-3.webp';
import OnboardingFive from './../../assets/media/onboarding/on-5.webp';
//import { AppTrackingTransparency } from "ios-tracking-transparency";

import EurekaConsole from '../../lib/EurekaConsole';
import { arrowForward } from 'ionicons/icons';
import { FCM } from '@capacitor-community/fcm';

const localize = i18n(locales);
const eureka = EurekaConsole({ label: 'onboarding-page' });

interface IProps extends RouteComponentProps {
  onBoardingCompleted: () => void;
}

interface IState {
  mode: 'INITIAL_STATE';
  gps_was_denied: boolean;
  push_was_denied: boolean;
  slideIndex: number;
}

export default withIonLifeCycle(
  class OnBoardingPage extends React.Component<IProps, IState> {
    private swiper: any;
    state: IState = {
      mode: 'INITIAL_STATE',
      gps_was_denied: false,
      push_was_denied: false,
      slideIndex: 0,
    };

    onGetSwiperHandler = async (e: any) => {
      this.swiper = e.target.swiper;
    };

    onContinueHandler = async () => {
      const { slideIndex } = this.state;
      switch (slideIndex) {
        case 0:
        case 1:
        case 2:
          this.swiper.slideNext();
          break;
        case 3:
          this.setState({ slideIndex: 5 });
          this.swiper.slideNext();
          break;
        case 4:
          Expr.whenIos(async () => {
            this.onEndOndboarding();

            // try {
            //   let status = await AppTrackingTransparency.trackingAuthorizationStatus();
            //   if (status.status === 'authorized') {
            //     this.onEndOndboarding();
            //     return;
            //   }
            //
            //   status = await AppTrackingTransparency.requestTrackingAuthorization();
            //   // const status = await AppTrackingTransparency.requestPermission();
            //   SettingsClient.set("ALLOWED_TO_TRACK_IDFA", status.status === "authorized");
            //   this.onEndOndboarding();
            //
            // } catch (ex) {
            //   console.error(ex);
            //   if (ex && (ex as any).status == "UNIMPLEMENTED" ) {
            //     this.onEndOndboarding();
            //   }
            //   if (ex && (ex as any).code == "UNIMPLEMENTED" ) {
            //     this.onEndOndboarding();
            //   }
            // }
          }, this.onEndOndboarding);
          break;
      }
    };

    onEndOndboarding = async () => {
      // uncomment to request push permission
      this.onEnablePushHandler();

      SettingsClient.set('FIRST_TIME', false);
      this.props.onBoardingCompleted();
    };

    onEnablePushHandler = async () => {
      Expr.whenInNativePhone(async () => {
        const permissionState = await PushNotifications.checkPermissions();
        switch (permissionState.receive) {
          case 'granted':
            break;
          case 'denied':
            return;
          case 'prompt':
            const result = await PushNotifications.requestPermissions();
            if (result.receive === 'granted') {
              // Register with Apple / Google to receive push via APNS/FCM
              PushNotifications.addListener(
                'registration',
                async (token: Token) => {
                  console.log(
                    'Push registration success, token: ',
                    JSON.stringify(token)
                  );

                  try {
                    // Get FCM token instead the APN one returned by Capacitor
                    let deviceID = '';
                    try {
                      const FCMResponse = await FCM.getToken();
                      deviceID = FCMResponse.token;
                    } catch (ex) {}
                    const verbose = [
                      'FCM Token: ' + deviceID,
                      'APNS Token: ' + token.value,
                    ].join(' , ');
                    eureka.log(verbose);
                  } catch (ex) {
                    eureka.error(ex as string);
                  }
                }
              );

              PushNotifications.addListener(
                'registrationError',
                (error: any) => {
                  console.log('Error on registration: ', JSON.stringify(error));
                }
              );

              try {
                await PushNotifications.register();
              } catch (ex) {
                console.log('error on register push');
                console.log(ex);
              }
            }

            // Call again to check the authorization
            setTimeout(this.onEnablePushHandler, 500);
            break;
        }
      });
    };

    render() {
      const { mode, slideIndex } = this.state;
      return (
        <IonPage
          className={`onboarding-page ${mode
            .replace(/_/gi, '-')
            .toLowerCase()} slide-${slideIndex}`}
        >
          {(() => {
            const customRender: Function = (this as any)[`render${mode}`];
            if (!customRender) {
              return <div>{mode}</div>;
            }
            return customRender();
          })()}
          <IonFooter class="onboarding">
            <div className="dots">
              <div className={slideIndex === 0 ? 'selected' : ''}></div>
              <div className={slideIndex === 1 ? 'selected' : ''}></div>
              <div className={slideIndex === 2 ? 'selected' : ''}></div>
              <div className={slideIndex === 3 ? 'selected' : ''}></div>
              <div className={slideIndex === 4 ? 'selected' : ''}></div>
            </div>
            <IonButton
              className="bold tag"
              onClick={() => {
                this.onContinueHandler();
              }}
            >
              <IonIcon icon={arrowForward} />
            </IonButton>
          </IonFooter>
        </IonPage>
      );
    }

    renderINITIAL_STATE = () => {
      return (
        <Fragment>
          <IonContent>
            <IonSlides
              onIonSlidesDidLoad={this.onGetSwiperHandler}
              onIonSlideWillChange={() =>
                this.setState({ slideIndex: this.swiper.activeIndex })
              }
              pager={false}
              options={{ initialSlide: 0, speed: 400, spaceBetween: '-22%' }}
            >
              <IonSlide className="application-welcome">
                <div className="content">
                  <img
                    src={OnboardingZero}
                    onClick={() => this.swiper.slideTo(0)}
                  />
                  <h2
                    dangerouslySetInnerHTML={{
                      __html: localize('PARKING_TITLE'),
                    }}
                  />
                  <h3
                    dangerouslySetInnerHTML={{
                      __html: localize('PARKING_MESSAGE'),
                    }}
                  />
                </div>
              </IonSlide>
              <IonSlide className="application-welcome">
                <div className="content">
                  <img
                    src={OnboardingOne}
                    onClick={() => this.swiper.slideTo(1)}
                  />
                  <h2
                    dangerouslySetInnerHTML={{
                      __html: localize('DISCOVERY_TITLE'),
                    }}
                  />
                  <h3
                    dangerouslySetInnerHTML={{
                      __html: localize('DISCOVERY_MESSAGE'),
                    }}
                  />
                </div>
              </IonSlide>
              <IonSlide className="application-welcome">
                <div className="content">
                  <img
                    src={OnboardingTwo}
                    onClick={() => this.swiper.slideTo(2)}
                  />
                  <h2
                    dangerouslySetInnerHTML={{
                      __html: localize('PROMOTIONS_TITLE'),
                    }}
                  />
                  <h3
                    dangerouslySetInnerHTML={{
                      __html: localize('PROMOTIONS_MESSAGE'),
                    }}
                  />
                </div>
              </IonSlide>
              <IonSlide className="application-welcome">
                <div className="content">
                  <img
                    src={OnboardingThree}
                    onClick={() => this.swiper.slideTo(3)}
                  />
                  <h2
                    dangerouslySetInnerHTML={{
                      __html: localize('WELCOME_TITLE'),
                    }}
                  />
                  <h3
                    dangerouslySetInnerHTML={{
                      __html: localize('WELCOME_MESSAGE'),
                    }}
                  />
                </div>
              </IonSlide>
              <IonSlide className="application-welcome">
                <div className="content">
                  <img
                    src={OnboardingFive}
                    onClick={() => this.swiper.slideTo(4)}
                  />
                  <h2
                    dangerouslySetInnerHTML={{ __html: localize('IDFA_TITLE') }}
                  />
                  <h3
                    dangerouslySetInnerHTML={{
                      __html: localize('IDFA_MESSAGE'),
                    }}
                  />
                </div>
              </IonSlide>
            </IonSlides>
          </IonContent>
        </Fragment>
      );
    };
  }
);
