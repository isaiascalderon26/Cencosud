import React, { Fragment } from 'react';
import './index.less';
import FaqClient from '../../clients/FaqClient';
import SettingsClient from '../../clients/SettingsClient';
import { IonCol, IonContent, IonGrid, IonHeader, IonIcon, IonImg, IonItem, IonList, IonRow, IonFooter } from '@ionic/react';
import { arrowBack, chevronForward } from 'ionicons/icons';
import FaqQuestion from './../../assets/media/FaqQuestion.svg';
import FaqService from './../../assets/media/FaqService.svg';
import FaqTermCondition from './../../assets/media/FaqTermCondition.svg';
import ListQuestion from './../../assets/media/ListQuestion.svg';
import Question from './../../assets/media/Question.svg';
import { IUser } from '../../models/users/IUser';
import FooterZoom from './components/footer-zoom';
import BackdropLoading from '../../components/backdrop-loading';
import IconDownload from './../../assets/media/icon-download.svg';
import ContactFormScreen from '../contact-form-screen';
import ActionSheet from '../action-sheet';
import ModalBottomSheet from '../modal-bottom-sheet';


interface IProps {
  onClose: (action: "close") => void;
  store: string;
  user?: IUser;
  history?: any;
  active_mode?: string;
  from_another_page: boolean//this property controls if the back button closes the window or redirects to the previous page
}

interface IState {
  mode: "INITIAL_STATE" | "MENU" | "TERM_CONDITION" | "TERM_CONDITION_DESCRIPTION" | "ACCESSIBILITY_DESCRIPTION" | "FAQ_STATE" | "FAQ_STATE_DETAIL" | "FAQ_STATE_DESCRIPTION" | "FAQ_SERVICE_STATE" | "SAC_EMAIL_SUCCESS" | "PRIVACY_POLICIES" | "PRIVACY_POLICIES_DESCRIPTION",
  loading: boolean
  faqs: Record<string, any>,
  term_conditions_topic: [],
  term_conditions_topic_description?: string,
  privacy_policies: [],
  privacy_policies_description?: string,
  accessibility_text: any[],
  faqs_detail?: topic
  detail?: string,
  description?: string,
  subject: string,
  subject_error: boolean,
  message: string,
  message_error: boolean,
  phone: string,
  phone_enable: boolean,
  phone_error: boolean,
  font_zoom: number,
  accessibility: boolean
  style_mode_dark: boolean,
  privacy_polices_doc_url?: string,
  term_conditions_doc_url?: string
}

interface topic {
  titulo: string;
  topico: Array<any>;
  form: boolean;
}

export default class FAQDetailPage extends React.Component<IProps, IState> {
  media = window.matchMedia('(prefers-color-scheme: dark)');

  state: IState = {
    mode: "INITIAL_STATE",
    loading: false,
    faqs: [],
    term_conditions_topic: [],
    privacy_policies: [],
    accessibility_text: [],
    subject: "",
    subject_error: false,
    message: "",
    message_error: false,
    phone: "",
    phone_enable: false,
    phone_error: false,
    font_zoom: 0,
    accessibility: false,
    style_mode_dark: false
  }

  onCloseModalHandler = async () => {
    this.props.onClose("close");
  }

  async componentDidMount() {
    if (this.props.user?.phone === "" || this.props.user?.phone === undefined) {
      this.setState({ phone_enable: true });
    }

    this.setState({
      loading: true
    })

    const { store } = this.props;
    let faqs = await this.getFaq();

    faqs = this.getFaqByStore(faqs, this.props.store);

    const term_conditions_topic = await this.getTermAndConditionsTopic();
    const accessibility_text = await this.getAccessibilityText();
    const privacy_policies = await this.getPrivacyPolicies();
    const privacy_polices_doc_url = await SettingsClient.getPrivacyPoliciesDocUrl();
    const term_conditions_doc_url = await SettingsClient.getTermsAndConditionsDocUrl();

    switch (this.props.active_mode) {//Verified if a specific faq element is going to be shown
      case 'sky_costanera':
        faqs && faqs.macrotopico?.map((faq: any, i: any) => {
          console.log(faq.titulo);
          if (faq.key !== null && faq.key === 'sky_costanera') {
            this.setState({
              loading: false,
              faqs: faqs,
              term_conditions_topic: term_conditions_topic,
              accessibility_text: accessibility_text,
              privacy_polices_doc_url,
              term_conditions_doc_url,
              mode: "FAQ_STATE_DETAIL",
              faqs_detail: faq
            })
          }
        });
        break;
      default:
        this.setState({
          loading: false,
          faqs: faqs,
          term_conditions_topic,
          accessibility_text,
          privacy_polices_doc_url,
          term_conditions_doc_url,
          mode: "MENU",
          privacy_policies
        })
        break;
    }
  }



  onGoBackHandler = () => {
    this.props.history.goBack();
  }

  onPressBack = (mode: any) => {
    this.setState({
      mode: mode,
      loading: false,
    })
  }

  async getFaq(): Promise<any> {
    try {
      return await FaqClient.getFaq();
    } catch (error) {
      console.log(error);
    }
  }

  async getTermAndConditionsTopic(): Promise<any> {
    try {
      return await SettingsClient.getTermsAndConditionsTopic();
    } catch (error) {
      console.log(error);
    }
  }

  async getPrivacyPolicies(): Promise<any> {
    try {
      return await SettingsClient.getPrivacyPolicies();
    } catch (error) {
      console.log(error);
    }
  }

  async getAccessibilityText(): Promise<any> {
    try {
      return await SettingsClient.getAccessibilityText();
    } catch (error) {
      console.log(error);
    }
  }

  getFaqByStore(faqs: Array<any>, store: string) {
    return faqs.find((item: Record<string, unknown>) => {
      return (item.mall as string).toLocaleLowerCase().trim() === store.toLocaleLowerCase().trim();
    });
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

  changeMode = () => {
    this.setState({ style_mode_dark: !this.state.style_mode_dark })
  }

  goToAccessibility = () => {
    this.setState({ mode: "ACCESSIBILITY_DESCRIPTION" });
  }

  decorate(line: string) {
    return line.replace(/\.$/, '');
  }

  faqDescription(title: any, description: any, form: boolean) {
    if (form) {
      this.setState({ mode: "FAQ_SERVICE_STATE" });
    } else {
      this.setState({ mode: 'FAQ_STATE_DESCRIPTION', detail: title, description: description });
    }
  }

  termConditionDescription(title: any, description: any) {
    this.setState({ mode: 'TERM_CONDITION_DESCRIPTION', term_conditions_topic_description: description });
  }

  privacyPolicies(title: any, description: any) {
    this.setState({ mode: 'PRIVACY_POLICIES_DESCRIPTION', privacy_policies_description: description });
  }

  render() {
    const { mode } = this.state;
    return <Fragment>
      {(() => {
        const customRender: Function = (this as any)[`render${mode}`];
        if (!customRender) {
          return <div>{mode}</div>;
        }
        else if (this.state.mode === "TERM_CONDITION" || this.state.mode === "TERM_CONDITION_DESCRIPTION" || this.state.mode === "ACCESSIBILITY_DESCRIPTION" || this.state.mode === "PRIVACY_POLICIES") {
          return <div className={`page-container term-condition-container ${this.state.style_mode_dark ? 'mode-dark' : 'mode-light'}`}>{customRender()}</div>;
        }
        else {
          return <div className="page-container">{customRender()}</div>;
        }

      })()}
    </Fragment>
  }

  renderINITIAL_STATE = () => {
    return <Fragment>
      <BackdropLoading message="Cargando" />
    </Fragment>
  }


  renderMENU = () => {
    return (
      <Fragment>
        <IonHeader>
          <div onClick={() => this.props.from_another_page ? this.onGoBackHandler() : this.onCloseModalHandler()}>
            <IonIcon icon={arrowBack}></IonIcon>
          </div>
        </IonHeader>
        <IonContent className='initial-state'>
          <div>
            <h1>Centro de ayuda</h1>
            <p>¿Cómo podemos ayudarte?</p>
          </div>
          <div>
            <IonGrid>
              <IonRow>
                <IonCol size="6" size-sm >
                  <div onClick={() => this.setState({ mode: "FAQ_STATE" })}>
                    <IonImg src={FaqQuestion} />
                    <h3>Preguntas<br />frecuentes</h3>
                  </div>
                </IonCol>
                <IonCol size="6" size-sm >
                  <div onClick={() => this.setState({ mode: "FAQ_SERVICE_STATE" })}>
                    <IonImg src={FaqService} />
                    <h3>Servicio<br />al cliente</h3>
                  </div>
                </IonCol>
              </IonRow>
              <IonRow>
                <IonCol size="6" size-sm >
                  <div onClick={() => this.setState({ mode: "TERM_CONDITION" })}>
                    <IonImg src={FaqTermCondition} />
                    <h3>Términos y<br />condiciones</h3>
                  </div>
                </IonCol>
                <IonCol size="6" size-sm >
                  <div onClick={() => this.setState({ mode: "PRIVACY_POLICIES" })}>
                    <IonImg src={FaqTermCondition} />
                    <h3>Políticas de<br />privacidad</h3>
                  </div>
                </IonCol>
              </IonRow>
            </IonGrid>
          </div>
        </IonContent>
      </Fragment>
    )
  }

  renderTERM_CONDITION = () => {
    const { term_conditions_topic } = this.state;

    return <Fragment>
      <IonHeader className='term-condition'>
        <div onClick={() => { this.onPressBack('MENU') }}>
          <IonIcon icon={arrowBack}></IonIcon>
        </div>
        <div>
          <h1>Términos y<br />condiciones</h1>
        </div>
      </IonHeader>
      <IonContent className='term-condition'>
        <div className='list'>
          <IonList>
            {
              term_conditions_topic && term_conditions_topic.map((term: any, i: any) => {
                return (<IonItem key={i} onClick={() => { this.termConditionDescription(term.title, term.description); }}>
                  <div>
                    <IonIcon icon={ListQuestion}></IonIcon>
                    <p className={`font-zoom-${this.state.font_zoom}`}>{this.decorate(`${term.key}. ${term.title}`)}</p>
                    <IonIcon icon={chevronForward}></IonIcon>
                  </div>
                </IonItem>)
              })}
          </IonList>
        </div>
        <FooterZoom change_mode={this.changeMode} show_go_to_accessibility={true} go_to_accessibility={this.goToAccessibility} font_zoom={this.state.font_zoom} add_zoom={this.addZoom} remove_zoom={this.removeZoom}></FooterZoom>
      </IonContent>
      {this.state.term_conditions_doc_url && <div className='container-download-info'><div className='component-button-icon' onClick={() => { window.open(this.state.term_conditions_doc_url, "_blank"); }}>
        <div className='icon'><IonIcon icon={IconDownload} /></div>
        <h3 className='text'>Descargar documentos</h3>
      </div></div>}
    </Fragment>
  }

  renderTERM_CONDITION_DESCRIPTION = () => {
    const { term_conditions_topic_description } = this.state;
    return (<Fragment>
      <IonHeader className='term-condition'>
        <div onClick={() => this.onPressBack('TERM_CONDITION')}>
          <IonIcon icon={arrowBack}></IonIcon>
        </div>
        <div>
          <h1>Términos y<br />condiciones</h1>
        </div>
      </IonHeader>
      <IonContent className='term-condition'>
        <div className='description'>
          <p className={`faq-state-description font-zoom-${this.state.font_zoom}`} dangerouslySetInnerHTML={{ __html: term_conditions_topic_description as string }}></p>
        </div>
        <FooterZoom change_mode={this.changeMode} show_go_to_accessibility={true} go_to_accessibility={this.goToAccessibility} font_zoom={this.state.font_zoom} add_zoom={this.addZoom} remove_zoom={this.removeZoom}></FooterZoom>

      </IonContent>
      {this.state.term_conditions_doc_url && <div className='container-download-info'><div className='component-button-icon' onClick={() => { window.open(this.state.term_conditions_doc_url, "_blank"); }}>
        <div className='icon'><IonIcon icon={IconDownload} /></div>
        <h3 className='text'>Descargar documentos</h3>
      </div></div>}

    </Fragment>
    )
  }

  renderPRIVACY_POLICIES = () => {
    const { privacy_policies } = this.state;

    return <Fragment>
      <IonHeader className='term-condition'>
        <div onClick={() => { this.onPressBack('MENU') }}>
          <IonIcon icon={arrowBack}></IonIcon>
        </div>
        <div>
          <h1>Políticas de<br />privacidad</h1>
        </div>
      </IonHeader>
      <IonContent className='term-condition'>
        <div className='list'>
          <IonList>
            {
              privacy_policies && privacy_policies.map((term: any, i: any) => {
                return (<IonItem key={i} onClick={() => { this.privacyPolicies(term.title, term.description); }}>
                  <div>
                    <IonIcon icon={ListQuestion}></IonIcon>
                    <p className={`font-zoom-${this.state.font_zoom}`}>{this.decorate(`${term.key}. ${term.title}`)}</p>
                    <IonIcon icon={chevronForward}></IonIcon>
                  </div>
                </IonItem>)
              })}
          </IonList>
        </div>
        <FooterZoom change_mode={this.changeMode} show_go_to_accessibility={true} go_to_accessibility={this.goToAccessibility} font_zoom={this.state.font_zoom} add_zoom={this.addZoom} remove_zoom={this.removeZoom}></FooterZoom>
      </IonContent>
      {this.state.privacy_polices_doc_url && <div className='container-download-info'><div className='component-button-icon' onClick={() => { window.open(this.state.privacy_polices_doc_url, "_blank"); }}>
        <div className='icon'><IonIcon icon={IconDownload} /></div>
        <h3 className='text'>Descargar documentos</h3>
      </div></div>}
    </Fragment>
  }

  renderPRIVACY_POLICIES_DESCRIPTION = () => {
    const { privacy_policies_description } = this.state;
    return (<Fragment>
      <IonHeader className='term-condition'>
        <div onClick={() => this.onPressBack('PRIVACY_POLICIES')}>
          <IonIcon icon={arrowBack}></IonIcon>
        </div>
        <div>
          <h1>Políticas de<br />privacidad</h1>
        </div>
      </IonHeader>
      <IonContent className='term-condition'>
        <div className='description'>
          <p className={`faq-state-description font-zoom-${this.state.font_zoom}`} dangerouslySetInnerHTML={{ __html: privacy_policies_description as string }}></p>
        </div>
        <FooterZoom change_mode={this.changeMode} show_go_to_accessibility={true} go_to_accessibility={this.goToAccessibility} font_zoom={this.state.font_zoom} add_zoom={this.addZoom} remove_zoom={this.removeZoom}></FooterZoom>
      </IonContent>
      {this.state.privacy_polices_doc_url && <div className='container-download-info'><div className='component-button-icon' onClick={() => { window.open(this.state.privacy_polices_doc_url, "_blank"); }}>
        <div className='icon'><IonIcon icon={IconDownload} /></div>
        <h3 className='text'>Descargar documentos</h3>
      </div></div>}
    </Fragment>
    )
  }

  renderACCESSIBILITY_DESCRIPTION = () => {
    return (<Fragment>
      <IonHeader className='term-condition'>
        <div onClick={() => this.onPressBack('TERM_CONDITION')}>
          <IonIcon icon={arrowBack}></IonIcon>
        </div>
        <div>
          <h1>¿Qué es<br />Accesibilidad?</h1>
        </div>
      </IonHeader>
      <IonContent className='term-condition'>
        <div className='accessibility'>
          {!this.state.style_mode_dark && <p className={`faq-state-description font-zoom-${this.state.font_zoom}`} dangerouslySetInnerHTML={{ __html: this.state.accessibility_text ? this.state.accessibility_text[0].description : '' }}></p>}
          {this.state.style_mode_dark && <p className={`faq-state-description font-zoom-${this.state.font_zoom}`} dangerouslySetInnerHTML={{ __html: this.state.accessibility_text ? this.state.accessibility_text[1].description : '' }}></p>}
        </div>
        <FooterZoom change_mode={this.changeMode} show_go_to_accessibility={false} go_to_accessibility={this.goToAccessibility} font_zoom={this.state.font_zoom} add_zoom={this.addZoom} remove_zoom={this.removeZoom}></FooterZoom>
      </IonContent>
    </Fragment>
    )
  }

  renderFAQ_STATE = () => {
    const { faqs } = this.state;
    return (<Fragment>
      <IonHeader>
        <div onClick={() => { this.onPressBack('MENU') }}>
          <IonIcon icon={arrowBack}></IonIcon>
        </div>
      </IonHeader>
      <IonContent className='faq-state'>
        <div>
          <h1>Preguntas<br />frecuentes</h1>
        </div>
        <div>
          <IonList>
            {
              faqs && faqs.macrotopico?.map((faq: any, i: any) => {
                return (<IonItem key={i} onClick={() => { this.setState({ mode: "FAQ_STATE_DETAIL", faqs_detail: faq }); console.log(faq) }}>
                  <div>
                    <IonIcon icon={ListQuestion}></IonIcon>
                    <p>{this.decorate(faq.titulo)}</p>
                    <IonIcon icon={chevronForward}></IonIcon>
                  </div>
                </IonItem>)
              })}
          </IonList>
        </div>
      </IonContent>
    </Fragment>
    )
  }

  renderFAQ_STATE_DETAIL = () => {
    const faqs_detail: topic = this.state.faqs_detail as topic;

    return (<Fragment>
      <IonHeader>
        <div onClick={() => this.props.from_another_page ? this.onGoBackHandler() : this.onPressBack('FAQ_STATE')}>
          <IonIcon icon={arrowBack}></IonIcon>
        </div>
      </IonHeader>
      <IonContent className='faq-state'>
        <div>
          <h1>Preguntas<br />frecuentes</h1>
        </div>
        <div>
          {faqs_detail ? <div className="faq-info-title"> {this.decorate(faqs_detail?.titulo)}</div> : null}
          <IonList>
            {
              faqs_detail?.topico?.map((faq: any, i) => {
                const { detalle, descripcion } = faq;
                return (<IonItem key={i} onClick={() => { this.faqDescription(detalle, descripcion, faqs_detail.form); }}>
                  <div>
                    <IonIcon icon={Question}></IonIcon>
                    <p>{this.decorate(detalle)}</p>
                    <IonIcon icon={chevronForward}></IonIcon>
                  </div>
                </IonItem>)
              })
            }
          </IonList>
        </div>
      </IonContent>
    </Fragment>
    )
  }

  renderFAQ_STATE_DESCRIPTION = () => {
    const { detail, description } = this.state
    return (<Fragment>
      <IonHeader>
        <div onClick={() => this.onPressBack('FAQ_STATE_DETAIL')}>
          <IonIcon icon={arrowBack}></IonIcon>
        </div>
      </IonHeader>
      <IonContent className='faq-state'>
        <div>
          <h1>Preguntas<br />frecuentes</h1>
        </div>
        <div>
          <span className="faq-state-title">{detail}</span>
          <p className="faq-state-description" dangerouslySetInnerHTML={{ __html: description as string }}></p>
        </div>
      </IonContent>
      <IonFooter className="ion-no-border contact-us">
        <span onClick={() => { this.setState({ mode: "FAQ_SERVICE_STATE" }); }}>
          <IonImg src={FaqService} />
          <span>Si tienes otras inquietudes o dudas contáctate con nosotros.</span>
        </span>
      </IonFooter>
    </Fragment>
    )
  }

  renderFAQ_SERVICE_STATE = () => {
    return (
      <ContactFormScreen
        onBack={() => {
          this.setState({
            mode: 'MENU',
          })
        }}
        onEmailSent={() => {
          this.setState({
            mode: 'MENU',
          })
        }}
        phone_enable={true}
        user_email={this.props.user?.email}
        user_fullname={this.props.user?.full_name}
        user_phone={this.props.user?.phone}
      />
    )
  }
};
