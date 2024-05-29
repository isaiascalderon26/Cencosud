import React from 'react';

import { IonPage } from '@ionic/react';
import Page from '../page';
// index
import './index.less';
import FooterZoom from '../footer-zoom';


interface IProps {
    header: JSX.Element
    paragraph: string;
    show_action_buttons: boolean
    style_mode_dark: boolean,
    changeMode: () => void;
}

interface IState {
  font_zoom: number,
  style_mode_dark: boolean,
}

export default class ParagraphPage extends React.Component<IProps, IState> {

  media = window.matchMedia('(prefers-color-scheme: dark)');

  state: IState = {
    font_zoom: 0,
    style_mode_dark: false,
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

  render = () => {
      const accessibilityContent = <div className='content'>
          <p className={`font-zoom-${this.state.font_zoom}`} dangerouslySetInnerHTML={{__html: this.props.paragraph}}></p>
        </div>
      return (
        <IonPage id='paragraph-page' className={`${this.props.style_mode_dark?'mode-dark':'mode-light'}`}>
          <Page header={this.props.header} content={accessibilityContent}/>
          {this.props.show_action_buttons && <FooterZoom font_zoom={this.state.font_zoom} add_zoom={this.addZoom} remove_zoom={this.removeZoom} change_mode={this.props.changeMode} go_to_accessibility={()=>{}} show_go_to_accessibility={false}/>}
        </IonPage>
        
      )
    }
}
