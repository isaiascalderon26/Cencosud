import React, { Fragment } from 'react';
import './index.less';
import { IonModal, IonContent, IonCheckbox, IonIcon, IonButton, IonFooter } from '@ionic/react';
import locales from './locales';
import { closeSharp } from 'ionicons/icons';
import i18n from '../../lib/i18n';
import BackdropLoading from '../../components/backdrop-loading';
import FooterZoom from '../footer-zoom';
import SettingsClient from '../../clients/SettingsClient';
import { DefaultHeader } from '../page';
import ParagraphPage from '../paragraph-page';
import EurekaConsole from '../../lib/EurekaConsole';
import IconDownload from '../../assets/media/icon-download.svg';


const localize = i18n(locales);

interface IAccessibility {
  key: string,
  description: string
}

interface IProps {
  onClose: (action: "close") => void;
  onAction: (action: "EMAIL" | "GOOGLE" | "FACEBOOK" | "INVITE") => void;
  mode?: any;
  termsAndConditionsDescription: string[];
  privacyPolicesDescription?: string[];
  termsAndConditionsDescriptionDocUrl?: string;
  privacyPolicesDescriptionDocUrl?: string;
}

interface IState {
  checkbox: boolean,
  termsAndConditionsDescription: string,
  privacyPolicesDescription: string,
  font_zoom: number,
  render_mode: 'LOADING' | 'CONTENT' | 'ACCESSIBILITY_DESCRIPTION',
  loading_message?: string
  style_mode_dark: boolean;
  accessibility_text: IAccessibility[];
  term_conditions_active: boolean
}

const eureka = EurekaConsole({ label: "purchase-ticket-component" });

export default class TermsModal extends React.Component<IProps, IState> {

  state: IState = {
    checkbox: false,
    termsAndConditionsDescription: '',
    privacyPolicesDescription: '',
    font_zoom: 0,
    render_mode: 'LOADING',
    loading_message: "Cargando...",
    style_mode_dark: false,
    accessibility_text: [],
    term_conditions_active: true
  }

  async componentDidMount() {
    let termsAndConditionsDescription = "</br>";
    this.props.termsAndConditionsDescription.map((item: any) => {
      termsAndConditionsDescription = termsAndConditionsDescription + item["description"];
    })
    termsAndConditionsDescription += "</br>";

    let privacyPolicesDescription = "</br>";
    if(this.props.privacyPolicesDescription){
      this.props.privacyPolicesDescription?.map((item: any) => {
        privacyPolicesDescription = privacyPolicesDescription + item["description"];
      })
      privacyPolicesDescription += "</br>";
    }
    
    const [accessibility_text] = await Promise.all([
      this.fetchAccessibilityText()
    ]);

    this.setState({ accessibility_text, termsAndConditionsDescription: termsAndConditionsDescription, privacyPolicesDescription: this.props.privacyPolicesDescription?privacyPolicesDescription:'', render_mode: 'CONTENT' });
  }


  async fetchAccessibilityText(): Promise<any> {
    try {
      return await SettingsClient.getAccessibilityText();
    } catch (error) {
      console.log(error);
    }
  }

  onChangeModeHandler = () => {
    this.setState({ style_mode_dark: !this.state.style_mode_dark });
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
    let { font_zoom } = this.state;
    if (font_zoom < 3)
      this.setState({ font_zoom: font_zoom + 1 })
  }

  removeZoom = () => {
    let { font_zoom } = this.state;
    if (font_zoom > 0)
      this.setState({ font_zoom: font_zoom - 1 })
  }

  goToAccessibility = () => {
    this.setState({ render_mode: 'ACCESSIBILITY_DESCRIPTION' })
  }

  onDownloadDocument = async () => {
    window.open(this.state.term_conditions_active?this.props.termsAndConditionsDescriptionDocUrl!:this.props.privacyPolicesDescriptionDocUrl!, "_blank");
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
    const { loading_message } = this.state;
    return (
      <Fragment>
        <BackdropLoading message={loading_message!} />
      </Fragment>
    )
  }

  /**renderCONTENT = () => {
    const { checkbox, termsAndConditionsDescription, font_zoom } = this.state;
    return <IonModal backdropDismiss={false} cssClass={`terms-modal initial-state ${this.state.style_mode_dark ? 'mode-dark' : 'mode-light'}`} isOpen={true}>
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
            <FooterZoom font_zoom={font_zoom} add_zoom={this.addZoom} remove_zoom={this.removeZoom} change_mode={this.onChangeModeHandler} show_go_to_accessibility={true} go_to_accessibility={this.goToAccessibility} />
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
  }**/

  renderCONTENT = () => {
    const { checkbox, termsAndConditionsDescription, privacyPolicesDescription, font_zoom, term_conditions_active } = this.state;
    return <IonModal backdropDismiss={false} cssClass={`terms-modal initial-state ${this.state.style_mode_dark ? 'mode-dark' : 'mode-light'}`} isOpen={true}>
      <IonContent>
        <div>
          <div className='close-icon' onClick={() => this.onCloseModalHandler()}>
            <IonIcon icon={closeSharp} />
          </div>
          <h1>Documentos Legales</h1>
          <div className='taps-text'>
            <div className={`tap ${term_conditions_active?'active':''}`} onClick={() => {this.setState({term_conditions_active:true})}}>Términos y condiciones</div>
            {this.props.privacyPolicesDescription && <div className={`tap ${!term_conditions_active?'active':''}`} onClick={() => {this.setState({term_conditions_active:false})}}>Politicas de privacidad</div>}
          </div>
          <div className='container-terms-description'>
            <div className={`terms-description font-zoom-${this.state.font_zoom}`}>
              <p dangerouslySetInnerHTML={{ __html: term_conditions_active?termsAndConditionsDescription:privacyPolicesDescription }} />
            </div>
          </div>
          <div className='container-font-style'>
            <FooterZoom font_zoom={font_zoom} add_zoom={this.addZoom} remove_zoom={this.removeZoom} change_mode={this.onChangeModeHandler} show_go_to_accessibility={true} go_to_accessibility={this.goToAccessibility} />
          </div>
          <div className='checkbox'>
            <div onClick={() => this.onCheckConditionHandler()}>
              <IonCheckbox mode="md" checked={checkbox} ></IonCheckbox>
              <p dangerouslySetInnerHTML={{ __html: localize('ACCEPT_TO_CONTINUE') }} />
            </div>
          </div>
        </div>
      </IonContent>
      <IonFooter>
          <IonButton className="white-centered" disabled={!checkbox} onClick={() => this.onContinueHandler()}>
            Continuar
          </IonButton>
          {(this.props.privacyPolicesDescriptionDocUrl || this.props.termsAndConditionsDescriptionDocUrl) && <div className='component-button-icon' onClick={this.onDownloadDocument}>
              <div className='icon'><IonIcon icon={IconDownload} /></div>
              <h3 className='text'>Descargar documentos</h3>
          </div>}
      </IonFooter>
    </IonModal>
  }

  renderACCESSIBILITY_DESCRIPTION = () => {
    const { style_mode_dark, accessibility_text } = this.state;
    const paragraph = accessibility_text ? style_mode_dark ? accessibility_text[1].description : accessibility_text[0].description : '';
    const header = <DefaultHeader title="¿Qué es Accesibilidad?" onBack={() => { this.setState({ render_mode: 'CONTENT' }) }} />;
    return <ParagraphPage changeMode={this.onChangeModeHandler} header={header} paragraph={paragraph} show_action_buttons={true} style_mode_dark={this.state.style_mode_dark} />
  }
};
