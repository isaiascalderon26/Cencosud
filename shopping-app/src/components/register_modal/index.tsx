import React, { Fragment } from 'react';
import './index.less';
import { IonModal, IonContent, IonIcon, IonButton} from '@ionic/react';
import i18n from '../../lib/i18n';
import locales from './locales';
import {close } from 'ionicons/icons';
import startOutline from './../../assets/media/icons/startOutline.png'
import puntosCencosud from './../../assets/media/icons/puntosCenco.svg'
import AuthenticationClient from '../../clients/AuthenticationClient';
import {IUser} from "../../models/users/IUser";

const localize = i18n(locales);

interface IProps {
  onClose: (action: "close") => void;
  onClick: (action: "click") => void;
  type: string
  userInfo? : IUser
}

interface IState {
  mode: "INITIAL_STATE" | "PAGE_LOADED",
  edit_rut_is_open: boolean;
  open_modal:boolean;
}

export default class RegisterModal extends React.Component<IProps, IState> {
  state: IState = {
    mode: "INITIAL_STATE",
    edit_rut_is_open : false,
    open_modal:true
  }

  onCloseModalHandler = async () => {
    this.props.onClose("close");
  }
  onClick = async ()=> {
    this.props.onClick("click");
  }
  onLoginClickHandler = async () => {
    await AuthenticationClient.signOut();
    window.location.reload();
  }

  onInputChangeHandler = (key: string, value: string) => {
    const newState: any = {};
    newState[key] = value;
    this.setState(newState)
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
  renderINITIAL_STATE = () =>{
    return (
       <IonModal swipeToClose={false} cssClass={'register-modal'} isOpen={this.state.open_modal} onDidDismiss={this.onCloseModalHandler}>
        <IonContent>
          <div>
            <IonIcon icon={close} onClick={this.onCloseModalHandler} size="large" />
          </div>
          <div>
            <div className="star-icon">
             {this.props.type == "CI" || this.props.type == "PLATE" ? 
              <img src={puntosCencosud} ></img>
            : <img src={startOutline} ></img>
            } 
            </div>
            <div>
              <h1 dangerouslySetInnerHTML={{ __html: localize(`TITLE_${this.props.type}`) }}/>
              <h3 dangerouslySetInnerHTML={{ __html: localize(`DESCRIPTION_${this.props.type}`) }}/>
            </div>
          </div>
          <div>       
              <IonButton className='white-centered' onClick={this.onClick}>
                {localize(`BUTTON_TEXT_${this.props.type}`)}
              </IonButton>
          </div>
        </IonContent>
      </IonModal>
    )
  }
};