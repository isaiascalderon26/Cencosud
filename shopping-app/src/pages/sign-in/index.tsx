import React, { Fragment, RefObject } from "react";
import './index.less';
import { IonPage, IonContent, IonSlide, IonSlides, IonButton, IonHeader, IonIcon, IonFooter, IonInput, IonItem } from '@ionic/react';
import { Clipboard } from '@capacitor/clipboard';
import { accessibility, arrowBack, browsers, mail } from 'ionicons/icons';
import GoogleLogo from './../../assets/media/google-icon-colored.png'
import AppleLogo from './../../assets/media/apple-icon.png'
import AppleDarkLogo from './../../assets/media/apple-icon-white.png'
import LoginHeader from './../../assets/media/onboarding/on-4.webp';
import LoginHeaderSmall from './../../assets/media/onboarding/on-4-small.webp';
import loadingSpin from './../../assets/media/icons/loading-spin.svg';
import Expr from "../../lib/Expr";
import IJwt from "../../models/IJwt";
import EventStreamer from "../../lib/EventStreamer";
import i18n from '../../lib/i18n';
import locales from './locales';
import { App } from '@capacitor/app';
import md5 from 'md5';
import { AppLauncher } from '@capacitor/app-launcher';
import { SplashScreen } from '@capacitor/splash-screen';
import EurekaConsole from "../../lib/EurekaConsole";
import UserClient from "../../clients/UserClient";
import { AxiosResponse } from "axios";
import AuthenticationClient from "../../clients/AuthenticationClient";
import { FCM } from '@capacitor-community/fcm';
import { IUser } from "../../models/users/IUser";
import { ICustomer } from "../../models/users/ICustomer";
//import TermsModal from "../../components/terms-condition-modal";
import TermsModal from "../../components/terms-condition";

import RegisterClient from "../../clients/RegisterClient";
import SettingsClient from "../../clients/SettingsClient";
import { SignInWithApple, SignInWithAppleResponse, SignInWithAppleOptions } from '@capacitor-community/apple-sign-in';
import { isPlatform } from "@ionic/core";
import AppleAuthenticationProviderClient from "../../clients/AppleAuthenticationProviderClient";
import { GoogleAuth } from "@codetrix-studio/capacitor-google-auth";
import IGoogleUser from "../../models/users/IGoogleUser";
import Page, { DefaultHeader } from "../../components/page";
import ParagraphPage from "../../components/paragraph-page";


const localize = i18n(locales);
const eureka = EurekaConsole({ label: "signin-page" });

export type onSignInCallbackHandler = (shoppingUser: IUser) => void;

interface IProps {
  onAuthenticated: (needRegistration: boolean, jwt?: IJwt, callback?: onSignInCallbackHandler, customer?: ICustomer) => void
}

interface IState {
  mode: "INITIAL_STATE" | "SIGIN_EMAIL" | "VERIFY_CODE" | "SAVE_DATA" | "ACCESSIBILITY_DESCRIPTION",
  login_mode?: 'EMAIL' | 'GOOGLE' | 'APPLE' | 'INVITE',
  version: string,
  slideIndex: number,
  message?: string,
  terms_modal_open: boolean,
  email: string,
  email_error: boolean,
  forwardButton: boolean,
  code: string,
  code_error: boolean,
  message_resent_code: boolean,
  name: string,
  name_error: boolean,
  telephone: string,
  telephone_error: boolean,
  button_disabled: boolean,
  displayGoogleSso: boolean,
  loading: boolean,
  handle_paste: boolean,
  term_conditions: string[],
  privacy_polices: string[],
  privacy_polices_doc_url?: string,
  term_conditions_doc_url?: string,
  style_mode_dark: boolean
}

export default class SignInPage extends React.Component<IProps, IState> {

  media = window.matchMedia('(prefers-color-scheme: dark)');

  private Input1?: RefObject<HTMLInputElement>;
  private Input2?: RefObject<HTMLInputElement>;
  private Input3?: RefObject<HTMLInputElement>;
  private Input4?: RefObject<HTMLInputElement>;
  private Input5?: RefObject<HTMLInputElement>;
  private Input6?: RefObject<HTMLInputElement>;

  constructor(props: any, state: any) {
    super(props, state);

    this.Input1 = React.createRef<HTMLInputElement>();
    this.Input2 = React.createRef<HTMLInputElement>();
    this.Input3 = React.createRef<HTMLInputElement>();
    this.Input4 = React.createRef<HTMLInputElement>();
    this.Input5 = React.createRef<HTMLInputElement>();
    this.Input6 = React.createRef<HTMLInputElement>();
  }

  private swiper: any;
  state: IState = {
    mode: "INITIAL_STATE",
    version: "x.x.x",
    slideIndex: 0,
    terms_modal_open: false,
    email: '',
    email_error: false,
    forwardButton: true,
    code: '',
    code_error: false,
    message_resent_code: false,
    name: '',
    name_error: false,
    telephone: '',
    telephone_error: false,
    button_disabled: false,
    displayGoogleSso: false,
    loading: false,
    handle_paste: false,
    term_conditions: [],
    privacy_polices: [],
    style_mode_dark: false
  }

  componentDidMount() {
    SettingsClient.getDisplayGoogleSso().then((displayGoogleSso: boolean) => {
      this.setState({ displayGoogleSso });
    });

    SettingsClient.getTermsAndConditionsTopic()
      .then((termsAndConditionsDescriptionTopic) => {
        this.setState({term_conditions: termsAndConditionsDescriptionTopic });
      });

    SettingsClient.getPrivacyPolicies()
      .then((privacyPolicies) => {
        this.setState({privacy_polices: privacyPolicies });
      });

    SettingsClient.getPrivacyPoliciesDocUrl()
      .then((privacyPoliciesDocUrl) => {
        this.setState({privacy_polices_doc_url: privacyPoliciesDocUrl });
      });

    SettingsClient.getTermsAndConditionsDocUrl()
      .then((termsAndConditionsDocUrl) => {
        this.setState({term_conditions_doc_url: termsAndConditionsDocUrl });
      });

    EventStreamer.on("DEEPLINK:SSO_CALLBACK", this.onDeepLinkSSOCallbackHandler)
    this.getAppVersion();
    SplashScreen.hide();
  }

  componentWillUnmount() {
    EventStreamer.off("DEEPLINK:SSO_CALLBACK", this.onDeepLinkSSOCallbackHandler)
  }

  onCloseModalHandler() {
    this.setState({
      terms_modal_open: false
    })
  }

  /* Create multiple actions for oauth flow */
  onActionHandler(mode: string) {
    switch (mode) {
      case "EMAIL": {
        this.setState({ mode: "SIGIN_EMAIL" })
        break;
      }
      case "GOOGLE": {
        Expr.whenInNativePhone(async () => {
          this.inAppoAuth();
        })
        Expr.whenNotInNativePhone(async () => {
          this.onAutenticateHandler();
        })
        break;
      }

      case "APPLE": {
        this.onAppleAutenticateHandler();
        break;
      }
      case "INVITE": {
        this.onNotAutenticateUserHandler();
      }
    }
  }

  async getAccessibilityText(): Promise<any> {
    try {
      return await SettingsClient.getAccessibilityText();
    } catch (error) {
      console.log(error);
    }
  }

  onDeepLinkSSOCallbackHandler = async (jwt: IJwt) => {
    const authenticateUser = async (provider: string, jwt: IJwt) => {
      await AuthenticationClient.authenticate(provider, {
        "access_token": jwt.access_token,
        "expires_in": jwt.expires_in,
        "token_type": jwt.token_type
      });
      this.props.onAuthenticated(false)
    }
    try {
      const myInfo = await UserClient.meWithJwt(jwt);
      const link = myInfo.links?.find((item, key) => item.rel === 'update_device_token');
      if (link) {
        let deviceToken: string = '';

        const updateToken = async (deviceToken: string) => {
          try {
            await UserClient.updateNotificationTokenWithJwt(deviceToken, jwt)
          } catch (error) {
            eureka.error('An error has ocurred trying to update the device token');
            eureka.debug('xhr error', error)
          }
        }
        Expr.whenInNativePhone(async () => {
          const FCMResponse = await FCM.getToken();
          deviceToken = FCMResponse.token;
          await updateToken(deviceToken);
        })
        Expr.whenNotInNativePhone(async () => {
          deviceToken = 'fake_token_when_browser'
          await updateToken(deviceToken);
        })
      }

      authenticateUser('google', jwt);
    } catch (ex: any) {

      if (!ex.response) {
        return;
      }

      switch ((ex.response as AxiosResponse).status) {
        case 404:
          this.props.onAuthenticated(true, jwt, () => {
            authenticateUser('google', jwt);
          });
          break;
        case 206:
          const customer = ex.data as ICustomer;
          this.props.onAuthenticated(true, jwt, () => {
            authenticateUser('google', jwt);
          }, customer);
          break;
        default:
          eureka.error("unhandled response meWithJwt")

      }
      eureka.debug(ex);
    }
  }

  onGetSwiperHandler = async (e: any) => {
    this.swiper = e.target.swiper;
    this.swiper.on('slideChangeTransitionEnd', () => {
      this.setState({
        slideIndex: this.swiper.activeIndex + 1
      });
    });
  }

  onContinueHandler = async (screenName: String) => {
    this.swiper.slideNext();
  }

  getAppVersion = async () => {
    Expr.whenInNativePhone(async () => {
      const info = await App.getInfo()

      this.setState({
        version: `${info.version}.${info.build}`
      });
    })

  }

  onNotAutenticateUserHandler = async () => {
    const jwt = await RegisterClient.registerGuest();
    EventStreamer.emit("DEEPLINK:SSO_CALLBACK", jwt);
  }


  onAppleAutenticateHandler = async () => {
    try {
      let options: SignInWithAppleOptions = {
        clientId: 'com.your.webservice',
        redirectURI: 'https://www.yourfrontend.com/login',
        scopes: 'email name',
        state: '12345',
        nonce: 'nonce',
      };
      const authorizationResponse: SignInWithAppleResponse = await SignInWithApple.authorize(options);
      /*
            // Only to test in Web
            const authorizationResponse: SignInWithAppleResponse = {
              response: {
                email: "oscarlea2202@gmail.com",
                familyName: "Leañez",
                givenName: "Oscar"
              }
            };
      */

      // Because apple dont send the user data (name, email) after the "first login"
      // we need to acquire via its own id (apple id)
      const appleData = authorizationResponse.response;
      console.debug(appleData);
      if (appleData.email !== null) {
        // First Login (not registered), the api will create in
        // the shopping database
        try {
          const hash = md5(`${process.env.REACT_APP_APPLE_HMAC}${appleData.email}`)
          const jwt = await AppleAuthenticationProviderClient.tryToRegisterWithApple({
            email: appleData.email!,
            familyName: appleData.familyName!,
            givenName: appleData.givenName!,
            hash: hash,
            user: appleData.user!
          });
          EventStreamer.emit("DEEPLINK:SSO_CALLBACK", jwt)

        } catch (ex) {
          console.debug(ex)
        }

      } else {
        // Second Login (already registered) , so we need to "get" from the
        // shopping user database (created and identified via apple user id)
        try {
          const md5User = md5(appleData.user!);
          const nonce = md5(`${process.env.REACT_APP_APPLE_HMAC}${md5User}`);
          const jwt = await AppleAuthenticationProviderClient.tryToLoginWithApple(md5User, nonce);
          EventStreamer.emit("DEEPLINK:SSO_CALLBACK", jwt);

        } catch (ex) {
          console.debug('Apple User Id', appleData.user);
          console.debug(ex)
        }
      }
    } catch (ex) {
      console.error(ex);
      throw ex;
    }

  }

  /* AUTH WITH SSO */
  onAutenticateHandler = async () => {
    const ssoURL = process.env.REACT_APP_SSO_ENDPOINT;
    const clientId = process.env.REACT_APP_REACT_APP_SHOPPING_APP_CLIENT_ID;

    // Change url between facebook and gmail oauth
    const loginUrl = `${ssoURL}/oauth2/v2/authorize/gmail_oauth?response_type=token&client_id=${clientId}&scope=profile&prompt=consent`;

    Expr.whenInNativePhone(async () => {
      const endpointURL = `${loginUrl}&redirect_uri=${process.env.REACT_APP_DEEP_LINK_URL}/sso_callback`;

      Expr.whenAndroid(
        // Android specific, force to open google Chrome (because support universal links)
        async () => {
          try {
            // Always try to force https
            let result = await AppLauncher.openUrl({ url: `googlechromes://navigate?url=${endpointURL}` })
            if (result.completed === false) {
              // Always try to force http
              result = await AppLauncher.openUrl({ url: `googlechrome://navigate?url=${endpointURL}` })
              if (result.completed === false) {

                // fallback to original
                window.open(endpointURL, "_blank");
              }
            }
          } catch (ex: any) {
            eureka.error(ex);
          }
        },
        // Rest of the platforms!
        () => {
          window.open(endpointURL, "_blank");
        });

    });

    Expr.whenNotInNativePhone(() => {
      const endpointURL = `${loginUrl}&redirect_uri=${ssoURL}/oauth2/v2/connect/oauth2_callback.html`;

      let loggedIn = false;
      const onPopupMessage = async (e: any) => {
        if (e.origin === e.data.origin && !loggedIn) {

          // Simulate the deeplink process if we were in a mobile
          //console.log(e);
          EventStreamer.emit("DEEPLINK:SSO_CALLBACK", e.data)

          //loggedIn = true;
        } else if (!loggedIn) {
          console.error("FATAL AUTH ERROR:: Origin missmatch");
        }
      };
      window.addEventListener("message", onPopupMessage);

      const loginPopUp = window.open(endpointURL, "_blank",
        "toolbar=yes,scrollbars=yes,resizable=yes,top=100,left=500,width=500,height=600"
      );

      // Only in web
      const timer = setInterval(function () {
        if (loginPopUp && loginPopUp.closed) {
          clearInterval(timer);
          window.removeEventListener("message", onPopupMessage);
        }
      }, 500);
    });
  }

  //email register
  onInputChangeHandler = (key: string, value: string) => {
    const newState: any = {};
    newState[key] = value.toLocaleLowerCase();
    newState[`${key}_error`] = '';
    this.setState(newState)

    //handler button disabled
    if (value != this.state.email) {
      this.setState({ button_disabled: false });
    }
  }

  onInputNumberChangeHandler = (key: string, value: string) => {

    const value_clean = value.replace(/[^0-9.]/g, '');

    const newState: any = {};
    newState[key] = value_clean;
    newState[`${key}_error`] = '';
    this.setState(newState)
  }

  validateEmail = (email: string) => {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  }

  onKeyboardInput = async (e: any, input:any, next: any, prev: any) => {

    this.setState({
      handle_paste: false
    });

    if (e.keyCode === 8) {

      input.current.value = '';

      if(prev !== undefined) {
        prev.current.focus();
      }

      this.setState({
        forwardButton: true
      });

    } else {
      input.current.value = input.current.value.replace(/[^a-z0-9]/gi,'');
      if(input.current.value && next !== undefined) {
        next.current.focus();
      }
    }

    if (await this.formValid()) {
      this.setState({
        forwardButton: false
      });
    }

    return;
  }

  handlePasteCode = async (e: any) => {

    Expr.whenInNativePhone(async () => {
      await Clipboard.write({
        string: e.clipboardData.getData('Text')
      });

      const read  = await Clipboard.read();
      this.setState({
        code: read.value,
        handle_paste: true,
        code_error: false
      })

      this.Input1!.current!.value = read.value.substring(0, 1);
      this.Input2!.current!.value = read.value.substring(1, 2);
      this.Input3!.current!.value = read.value.substring(2, 3);
      this.Input4!.current!.value = read.value.substring(3, 4);
      this.Input5!.current!.value = read.value.substring(4, 5);
      this.Input6!.current!.value = read.value.substring(5, 6);
    });

    Expr.whenNotInNativePhone(() => {
      const value = e.clipboardData.getData('Text').substring(0, 6);

      this.Input1!.current!.value = value.substring(0, 1);
      this.Input2!.current!.value = value.substring(1, 2);
      this.Input3!.current!.value = value.substring(2, 3);
      this.Input4!.current!.value = value.substring(3, 4);
      this.Input5!.current!.value = value.substring(4, 5);
      this.Input6!.current!.value = value.substring(5, 6);
    });

  }

  joinCodeInput = () => {
    return [
      this.Input1!.current!.value,
      this.Input2!.current!.value,
      this.Input3!.current!.value,
      this.Input4!.current!.value,
      this.Input5!.current!.value,
      this.Input6!.current!.value,
    ].join('').toUpperCase();
  }

  formValid = async () => {

    const fullString = !this.state.handle_paste ? this.joinCodeInput() : this.state.code;

    this.setState({ code: fullString, code_error: false, message_resent_code: true })

    if (fullString.length === 0) {
      this.setState({ message_resent_code: false })
    }

    return fullString.length === 6;
  }

  registerEmail = async () => {
    if(this.state.loading) return;

    if (this.state.email === '') {
      this.setState({ email_error: true })
      return false;
    }
    if (!this.validateEmail(this.state.email)) {
      this.setState({ email_error: true })
      return false;
    }
    this.setState({ loading: true });

    try {
      await RegisterClient.register({
        full_name: '',
        IMEI: '',
        device_token: '',
        phone: '',
        email: this.state.email,
        code: ''
      });

      setTimeout(() => {
        this.setState({
          mode: "VERIFY_CODE",
          email_error: false,
          button_disabled: true,
          loading: false
        });
      }, 2000);

    } catch (error) {
      eureka.debug(error as string)
      this.setState({ loading: false });
    }
  }

  validateCode = async () => {
    if(this.state.loading) {
      return;
    }

    if(this.state.code.length !== 6) {
      this.setState({ code_error: true });
      return;
    }

    this.setState({ loading: true });

    try {
      const jwt = await RegisterClient.verifycode({
        email: this.state.email,
        full_name: "-",
        IMEI: "",
        device_token: "",
        phone: "",
        code: this.state.code,
      });

      if (!jwt) {
        this.setState({ code_error: true, loading: false });
        return;
      }

      setTimeout(() => {
        this.setState({
          loading: false
        });
        EventStreamer.emit("DEEPLINK:SSO_CALLBACK", jwt);
      }, 600);

    } catch (ex: any) {
      console.log(ex);
      this.setState({ loading: false });
    }
  }

  validateNumber = (event: any) => {
    var key = window.event ? event.keyCode : event.which;
    if (event.keyCode === 8 || event.keyCode === 46) {
      return true;
    } else if (key < 48 || key > 57) {
      return false;
    } else {
      return true;
    }
  }

  inAppoAuth = async () => {
    try {
      Expr.whenIos(() => {
        GoogleAuth.initialize();
      })
      const result = await GoogleAuth.signIn();

      this.setState({ loading: true });

      const hash = md5(`${process.env.REACT_APP_APPLE_HMAC}${result.email}`);

      const user : IGoogleUser = {
        full_name: result.name,
        email: result.email,
        hash: hash,
        familyName: result.familyName,
        givenName: result.givenName
      }

      const jwt = await RegisterClient.tryToRegisterWithGoogle(user);

      if (!jwt) {
        console.log('not jwt get from de api')
        return;
      }
      this.setState({ loading: false });
      EventStreamer.emit("DEEPLINK:SSO_CALLBACK", jwt);

    } catch (error) {
      eureka.debug(error as string)
      this.setState({ loading: false });
    }
  }

  goToAccessibility = () => {
    this.setState({mode: "ACCESSIBILITY_DESCRIPTION"});
  }


  changeMode = () => {
    this.setState({style_mode_dark: !this.state.style_mode_dark})
  }

  render() {
    const { mode } = this.state;
    return <Fragment>
      {(() => {
        const customRender: Function = (this as any)[`render${mode}`];
        if (!customRender) {
          return <div>{mode}</div>;
        }
        return customRender();
      })()}
    </Fragment>
  }

  renderINITIAL_STATE = () => {

    const { displayGoogleSso, terms_modal_open, term_conditions, privacy_polices, term_conditions_doc_url, privacy_polices_doc_url } = this.state;
    return <IonPage className="signin-page">
      <IonContent>
        <IonSlides onIonSlidesDidLoad={this.onGetSwiperHandler} pager={false} options={{ initialSlide: this.state.slideIndex, speed: 400 }}>
          <IonSlide className='swiper-no-swiping application-login' >
            <img className="hidden-m" src={LoginHeaderSmall} />
            <img className="visible-m" src={LoginHeader} />
            <div className="content">
              <h1 dangerouslySetInnerHTML={{ __html: localize('LOGIN_TITLE') }} />
              <span dangerouslySetInnerHTML={{ __html: localize('LOGIN_SUBTITLE') }} />
            </div>
            <div className="footer">
              <IonButton className="white-centered" onClick={() => { this.setState({ login_mode: 'EMAIL', terms_modal_open: true }) }}>
                {localize('LOGIN_WITH_EMAIL')}
              </IonButton>


              <IonButton className="login-white" onClick={() => {  this.setState({ login_mode: 'GOOGLE', terms_modal_open: true })   /* this.inAppoAuth() */  }}>
                <div>
                  <img src={GoogleLogo} />
                  {localize('LOGIN_WITH_GOOGLE')}
                </div>
              </IonButton>


              {isPlatform("ios") ? (() => {
                const logo =  AppleLogo;

                return <IonButton className="login-white" onClick={() => { this.setState({ login_mode: 'APPLE', terms_modal_open: true }) }}>
                  <div>
                    <img src={logo} />
                    {localize('LOGIN_WITH_APPLE')}
                  </div>
                </IonButton>;

              })() : null}

              {/*<IonButton disabled className="login-white" onClick={() => { this.setState({login_mode: 'FACEBOOK', terms_modal_open: true}) }}>
                <div>
                  <img src={FacebookLogo} />
                  {//localize('LOGIN_WITH_FACEBOOK')}
                </div>
                  </IonButton>*/}
              <div onClick={() => { this.setState({ login_mode: 'INVITE', terms_modal_open: true }) }}>
                <span>{localize('LOGIN_WITH_INVITE')}</span>
              </div>
            </div>
          </IonSlide>
        </IonSlides>
      </IonContent>
      {terms_modal_open ? <TermsModal
                privacyPolicesDescription={privacy_polices}
                privacyPolicesDescriptionDocUrl={privacy_polices_doc_url}
                termsAndConditionsDescriptionDocUrl={term_conditions_doc_url}
                termsAndConditionsDescription={term_conditions}
                onClose={() => this.onCloseModalHandler()}
                onAction={(e) => this.onActionHandler(e)}
                mode={this.state.login_mode}
                 />: null}
    </IonPage>
  }

  renderSIGIN_EMAIL = () => {

    const { email_error, button_disabled } = this.state;

    return (<IonPage className='email-register'>
      <IonHeader>
        <div onClick={() => this.setState({ mode: 'INITIAL_STATE', email: '', email_error: false, button_disabled: false })}>
          <IonIcon icon={arrowBack}></IonIcon>
        </div>
      </IonHeader>
      <IonContent className='email-insert'>
        <div>
          <h1>{localize('EMAIL_TITLE')}</h1>
          <p>{localize('EMAIL_INFO')}</p>
        </div>
        <div>
          <IonIcon icon={mail}></IonIcon>
          <input type="email" value={this.state.email} placeholder={this.state.email ? this.state.email : "Correo electrónico"} onChange={e => { this.onInputChangeHandler('email', e.currentTarget.value?.toString()!) }}></input>
          {email_error ? <span className="error">{localize('EMAIL_ERROR')}</span> : null}
        </div>
      </IonContent>
      <IonFooter>
        <div className='pad-buttons'>
          <IonButton className='white-centered' onClick={() =>  this.registerEmail() } disabled={button_disabled}>
            {this.state.loading ? '' : 'Continuar'}
            {this.state.loading ? <IonIcon icon={loadingSpin}></IonIcon> : ''}
          </IonButton>
        </div>
      </IonFooter>
    </IonPage>
    )
  }

  renderVERIFY_CODE = () => {
    const { code_error, message_resent_code } = this.state;
    return (<IonPage className='validate-code'>
      <IonHeader>
        <div onClick={() => this.setState({ mode: 'SIGIN_EMAIL', forwardButton: true, message_resent_code: false, code_error: false })}>
          <IonIcon icon={arrowBack}></IonIcon>
        </div>
      </IonHeader>
      <IonContent className='body-validate-code'>
        <div>
          <h1>{localize('EMAIL_VALIDATE_TITLE')}</h1>
          <p>{localize('EMAIL_VALIDATE_INFO')}</p>
        </div>
        <div>
          <div className="slide-content">
            <div className="register-code-form fine-print">
              <div className="code-characters">
                <input onPaste={(e) => this.handlePasteCode(e)}   onKeyUp={(e) => this.onKeyboardInput(e, this.Input1, this.Input2, undefined)} ref={this.Input1} maxLength={1} />
                <input onKeyUp={(e) => this.onKeyboardInput(e, this.Input2, this.Input3, this.Input1)} ref={this.Input2} maxLength={1} />
                <input onKeyUp={(e) => this.onKeyboardInput(e, this.Input3, this.Input4, this.Input2)} ref={this.Input3} maxLength={1} />
                <input onKeyUp={(e) => this.onKeyboardInput(e, this.Input4, this.Input5, this.Input3)} ref={this.Input4} maxLength={1} />
                <input onKeyUp={(e) => this.onKeyboardInput(e, this.Input5, this.Input6, this.Input4)} ref={this.Input5} maxLength={1} />
                <input onKeyUp={(e) => this.onKeyboardInput(e, this.Input6, undefined, this.Input5)} ref={this.Input6} maxLength={1} />
              </div>
              {code_error ? <p className="error">{localize('EMAIL_VALIDATE_CODE_ERROR')}</p> : null}
            </div>
          </div>
        </div>
      </IonContent>
      <IonFooter>
        <div className='pad-buttons'>
          <IonButton className='white-centered' onClick={() => this.validateCode()}>
            {this.state.loading ? '' : localize('EMAIL_VALIDATE_CODE_VALIDATION_MESSAGE')}
            {this.state.loading ? <IonIcon icon={loadingSpin}></IonIcon> : ''}
          </IonButton>
          <div className='footer-message'>
            <p className="validate-question">{localize('EMAIL_VALIDATE_MESSAGE_QUESTION')}</p>
            <p className="validate-resend"><a onClick={() => this.registerEmail()}>{!message_resent_code ? localize('EMAIL_VALIDATE_RESENT_CODE') : localize('EMAIL_VALIDATE_REQUEST_CODE')}</a></p>
          </div>
        </div>
      </IonFooter>
    </IonPage>
    )
  }
}
