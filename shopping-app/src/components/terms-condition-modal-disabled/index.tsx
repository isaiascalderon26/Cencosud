import React, { Fragment } from 'react';
import './index.less';
import { IonModal, IonContent, IonCheckbox, IonIcon, IonButton } from '@ionic/react';
import i18n from '../../lib/i18n';
import locales from './locales';
import termsLogo from './../../assets/media/onboarding/terms-icon.webp'
import { closeSharp } from 'ionicons/icons';
import SettingsClient from '../../clients/SettingsClient';
import FooterZoom from '../footer-zoom';
import BackdropLoading from "../backdrop-loading";

const localize = i18n(locales);

interface IProps {
  onClose: (action: "close") => void;
  onAction: (action: "EMAIL" | "GOOGLE" | "FACEBOOK" | "INVITE") => void;
  goToAccessibility: () => void,
  changeMode: () => void,
  mode?: any;
  style_mode_dark: boolean
}

interface IState {
  checkbox: boolean,
  termsAndConditionsDescription: string,
  font_zoom: number,
  render_mode: 'LOADING' | 'CONTENT',
  loading_message?: string
}

export default class TermsModal extends React.Component<IProps, IState> {

  state: IState = {
    checkbox: false,
    termsAndConditionsDescription: '',
    font_zoom: 0,
    render_mode: 'LOADING',
    loading_message: "Cargando...",
  }

  componentDidMount() {
    SettingsClient.getTermsAndConditionsTopic()
      .then((termsAndConditionsDescriptionTopic) => {
        let termsAndConditionsDescription = "</br>";
        termsAndConditionsDescriptionTopic.map((item: any) => {
          termsAndConditionsDescription = termsAndConditionsDescription + item["description"];
        })
        termsAndConditionsDescription += "</br>";
        this.setState({termsAndConditionsDescription: termsAndConditionsDescription, render_mode: 'CONTENT' });
      });
  }

  onCloseModalHandler = async () => {
    this.props.onClose("close");
  }
  onContinueHandler = async () => {
    this.props.onClose("close");
    this.props.onAction(this.props.mode);
  }
  onCheckConditionHandler() {
    if (this.state.checkbox) {
      this.setState({ checkbox: false })
      return
    }
    this.setState({ checkbox: true })
  }

  addZoom = () => {
    let {font_zoom} = this.state;
    if(font_zoom<3)
      this.setState({font_zoom: font_zoom+1})
  }

  removeZoom = () => {
    let {font_zoom} = this.state;
    if(font_zoom>0)
      this.setState({font_zoom: font_zoom-1})
  }

  /* 
     * Main Render
     */
  render() {
    const { render_mode } = this.state;

    return <>
      {(() => {
        const customRender: Function = (this as any)[`render${render_mode}`];
        if (!customRender) {
          return <div>{render_mode}</div>;
        }
        return customRender();
      })()}
    </>
  } 

  renderLOADING = () => { 
    const { loading_message } =  this.state;
    return (
        <Fragment>
            <BackdropLoading message={loading_message!} />
        </Fragment>
    )
  }
  
  renderCONTENT = () => {
    const { checkbox, termsAndConditionsDescription, font_zoom} = this.state;
    return <IonModal backdropDismiss={false} cssClass={`terms-modal initial-state ${this.props.style_mode_dark?'mode-dark':'mode-light'}`} isOpen={true}>
      <IonContent>
        <div>
          <div className='close-icon' onClick={() => this.onCloseModalHandler()}>
            <IonIcon icon={closeSharp} />
          </div>
          <img src={termsLogo} />
          <h1 dangerouslySetInnerHTML={{ __html: localize('TERMS_AND_CONDITIONS') }} />
          <div className='container-terms-description'>
            <div className={`terms-description font-zoom-${this.state.font_zoom}`}>
              <p dangerouslySetInnerHTML={{ __html: termsAndConditionsDescription }} />
            </div>
            <FooterZoom font_zoom={font_zoom} add_zoom={this.addZoom} remove_zoom={this.removeZoom} change_mode={this.props.changeMode} show_go_to_accessibility={true} go_to_accessibility={this.props.goToAccessibility} />
          </div>
          <div className='checkbox'>
            <div onClick={() => this.onCheckConditionHandler()}>
              <IonCheckbox mode="md" checked={checkbox} ></IonCheckbox>
              <p dangerouslySetInnerHTML={{ __html: localize('ACCEPT_TO_CONTINUE') }} />
            </div>
          </div>
          <IonButton className="white-centered" disabled={!checkbox} onClick={() => this.onContinueHandler()}>
            Continuar
          </IonButton>
        </div>
      </IonContent>
    </IonModal>
  }
};
