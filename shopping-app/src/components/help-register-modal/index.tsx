import React, { Fragment } from 'react';
import './index.less';
import { IonModal, IonContent, IonIcon, IonFooter, IonButton } from '@ionic/react';
import {  arrowForward } from 'ionicons/icons';

interface IProps {
  modal_is_open: boolean;
  onClose: (action: "close") => void;
  content: any;
  cssClass?: string;
}

interface IState {
  mode: "START",
  open_modal: boolean;
  slideIndex: number;
  slideLength: number;
  content: any;
}

export default class HelpRegisterModal extends React.Component<IProps,IState> {
    state: IState = {
        open_modal: this.props.modal_is_open,
        mode: "START",
        slideIndex: 0,
        slideLength: this.props.content.length,
        content: this.props.content
    }

    onCloseModalHandler = () => {
        this.props.onClose("close");
    }

    nextModalHandler = () => {
        let index = this.state.slideIndex;
        if(index + 1 === this.state.slideLength) {
            this.onCloseModalHandler();
        } else {
            this.setState({ slideIndex : index + 1 })
        }
    }

    render() {
        const { mode } = this.state;
        return <>
          {(() => {
            const customRender: Function = (this as any)[`render${mode}`];
            if (!customRender) {
              return <div>{mode}</div>;
            }
            return customRender();
          })()}
        </>;
      }

    renderSTART = () => {

        const { slideIndex, slideLength, content } =  this.state;

        return <Fragment>
            <div className='modal-help'>
                <IonModal swipeToClose={false} onDidDismiss={this.onCloseModalHandler} cssClass={`help-register-modal ${this.props.cssClass}`} isOpen={this.state.open_modal}>
                <IonContent>
                    <div></div>
                    <div>
                        <img src={content[slideIndex].image} alt=''/>
                    </div>
                    <div className="title-text">
                        <h3>{content[slideIndex].title}</h3>
                    </div>
                    <div className="text-body">
                        <p>{content[slideIndex].description}</p>
                    </div>
                </IonContent>
                <IonFooter class="footer-help">
                    <div className="dots">
                        <div className={slideIndex === 0 ? 'selected' : ''}></div>
                        <div className={slideIndex === 1 ? 'selected' : ''}></div>
                        <div className={slideIndex === 2 ? 'selected' : ''}></div>
                        {slideLength === 3 ? '' : <div className={slideIndex === 3 ? 'selected' : ''}></div>}
                    </div>
                    <IonButton className="bold tag-help" onClick={this.nextModalHandler}>
                        <IonIcon icon={arrowForward} />
                    </IonButton>
                </IonFooter>
                </IonModal>
            </div>
        </Fragment>
    }
};
